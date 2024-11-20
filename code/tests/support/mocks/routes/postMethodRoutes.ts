import { HttpStatusCodes } from 'tests/support/enums/httpStatusCodes';
import { http, HttpHandler, HttpResponse } from 'msw';

export const postMethodRoutes: HttpHandler[] = [
  http.post('https://api.example.local/notifications/text-message', () => {
    return new HttpResponse('OK', { status: HttpStatusCodes.HTTP_OK });
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

    return new HttpResponse(JSON.stringify(response), {
      status: HttpStatusCodes.HTTP_CREATED,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),
];
