import { SessionProvider } from "next-auth/react"
import '@/styles/globals.css'  // Adjust this path if your global styles are located elsewhere

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}