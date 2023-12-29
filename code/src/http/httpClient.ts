import MockedResponses from './responses/mockedResponses';
import PendingRequestBody from './pendingRequest/pendingRequestBody';
import PendingRequestUrl from './pendingRequest/pendingRequestUrl';
import { Options } from './types/options';
import { HttpMethods } from './types/httpMethods';
import { RequestAuthorization } from './types/requestAuthorization';
import InvalidHeaderFormatException from './exceptions/invalidHeaderFormatException';
import { FetchOptions } from './types/fetchOptions';
import { RequestOptions } from './types/requestOptions';

export default class HttpClient {
  /**
   * The mocked responses instance.
   *
   * @var {MockedResponse}
   */
  private mockedResponses: MockedResponses;

  /**
   * The request options object.
   *
   * @var {Options}
   */
  private options: Options = {};

  /**
   * The request body instance.
   *
   * @var {PendingRequestBody}
   */
  private requestBody: PendingRequestBody;

  /**
   * The request Url instance.
   *
   * @var {PendingRequestUrl}
   */
  private requestUrl: PendingRequestUrl;

  /**
   * Create a new Http Client instance.
   *
   * @param {string|undefined} baseUrl
   * @param {object|undefined} options
   */
  constructor(baseUrl?: string, options?: object) {
    this.mockedResponses = new MockedResponses();
    this.requestBody = new PendingRequestBody();
    this.requestUrl = new PendingRequestUrl(baseUrl);
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
    this.requestBody.asJson();
    this.contentType('application/json');

    return this;
  }

  /**
   * Indicate the request contains form data.
   *
   * @return {this}
   */
  public asForm(): this {
    this.requestBody.asForm();
    this.contentType('multipart/form-data');

    return this;
  }

  /**
   * Indicate the request contains form parameters.
   *
   * @return {this}
   */
  public asUrlEncoded(): this {
    this.requestBody.asUrlEncoded();
    this.contentType('application/x-www-form-urlencoded');

    return this;
  }

  /**
   * Construct the Fetch API Options for the request.
   *
   * @param {HttpMethods} method
   *
   * @returns {FetchOptions}
   */
  private buildRequestOptions(method: HttpMethods): FetchOptions {
    if (this.requestBody.hasBody()) {
      this.options.body = this.requestBody.parseRequestBody();

      if (!this.options.headers?.has('Content-Type')) {
        this.withHeader('Content-Type', 'text/plain');
      }
    }

    const options: FetchOptions = { method, ...this.options };

    if (!this.hasHeaders()) {
      delete options.headers;
    }

    return options;
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
   * Process a DELETE request to the given URL.
   *
   * @param {string} url
   *
   * @returns {Promise<Response>}
   */
  public delete(url: string): Promise<Response> {
    return this.sendRequest('DELETE', url);
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
   * @param {object|undefined} query
   *
   * @returns {Promise<Response>}
   */
  public get(url: string, query?: object): Promise<Response> {
    if (query) this.withQueryParameters(query);

    return this.sendRequest('GET', url);
  }

  /**
   * Check if the headers have been set for the pending request.
   *
   * @returns {boolean}
   */
  private hasHeaders(): boolean {
    return this.options.headers !== undefined && Array.from(this.options.headers.entries()).length > 0;
  }

  /**
   * Process a HEAD request to the given URL.
   *
   * @param {string} url
   * @param {object|undefined} query
   *
   * @returns {Promise<Response>}
   */
  public head(url: string, query?: object): Promise<Response> {
    if (query) this.withQueryParameters(query);

    return this.sendRequest('HEAD', url);
  }

  /**
   * Process a PATCH request to the given URL.
   *
   * @param {string} url
   * @param {object|string} data
   *
   * @returns {Promise<Response>}
   */
  public patch(url: string, data: object | string): Promise<Response> {
    this.withBody(data);

    return this.sendRequest('PATCH', url);
  }

  /**
   * Process a POST request to the given URL.
   *
   * @param {string} url
   * @param {object|string} data
   *
   * @returns {Promise<Response>}
   */
  public post(url: string, data: object | string): Promise<Response> {
    this.withBody(data);

    return this.sendRequest('POST', url);
  }

  /**
   * Process a PUT request to the given URL.
   *
   * @param {string} url
   * @param {object|string} data
   *
   * @returns {Promise<Response>}
   */
  public put(url: string, data: object | string): Promise<Response> {
    this.withBody(data);

    return this.sendRequest('PUT', url);
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
    this.options.headers?.set(name, value);

    return this;
  }

  /**
   * Replace the given headers on the request.
   *
   * @param {Headers|object} headers
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
   * Send the request to the given URL.
   *
   * @param {HttpMethods} method
   * @param {string} endpoint
   *
   * @returns {Promise<Response>}
   */
  private async sendRequest(method: HttpMethods, endpoint: string): Promise<Response> {
    const url = this.requestUrl.buildUrl(endpoint);

    return this.mockedResponses.isMocked()
      ? this.mockedResponses.getMockedResponse(url.toString())
      : await fetch(url.toString(), this.buildRequestOptions(method));
  }

  /**
   * Set the default options for the Http Client.
   *
   * @param {object|undefined} options
   */
  private setOptions(options?: object): void {
    this.options = { headers: new Headers() };

    if (options !== undefined) {
      for (const [key, value] of Object.entries(options)) {
        this.withOption(key, value);
      }
    }
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
   * @param {object|string} body
   *
   * @returns {void}
   */
  private withBody(body: object | string): void {
    this.requestBody.setBody(body);
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
    this.options.headers?.append(name, value);

    return this;
  }

  /**
   * Add the given headers to the request.
   *
   * @param {Headers|object} headers
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
      this.options[key] = value;
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
    this.requestUrl.withQueryParameters(query);

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
}
