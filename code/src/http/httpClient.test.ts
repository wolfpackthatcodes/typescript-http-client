/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HttpStatusCodes } from './enums/httpStatusCodes';
import HttpClient from './httpClient';

global.fetch = vi.fn();

describe('HTTP Client', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch.mockReset();
  });

  describe('Send HEAD requests', () => {
    it('Send a HEAD request', async () => {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      const mockedResponse = new Response(null, { status: HttpStatusCodes.HTTP_OK, headers });

      // @ts-ignore
      global.fetch.mockResolvedValue(mockedResponse);

      const response = await new HttpClient().head('https://api.local/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', { method: 'HEAD' });
      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(response.headers).toStrictEqual(headers);
    });

    it('Send a HEAD request with query parameters', () => {
      new HttpClient().head('https://api.local/test/', { q: 1 });

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/?q=1', { method: 'HEAD' });
    });
  });

  describe('Send GET requests', () => {
    it('Send a GET request using a base URL', async () => {
      const mockedResponseBody = [{ title: 'Unit test', done: true }];
      const mockedResponse = new Response(JSON.stringify(mockedResponseBody), { status: HttpStatusCodes.HTTP_OK });

      // @ts-ignore
      global.fetch.mockResolvedValue(mockedResponse);

      const response = await new HttpClient('https://api.local/').get('/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', { method: 'GET' });
      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await response.json()).toStrictEqual(mockedResponseBody);
    });

    it('Send a GET request without a base URL', () => {
      new HttpClient().get('https://api.local/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', { method: 'GET' });
    });

    it('Send a GET request with query parameters', () => {
      new HttpClient().get('https://api.local/test/', { q: 'abc' });

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/?q=abc', { method: 'GET' });

      // @ts-ignore
      global.fetch.mockReset();

      new HttpClient().withQueryParameters({ q: 123 }).get('https://api.local/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/?q=123', { method: 'GET' });
    });
  });
});
