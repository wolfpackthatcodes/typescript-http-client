export default class PendingRequestUrl {
  /**
   * The base URL for the pending request.
   *
   * @var {string}
   */
  private baseUrl: string = '';

  /**
   * The query parameters for the pending request URL.
   *
   * @returns {Record<string, string>|undefined}
   */
  private query?: Record<string, string>;

  /**
   * Create a new Pending Request Url instance.
   *
   * @param {string|undefined} baseUrl
   */
  constructor(baseUrl?: string) {
    if (baseUrl) this.setBaseUrl(baseUrl);
  }

  /**
   * Construct the URL for the pending request.
   *
   * @param {string} url
   *
   * @returns {URL}
   */
  public buildUrl(url: string): URL {
    url = url.replace(/^\/|\/$/g, '') + '/';

    if (!(url.startsWith('http://') || url.startsWith('https://'))) {
      url = this.baseUrl.replace(/\/$/, '') + '/' + url;
    }

    if (this.query !== undefined) {
      url += '?' + new URLSearchParams(this.query);
    }

    return new URL(url);
  }

  /**
   * Set the base URL for the pending request.
   *
   * @param {string} baseUrl
   *
   * @returns {void}
   */
  private setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Set the given query parameters in the pending request URL.
   *
   * @param {object} query
   *
   * @returns {void}
   */
  public withQueryParameters(query: object): void {
    this.query = { ...this.query, ...query };
  }
}
