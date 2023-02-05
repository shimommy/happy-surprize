import { dynamodb } from '@/lib/aws'
import { ScoreType } from '@/models/score'
import { ScoreDetail } from '@/models/scoreDetail'
import { GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'

export class ResultRepository {
  constructor(
    private db = dynamodb(),
    private tableName = 'RekognitionResultTable'
  ) {}

  async putItem(
    userId: string,
    sortKey: string,
    userName: string,
    scoreType: ScoreType,
    scoreDetail: ScoreDetail
  ) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        partition: { S: userId },
        sortKey: { S: sortKey },
        userName: { S: userName },
        scoreType: { S: scoreType },
        scoreDetail: { M: scoreDetail.toAttributeValues() },
      },
    })

    try {
      const result = await this.db.send(command)
      console.info(
        'Successfully putItem: userId:' +
          userId +
          ', sortKey:' +
          sortKey +
          ', userName:' +
          userName
      )
      return result
    } catch (e) {
      console.error('Error', e)
    }
  }

  getItem(partition: string, sortKey: string) {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        partition: { S: partition },
        sortKey: { S: sortKey },
      },
    })
  }

  queryOverAllRanking() {}
}
