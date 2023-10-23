export default class PendingRequestHeaders {
  /**
   * The headers for the pending request.
   *
   * @var {Headers}
   */
  public headers: Headers;

  /**
   * Create a new Pending Request Headers instance.
   */
  constructor() {
    this.headers = new Headers();
  }

  /**
   * Check if the headers have been set for the pending request.
   *
   * @returns {boolean}
   */
  public hasHeaders(): boolean {
    return Array.from(this.headers.entries()).length > 0;
  }

  /**
   * Replace the given header on the pending request.
   *
   * @param {string} name
   * @param {string} value
   *
   * @returns {void}
   */
  public replaceHeader(name: string, value: string): void {
    this.headers.set(name, value);
  }

  /**
   * Add the given header to the pending request.
   *
   * @param {string} name
   * @param {string} value
   *
   * @returns {void}
   */
  public withHeader(name: string, value: string): void {
    this.headers.append(name, value);
  }
}
