/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HttpStatusCodes } from './enums/httpStatusCodes';
import HttpClient from './httpClient';

// @ts-ignore
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

  describe('Send requests with Authentication', () => {
    it('Send a request with a Basic Authentication', () => {
      const user = {
        name: 'luis.aveiro',
        password: (Math.random() + 10).toString(36).substring(2),
      };

      new HttpClient().withBasicAuth(user.name, user.password).get('https://api.local/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', {
        method: 'GET',
        headers: new Headers({
          Authorization: 'Basic ' + btoa(`${user.name}:${user.password}`),
        }),
      });
    });

    it('Send a request with a Bearer token', () => {
      const token = (Math.random() + 10).toString(36).substring(2);

      new HttpClient().withToken(token).get('https://api.local/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', {
        method: 'GET',
        headers: new Headers({ Authorization: `Bearer ${token}` }),
      });
    });

    it('Send a request with Credentials', () => {
      new HttpClient().withCredentials().get('https://api.local/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', { method: 'GET', credentials: 'same-origin' });
    });
  });

  describe('Send requests with Headers', () => {
    it('Send a request with a header', () => {
      new HttpClient().withHeader('Accept-Encoding', 'gzip, deflate, br').head('https://api.local/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', {
        method: 'HEAD',
        headers: new Headers({ 'Accept-Encoding': 'gzip, deflate, br' }),
      });
    });

    it('Send a request with headers', () => {
      const headers = { 'Accept-Encoding': 'gzip, deflate, br', connection: 'keep-alive' };

      new HttpClient().withHeaders(headers).head('https://api.local/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', { method: 'HEAD', headers: new Headers(headers) });
    });

    it('Send a request with updated headers', () => {
      new HttpClient('https://api.local/')
        .withHeaders({ 'Accept-Encoding': 'gzip, deflate', 'Content-Type': 'application/html' })
        .replaceHeaders({ 'Accept-Encoding': 'gzip, deflate, br', 'Content-Type': 'application/json' })
        .head('/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', {
        method: 'HEAD',
        headers: new Headers({
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'application/json',
        }),
      });
    });

    it('Send a request with updated header', () => {
      new HttpClient('https://api.local/')
        .withHeaders({ 'Content-Type': 'application/html' })
        .replaceHeader('Content-Type', 'application/json')
        .head('/test/');

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', {
        method: 'HEAD',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });
    });

    it('Send a request that accepts JSON', async () => {
      const mockedResponseBody = [{ first_name: 'Luis', last_name: 'Aveiro' }];
      const mockedResponse = new Response(JSON.stringify(mockedResponseBody), {
        status: HttpStatusCodes.HTTP_OK,
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });

      // @ts-ignore
      global.fetch.mockResolvedValue(mockedResponse);

      const response = await new HttpClient().acceptJson().get('https://api.local/users');

      expect(fetch).toHaveBeenCalledWith('https://api.local/users/', {
        method: 'GET',
        headers: new Headers({ Accept: 'application/json' }),
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(response.headers.get('Content-Type')).toStrictEqual('application/json');
      expect(await response.json()).toStrictEqual(mockedResponseBody);
    });
  });
});
