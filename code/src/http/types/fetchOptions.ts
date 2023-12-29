import { HttpMethods } from './httpMethods';
import { Options } from './options';

export type FetchOptions = Options & {
  method: HttpMethods;
};
