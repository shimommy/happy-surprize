import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { RekognitionClient } from '@aws-sdk/client-rekognition'
import { S3Client } from '@aws-sdk/client-s3'

export const s3 = () =>
  new S3Client({
    region: process.env.REGION,
  })

export const dynamodb = () =>
  new DynamoDBClient({
    region: process.env.REGION,
  })

export const rekognition = () =>
  new RekognitionClient({ region: process.env.REGION })
