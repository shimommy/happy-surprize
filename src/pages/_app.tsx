import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { Marcellus } from '@next/font/google'
const marcellus = Marcellus({ weight: '400', subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={marcellus.className}>
      <Component {...pageProps} />
    </main>
  )
}
