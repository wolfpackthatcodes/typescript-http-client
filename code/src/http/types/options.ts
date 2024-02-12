import { RequestOptions } from './requestOptions';

export type Options = {
  body?: FormData | string | URLSearchParams;
  credentials?: RequestCredentials;
  headers?: Headers;
  signal?: AbortSignal;
  [key: string]: RequestOptions;
};
