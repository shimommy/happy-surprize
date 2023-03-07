import Image from 'next/image'
import Link from 'next/link'

type Props = {
  userId: string
  imageId: string
  isLink: boolean
  isBox?: boolean
  isRank?: number
}

export default function FaceImage(props: Props) {
  const src = `${process.env.NEXT_PUBLIC_BUCKET}${props.userId}/${
    props.isLink ? 'thumbnails' : 'images'
  }/${props.imageId}${props.isBox ? '-box' : ''}`
  const link = `/users/${props.userId}/photo/${props.imageId}`

  var bgColor = ''
  switch (props.isRank) {
    case 1:
      bgColor = 'bg-amber-400'
      break
    case 2:
      bgColor = 'bg-zinc-300'
      break
    case 3:
      bgColor = 'bg-orange-800'
      break

    default:
      bgColor = 'bg-slate-600'
      break
  }

  const rankingIconClassName = (): string => {
    return `absolute w-5 h-5 right-1 sm:w-10 sm:h-10 top-0 sm:right-2 mt-1 font-bold rounded-full ${bgColor} flex items-center justify-center`
  }

  console.log(bgColor)
  return (
    <div className="w-full h-full">
      {props.isLink ? (
        <Link href={link} className="relative">
          <Image
            src={src}
            alt={'FaceImage'}
            height={1000}
            width={1000}
            className="w-full h-full object-contain"
          />
          {props.isRank ? (
            <div className={rankingIconClassName()}>{props.isRank}</div>
          ) : (
            <></>
          )}
        </Link>
      ) : (
        <Image
          src={src}
          alt={'FaceImage'}
          height={1000}
          width={1000}
          className="w-full h-full object-contain"
        />
      )}
    </div>
  )
}
