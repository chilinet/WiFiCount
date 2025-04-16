import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <SessionProvider session={session}>
      {isLoginPage ? (
        <Component {...pageProps} />
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
} 