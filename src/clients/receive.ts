import { dynamodb } from '@/lib/aws'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'

export class ReceiveClient {
  constructor(
    private client = dynamodb(),
    private tableName = 'ReceiveTable'
  ) {}

  async putItem(id: string, userId: string, replyToken: string) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        partition: { S: id },
        userId: { S: userId },
        replyToken: { S: replyToken },
      },
    })

    try {
      const result = await this.client.send(command)
      console.info(
        'Successfully putItem: id:' +
          id +
          ', userId:' +
          userId +
          ', replyToken:' +
          replyToken
      )
      return result
    } catch (e) {
      console.error('Error', e)
    }
  }
}
