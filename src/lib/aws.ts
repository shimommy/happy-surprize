import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'

export const s3 = () =>
  new S3Client({
    region: process.env.REGION,
  })

export const dynamodb = () =>
  new DynamoDBClient({
    region: process.env.REGION,
  })
