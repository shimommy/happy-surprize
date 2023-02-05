import { Score } from '@/models/score'
import { ResultRepository } from '@/repositories/result'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Score | null>
) {
  const { id } = req.query
  const repository = new ResultRepository()
  const result = await repository.getItemFromImageId(id as string)
  if (!result) {
    res.status(404).json(null)
  }

  res.status(200).json(result!)
}
