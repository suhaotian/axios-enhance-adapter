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
  shouldRetryOnError: true,
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
      shouldRetryOnError: false,
    })
  )
);
```
