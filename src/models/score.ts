import { ScoreDetail } from './scoreDetail'

export type ScoreType = 'OverAllRanking'

export class Score {
  constructor(
    readonly partition: string,
    readonly sortKey: string,
    readonly score: number,
    readonly userName: string,
    readonly imageId: string,
    readonly detail: ScoreDetail,
    readonly scoreType: ScoreType,
    readonly createdAt: string,
    readonly updatedAt: string
  ) {}
}
