import { lineClient } from '../lib/line'

export class UserClient {
  constructor(private client = lineClient()) {}

  async find(userId: string) {
    return await this.client.getProfile(userId)
  }
}
