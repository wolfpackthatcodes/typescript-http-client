import { delay, http, HttpHandler } from 'msw';
import { generateRandomBooks, generateRandomUser } from 'tests/support/helpers/generators';
import {
  mockedResponseStatusBadRequest,
  mockedResponseStatusOk,
  mockedResponseStatusUnauthorized,
  mockedResponseStatusUnavailable,
} from '../responses/mockedResponses';

export const getMethodRoutes: HttpHandler[] = [
  http.get('https://api.example.local/auth/protected-resource', ({ request }) => {
    if (request.credentials !== 'same-origin') {
      return mockedResponseStatusBadRequest(JSON.stringify({ error: 'Invalid credentials mode' }));
    }

    return mockedResponseStatusOk(JSON.stringify({ status: 'OK' }));
  }),

  http.get('https://api.example.local/authorize', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return mockedResponseStatusUnauthorized(JSON.stringify({ error: 'Unauthorized' }));
    }

    return mockedResponseStatusOk(JSON.stringify({ status: 'OK' }));
  }),

  http.get('https://api.example.local/books', ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') ?? 10;
    const books = generateRandomBooks(Number(limit));

    return mockedResponseStatusOk(JSON.stringify(books));
  }),

  http.get('https://api.example.local/profile', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return mockedResponseStatusUnauthorized(JSON.stringify({ error: 'Unauthorized' }));
    }

    const encodedCredentials = authHeader.replace('Basic ', '');
    const decodedCredentials = atob(encodedCredentials);
    const [username] = decodedCredentials.split(':');

    return mockedResponseStatusOk(JSON.stringify({ message: `Hello, ${username}` }));
  }),

  http.get('https://api.example.local/timeout', async () => {
    await delay(5);

    return mockedResponseStatusOk();
  }),

  http.get('https://api.example.local/unavailable', () => {
    return mockedResponseStatusUnavailable();
  }),

  http.get('https://api.example.local/users', () => {
    const user = generateRandomUser();
    return mockedResponseStatusOk(JSON.stringify([user]));
  }),
];
