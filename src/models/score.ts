import { ScoreDetail } from './scoreDetail'

export type ScoreType = 'OverAllRanking'

export class Score {
  constructor(
    readonly partition: string,
    readonly sortKey: string,
    readonly userName: string,
    readonly detail: ScoreDetail,
    readonly scoreType: ScoreType
  ) {}
}
