import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import HttpClient from '@/http/httpClient';
import { MissingMockedResponseException } from '@/http/exceptions';
import { HttpStatusCodes } from 'tests/support/enums/httpStatusCodes';
import { generateRandomNumber, generateRandomUser, generateSecurePassword } from 'tests/support/helpers/generators';
import { server } from 'tests/support/mocks/mockServer';

describe('HTTP Client', () => {
  let fetchSpy: MockInstance;

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterAll(() => {
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Test URL structure', () => {
    it.each([
      ['https://api.example.local', 'status'],
      ['https://api.example.local', '/status'],
      ['https://api.example.local/', 'status'],
      ['https://api.example.local/', '/status'],
      [null, 'https://api.example.local/status'],
      [null, 'https://api.example.local/status/'],
      [null, 'https://api.example.local//status/'],
      [null, 'https://api.example.local//status//'],
    ])('Should be able to send a request using a base URL', (baseUrl: string | null, endpoint: string) => {
      const client = baseUrl ? new HttpClient(baseUrl) : new HttpClient();
      client.head(endpoint);

      expect(fetchSpy).toHaveBeenCalledWith('https://api.example.local/status', { method: 'HEAD' });
    });
  });

  describe('Test HEAD requests', () => {
    it('Should be able to send a HEAD request', async () => {
      const url: string = 'https://api.example.local/status';

      const response = await new HttpClient().head(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, { method: 'HEAD' });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(response.headers).toStrictEqual(new Headers({ 'Content-Type': 'application/json' }));
      expect(await response.json()).toHaveProperty('status', 'OK');
    });

    it('Should be able to send a HEAD request with query parameters', async () => {
      const url = 'https://api.example.local/status';
      const timestamp = Date.now();

      const response = await new HttpClient().head(url, { timestamp: timestamp });

      expect(fetchSpy).toHaveBeenCalledWith(`${url}?timestamp=${timestamp}`, { method: 'HEAD' });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await response.json()).toStrictEqual({ status: 'OK', timestamp: timestamp.toString() });
    });
  });

  describe('Test OPTIONS requests', () => {
    it('Should be able to send an OPTIONS request', async () => {
      const url = 'https://api.example.local/status';

      const response = await new HttpClient().options(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, { method: 'OPTIONS' });
      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
    });
  });

  describe('Test GET requests', () => {
    it('Should be able to send a GET request', async () => {
      const url = 'https://api.example.local/books';
      const response = await new HttpClient().get(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, { method: 'GET' });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect((await response.json()).length).toEqual(10);
    });

    it('Should be able to send a GET request with query parameters', async () => {
      const url = 'https://api.example.local/books';
      const limit = 5;

      const response = await new HttpClient().get(url, { limit: limit });

      expect(fetchSpy).toHaveBeenCalledWith(`${url}?limit=${limit}`, { method: 'GET' });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect((await response.json()).length).toEqual(5);
    });
  });

  describe('Test POST request', () => {
    it('Should be able to send a POST request with raw data', async () => {
      const url = 'https://api.example.local/notifications/text-message';
      const bodyText = 'This is a text message.';

      const response = await new HttpClient().post(url, bodyText);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'POST',
        body: bodyText,
        headers: new Headers({
          'Content-Type': 'text/plain',
        }),
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await response.text()).toEqual('OK');
    });

    it('Should be able to send a POST request with JSON data', async () => {
      const url = 'https://api.example.local/users';
      const user = generateRandomUser();

      const response = await new HttpClient().asJson().post(url, user);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(await response.json()).toStrictEqual({ id: 1, ...user });
    });

    it('Should be able to send a POST request with Multipart Form-data', async () => {
      const user = generateRandomUser();
      const formData = new FormData();

      for (const [key, value] of Object.entries(user)) {
        formData.append(key, value);
      }

      const firstResponse = await new HttpClient().asForm().post('https://api.example.local/users/', user);

      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(await firstResponse.json()).toStrictEqual({ id: 1, ...user });

      const secondResponse = await new HttpClient().asForm().post('https://api.example.local/users/', formData);

      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(await secondResponse.json()).toStrictEqual({ id: 1, ...user });
    });

    it('Should be able to send a POST request with URL encoded data', async () => {
      const url = 'https://api.example.local/users';
      const user = generateRandomUser();
      const urlencoded = new URLSearchParams(user);

      const response = await new HttpClient().asUrlEncoded().post(url, user);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'POST',
        body: urlencoded,
        headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(await response.json()).toStrictEqual({ id: 1, ...user });
    });
  });

  describe('Test PATCH request', () => {
    it('Should be able to send a PATCH request with JSON data', async () => {
      const url = 'https://api.example.local/users/1';
      const user = generateRandomUser();

      const response = await new HttpClient().asJson().patch(url, user);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'PATCH',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_ACCEPTED);
      expect(await response.json()).toStrictEqual({ id: 1, ...user });
    });
  });

  describe('Test PUT request', () => {
    it('Should be able to send a PUT request with JSON data', async () => {
      const url = 'https://api.example.local/users/1';
      const user = generateRandomUser();

      const response = await new HttpClient().asJson().put(url, user);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'PUT',
        body: JSON.stringify(user),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_ACCEPTED);
      expect(await response.json()).toStrictEqual({ id: 1, ...user });
    });
  });

  describe('Test DELETE request', () => {
    it('Should be able to send a DELETE request', () => {
      const url = 'https://api.example.local/users/1';
      new HttpClient().delete(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, { method: 'DELETE' });
    });
  });

  describe('Test request timeout', () => {
    it('Should abort the request when signal is timed out', () => {
      const url = 'https://api.example.local/timeout';
      const request = new HttpClient().timeout(1).get(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'GET',
        signal: expect.any(AbortSignal),
      });

      expect(request).rejects.toThrowError('The operation was aborted due to timeout');
    });
  });

  describe('Test Authenticated requests', () => {
    it('Should be able to send a request with a Basic Authentication', async () => {
      const url = 'https://api.example.local/profile';
      const user = { name: 'luis.aveiro', password: generateSecurePassword(12) };
      const header = { Authorization: 'Basic ' + btoa(`${user.name}:${user.password}`) };

      const firstResponse = await new HttpClient().withBasicAuth(user.name, user.password).get(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'GET',
        headers: new Headers(header),
      });

      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await firstResponse.json()).toStrictEqual({ message: `Hello, ${user.name}` });

      const secondResponse = await new HttpClient().withOption('headers', header).get(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'GET',
        headers: new Headers(header),
      });

      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await secondResponse.json()).toStrictEqual({ message: `Hello, ${user.name}` });
    });

    it('Should be able to send a request with a Bearer token', async () => {
      const url = 'https://api.example.local/authorize';
      const token = generateSecurePassword(10);
      const header = { Authorization: `Bearer ${token}` };

      const firstResponse = await new HttpClient().withToken(token).get(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'GET',
        headers: new Headers(header),
      });

      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(firstResponse.headers).toStrictEqual(new Headers({ 'Content-Type': 'application/json' }));
      expect(await firstResponse.json()).toStrictEqual({ status: 'OK' });

      const secondResponse = await new HttpClient().withOption('headers', header).get(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'GET',
        headers: new Headers(header),
      });

      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(secondResponse.headers).toStrictEqual(new Headers({ 'Content-Type': 'application/json' }));
      expect(await secondResponse.json()).toStrictEqual({ status: 'OK' });
    });

    it('Should be able to send a request with Credentials', async () => {
      const url = 'https://api.example.local/auth/protected-resource';

      const response = await new HttpClient().withCredentials().get(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'GET',
        credentials: 'same-origin',
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(response.headers).toStrictEqual(new Headers({ 'Content-Type': 'application/json' }));
      expect(await response.json()).toStrictEqual({ status: 'OK' });
    });
  });

  describe('Test requests with Headers', () => {
    it('Should be able to send a request with a header', async () => {
      const baseUrl = 'https://api.example.local';
      const endpoint = '/validate/headers/accept-encoding';
      const headers = { 'Accept-Encoding': 'gzip, deflate, br' };

      const firstResponse = await new HttpClient(baseUrl, { headers: new Headers(headers) }).head(endpoint);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}${endpoint}`, {
        method: 'HEAD',
        headers: new Headers(headers),
      });

      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await firstResponse.json()).toHaveProperty('status', 'OK');

      const secondResponse = await new HttpClient(baseUrl, { headers: headers }).head(endpoint);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}${endpoint}`, {
        method: 'HEAD',
        headers: new Headers(headers),
      });

      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await secondResponse.json()).toHaveProperty('status', 'OK');

      const thirdResponse = await new HttpClient()
        .withHeader('Accept-Encoding', 'gzip, deflate, br')
        .head(`${baseUrl}${endpoint}`);

      expect(fetchSpy).toHaveBeenCalledWith(`${baseUrl}${endpoint}`, {
        method: 'HEAD',
        headers: new Headers(headers),
      });

      expect(thirdResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await thirdResponse.json()).toHaveProperty('status', 'OK');
    });

    it('Should be able to send a request with multiple headers', async () => {
      const url = 'https://api.example.local/validate/headers';
      const headers = { 'Accept-Encoding': 'gzip, deflate, br', 'Content-Type': 'application/json' };

      const firstResponse = await new HttpClient().withHeaders(headers).head(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'HEAD',
        headers: new Headers(headers),
      });

      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await firstResponse.json()).toHaveProperty('status', 'OK');

      const secondResponse = await new HttpClient().withHeaders(new Headers(headers)).head(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'HEAD',
        headers: new Headers(headers),
      });

      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await secondResponse.json()).toHaveProperty('status', 'OK');
    });

    it('Should be able to send a request with updated headers', async () => {
      const url = 'https://api.example.local/validate/headers';
      const defaultHeaders = { 'Accept-Encoding': 'gzip, deflate', 'Content-Type': 'application/html' };
      const updatedHeaders = { 'Accept-Encoding': 'gzip, deflate, br', 'Content-Type': 'application/json' };

      const firstResponse = await new HttpClient().withHeaders(defaultHeaders).replaceHeaders(updatedHeaders).head(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'HEAD',
        headers: new Headers(updatedHeaders),
      });

      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await firstResponse.json()).toHaveProperty('status', 'OK');

      const secondResponse = await new HttpClient(url)
        .withHeaders(defaultHeaders)
        .replaceHeaders(new Headers(updatedHeaders))
        .head(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'HEAD',
        headers: new Headers(updatedHeaders),
      });

      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await secondResponse.json()).toHaveProperty('status', 'OK');
    });

    it('Should be able to send a request with an updated header', async () => {
      const url = 'https://api.example.local/validate/headers/content-type';

      const response = await new HttpClient()
        .withHeaders({ 'Content-Type': 'application/html' })
        .replaceHeader('Content-Type', 'application/json')
        .head(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'HEAD',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await response.json()).toHaveProperty('status', 'OK');
    });

    it('Should be able to send a request that accepts JSON', async () => {
      const url = 'https://api.example.local/users';
      const response = await new HttpClient().acceptJson().get(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'GET',
        headers: new Headers({ Accept: 'application/json' }),
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(response.headers.get('Content-Type')).toStrictEqual('application/json');
      expect((await response.json()).length).toEqual(1);
    });
  });

  describe('Test requests with options', () => {
    it('Should be able to send a request with options', async () => {
      const url = 'https://api.example.local/validate/options';
      const options = { mode: 'same-origin', keepalive: true };

      const response = await new HttpClient().withOptions(options).head(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, { method: 'HEAD', ...options });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await response.json()).toStrictEqual({ status: 'OK' });
    });

    it('Should be able to send a request with an option', async () => {
      const url = 'https://api.example.local/validate/mode';
      const response = await new HttpClient().withOption('mode', 'same-origin').head(url);

      expect(fetchSpy).toHaveBeenCalledWith(url, {
        method: 'HEAD',
        mode: 'same-origin',
      });

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
      expect(await response.json()).toStrictEqual({ status: 'OK' });
    });
  });

  describe('Test request retries', () => {
    it('Send a request with retry', async () => {
      await new HttpClient().retry(2, 1).get('https://api.example.local/unavailable');

      expect(fetchSpy).toHaveBeenCalledTimes(3);
    });

    it('Should be able to retry a request if callback return true', async () => {
      await new HttpClient()
        .retry(1, 1, (response) => {
          return response !== undefined && response.status !== HttpStatusCodes.HTTP_NOT_FOUND;
        })
        .get('https://api.example.local/unavailable');

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
        .get('https://api.example.local/users/1');

      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Test Exceptions', () => {
    it('Catch a request with invalid URL encoded data', () => {
      const httpClient = new HttpClient()
        .asUrlEncoded()
        .post('https://api.example.local/notifications/text-message', 'Example text');

      expect(httpClient).rejects.toThrowError('Cannot parse a string as URLSearchParams.');
    });

    it('Catch a request with invalid Multipart Form-data', () => {
      const httpClient = new HttpClient()
        .asForm()
        .post('https://api.example.local/notifications/text-message', 'Example text');

      expect(httpClient).rejects.toThrowError('Cannot parse a string as FormData.');
    });

    it('Catch a request with invalid header format', () => {
      expect(() =>
        new HttpClient('https://api.example.local/notifications/text-message').withOption('headers', 'invalid header'),
      ).toThrowError();
    });
  });

  describe('Test mocked responses', () => {
    it('Mocked response is returned after faking', async () => {
      const url = 'https://api.example.local/users';
      const user = generateRandomUser();
      const userId = generateRandomNumber(1, 100);

      const mockedResponseBody = [{ id: userId }];

      const mockedResponse = new Response(JSON.stringify(mockedResponseBody), {
        status: HttpStatusCodes.HTTP_CREATED,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      const firstResponse = await new HttpClient()
        .fake({ users: mockedResponse.clone() })
        .asJson()
        .acceptJson()
        .post(url, user);

      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(firstResponse.headers.has('Content-Type')).toBeTruthy();
      expect(firstResponse.headers.get('Content-Type')).toEqual('application/json');
      expect(await firstResponse.json()).toStrictEqual(mockedResponseBody);

      const secondResponse = await new HttpClient()
        .fake({ 'users*': mockedResponse.clone() })
        .asJson()
        .acceptJson()
        .post(url, user);

      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(secondResponse.headers.has('Content-Type')).toBeTruthy();
      expect(secondResponse.headers.get('Content-Type')).toEqual('application/json');
      expect(await secondResponse.json()).toStrictEqual(mockedResponseBody);

      const thirdResponse = await new HttpClient()
        .fake({ 'users/*': mockedResponse.clone() })
        .asJson()
        .acceptJson()
        .post(url, user);

      expect(thirdResponse.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(thirdResponse.headers.has('Content-Type')).toBeTruthy();
      expect(thirdResponse.headers.get('Content-Type')).toEqual('application/json');
      expect(await thirdResponse.json()).toStrictEqual(mockedResponseBody);

      const fourthResponse = await new HttpClient()
        .fake({
          'users/*': new Response(JSON.stringify({ id: userId, ...user }), {
            status: HttpStatusCodes.HTTP_CREATED,
            headers: new Headers({ 'Content-Type': 'application/json' }),
          }),
        })
        .asJson()
        .acceptJson()
        .get(`${url}/${userId}/profile`);

      expect(fourthResponse.status).toStrictEqual(HttpStatusCodes.HTTP_CREATED);
      expect(fourthResponse.headers.has('Content-Type')).toBeTruthy();
      expect(fourthResponse.headers.get('Content-Type')).toEqual('application/json');
      expect(await fourthResponse.json()).toStrictEqual({ id: userId, ...user });
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

      const firstResponse = await client.delete('https://api.example.local/users/1');
      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_ACCEPTED);

      const secondResponse = await client.get('https://test.local/users');
      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
    });

    it('Wildcard mocked response is returned after faking', async () => {
      const client = new HttpClient()
        .fake({ '*': new Response(null, { status: HttpStatusCodes.HTTP_OK }) })
        .asJson()
        .acceptJson();

      const firstResponse = await client.delete('https://api.example.local/users/1');
      expect(firstResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);

      const secondResponse = await client.get('https://test.local/users');
      expect(secondResponse.status).toStrictEqual(HttpStatusCodes.HTTP_OK);
    });

    it('Catch a request with missing mocked response', () => {
      const httpClient = new HttpClient()
        .fake({ 'users/1/posts': new Response(JSON.stringify({}), { status: HttpStatusCodes.HTTP_OK }) })
        .acceptJson()
        .get('https://api.example.local/users/1');

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
        .get('https://api.example.local/users');

      expect(response.status).toStrictEqual(HttpStatusCodes.HTTP_SERVICE_UNAVAILABLE);
    });
  });
});
