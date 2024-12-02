import { http, HttpHandler } from 'msw';
import { mockedResponseStatusAccepted } from '../responses/mockedResponses';

export const putMethodRoutes: HttpHandler[] = [
  http.put('https://api.example.local/users/:id', async ({ request, params }) => {
    const { id } = params;
    const json = (await request.json()) as Record<string, unknown>;

    return mockedResponseStatusAccepted(JSON.stringify({ id: Number(id), ...json }));
  }),
];
