// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { createHmac } from 'crypto'

type Data = {
  name?: string
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  console.log(req)

  const { headers } = req
  if (!headers['x-line-signature']) {
    res.status(403).json({ error: 'x-line-signature not found' })
    return
  }

  const token = process.env.CHANNEL_ACCESS_TOKEN
  const { body } = req
  const signature = createHmac('SHA256', token!).update(body).digest('base64')
  const lineSignature = headers['x-line-signature']

  if (signature !== lineSignature) {
    res.status(403).json({ error: 'signature invalid' })
    return
  }

  res.status(200).json({ name: 'John Doe' })
}
