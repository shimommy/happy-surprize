// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Middleware } from '@line/bot-sdk/lib/middleware'
import * as line from '../../lib/line'
import {
  Message,
  MessageEvent,
  validateSignature,
  WebhookRequestBody,
} from '@line/bot-sdk'
import { MessageClient } from '@/clients/message'
import { S3Client } from '@/clients/s3'
import { ReceiveRepository } from '@/repositories/receive'

type Response = {
  name?: string
  message?: string
}

export const config = {
  api: {
    bodyParser: false,
  },
}

async function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Middleware
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
    )
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  // validate
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  try {
    await runMiddleware(req, res, line.middleware)
  } catch (e) {
    if (e instanceof Error) {
      res.status(500).json({ name: e.name, message: e.message })
      return
    }

    res.status(500).end()
    return
  }

  const { headers } = req
  if (!headers['x-line-signature']) {
    res.status(403).json({ message: 'x-line-signature not found' })
    return
  }

  const lineSignature = headers['x-line-signature'] as string
  const validation = validateSignature(
    JSON.stringify(req.body),
    process.env.CHANNEL_SECRET!,
    lineSignature
  )

  if (!validation) {
    res.status(403).json({ message: 'signature invalid' })
    return
  }

  // reply
  const client = new MessageClient()
  const reply = (
    index: number,
    replyToken: string,
    messages: Message | Message[]
  ) => {
    if (index !== 1) {
      return
    }

    client.reply(replyToken, messages)
  }

  // message handle
  const s3 = new S3Client()
  const dynamodb = new ReceiveRepository()
  const handleMessage = async (event: MessageEvent) => {
    const { message } = event
    switch (message.type) {
      case 'image': {
        reply(message.imageSet?.index ?? 1, event.replyToken, {
          type: 'text',
          text: `写真を送ってくれてありがとう！\n笑顔レベルの計測完了までしばらくお待ちください💍`,
        })

        const stream = await client.getContent(event.message.id)
        await s3.uploadStream(event.source.userId!, event.message.id, stream)
        dynamodb.putItem(event.message.id, event.source.userId!)
        break
      }
      default: {
        break
      }
    }
  }

  // event handle
  const body: WebhookRequestBody = req.body
  const executeHandles = body.events.map((event, index) =>
    (async () => {
      if (event.mode !== 'active') {
        return
      }

      switch (event.type) {
        case 'message': {
          handleMessage(event)
          break
        }
      }
    })()
  )

  await Promise.all(executeHandles)
  res.status(200).json({})
}
