import { AttributeValue } from '@aws-sdk/client-dynamodb'
import { EmotionName, FaceDetail } from '@aws-sdk/client-rekognition'

// スコアの詳細（複数人いる場合は平均値をスコアとする）
export class ScoreDetail {
  constructor(
    // 幸せ
    readonly happy: number = 0,
    // 驚き
    readonly surprize: number = 0,
    // 怒り
    readonly angry: number = 0,
    // 嫌悪
    readonly disgusted: number = 0,
    // 混乱
    readonly confused: number = 0,
    // 穏やか
    readonly calm: number = 0,
    // 悲しい
    readonly sad: number = 0,
    // 笑顔係数
    readonly smile: number = 0
  ) {}

  static fromFaceDetails(faceDetails: FaceDetail[]): ScoreDetail {
    let happy: number = 0,
      surprize: number = 0,
      angry: number = 0,
      disgusted: number = 0,
      confused: number = 0,
      calm: number = 0,
      sad: number = 0
    let smile: number = 1

    faceDetails.forEach((faceDetail) => {
      const { Emotions, Smile } = faceDetail
      if (!Smile && !Emotions) {
        return
      }

      // NOTE: Emotions（の中身含めて）が空になることはない想定
      ;(Emotions ?? []).forEach((emotion) => {
        const { Confidence, Type } = emotion
        switch (Type) {
          case EmotionName.ANGRY:
            angry += Confidence!
            break
          case EmotionName.SURPRISED:
            surprize += Confidence!
            break
          case EmotionName.SAD:
            sad += Confidence!
            break
          case EmotionName.DISGUSTED:
            disgusted += Confidence!
            break
          case EmotionName.CONFUSED:
            confused += Confidence!
            break
          case EmotionName.CALM:
            calm += Confidence!
            break
          case EmotionName.HAPPY:
            happy += Confidence!
            break
          default:
            break
        }
      })

      if (!Smile) {
        return
      }

      const { Value, Confidence } = Smile
      if (!Value || !Confidence) {
        return
      }

      if (Confidence > 94.0) {
        smile += 0.1
      }
    })

    const length = faceDetails.length
    return new ScoreDetail(
      happy / length,
      calm / length,
      sad / length,
      surprize / length,
      confused / length,
      angry / length,
      disgusted / length,
      smile
    )
  }

  score(): number {
    return (
      (this.happy +
        this.calm +
        this.surprize +
        this.sad -
        this.angry -
        this.confused) *
      this.smile
    )
  }

  toAttributeValues(): Record<string, AttributeValue> {
    return {
      happy: { N: `${this.happy}` },
      calm: { N: `${this.calm}` },
      surprize: { N: `${this.surprize}` },
      sad: { N: `${this.sad}` },
      angry: { N: `${this.angry}` },
      confused: { N: `${this.confused}` },
      disgusted: { N: `${this.disgusted}` },
      smile: { N: `${this.smile}` },
    }
  }
}
