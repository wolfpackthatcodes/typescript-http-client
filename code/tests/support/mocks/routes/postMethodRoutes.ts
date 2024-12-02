import { http, HttpHandler } from 'msw';
import { mockedResponseStatusCreated, mockedResponseStatusOk } from '../responses/mockedResponses';

export const postMethodRoutes: HttpHandler[] = [
  http.post('https://api.example.local/notifications/text-message', () => {
    return mockedResponseStatusOk('OK');
  }),

  http.post('https://api.example.local/users', async ({ request }) => {
    const contentType = request.headers.get('Content-Type');
    let response = { id: 1 };

    if (contentType === 'application/json') {
      const json = (await request.json()) as Record<string, unknown>;
      response = { ...response, ...json };
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      const urlencoded = Object.fromEntries(new URLSearchParams(await request.text()));
      response = { ...response, ...urlencoded };
    }

    if (contentType?.startsWith('multipart/form-data;')) {
      const formData = Object.fromEntries((await request.formData()).entries());
      response = { ...response, ...formData };
    }

    return mockedResponseStatusCreated(JSON.stringify(response));
  }),
];
