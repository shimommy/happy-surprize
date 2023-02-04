import { lineClient } from '@/lib/line'
import { Message } from '@line/bot-sdk'

export class MessageClient {
  constructor(private client = lineClient()) {}

  reply(replyToken: string, messages: Message | Message[]) {
    this.client.replyMessage(replyToken, messages)
  }

  async getContent(messageId: string) {
    return this.client.getMessageContent(messageId)
  }
}
