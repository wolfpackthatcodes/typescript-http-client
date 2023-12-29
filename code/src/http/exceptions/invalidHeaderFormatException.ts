export default class InvalidHeaderFormatException extends Error {
  name: string = 'InvalidHeaderFormatException';

  /**
   * Create a new Invalid Header Format Exception instance.
   *
   * @param {string} message
   */
  constructor(message: string) {
    super(message);
  }
}
