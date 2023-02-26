import FaceImage from '@/components/Image/FaceImage'
import { useRanking } from '@/hooks/ranking/useRanking'
import Head from 'next/head'

export default function Ranking() {
  const { loading, success, ranking } = useRanking()

  return (
    <>
      <Head>
        <title>Happy Surprize</title>
        <meta name="description" content="Happy Surprize" />
        <meta
          name="viewport"
          content="width=device-width, heigh=device-heigh initial-scale=1"
        />
      </Head>
      <main className="w-screen h-screen bg-black bg-opacity-40 overflow-auto">
        <header>
          <h1 className="px-5 pt-4 sm:px-8 sm:pb-0 text-lg sm:text-5xl">
            HAPPY SURPRIZE
          </h1>
        </header>
        <div className="sm:p-8 p-5">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <div className="gap-2 columns-2 sm:gap-4 md:columns-3 lg:columns-5 [&>div:not(:first-child)]:mt-2 sm:[&>div:not(:first-child)]:mt-8">
              {ranking.map((data, index) => {
                return (
                  <FaceImage
                    key={data.imageId}
                    isLink={true}
                    userId={data.partition}
                    imageId={data.imageId}
                    isRank={index + 1}
                  ></FaceImage>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
