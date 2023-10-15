export default class InvalidRequestBodyFormatException extends Error {
  name: string = 'InvalidRequestBodyFormatException';

  /**
   * Create a new Invalid Request Body Format Exception instance.
   *
   * @param {string} message
   */
  constructor(message: string) {
    super(message);
  }
}
