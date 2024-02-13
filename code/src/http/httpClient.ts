import MockedResponses from './responses/mockedResponses';
import { FetchOptions, HttpMethods, Options, RequestAuthorization, RequestBodyFormat, RequestOptions } from './types';
import {
  EmptyRequestBodyException,
  InvalidHeaderFormatException,
  InvalidRequestBodyFormatException,
} from './exceptions';

export default class HttpClient {
  /**
   * The base URL for the request.
   *
   * @var {string}
   */
  private baseUrl: string = '';

  /**
   * The request body data.
   *
   * @var {object | string | undefined}
   */
  private body?: object | string;

  /**
   * The request body format.
   *
   * @var {RequestBodyFormat}
   */
  private bodyFormat: RequestBodyFormat = 'String';

  /**
   * The mocked responses instance.
   *
   * @var {MockedResponse}
   */
  private mockedResponses: MockedResponses;

  /**
   * Number of attempts for the request.
   *
   * @var {number}
   */
  private requestAttempts: number = 0;

  /**
   * The request options object.
   *
   * @var {Options}
   */
  private requestOptions: Options = {};

  /**
   * The number of times to try the request.
   *
   * @var {number}
   */
  private retries: number = 0;

  /**
   * The number of milliseconds to wait between retries.
   *
   * @var {number}
   */
  private retryDelay: number = 0;

  /**
   * The callback that will determine if the request should be retried.
   *
   * @var {function}
   */
  private retryCallback?: (response: Response | undefined, request: this, error?: unknown) => boolean | null;

  /**
   * The URL for the request.
   *
   * @var {string}
   */
  private url: string = '';

  /**
   * The query parameters for the request URL.
   *
   * @var {Record<string, string> | undefined}
   */
  private urlQueryParameters?: Record<string, string>;

  /**
   * Create a new Http Client instance.
   *
   * @param {string | undefined} baseUrl
   * @param {object | undefined} options
   */
  constructor(baseUrl?: string, options?: object) {
    this.mockedResponses = new MockedResponses();

    this.setBaseUrl(baseUrl);
    this.setOptions(options);
  }

  /**
   * Indicate the type of content that should be returned by the server.
   *
   * @param {string} contentType
   *
   * @return {this}
   */
  public accept(contentType: string): this {
    return this.withHeader('Accept', contentType);
  }

  /**
   * Indicate that JSON should be returned by the server.
   *
   * @return {this}
   */
  public acceptJson(): this {
    return this.accept('application/json');
  }

  /**
   * Indicate the request contains JSON.
   *
   * @return {this}
   */
  public asJson(): this {
    this.setBodyFormat('Json');
    this.contentType('application/json');

    return this;
  }

  /**
   * Indicate the request contains form data.
   *
   * @return {this}
   */
  public asForm(): this {
    this.setBodyFormat('FormData');
    this.contentType('multipart/form-data');

    return this;
  }

  /**
   * Indicate the request contains form parameters.
   *
   * @return {this}
   */
  public asUrlEncoded(): this {
    this.setBodyFormat('URLSearchParams');
    this.contentType('application/x-www-form-urlencoded');

    return this;
  }

  /**
   * Try the request to the given URL.
   *
   * @param {HttpMethods} method
   *
   * @returns {Promise<Response>}
   */
  private async attemptRequest(method: HttpMethods): Promise<Response> {
    const url: URL = this.buildUrl();

    return this.mockedResponses.isMocked()
      ? this.mockedResponses.getMockedResponse(url.toString())
      : await fetch(url.toString(), this.buildRequestOptions(method));
  }

  /**
   * Construct the Fetch API Options for the request.
   *
   * @param {HttpMethods} method
   *
   * @returns {FetchOptions}
   */
  private buildRequestOptions(method: HttpMethods): FetchOptions {
    if (this.hasBody()) {
      this.requestOptions.body = this.parseRequestBody();

      if (!this.requestOptions.headers?.has('Content-Type')) {
        this.withHeader('Content-Type', 'text/plain');
      }
    }

    const options: FetchOptions = { method, ...this.requestOptions };

    if (!this.hasHeaders()) {
      delete options.headers;
    }

    return options;
  }

  /**
   * Construct the URL for the pending request.
   *
   * @returns {URL}
   */
  private buildUrl(): URL {
    let url = this.url
      .split('://')
      .map((urlSlug) => urlSlug.replace(/\/{2,}/g, '/'))
      .join('://');

    if (!url.endsWith('/')) {
      url += '/';
    }

    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
      url = this.baseUrl.replace(/\/$/, '') + url;
    }

    if (this.urlQueryParameters !== undefined) {
      url += '?' + new URLSearchParams(this.urlQueryParameters);
    }

    return new URL(url);
  }

  /**
   * Specify the request's content type.
   *
   * @param {string} contentType
   *
   * @return {this}
   */
  public contentType(contentType: string): this {
    return this.withHeader('Content-Type', contentType);
  }

  /**
   * Delays the execution of the request by the specified number of milliseconds.
   *
   * @param {number} milliseconds
   *
   * @returns {Promise<void>}
   */
  private delayRequest(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  /**
   * Process a DELETE request to the given URL.
   *
   * @param {string} url
   *
   * @returns {Promise<Response>}
   */
  public delete(url: string): Promise<Response> {
    this.withUrl(url);

    return this.sendRequest('DELETE');
  }

  /**
   * Register a mocked response that will intercept requests and be able to return mocked responses.
   *
   * @param {object} mockedResponses
   *
   * @returns {this}
   */
  public fake(mockedResponses: object): this {
    this.mockedResponses.set(mockedResponses);

    return this;
  }

  /**
   * Process a GET request to the given URL.
   *
   * @param {string} url
   * @param {object | undefined} query
   *
   * @returns {Promise<Response>}
   */
  public get(url: string, query?: object): Promise<Response> {
    this.withUrl(url);

    if (query) this.withQueryParameters(query);

    return this.sendRequest('GET');
  }

  /**
   * Check if the body data has been set for the pending request.
   *
   * @returns {boolean}
   */
  private hasBody(): boolean {
    return this.body !== undefined;
  }

  /**
   * Check if the headers have been set for the pending request.
   *
   * @returns {boolean}
   */
  private hasHeaders(): boolean {
    return this.requestOptions.headers !== undefined && Array.from(this.requestOptions.headers.entries()).length > 0;
  }

  /**
   * Process a HEAD request to the given URL.
   *
   * @param {string} url
   * @param {object | undefined} query
   *
   * @returns {Promise<Response>}
   */
  public head(url: string, query?: object): Promise<Response> {
    this.withUrl(url);

    if (query) this.withQueryParameters(query);

    return this.sendRequest('HEAD');
  }

  /**
   * Process a OPTIONS request to the given URL.
   *
   * @param {string} url
   *
   * @returns {Promise<Response>}
   */
  public options(url: string): Promise<Response> {
    this.withUrl(url);

    return this.sendRequest('OPTIONS');
  }

  /**
   * Process request body contents to desirable format.
   *
   * @throws {EmptyRequestBodyException | InvalidRequestBodyFormatException}
   *
   * @returns {string | FormData | URLSearchParams}
   */
  private parseRequestBody(): string | FormData | URLSearchParams {
    if (this.body === undefined) {
      throw new EmptyRequestBodyException('Request body has no data.');
    }

    if (this.bodyFormat === 'FormData') {
      if (typeof this.body === 'string') {
        throw new InvalidRequestBodyFormatException('Cannot parse a string as FormData.');
      }

      const formData = new FormData();

      for (const [key, value] of Object.entries(this.body)) {
        formData.append(key, value);
      }

      return formData;
    }

    if (this.bodyFormat === 'URLSearchParams') {
      if (typeof this.body === 'string') {
        throw new InvalidRequestBodyFormatException('Cannot parse a string as URLSearchParams.');
      }

      return new URLSearchParams({ ...this.body });
    }

    return typeof this.body === 'object' ? JSON.stringify(this.body) : this.body;
  }

  /**
   * Process a PATCH request to the given URL.
   *
   * @param {string} url
   * @param {object | string} data
   *
   * @returns {Promise<Response>}
   */
  public patch(url: string, data: object | string): Promise<Response> {
    this.withUrl(url);
    this.withBody(data);

    return this.sendRequest('PATCH');
  }

  /**
   * Process a POST request to the given URL.
   *
   * @param {string} url
   * @param {object | string} data
   *
   * @returns {Promise<Response>}
   */
  public post(url: string, data: object | string): Promise<Response> {
    this.withUrl(url);
    this.withBody(data);

    return this.sendRequest('POST');
  }

  /**
   * Process a PUT request to the given URL.
   *
   * @param {string} url
   * @param {object | string} data
   *
   * @returns {Promise<Response>}
   */
  public put(url: string, data: object | string): Promise<Response> {
    this.withUrl(url);
    this.withBody(data);

    return this.sendRequest('PUT');
  }

  /**
   * Replace the given header on the request.
   *
   * @param {string} name
   * @param {string} value
   *
   * @returns {this}
   */
  public replaceHeader(name: string, value: string): this {
    this.requestOptions.headers?.set(name, value);

    return this;
  }

  /**
   * Replace the given headers on the request.
   *
   * @param {Headers | object} headers
   *
   * @returns {this}
   */
  public replaceHeaders(headers: Headers | object): this {
    const entries = headers instanceof Headers ? Array.from(headers.entries()) : Object.entries(headers);

    for (const [key, value] of entries) {
      this.replaceHeader(key, value);
    }

    return this;
  }

  /**
   * Specify the number of times the request should be attempted.
   *
   * @param {number} maxAttempts
   * @param {number} intervalMilliseconds
   * @param {function} callback
   *
   * @returns {this}
   */
  retry(
    maxAttempts: number,
    intervalMilliseconds: number,
    callback?: (response: Response | undefined, request: this, error?: unknown) => boolean | null,
  ): this {
    this.retries = maxAttempts;
    this.retryDelay = intervalMilliseconds;
    this.retryCallback = callback;

    return this;
  }

  /**
   * Send the request to the given URL.
   *
   * @param {HttpMethods} method
   *
   * @returns {Promise<Response>}
   */
  private async sendRequest(method: HttpMethods): Promise<Response> {
    this.requestAttempts++;

    try {
      const response: Response = await this.attemptRequest(method);
      const successfulResponse: boolean = response !== undefined && response.ok;
      const shouldRetry = this.retryCallback ? this.retryCallback(response, this) : true;

      if (!successfulResponse && shouldRetry === true && this.requestAttempts <= this.retries) {
        await this.delayRequest(this.retryDelay);

        if (this.retryCallback) {
          this.retryCallback(response, this);
        }

        return this.sendRequest(method);
      } else {
        return response;
      }
    } catch (error) {
      if (this.requestAttempts <= this.retries) {
        await this.delayRequest(this.retryDelay);

        if (this.retryCallback) {
          this.retryCallback(undefined, this, error);
        }

        return this.sendRequest(method);
      } else {
        throw error;
      }
    }
  }

  /**
   * Set the base URL for the request.
   *
   * @param {string} baseUrl
   *
   * @returns {void}
   */
  private setBaseUrl(baseUrl: string = ''): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Specify the body data of the request.
   *
   * @param {object | string} body
   *
   * @return {void}
   */
  private setBody(body: object | string): void {
    this.body = body;
  }

  /**
   * Specify the body format of the request.
   *
   * @param {RequestBodyFormat} format
   *
   * @return {void}
   */
  private setBodyFormat(format: RequestBodyFormat): void {
    this.bodyFormat = format;
  }

  /**
   * Set the default options for the request.
   *
   * @param {object | undefined} options
   */
  private setOptions(options?: object): void {
    this.requestOptions = { headers: new Headers() };

    if (options !== undefined) {
      for (const [key, value] of Object.entries(options)) {
        this.withOption(key, value);
      }
    }
  }

  /**
   * Specify the timeout (in milliseconds) for the pending request.
   *
   * @param {number} milliseconds
   *
   * @returns {this}
   */
  public timeout(milliseconds: number): this {
    this.withOption('signal', AbortSignal.timeout(milliseconds));

    return this;
  }

  /**
   * Specify the basic authentication username and password for the request.
   *
   * @param {string} username
   * @param {string} password
   *
   * @returns {this}
   */
  public withBasicAuth(username: string, password: string): this {
    return this.withToken(btoa(`${username}:${password}`), 'Basic');
  }

  /**
   * Attach body data to the request.
   *
   * @param {object | string} body
   *
   * @returns {void}
   */
  private withBody(body: object | string): void {
    this.setBody(body);
  }

  /**
   * Send credentials with the request.
   *
   * @param {RequestCredentials} credentials
   *
   * @returns {this}
   */
  public withCredentials(credentials: RequestCredentials = 'same-origin'): this {
    return this.withOption('credentials', credentials);
  }

  /**
   * Add the given header to the request.
   *
   * @param {string} name
   * @param {string} value
   *
   * @returns {this}
   */
  public withHeader(name: string, value: string): this {
    this.requestOptions.headers?.append(name, value);

    return this;
  }

  /**
   * Add the given headers to the request.
   *
   * @param {Headers | object} headers
   *
   * @returns {this}
   */
  public withHeaders(headers: Headers | object): this {
    const entries = headers instanceof Headers ? Array.from(headers.entries()) : Object.entries(headers);

    for (const [key, value] of entries) {
      this.withHeader(key, value);
    }

    return this;
  }

  /**
   * Add the given option to the request.
   *
   * @param {string} key
   * @param {RequestOptions} value
   *
   * @throws {InvalidHeaderFormatException}
   *
   * @returns {this}
   */
  public withOption(key: string, value: RequestOptions): this {
    if (key === 'headers') {
      if (typeof value === 'object' && value !== null) {
        this.withHeaders(value);
      } else {
        throw new InvalidHeaderFormatException('Header options must be an object.');
      }
    } else {
      this.requestOptions[key] = value;
    }

    return this;
  }

  /**
   * Add the given options to the request.
   *
   * @param {object} options
   *
   * @returns {this}
   */
  public withOptions(options: object): this {
    for (const [key, value] of Object.entries(options)) {
      this.withOption(key, value);
    }

    return this;
  }

  /**
   * Set the given query parameters in the request URL.
   *
   * @param {object} query
   *
   * @returns {this}
   */
  public withQueryParameters(query: object): this {
    this.urlQueryParameters = { ...this.urlQueryParameters, ...query };

    return this;
  }

  /**
   * Specify an authorization token for the request.
   *
   * @param {string} token
   * @param {RequestAuthorization} type
   *
   * @returns {this}
   */
  public withToken(token: string, type: RequestAuthorization = 'Bearer'): this {
    return this.withHeader('Authorization', `${type} ${token.trim()}`);
  }

  /**
   * Specify the URL for the request.
   *
   * @param {string} url
   *
   * @returns {this}
   */
  public withUrl(url: string): this {
    this.url = url;

    return this;
  }
}
