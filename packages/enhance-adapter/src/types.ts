import type { AxiosRequestConfig, AxiosAdapter, AxiosError } from 'axios';

/// <reference types="axios" />

export interface AxiosRequestEnhanceConfig {
  getKey?: (config: AxiosRequestConfig) => string;
  checkEnable?: (config: AxiosRequestConfig) => boolean;
  /** custom key */
  key?: string;
  /** retry when fetcher has an error */
  shouldRetryOnError?: (error: AxiosError) => boolean;
  /** default 5000, error retry interval in milliseconds */
  errorRetryInterval?: number;
  /** max error retry count */
  errorRetryCount?: number;
}

export interface EnhanceDefaultOptions
  extends Pick<
    AxiosRequestEnhanceConfig,
    'checkEnable' | 'getKey' | 'shouldRetryOnError' | 'errorRetryInterval' | 'errorRetryCount'
  > {
  customAdapter?: AxiosAdapter;
}
declare module 'axios' {
  export interface AxiosRequestConfig extends AxiosRequestEnhanceConfig {
    //
  }
}
