import Image from 'next/image'
import { Score } from '@/models/score'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import FaceImage from '@/components/Image/FaceImage'
import { round } from '@/util/math'
import Link from 'next/link'

type Props = {
  rank: number
  score: Score
}

export default function Ranking({ score, rank }: Props) {
  const src = `${process.env.NEXT_PUBLIC_BUCKET}${score.partition}/images/${score.imageId}`
  const totalScore = score.sortKey.split('|')[0]

  return (
    <>
      <Head>
        <title>Happy Surprise</title>
        <meta name="description" content="Happy Surprise" />
        <meta
          name="viewport"
          content="width=device-width, heigh=device-heigh initial-scale=1"
        />
      </Head>
      <main>
        <div className="absolute top-0 left-0 z-50">
          <h1 className="px-5 pt-4 sm:px-8 sm:pb-0 text-lg sm:text-5xl">
            <Link href={'/'}>HAPPY SURPRISE</Link>
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row h-screen bg-black bg-opacity-40">
          <div className="sm:flex-1 w-full h-full relative">
            <Image
              src={src}
              className="absolute w-full h-full object-cover blur-md"
              alt={'Background'}
              width={1000}
              height={1000}
            ></Image>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 h-4/5 object-center">
              <FaceImage
                isLink={false}
                userId={score.partition}
                imageId={score.imageId}
                isBox={true}
              ></FaceImage>
            </div>
          </div>
          <div className="sm:flex-1 w-full h-full flex flex-col justify-center">
            <div className="w-full max-w-2xl mx-auto text-sm sm:text-4xl font-semibold px-2 pt-4 pb-2 ">
              {score.userName}さんの投稿写真
            </div>
            <div className="flex-none px-2 pb-2">
              <div className="w-full max-w-2xl sm:mx-auto bg-white shadow-lg rounded-sm border border-gray-200">
                <header className="px-5 py-4 border-b border-gray-100 flex flex-row">
                  <h2 className="text-sm sm:text-4xl font-semibold text-gray-800">
                    スコア
                  </h2>
                  <div className="flex-1"></div>
                  <h2 className="text-sm sm:text-4xl font-semibold text-gray-800">
                    {round(Number(totalScore))} pt
                  </h2>
                </header>
                <div className="p-3">
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full">
                      <thead className="text-sm sm:text-5xl font-semibold uppercase text-gray-400 bg-gray-50">
                        <tr>
                          <th className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-3xl font-semibold text-left">
                              表情
                            </div>
                          </th>
                          <th className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-3xl font-semibold text-center">
                              スコア
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-sm divide-y divide-gray-100">
                        <tr>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm sm:text-2xl font-medium text-gray-800">
                                喜び
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-2xl text-center text-gray-800">
                              {round(score.detail.happy)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm sm:text-2xl font-medium text-gray-800">
                                驚き
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-2xl text-center text-gray-800">
                              {round(score.detail.surprize)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm sm:text-2xl font-medium text-gray-800">
                                怒り
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-2xl text-center text-gray-800">
                              {round(score.detail.angry)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm sm:text-2xl font-medium text-gray-800">
                                嫌悪
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-2xl text-center text-gray-800">
                              {round(score.detail.disgusted)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm sm:text-2xl font-medium text-gray-800">
                                混乱
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-2xl text-center text-gray-800">
                              {round(score.detail.confused)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm sm:text-2xl font-medium text-gray-800">
                                穏やか
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-2xl text-center text-gray-800">
                              {round(score.detail.calm)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm sm:text-2xl font-medium text-gray-800">
                                悲しい
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-2xl text-center text-gray-800">
                              {round(score.detail.sad)}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm sm:text-2xl font-medium text-gray-800">
                                笑顔係数
                              </div>
                            </div>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            <div className="text-sm sm:text-2xl text-center text-gray-800">
                              {round(score.detail.smile)}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { rank } = context.query
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HOST}api/ranking/${rank}`
  )

  const list = await response.json()

  return {
    props: {
      rank: Number(rank),
      score: list[Number(rank) - 1],
    },
  }
}
