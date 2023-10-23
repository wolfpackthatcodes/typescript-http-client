import { RequestAuthorization } from '../types/requestAuthorization';

export default class pendingRequestAuthorization {
  /**
   * The authentication token for the pending request.
   *
   * @var {string|undefined}
   */
  public token?: string;

  /**
   * The authentication type for the pending request.
   *
   * @var {RequestAuthorization}
   */
  public type: RequestAuthorization = 'Bearer';

  /**
   * Check if Authorization header is required for pending request.
   *
   * @returns {boolean}
   */
  public isRequired(): boolean {
    return this.token !== undefined;
  }

  /**
   * Specify an authorization token for the pending request.
   *
   * @param {string} token
   * @param {RequestAuthorization} type
   *
   * @returns {void}
   */
  public withToken(token: string, type: RequestAuthorization = 'Bearer'): void {
    this.token = token.trim();
    this.type = type;
  }
}
