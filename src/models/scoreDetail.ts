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

  static fromRecord(record: Record<string, AttributeValue> | undefined) {
    if (!record) {
      return new ScoreDetail()
    }

    return new ScoreDetail(
      Number(record.happy.N!),
      Number(record.surprize.N!),
      Number(record.angry.N!),
      Number(record.disgusted.N!),
      Number(record.confused.N!),
      Number(record.calm.N!),
      Number(record.sad.N!),
      Number(record.smile.N!)
    )
  }

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
      // 笑顔ではないまたは信頼度がない場合はスマイル係数を測定しない
      if (!Value || !Confidence) {
        return
      }

      if (Confidence < 91.0) {
        return
      }

      // 94以上ならば係数を上げる
      if (smile == 1.0) {
        smile += 0.1
        return
      }

      smile += 0.01
    })

    const length = faceDetails.length
    return new ScoreDetail(
      happy / length,
      surprize / length,
      angry / length,
      disgusted / length,
      confused / length,
      calm / length,
      sad / length,
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
      surprize: { N: `${this.surprize}` },
      angry: { N: `${this.angry}` },
      disgusted: { N: `${this.disgusted}` },
      confused: { N: `${this.confused}` },
      calm: { N: `${this.calm}` },
      sad: { N: `${this.sad}` },
      smile: { N: `${this.smile}` },
    }
  }
}
