import { dynamodb } from '@/lib/aws'
import { Score, ScoreType } from '@/models/score'
import { ScoreDetail } from '@/models/scoreDetail'
import {
  AttributeValue,
  GetItemCommand,
  GetItemCommandOutput,
  PutItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb'

export class ResultRepository {
  constructor(
    private db = dynamodb(),
    private tableName = 'RekognitionResultTable'
  ) {}

  decode(item: Record<string, AttributeValue> | undefined): Score | undefined {
    if (!item) {
      return
    }

    return {
      partition: item.partition.S ?? '',
      sortKey: item.sortKey.S ?? '',
      userName: item.userName.S ?? '',
      imageId: item.imageId.S ?? '',
      scoreType: item.scoreType.S as ScoreType,
      detail: ScoreDetail.fromRecord(item.scoreDetail.M!),
    }
  }

  async putItem(
    userId: string,
    sortKey: string,
    userName: string,
    imageId: string,
    scoreType: ScoreType,
    scoreDetail: ScoreDetail
  ) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        partition: { S: userId },
        sortKey: { S: sortKey },
        userName: { S: userName },
        imageId: { S: imageId },
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

  async getItem(partition: string, sortKey: string) {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        partition: { S: partition },
        sortKey: { S: sortKey },
      },
    })

    try {
      const result = await this.db.send(command)
      return this.decode(result.Item)
    } catch (e) {
      console.error('Error', e)
    }
  }

  async getItemFromImageId(imageId: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'imageId-index',
      KeyConditionExpression: 'imageId = :i',
      ExpressionAttributeValues: {
        ':i': { S: imageId },
      },
    })

    try {
      const result = await this.db.send(command)
      return result.Items!.map((Item) => this.decode(Item)!)[0]
    } catch (e) {
      console.error('Error', e)
    }
  }

  async queryOverAllRanking() {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'scoreType-index',
      KeyConditionExpression: 'scoreType = :t',
      Limit: 300,
      ScanIndexForward: false,
      ExpressionAttributeValues: {
        ':t': { S: 'OverAllRanking' },
      },
    })

    try {
      const result = await this.db.send(command)
      return result.Items!.map((Item) => this.decode(Item)!)
    } catch (e) {
      console.error('Error', e)
    }
  }
}
