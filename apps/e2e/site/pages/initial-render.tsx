import Head from 'next/head';
import { useEffect } from 'react';

import { axiosInstance, defaultOptions } from '../axios';
import styles from '../styles/Home.module.css';

export async function run() {
  return Promise.all(
    [1, 2, 3, 4, 5, 6].map((item) =>
      axiosInstance.get('/api/hello', {
        ...defaultOptions,
        shouldRetryOnError: () => true,
        errorRetryInterval: 2_000,
      })
    )
  );
}

export default function Home() {
  useEffect(() => {
    run().then((res) => {
      (window as any).onRender('Rendered!');
      console.log(res);
    });
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>[web] Expo monorepo</title>
        <meta name="description" content="Sharing code with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        Hello, <strong>axios-enhance-adapter</strong>
      </main>
    </div>
  );
}
