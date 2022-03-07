import { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import './styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import { initGA } from 'utils/analytics';
import 'react-loading-skeleton/dist/skeleton.css';
import { IntlWrapper } from '@xeo/ui/lib/Wrappers/IntlWrapper';
import { PrivateRoute } from 'components/PrivateRoute';
import { SkeletonWrapper } from 'components/SkeletonWrapper/SkeletonWrapper';

declare global {
  interface Window {
    GA_INITIALIZED: undefined | boolean;
  }
}

function CustomApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  useEffect(() => {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
  }, []);

  return (
    <>
      <Head>
        <title>Xeo Scrum</title>
        <link rel="icon" href="/xeo.ico" />
      </Head>
      <IntlWrapper>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SkeletonWrapper>
            <SessionProvider session={session}>
              <PrivateRoute>
                <main className="prose dark:prose-invert max-w-none">
                  <Component {...pageProps} />
                </main>
              </PrivateRoute>
            </SessionProvider>
          </SkeletonWrapper>
        </ThemeProvider>
      </IntlWrapper>
    </>
  );
}

export default CustomApp;
