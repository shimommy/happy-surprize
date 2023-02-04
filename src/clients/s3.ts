import { s3 } from '@/lib/aws'
import { PutObjectCommandInput } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'stream'

export class S3Client {
  constructor(private client = s3()) {}

  async uploadStream(userId: string, Key: string, Body: Readable) {
    try {
      const params: PutObjectCommandInput = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${userId}/images/${Key}`,
        Body: Body,
      }
      const upload = new Upload({
        client: this.client,
        params,
      })

      const data = await upload.done()
      console.info(
        'Successfully uploaded object: ' + params.Bucket + '/' + params.Key
      )
      return data
    } catch (e) {
      console.error('Error', e)
    }
  }
}
