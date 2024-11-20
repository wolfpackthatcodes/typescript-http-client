import { HttpStatusCodes } from 'tests/support/enums/httpStatusCodes';
import { delay, http, HttpHandler, HttpResponse } from 'msw';
import { generateRandomBooks, generateRandomUser } from 'tests/support/helpers/generators';

export const getMethodRoutes: HttpHandler[] = [
  http.get('https://api.example.local/auth/protected-resource', ({ request }) => {
    if (request.credentials !== 'same-origin') {
      return new HttpResponse(JSON.stringify({ error: 'Invalid credentials mode' }), {
        status: HttpStatusCodes.HTTP_BAD_REQUEST,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    return new HttpResponse(JSON.stringify({ status: 'OK' }), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.get('https://api.example.local/authorize', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: HttpStatusCodes.HTTP_UNAUTHORIZED,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    return new HttpResponse(JSON.stringify({ status: 'OK' }), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.get('https://api.example.local/books', ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') ?? 10;
    const books = generateRandomBooks(Number(limit));

    return new HttpResponse(JSON.stringify(books), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.get('https://api.example.local/profile', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new HttpResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: HttpStatusCodes.HTTP_UNAUTHORIZED,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    const encodedCredentials = authHeader.replace('Basic ', '');
    const decodedCredentials = atob(encodedCredentials);
    const [username] = decodedCredentials.split(':');

    return new HttpResponse(JSON.stringify({ message: `Hello, ${username}` }), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.get('https://api.example.local/timeout', async () => {
    await delay(5);

    return new HttpResponse(null, { status: HttpStatusCodes.HTTP_OK });
  }),

  http.get('https://api.example.local/unavailable', () => {
    return new HttpResponse(null, { status: HttpStatusCodes.HTTP_SERVICE_UNAVAILABLE });
  }),

  http.get('https://api.example.local/users', () => {
    const user = generateRandomUser();
    return new HttpResponse(JSON.stringify([user]), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),
];
