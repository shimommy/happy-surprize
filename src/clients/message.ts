import { lineClient } from '@/lib/line'
import { Message, TemplateMessage, TextMessage } from '@line/bot-sdk'

export class MessageClient {
  constructor(private client = lineClient()) {}

  reply(replyToken: string, messages: Message | Message[]) {
    this.client.replyMessage(replyToken, messages)
  }

  message(to: string, messages: TextMessage | TextMessage[]) {
    this.client.pushMessage(to, messages)
  }

  templateMessage(to: string, messages: TemplateMessage | TemplateMessage[]) {
    this.client.pushMessage(to, messages)
  }

  async getContent(messageId: string) {
    return this.client.getMessageContent(messageId)
  }

  async getProfile(userId: string) {
    return this.client.getProfile(userId)
  }
}
