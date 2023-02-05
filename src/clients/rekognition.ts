import { rekognition } from '@/lib/aws'
import { DetectFacesCommand, FaceDetail } from '@aws-sdk/client-rekognition'

export class RekognitionClient {
  constructor(private client = rekognition()) {}

  async detectFaces(Name: string) {
    const command = new DetectFacesCommand({
      Attributes: ['ALL', 'DEFAULT'],
      Image: {
        S3Object: {
          Bucket: process.env.BUCKET_NAME,
          Name,
        },
      },
    })

    try {
      const result = await this.client.send(command)
      return result
    } catch (e) {
      console.error('Error', e)
    }
  }

  filterHighConfidence(faceDetails?: FaceDetail[]) {
    if (!faceDetails) {
      return []
    }

    return faceDetails.filter((faceDetail) => {
      const { Confidence } = faceDetail
      return Confidence && Confidence > 99.0
    })
  }
}
