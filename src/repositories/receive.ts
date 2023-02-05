import { dynamodb } from '@/lib/aws'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'

export class ReceiveRepository {
  constructor(private db = dynamodb(), private tableName = 'ReceiveTable') {}

  async putItem(id: string, userId: string) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: {
        partition: { S: id },
        userId: { S: userId },
      },
    })

    try {
      const result = await this.db.send(command)
      console.info('Successfully putItem: id:' + id + ', userId:' + userId)
      return result
    } catch (e) {
      console.error('Error', e)
    }
  }
}
