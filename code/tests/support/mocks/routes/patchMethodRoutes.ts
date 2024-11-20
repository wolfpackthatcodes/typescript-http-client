import { HttpStatusCodes } from 'tests/support/enums/httpStatusCodes';
import { http, HttpHandler, HttpResponse } from 'msw';

export const patchMethodRoutes: HttpHandler[] = [
  http.patch('https://api.example.local/users/:id', async ({ request, params }) => {
    const { id } = params;
    const json = (await request.json()) as Record<string, unknown>;

    return new HttpResponse(JSON.stringify({ id: Number(id), ...json }), {
      status: HttpStatusCodes.HTTP_ACCEPTED,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),
];
