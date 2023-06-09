import axios, { AxiosError, AxiosResponse, AxiosRequestConfig, AxiosAdapter } from 'axios';

import { EnhanceDefaultOptions } from './types';
import { isNotUndefined } from './utils';

const DefaultOptions: Omit<EnhanceDefaultOptions, 'customAdapter'> = {
  shouldRetryOnError: () => true,
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

interface QueueItem {
  queue: { resolve: Function; reject: Function }[];
  startTime: number;
  endTime?: number;
  retryCount?: number;
  lastData?: any;
}
interface RequestPendingQueue {
  [key: string]: undefined | QueueItem;
}

export function getEnhanceAdapter(options?: EnhanceDefaultOptions): AxiosAdapter {
  const requestPendingQueue: RequestPendingQueue = {};
  const adapter = (options?.customAdapter || axios.defaults.adapter) as AxiosAdapter;

  function request(
    requestConfig: AxiosRequestConfig,
    config: EnhanceDefaultOptions & { key: string }
  ) {
    return adapter(requestConfig)
      .then((res: AxiosResponse<any>) => {
        requestPendingQueue[config.key]?.queue.forEach((item) => {
          item.resolve(res);
        });
        delete requestPendingQueue[config.key];
      })
      .catch((err: AxiosError) => {
        const current = requestPendingQueue[config.key] as Required<QueueItem>;
        const { shouldRetryOnError, errorRetryCount } = config;
        if (
          shouldRetryOnError &&
          shouldRetryOnError(err) &&
          (errorRetryCount ? errorRetryCount > current.retryCount : true)
        ) {
          current.retryCount += 1;
          setTimeout(() => {
            request(requestConfig, config);
          }, config.errorRetryInterval);
        } else {
          current.queue.forEach((item) => {
            item.reject(err);
          });
          if (requestPendingQueue[config.key]) {
            delete requestPendingQueue[config.key];
          }
        }
      });
  }

  return function (axiosRequestConfig: AxiosRequestConfig) {
    const {
      key: _key,
      getKey,
      checkEnable,
      shouldRetryOnError: _shouldRetryOnError,
      errorRetryCount: _errorRetryCount,
      errorRetryInterval: _errorRetryInterval,
      ...requestConfig
    } = axiosRequestConfig;
    const opts = Object.assign({}, DefaultOptions, options) as Required<EnhanceDefaultOptions>;
    const enable = checkEnable ? checkEnable(requestConfig) : opts.checkEnable(requestConfig);

    if (!enable) {
      return adapter(requestConfig);
    }

    const key = _key || (getKey || opts.getKey)(requestConfig);

    return new Promise((resolve, reject) => {
      const config = {
        key,
        shouldRetryOnError: isNotUndefined(_shouldRetryOnError)
          ? _shouldRetryOnError
          : opts.shouldRetryOnError,
        errorRetryCount: isNotUndefined(_errorRetryCount) ? _errorRetryCount : opts.errorRetryCount,
        errorRetryInterval: isNotUndefined(_errorRetryInterval)
          ? _errorRetryInterval
          : opts.errorRetryInterval,
      };

      if (!requestPendingQueue[config.key]) {
        requestPendingQueue[config.key] = {
          startTime: Date.now(),
          retryCount: 0,
          queue: [],
        };
      }

      requestPendingQueue[config.key]?.queue.push({
        resolve,
        reject,
      });

      if (requestPendingQueue[config.key]?.queue.length === 1) {
        request(requestConfig, config);
      }
    });
  };
}
