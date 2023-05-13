import axios, { AxiosRequestConfig } from 'axios';
import { getEnhanceAdapter } from 'axios-enhance-adapter';

export const defaultOptions = {
  shouldRetryOnError: (err) => true,
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

export const axiosInstance = axios.create({
  baseURL: `/`,
  adapter: getEnhanceAdapter(defaultOptions),
});
