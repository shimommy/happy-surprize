// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { MessageClient } from '@/clients/message'
import { RekognitionClient } from '@/clients/rekognition'
import { S3Client } from '@/clients/s3'
import { TemplateMessage, TextMessage } from '@line/bot-sdk'
import { DynamoDBStreamEvent } from 'aws-lambda/trigger/dynamodb-stream'
import imageThumbnail from 'image-thumbnail'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Readable } from 'stream'
const sizeOf = require('buffer-image-size')
import { createCanvas, loadImage } from 'canvas'
import { FaceDetail } from '@aws-sdk/client-rekognition'
import { ScoreDetail } from '@/models/scoreDetail'
import { ResultRepository } from '@/repositories/result'
import { round } from '@/util/math'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<void>
) {
  const { headers } = req

  if (!headers['x-service-api-key']) {
    res.status(403).end()
    return
  }

  const apiKey = headers['x-service-api-key']

  if (apiKey !== process.env.API_KEY) {
    res.status(403).end()
    return
  }

  const body = req.body as DynamoDBStreamEvent | undefined
  if (!body) {
    res.status(500).end()
    return
  }

  // reply result
  const client = new MessageClient()
  const message = (userId: string, messages: TextMessage | TextMessage[]) => {
    client.message(userId, messages)
  }

  const templateMessage = (
    userId: string,
    messages: TemplateMessage | TemplateMessage[]
  ) => {
    client.templateMessage(userId, messages)
  }

  // thumbnail
  const s3 = new S3Client()
  const thumbnail = async (userId: string, id: string, originPath: string) => {
    const origin = await s3.getBuffer(originPath)
    if (!origin) {
      console.error('Error origin not found')
      return
    }

    const buffer = await imageThumbnail(origin)
    const thumbnail = Readable.from(buffer)
    await s3.uploadStream(userId, id, thumbnail, 'thumbnails')
    return origin
  }

  // add boundingBox
  const boundingBox = async (
    userId: string,
    id: string,
    details: FaceDetail[],
    origin: Buffer
  ) => {
    try {
      const dimensions = sizeOf(origin)
      const canvas = createCanvas(dimensions.width, dimensions.height)
      const ctx = canvas.getContext('2d')

      // 画像を貼り付け
      const image = await loadImage(origin)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

      // 線のスタイル設定
      ctx.strokeStyle = 'blue'
      ctx.lineWidth = 5

      // 線を描く
      for (let detail of details) {
        const { BoundingBox } = detail
        const boxLeft = Math.floor(BoundingBox!.Left! * dimensions.width)
        const boxTop = Math.floor(BoundingBox!.Top! * dimensions.height)
        const boxWidth = Math.floor(BoundingBox!.Width! * dimensions.width)
        const boxHeight = Math.floor(BoundingBox!.Height! * dimensions.height)

        // 線
        ctx.beginPath()
        ctx.moveTo(boxLeft, boxTop) // 左上からスタート
        ctx.lineTo(boxLeft + boxWidth, boxTop) // 右上
        ctx.lineTo(boxLeft + boxWidth, boxTop + boxHeight) // 右下
        ctx.lineTo(boxLeft, boxTop + boxHeight) // 左下
        ctx.lineTo(boxLeft, boxTop) // 左上に戻る
        ctx.stroke()
      }

      // JPEGに変換して保存
      console.info('BoundingBox image toBuffer')
      const result = canvas.toBuffer('image/jpeg', { quality: 0.95 })
      const boundingBox = Readable.from(result)
      await s3.uploadStream(userId, `${id}-box`, boundingBox, 'images')
    } catch (e) {
      console.error('Error', e)
    }
  }

  // putItem for Frontend
  const repository = new ResultRepository()
  const putItem = async (
    userId: string,
    userName: string,
    imageId: string,
    scoreDetail: ScoreDetail
  ) => {
    const score = scoreDetail.score()
    const result = await repository.putItem(
      userId,
      `${score}|${imageId}`,
      score,
      userName,
      imageId,
      'OverAllRanking',
      scoreDetail
    )

    if (!result) {
      return
    }

    templateMessage(userId, {
      type: 'template',
      altText: '判定が完了しました！',
      template: {
        type: 'buttons',
        title: `${round(score)} pt`,
        text: '判定が完了しました！',
        thumbnailImageUrl: `https://happy-surprize.s3.ap-northeast-1.amazonaws.com/${userId}/images/${imageId}-box`,
        imageSize: 'cover',
        actions: [
          {
            type: 'uri',
            label: '詳細を見る',
            uri: `http://localhost:3000/users/${userId}/photo/${imageId}`,
          },
        ],
      },
    })
  }

  // rekognition
  const rekognition = new RekognitionClient()
  for (let index = 0; index < body.Records.length; index++) {
    const record = body.Records[index]
    const { eventName, dynamodb } = record
    if (!dynamodb || !eventName || record.eventName !== 'INSERT') {
      console.info('Not INSERT data.')
      console.info(record)
      continue
    }

    const { NewImage } = dynamodb
    if (!NewImage) {
      continue
    }

    const partition = NewImage['partition'].S!
    const userId = NewImage['userId'].S!
    const path = `${userId}/images/${partition}`
    const result = await rekognition.detectFaces(path)

    if (!result) {
      message(userId, {
        type: 'text',
        text: '顔検出でエラーが起きました。再度やり直してください🙇🏻‍♂️',
      })
      continue
    }

    const { FaceDetails } = result
    const faceDetails = rekognition.filterHighConfidence(FaceDetails)
    if (faceDetails.length < 1) {
      message(userId, {
        type: 'text',
        text: '顔を検出できませんでした。再度やり直してください🙇🏻‍♂️',
      })
      continue
    }

    const origin = await thumbnail(userId, partition, path)
    await boundingBox(userId, partition, faceDetails, origin!)
    const profile = await client.getProfile(userId)
    const detail = ScoreDetail.fromFaceDetails(faceDetails)
    putItem(userId, profile.displayName, partition, detail)
  }

  res.status(200).end()
}
