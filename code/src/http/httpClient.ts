import PendingRequestUrl from './pendingRequestUrl';
import { HttpMethods } from './types/httpMethods';

export default class HttpClient {
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
    this.requestUrl = new PendingRequestUrl(baseUrl);
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
   * Send the request to the given URL.
   *
   * @param {HttpMethods} method
   * @param {string} endpoint
   *
   * @returns {Promise<Response>}
   */
  private async sendRequest(method: HttpMethods, endpoint: string): Promise<Response> {
    const url = this.requestUrl.buildUrl(endpoint);

    return await fetch(url.toString(), { method });
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
}
