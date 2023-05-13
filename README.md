[![Tests](https://github.com/suhaotian/axios-enhance-adapter/actions/workflows/tests-ci.yml/badge.svg)](https://github.com/suhaotian/axios-enhance-adapter/actions/workflows/tests-ci.yml)
[![npm version](https://badge.fury.io/js/axios-enhance-adapter.svg)](https://badge.fury.io/js/axios-enhance-adapter)
[![install size](https://packagephobia.com/badge?p=axios-enhance-adapter@latest)](https://packagephobia.com/result?p=axios-enhance-adapter@latest)
[![author](https://badgen.net/badge/icon/Made%20by%20suhaotian?icon=github&label&color=black&labelColor=black)](https://github.com/suhaotian)
![license](https://badgen.net/npm/license/axios-enhance-adapter)

# axios enhance adapter

**Note: Currently, only support axios <= v0.27.2**

## Features:

- Avoid repeat requests at same time
- Error retry

### Usage

```ts
import { getEnhanceAdapter } from 'axios-enhance-adapter';
import axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: `http://127.0.0.1:${port}`,
  adapter: getEnhanceAdapter(defaultOptions),
});
const defaultOptions = {
  shouldRetryOnError: (err) => {
    return true;
  },
  errorRetryInterval: 3000,
  errorRetryCount: 3,
  checkEnable(config: AxiosRequestConfig) {
    const method = config.method?.toLowerCase();
    const isGet = method === 'get';
    return isGet;
  },
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
};

// only one will send
await Promise.all([1, 2, 3, 4, 5].map((item) => axiosInstance.get('/')));

// disable repeat requests filter and error retry
await Promise.all(
  [1, 2, 3, 4, 5].map((item) =>
    axiosInstance.get('/', {
      checkEnable: () => false,
    })
  )
);

// only disable error retry
await Promise.all(
  [1, 2, 3, 4, 5].map((item) =>
    axiosInstance.get('/', {
      shouldRetryOnError: (err) => {
        if (err.status === 401 || err.status === 403) {
          return false;
        }
        return true;
      },
    })
  )
);
```
