import axios, { AxiosRequestConfig } from 'axios';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';

import { runServer, closeServer } from './test-server-api';
import { getEnhanceAdapter } from '../src/enhance';

const port = 5111;

beforeAll(async () => {
  await runServer(port);
});

afterAll(async () => {
  await closeServer();
});

describe('axios-enhance test suits', () => {
  const defaultOptions = {
    shouldRetryOnError: true,
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
      const isGet = method === 'get';
      return isGet;
    },
  };
  const axiosInstance = axios.create({
    baseURL: `http://127.0.0.1:${port}`,

    adapter: getEnhanceAdapter(defaultOptions),
  });

  beforeEach(async () => {
    await axiosInstance.get('/reset-count');
  });

  it('should only one request actually send when multiple GET requests send at same time', async () => {
    const result = await Promise.all(
      [1, 2, 3, 4, 5].map((item) => {
        return axiosInstance.get('/add-count', {
          params: {
            response: { data: 'hello' },
            delay: 1000,
          },
        });
      })
    );

    expect(result.length).toBe(5);
    result.forEach((item) => {
      expect(item.data.count === 1).toBe(true);
    });

    const latestCount = await axiosInstance.get('/add-count').then((res) => res.data.count);

    expect(latestCount).toBe(2);
  });

  it('should not pending when sending multiple GET requests at same time with  `checkEnable = () => false`', async () => {
    const result = await Promise.all(
      [1, 2, 3, 4, 5].map((item) => {
        return axiosInstance.get('/add-count', {
          checkEnable: () => false,
          params: {
            response: { data: 'hello' },
            delay: 1000,
          },
        });
      })
    );

    expect(result.length).toBe(5);
    result.forEach((item, index) => {
      expect(item.data.count).toBe(index + 1);
    });
  });

  it('should not pending with sending multiple POST/PUT/DELETE..(not GET) requests at same time', async () => {
    const result = await Promise.all(
      [1, 2, 3, 4, 5].map((item) => {
        return axiosInstance.post('/add-count', {
          body: {
            response: { data: 'hello' },
            delay: 1000,
          },
        });
      })
    );

    expect(result.length).toBe(5);
    result.forEach((item, index) => {
      expect(item.data.count).toBe(index + 1);
    });
  });

  it('should only one request actually send when sending multiple POST/PUT/DELETE..(not GET) requests  at same time', async () => {
    const result = await Promise.all(
      [1, 2, 3, 4, 5].map((item) => {
        return axiosInstance.post(
          '/add-count',
          {
            body: {
              response: { data: 'hello' },
              delay: 1000,
            },
          },
          {
            checkEnable: () => true,
          }
        );
      })
    );
    expect(result.length).toBe(5);
    result.forEach((item) => {
      expect(item.data.count).toBe(1);
    });

    const latestCount = await axiosInstance
      .post(
        '/add-count',
        {
          body: {
            response: { data: 'hello' },
            delay: 1000,
          },
        },
        {
          checkEnable: () => true,
        }
      )
      .then((res) => res.data.count);

    expect(latestCount).toBe(2);
  });

  it('timeout should have error', async () => {
    const result = await Promise.all(
      [1, 2, 3, 4, 5].map((item) => {
        return new Promise(async (resolve, reject) => {
          axiosInstance
            .get('/timeout-test', {
              timeout: 200,
              shouldRetryOnError: false,
              params: {
                delay: 500,
              },
            })
            .then((res) => resolve('no error'))
            .catch((e) => {
              resolve(e.message);
            });
        });
      })
    );
    expect(result.length).toBe(5);
    result.forEach((item: unknown, index: number) => {
      expect((item as string).indexOf('timeout')).toBeGreaterThan(-1);
    });
  });

  it('error retry should work', async () => {
    const retryCount = 3;
    const errorRetryInterval = 300;
    const delay = 200;
    const total = (errorRetryInterval + delay) * retryCount + delay;
    const startTimestamp = Date.now();

    const result = await Promise.all(
      [1, 2, 3, 4, 5].map((item) => {
        return axiosInstance
          .get('/test-error-retry', {
            shouldRetryOnError: true,
            errorRetryCount: retryCount,
            errorRetryInterval,
            params: {
              delay,
              key: 'error-retry-test',
              maxErrorCount: retryCount,
            },
          })
          .then((res) => {
            return res.data.retryCount;
          });
      })
    );

    expect(Date.now() - startTimestamp >= total).toBe(true);

    expect(result.length).toBe(5);
    result.forEach((item) => {
      expect(item).toBe(retryCount + 1);
    });
  });

  it('disable error retry should have error', async () => {
    const retryCount = 3;
    const result: string[] = [];
    const delay = 200;
    const startTimestamp = Date.now();

    await Promise.all(
      [1, 2, 3, 4, 5].map((item) => {
        return axiosInstance
          .get('/test-error-retry', {
            shouldRetryOnError: false,
            errorRetryCount: retryCount,
            params: {
              delay,
              key: 'error-retry-test-2',
              maxErrorCount: retryCount,
            },
          })
          .then((res) => {
            return res.data.retryCount;
          })
          .catch((e) => {
            result.push(e.message);
          });
      })
    );
    expect(Date.now() - startTimestamp < delay + 50).toBe(true);

    expect(result.length).toBe(5);
    result.forEach((item) => {
      expect(item).toBe('Request failed with status code 400');
    });
  });
});
