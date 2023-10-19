import { EmptyRequestBodyException, InvalidRequestBodyFormatException } from './exceptions';
import { RequestBodyFormat } from './types/requestBodyFormat';

export default class PendingRequestBody {
  /**
   * The request body data.
   *
   * @var {object|string|undefined}
   */
  public body?: object | string;

  /**
   * The request body format.
   *
   * @var {RequestBodyFormat}
   */
  public bodyFormat: RequestBodyFormat = 'String';

  /**
   * Indicate the request contains JSON.
   *
   * @return {void}
   */
  public asJson(): void {
    this.setBodyFormat('Json');
  }

  /**
   * Indicate the request is a multi-part form request.
   *
   * @return {void}
   */
  public asForm(): void {
    this.setBodyFormat('FormData');
  }

  /**
   * Indicate the request contains form parameters.
   *
   * @return {void}
   */
  public asUrlEncoded(): void {
    this.setBodyFormat('URLSearchParams');
  }

  /**
   * Check if the body data has been set for the pending request.
   *
   * @returns {boolean}
   */
  public hasBody(): boolean {
    return this.body !== undefined;
  }

  /**
   * Specify the body data of the request.
   *
   * @param {object|string} body
   *
   * @return {void}
   */
  public setBody(body: object | string): void {
    this.body = body;
  }

  /**
   * Specify the body format of the request.
   *
   * @param {RequestBodyFormat} format
   *
   * @return {void}
   */
  private setBodyFormat(format: RequestBodyFormat): void {
    this.bodyFormat = format;
  }

  /**
   * Process request body contents to desirable format.
   *
   * @throws {EmptyRequestBodyException|InvalidRequestBodyFormatException}
   *
   * @returns {FormData|URLSearchParams|string}
   */
  public parseRequestBody(): FormData | URLSearchParams | string {
    if (this.body === undefined) {
      throw new EmptyRequestBodyException('Request body has no data.');
    }

    if (this.bodyFormat === 'FormData') {
      if (typeof this.body === 'string') {
        throw new InvalidRequestBodyFormatException('Cannot parse a string as FormData.');
      }

      const formData = new FormData();

      for (const [key, value] of Object.entries(this.body)) {
        formData.append(key, value);
      }

      return formData;
    }

    if (this.bodyFormat === 'URLSearchParams') {
      if (typeof this.body === 'string') {
        throw new InvalidRequestBodyFormatException('Cannot parse a string as URLSearchParams.');
      }

      return new URLSearchParams({ ...this.body });
    }

    return typeof this.body === 'object' ? JSON.stringify(this.body) : this.body;
  }
}
