export default class PendingRequestCredentials {
  /**
   * The credentials property for the pending request.
   *
   * @var {RequestCredentials|undefined}
   */
  public credentials?: RequestCredentials;

  /**
   * Indicate if credentials should be included in the pending request.
   *
   * @returns {boolean}
   */
  public isRequired(): boolean {
    return this.credentials !== undefined;
  }

  /**
   * Send credentials with the pending request.
   *
   * @param {RequestCredentials} credentials
   *
   * @returns {void}
   */
  public withCredentials(credentials: RequestCredentials = 'same-origin'): void {
    this.credentials = credentials;
  }
}
