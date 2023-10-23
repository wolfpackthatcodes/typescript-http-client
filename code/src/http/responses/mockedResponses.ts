import Str from '@/support/str';
import MissingMockedResponseException from '../exceptions/missingMockedResponseException';

export default class MockedResponses {
  /**
   * The mocked responses object.
   *
   * @var {object}
   */
  protected mockedResponses: object = {};

  /**
   * Indicates if the client is to return mocked responses.
   *
   * @returns {boolean}
   */
  public isMocked(): boolean {
    return Object.entries(this.mockedResponses).length > 0;
  }

  /**
   * Register a mocked response that will intercept requests
   * and be able to return mocked responses.
   *
   * @param {object} mockedResponses
   *
   * @returns {this}
   */
  public set(mockedResponses: object): this {
    this.mockedResponses = mockedResponses;

    return this;
  }

  /**
   * Retrieve mocked response for given URL.
   *
   * @param {string} requestUrl
   *
   * @throws {MissingMockedResponseException}
   *
   * @returns {Promise<Response>}
   */
  public getMockedResponse(requestUrl: string): Promise<Response> {
    type ObjectKey = keyof typeof this.mockedResponses;

    const mockedUrl = Object.keys(this.mockedResponses).find((url) => {
      return url === requestUrl || url === '*' ? true : Str.is(Str.start(url, '*'), requestUrl);
    }) as ObjectKey;

    if (mockedUrl === undefined) {
      return Promise.reject(new MissingMockedResponseException('Failed to fetch mocked response'));
    }

    const mockedResponse = this.mockedResponses[mockedUrl];

    return new Promise((resolve) => {
      resolve(mockedResponse);
    });
  }
}
