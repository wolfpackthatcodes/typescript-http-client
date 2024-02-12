import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import HttpClient from '@/http/httpClient';
import { HttpStatusCodes } from '../enums/httpStatusCodes';
import { generateRandomNumber, generateSecurePassword } from '../utils/generators';
import { MissingMockedResponseException } from '@/http/exceptions';
import { setupServer } from 'msw/node';
import { restHandlers } from '../utils/testRoutes';

describe('HTTP Client', () => {
  let fetchSpy: unknown;
  const server = setupServer(...restHandlers);

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
  });
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  describe('Test HEAD requests', () => {
    it('Should be able to send a HEAD request', async () => {
      const response = await new HttpClient().head('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', { method: 'HEAD' });
      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(response.headers).toStrictEqual(new Headers({ 'Content-Type': 'application/json' }));
    });

    it('Should be able to send a HEAD request with query parameters', () => {
      new HttpClient().head('https://api.example.local/test/', { q: 1 });

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/?q=1', { method: 'HEAD' });
    });
  });

  describe('Test OPTIONS requests', () => {
    it('Should be able to send an OPTIONS request', async () => {
      await new HttpClient().options('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', { method: 'OPTIONS' });
    });
  });

  describe('Test GET requests', () => {
    it('Should be able to send a GET request using a base URL', async () => {
      const response = await new HttpClient('https://api.example.local/').get('/test/1');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/1/', { method: 'GET' });
      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await response.json()).toStrictEqual({ title: 'Unit test', done: true });
    });

    it('Should be able to send a GET request with query parameters', () => {
      new HttpClient().get('https://api.example.local/test/', { q: 'abc' });

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/?q=abc', { method: 'GET' });

      new HttpClient().withQueryParameters({ q: 123 }).get('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/?q=123', { method: 'GET' });
    });
  });

  describe('Test POST request', () => {
    it('Should be able to send a POST request with raw data', () => {
      const bodyText = 'This is a text body request.';

      new HttpClient().post('https://api.example.local/test', bodyText);

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'POST',
        body: bodyText,
        headers: new Headers({
          'Content-Type': 'text/plain',
        }),
      });
    });

    it('Should be able to send a POST request with JSON data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };

      new HttpClient().asJson().post('https://api.example.local/users/', user);

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/users/', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });
    });

    it('Should be able to send a POST request with Multipart Form-data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };
      const formData = new FormData();

      for (const [key, value] of Object.entries(user)) {
        formData.append(key, value);
      }

      new HttpClient().asForm().post('https://api.example.local/users/', user);

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/users/', {
        method: 'POST',
        body: formData,
        headers: new Headers({
          'Content-Type': 'multipart/form-data',
        }),
      });
    });

    it('Should be able to send a POST request with URL encoded data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };
      const urlencoded = new URLSearchParams(user);

      new HttpClient().asUrlEncoded().post('https://api.example.local/users/', user);

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/users/', {
        method: 'POST',
        body: urlencoded,
        headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      });
    });
  });

  describe('Test PATCH request', () => {
    it('Should be able to send a PATCH request with JSON data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };

      new HttpClient().asJson().patch('https://api.example.local/users/1', user);

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/users/1/', {
        method: 'PATCH',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });
    });
  });

  describe('Test PUT request', () => {
    it('Should be able to send a PUT request with JSON data', () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };

      new HttpClient().asJson().put('https://api.example.local/users/1', user);

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/users/1/', {
        method: 'PUT',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });
    });
  });

  describe('Test DELETE request', () => {
    it('Should be able to send a DELETE request', () => {
      new HttpClient().delete('https://api.example.local/users/1');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/users/1/', { method: 'DELETE' });
    });
  });

  describe('Test request timeout', () => {
    it('Should abort the request when signal is timed out', () => {
      const request = new HttpClient().timeout(1).get('https://api.example.local/timeout');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/timeout/', {
        method: 'GET',
        signal: expect.any(AbortSignal),
      });
      expect(request).rejects.toThrowError('The operation was aborted due to timeout');
    });
  });

  describe('Test Authenticated requests', () => {
    it('Should be able to send a request with a Basic Authentication', () => {
      const user = { name: 'luis.aveiro', password: generateSecurePassword(12) };
      const header = { Authorization: 'Basic ' + btoa(`${user.name}:${user.password}`) };

      new HttpClient().withBasicAuth(user.name, user.password).get('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'GET',
        headers: new Headers(header),
      });

      new HttpClient().withOption('headers', header).get('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'GET',
        headers: new Headers(header),
      });
    });

    it('Should be able to send a request with a Bearer token', () => {
      const token = generateSecurePassword(10);
      const header = { Authorization: `Bearer ${token}` };

      new HttpClient().withToken(token).get('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'GET',
        headers: new Headers(header),
      });

      new HttpClient().withOption('headers', header).get('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'GET',
        headers: new Headers(header),
      });
    });

    it('Should be able to send a request with Credentials', () => {
      new HttpClient().withCredentials().get('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'GET',
        credentials: 'same-origin',
      });
    });
  });

  describe('Test requests with Headers', () => {
    it('Should be able to send a request with a header', () => {
      const headers = { 'Accept-Encoding': 'gzip, deflate, br' };

      new HttpClient('https://api.example.local/', { headers: new Headers(headers) }).head('/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'HEAD',
        headers: new Headers(headers),
      });

      new HttpClient('https://api.example.local/', { headers: headers }).head('/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'HEAD',
        headers: new Headers(headers),
      });

      new HttpClient().withHeader('Accept-Encoding', 'gzip, deflate, br').head('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'HEAD',
        headers: new Headers(headers),
      });
    });

    it('Should be able to send a request with multiple headers', () => {
      const headers = { 'Accept-Encoding': 'gzip, deflate, br', connection: 'keep-alive' };

      new HttpClient().withHeaders(headers).head('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'HEAD',
        headers: new Headers(headers),
      });

      new HttpClient().withHeaders(new Headers(headers)).head('https://api.example.local/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'HEAD',
        headers: new Headers(headers),
      });
    });

    it('Should be able to send a request with updated headers', () => {
      const defaultHeaders = { 'Accept-Encoding': 'gzip, deflate', 'Content-Type': 'application/html' };
      const updatedHeaders = { 'Accept-Encoding': 'gzip, deflate, br', 'Content-Type': 'application/json' };

      new HttpClient('https://api.example.local/')
        .withHeaders(defaultHeaders)
        .replaceHeaders(updatedHeaders)
        .head('/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'HEAD',
        headers: new Headers(updatedHeaders),
      });

      new HttpClient('https://api.example.local/')
        .withHeaders(defaultHeaders)
        .replaceHeaders(new Headers(updatedHeaders))
        .head('/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'HEAD',
        headers: new Headers(updatedHeaders),
      });
    });

    it('Should be able to send a request with an updated header', () => {
      new HttpClient('https://api.example.local/')
        .withHeaders({ 'Content-Type': 'application/html' })
        .replaceHeader('Content-Type', 'application/json')
        .head('/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', {
        method: 'HEAD',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });
    });

    it('Should be able to send a request that accepts JSON', async () => {
      const response = await new HttpClient().acceptJson().get('https://api.example.local/users');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/users/', {
        method: 'GET',
        headers: new Headers({ Accept: 'application/json' }),
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(response.headers.get('Content-Type')).toStrictEqual('application/json');
      expect(await response.json()).toStrictEqual([{ first_name: 'Luis', last_name: 'Aveiro' }]);
    });
  });

  describe('Test requests with options', () => {
    it('Should be able to send a request with options', () => {
      const options = { mode: 'same-origin', keepalive: true };

      new HttpClient('https://api.example.local/').withOptions(options).head('/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', { method: 'HEAD', ...options });
    });

    it('Should be able to send a request with an option', () => {
      new HttpClient('https://api.example.local/').withOption('mode', 'same-origin').head('/test/');

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/test/', { method: 'HEAD', mode: 'same-origin' });
    });
  });

  describe('Test request retries', () => {
    it('Send a request with retry', async () => {
      await new HttpClient().retry(2, 1).get('https://api.example.local/unavailable/');

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('Should be able to retry a request if callback return true', async () => {
      await new HttpClient()
        .retry(1, 1, (response) => {
          return response !== undefined && response.status !== HttpStatusCodes.HTTP_NOT_FOUND;
        })
        .get('https://api.example.local/unavailable/');

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('Should be able to retry a request with missing mocked response', async () => {
      // @ts-expect-error sendRequest is private method.
      const spy = vi.spyOn(HttpClient.prototype, 'sendRequest');
      const MockedResponse = new Response(JSON.stringify({}), { status: HttpStatusCodes.HTTP_OK });

      await new HttpClient()
        .fake({ 'users/1/posts': MockedResponse })
        .retry(1, 1, (_response, request, error) => {
          if (error instanceof MissingMockedResponseException) {
            request.fake({ '*': MockedResponse });
          }

          return true;
        })
        .acceptJson()
        .get('https://api.example.local/users/1/');

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Test Exceptions', () => {
    it('Catch a request with invalid URL encoded data', () => {
      const httpClient = new HttpClient().asUrlEncoded().post('https://api.example.local/test/', 'Example text');

      expect(httpClient).rejects.toThrowError('Cannot parse a string as URLSearchParams.');
    });

    it('Catch a request with invalid Multipart Form-data', () => {
      const httpClient = new HttpClient().asForm().post('https://api.example.local/test/', 'Example text');

      expect(httpClient).rejects.toThrowError('Cannot parse a string as FormData.');
    });

    it('Catch a request with invalid header format', () => {
      expect(() => new HttpClient().withOption('headers', 'invalid header')).toThrowError();
    });
  });

  describe('Test mocked responses', () => {
    it('Mocked response is returned after faking', async () => {
      const user = { first_name: 'Luis', last_name: 'Aveiro' };

      const mockedResponseBody = [{ id: generateRandomNumber(1, 100) }];

      const mockedResponse = new Response(JSON.stringify(mockedResponseBody), {
        status: HttpStatusCodes.HTTP_CREATED,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const response = await new HttpClient()
        .fake({ 'users/*': mockedResponse })
        .asJson()
        .acceptJson()
        .post('https://api.example.local/users/', user);

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(response.headers.has('Content-Type')).toBeTruthy();
      expect(response.headers.get('Content-Type')).toEqual('application/json');
      expect(await response.json()).toStrictEqual(mockedResponseBody);
    });

    it('Mocked responses is returned after faking', async () => {
      const client = new HttpClient()
        .fake({
          'https://api.example.local/*': new Response(null, {
            status: HttpStatusCodes.HTTP_ACCEPTED,
          }),
          'https://test.local/*': new Response(null, {
            status: HttpStatusCodes.HTTP_OK,
          }),
        })
        .asJson()
        .acceptJson();

      const firstResponse = await client.delete('https://api.example.local/users/1/');
      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_ACCEPTED);

      const secondResponse = await client.get('https://test.local/users/');
      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
    });

    it('Wildcard mocked response is returned after faking', async () => {
      const client = new HttpClient()
        .fake({ '*': new Response(null, { status: HttpStatusCodes.HTTP_OK }) })
        .asJson()
        .acceptJson();

      const firstResponse = await client.delete('https://api.example.local/users/1/');
      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);

      const secondResponse = await client.get('https://test.local/users/');
      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
    });

    it('Catch a request with missing mocked response', () => {
      const httpClient = new HttpClient()
        .fake({ 'users/1/posts': new Response(JSON.stringify({}), { status: HttpStatusCodes.HTTP_OK }) })
        .acceptJson()
        .get('https://api.example.local/users/1/');

      expect(httpClient).rejects.toThrowError('Failed to fetch mocked response');
      expect(httpClient).rejects.toThrowError(TypeError);
    });

    it('Mocked failed response is returned after faking', async () => {
      const mockedResponse = new Response(null, {
        status: HttpStatusCodes.HTTP_SERVICE_UNAVAILABLE,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const response = await new HttpClient()
        .fake({ '*': mockedResponse })
        .acceptJson()
        .get('https://api.example.local/users/');

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_SERVICE_UNAVAILABLE);
    });
  });
});
