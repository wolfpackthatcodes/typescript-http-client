import { HttpMethods } from './httpMethods';

export type FetchOptions = {
  method: HttpMethods;
  headers?: Headers;
  credentials?: RequestCredentials;
  body?: URLSearchParams | FormData | string;
};
