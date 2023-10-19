export default class EmptyRequestBodyException extends Error {
  name: string = 'EmptyRequestBodyException';

  /**
   * Create a new Empty Request Body Exception instance.
   *
   * @param {string} message
   */
  constructor(message: string) {
    super(message);
  }
}
