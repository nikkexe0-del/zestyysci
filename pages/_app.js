import '../styles/globals.css';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>ZestyyScii - Educational Platform</title>
        <meta name="description" content="Learn science with fun!" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
