import { s3 } from '@/lib/aws'
import { GetObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'stream'

type ImageType = 'images' | 'thumbnails'

export class S3Client {
  constructor(private client = s3()) {}

  async getBuffer(Key: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key,
    })

    try {
      const result = await this.client.send(command)
      const array = await result.Body!.transformToByteArray()
      return Buffer.from(array.buffer)
    } catch (e) {
      console.error('Error', e)
    }
  }

  async uploadStream(
    userId: string,
    Key: string,
    Body: Readable,
    imageType: ImageType = 'images'
  ) {
    const params: PutObjectCommandInput = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${userId}/${imageType}/${Key}`,
      Body: Body,
    }

    const upload = new Upload({
      client: this.client,
      params,
    })

    try {
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
