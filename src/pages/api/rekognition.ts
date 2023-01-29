// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { DynamoDBStreamEvent } from 'aws-lambda/trigger/dynamodb-stream'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
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

  console.log(body)
  res.status(200).end()
}
