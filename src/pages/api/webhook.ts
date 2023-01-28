// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { createHmac } from 'crypto'
import { Middleware } from '@line/bot-sdk/lib/middleware'
import * as line from '../../lib/line'
import { WebhookRequestBody } from '@line/bot-sdk'
import { UserClient } from '@/clients/user'
import { MessageClient } from '@/clients/message'

type Response = {
  name?: string
  message?: string
}

export const config = {
  api: {
    bodyParser: false, // Necessary for line.middleware
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
  console.log(req)

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
  }

  const { headers } = req
  if (!headers['x-line-signature']) {
    res.status(403).json({ message: 'x-line-signature not found' })
    return
  }

  const token = process.env.CHANNEL_SECRET
  const signature = createHmac('SHA256', token!)
    .update(req.body)
    .digest('base64')
  const lineSignature = headers['x-line-signature']

  if (signature !== lineSignature) {
    res.status(403).json({ message: 'signature invalid' })
    return
  }

  const body: WebhookRequestBody = req.body
  console.log(body)

  await Promise.all(
    body.events.map((event) =>
      (async () => {
        if (event.mode === 'active') {
          switch (event.type) {
            case 'message': {
              new MessageClient().reply(event.replyToken, {
                type: 'text',
                text: `Happy Wedding!!!`,
              })
              break
            }
            case 'follow': {
              const profile = await new UserClient().find(event.source.userId!)
              new MessageClient().reply(event.replyToken, {
                type: 'text',
                text: `こんにちは ${profile.displayName} さん`,
              })
              break
            }
          }
        }
      })()
    )
  )

  res.status(200).json({ name: 'John Doe' })
}
