import PendingRequestAuthorization from './pendingRequestAuthorization';
import PendingRequestCredentials from './pendingRequestCredentials';
import PendingRequestHeaders from './pendingRequestHeaders';
import PendingRequestUrl from './pendingRequestUrl';
import { FetchOptions } from './types/fetchOptions';
import { HttpMethods } from './types/httpMethods';
import { RequestAuthorization } from './types/requestAuthorization';

export default class HttpClient {
  /**
   * The request authorization instance.
   *
   * @var {PendingRequestAuthorization}
   */
  private requestAuthorization: PendingRequestAuthorization;

  /**
   * The request credentials instance.
   *
   * @var {PendingRequestCredentials}
   */
  private requestCredentials: PendingRequestCredentials;

  /**
   * The request headers instance.
   *
   * @var {PendingRequestHeaders}
   */
  private requestHeaders: PendingRequestHeaders;

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
   */
  constructor(baseUrl?: string) {
    this.requestAuthorization = new PendingRequestAuthorization();
    this.requestCredentials = new PendingRequestCredentials();
    this.requestHeaders = new PendingRequestHeaders();
    this.requestUrl = new PendingRequestUrl(baseUrl);
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
   * Construct the Fetch API Options for the request.
   *
   * @param {HttpMethods} method
   *
   * @returns {FetchOptions}
   */
  private buildRequestOptions(method: HttpMethods): FetchOptions {
    const options: FetchOptions = { method };

    if (this.requestCredentials.isRequired()) {
      options.credentials = this.requestCredentials.credentials;
    }

    if (this.requestAuthorization.isRequired()) {
      this.requestHeaders.withHeader(
        'Authorization',
        `${this.requestAuthorization.type} ${this.requestAuthorization.token}`,
      );
    }

    if (this.requestHeaders.hasHeaders()) {
      options.headers = this.requestHeaders.headers;
    }

    return options;
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
   * Replace the given header on the request.
   *
   * @param {string} name
   * @param {string} value
   *
   * @returns {this}
   */
  public replaceHeader(name: string, value: string): this {
    this.requestHeaders.replaceHeader(name, value);

    return this;
  }

  /**
   * Replace the given headers on the request.
   *
   * @param {object} headers
   *
   * @returns {this}
   */
  public replaceHeaders(headers: object): this {
    for (const [key, value] of Object.entries(headers)) {
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

    return await fetch(url.toString(), this.buildRequestOptions(method));
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
   * Send credentials with the request.
   *
   * @param {RequestCredentials} credentials
   *
   * @returns {this}
   */
  public withCredentials(credentials: RequestCredentials = 'same-origin'): this {
    this.requestCredentials.withCredentials(credentials);

    return this;
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
    this.requestHeaders.withHeader(name, value);

    return this;
  }

  /**
   * Add the given headers to the request.
   *
   * @param {object} headers
   *
   * @returns {this}
   */
  public withHeaders(headers: object): this {
    for (const [key, value] of Object.entries(headers)) {
      this.withHeader(key, value);
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
    this.requestAuthorization.withToken(token, type);

    return this;
  }
}
