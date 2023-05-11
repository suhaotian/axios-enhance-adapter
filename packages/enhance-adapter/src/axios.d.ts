import { AxiosRequestConfig, AxiosAdapter } from 'axios/index';

/// <reference types="axios" />

export interface AxiosRequestEnhanceConfig {
  getKey?: (config: AxiosRequestConfig) => string;
  checkEnable?: (config: AxiosRequestConfig) => boolean;
  /** custom key */
  key?: string;
  /** retry when fetcher has an error */
  shouldRetryOnError?: boolean;
  /** default 5000, error retry interval in milliseconds */
  errorRetryInterval?: number;
  /** max error retry count */
  errorRetryCount?: number;
}

export interface AxiosEnhanceConfig
  extends Pick<
    AxiosRequestEnhanceConfig,
    'checkEnable' | 'getKey' | 'shouldRetryOnError' | 'errorRetryInterval' | 'errorRetryCount'
  > {
  customAdapter?: AxiosAdapter;
}
declare module 'axios/index' {
  export interface AxiosRequestConfig extends AxiosRequestEnhanceConfig {
    //
  }
}
