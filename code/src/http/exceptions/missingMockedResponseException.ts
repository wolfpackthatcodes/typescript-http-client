export default class MissingMockedResponseException extends TypeError {
  name: string = 'MissingMockedResponseException';

  /**
   * Create a new Missing Mocked Response Exception instance.
   *
   * @param {string} message
   */
  constructor(message: string) {
    super(message);
  }
}
