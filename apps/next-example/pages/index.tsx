import { AxiosRequestConfig } from 'axios';
import Head from 'next/head';
import { useEffect } from 'react';

import { axiosInstance } from '../axios';
import styles from '../styles/Home.module.css';

export async function run() {
  return Promise.all(
    [1, 2, 3, 4, 5, 6].map((item) =>
      axiosInstance.get('/test', {
        // default
        shouldRetryOnError: false,
        errorRetryInterval: 3000,
        errorRetryCount: 3,
        getKey(config: AxiosRequestConfig) {
          const { method, data, params, url } = config;
          const arr = [method, url];
          if (data) {
            arr.push(JSON.stringify(data));
          }
          if (params) {
            arr.push(JSON.stringify(params));
          }
          return arr.join(',');
        },
        checkEnable(config: AxiosRequestConfig) {
          const method = config.method?.toLowerCase();
          const isGet = method === 'post';
          return isGet;
        },
      })
    )
  );
}

export default function Home() {
  useEffect(() => {
    run();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>[web] Expo monorepo</title>
        <meta name="description" content="Sharing code with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>Hello, and open developer tools</main>
    </div>
  );
}
