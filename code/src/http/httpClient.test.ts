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

  describe('POST request', () => {
    it('Send a request with raw data', () => {
      const bodyText = 'This is a text body request.';

      new HttpClient().post('https://api.local/test/', bodyText);

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', {
        method: 'POST',
        body: bodyText,
        headers: new Headers({
          'Content-Type': 'text/plain',
        }),
      });
    });

    it('Send a request with JSON data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };

      new HttpClient().asJson().post('https://api.local/test/', user);

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });
    });

    it('Send a request with Multipart Form-data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };
      const formData = new FormData();

      for (const [key, value] of Object.entries(user)) {
        formData.append(key, value);
      }

      new HttpClient().asForm().post('https://api.local/test/', user);

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', {
        method: 'POST',
        body: formData,
        headers: new Headers({
          'Content-Type': 'multipart/form-data',
        }),
      });
    });

    it('Send a request with URL encoded data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };
      const urlencoded = new URLSearchParams(user);

      new HttpClient().asUrlEncoded().post('https://api.local/test/', user);

      expect(fetch).toHaveBeenCalledWith('https://api.local/test/', {
        method: 'POST',
        body: urlencoded,
        headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      });
    });
  });

  describe('PATCH request', () => {
    it('Send a request with JSON data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };

      new HttpClient().asJson().patch('https://api.local/users/1', user);

      expect(fetch).toHaveBeenCalledWith('https://api.local/users/1/', {
        method: 'PATCH',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });
    });
  });

  describe('PUT request', () => {
    it('Send a request with JSON data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };

      new HttpClient().asJson().put('https://api.local/users/1', user);

      expect(fetch).toHaveBeenCalledWith('https://api.local/users/1/', {
        method: 'PUT',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });
    });
  });

  describe('DELETE request', () => {
    it('Send a DELETE request', () => {
      new HttpClient().delete('https://api.local/users/1');

      expect(fetch).toHaveBeenCalledWith('https://api.local/users/1/', { method: 'DELETE' });
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

  describe('Catch Exceptions', () => {
    it('Catch a request with invalid URL encoded data', () => {
      const httpClient = new HttpClient().asUrlEncoded().post('https://api.local/test/', 'Example text');

      expect(httpClient).rejects.toThrowError('Cannot parse a string as URLSearchParams.');
    });

    it('Catch a request with invalid Multipart Form-data', () => {
      const httpClient = new HttpClient().asForm().post('https://api.local/test/', 'Example text');

      expect(httpClient).rejects.toThrowError('Cannot parse a string as FormData.');
    });
  });

  describe('Provide mocked response', () => {
    it('Mocked response is returned after faking', async () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };

      const mockedResponseBody = [
        { id: Math.round(Math.random() * 100), ...user, date_created: new Date().toString() },
      ];

      const mockedResponse = new Response(JSON.stringify(mockedResponseBody), {
        status: HttpStatusCodes.HTTP_CREATED,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const response = await new HttpClient()
        .fake({ 'users/*': mockedResponse })
        .asJson()
        .acceptJson()
        .post('https://api.local/users/', user);

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(response.headers.has('Content-Type')).toBeTruthy();
      expect(response.headers.get('Content-Type')).toEqual('application/json');
      expect(await response.json()).toStrictEqual(mockedResponseBody);
    });

    it('Mocked responses is returned after faking', async () => {
      const client = new HttpClient()
        .fake({
          'https://api.local/*': new Response(null, {
            status: HttpStatusCodes.HTTP_ACCEPTED,
          }),
          'https://test.local/*': new Response(null, {
            status: HttpStatusCodes.HTTP_OK,
          }),
        })
        .asJson()
        .acceptJson();

      const firstResponse = await client.delete('https://api.local/users/1/');
      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_ACCEPTED);

      const secondResponse = await client.get('https://test.local/users/');
      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
    });

    it('Wildcard mocked response is returned after faking', async () => {
      const client = new HttpClient()
        .fake({ '*': new Response(null, { status: HttpStatusCodes.HTTP_OK }) })
        .asJson()
        .acceptJson();

      const firstResponse = await client.delete('https://api.local/users/1/');
      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);

      const secondResponse = await client.get('https://test.local/users/');
      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
    });

    it('Catch a request with missing mocked response', () => {
      const httpClient = new HttpClient()
        .fake({ 'users/1/posts': new Response(JSON.stringify({}), { status: HttpStatusCodes.HTTP_OK }) })
        .acceptJson()
        .get('https://api.local/users/1/');

      expect(httpClient).rejects.toThrowError('Failed to fetch mocked response');
      expect(httpClient).rejects.toThrowError(TypeError);
    });
  });
});
