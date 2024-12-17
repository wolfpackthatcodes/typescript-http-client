import { mockedResponseStatusAccepted } from '../responses/mockedResponses';
import { HttpHandler, http } from 'msw';

export const patchMethodRoutes: HttpHandler[] = [
  http.patch('https://api.example.local/users/:id', async ({ request, params }) => {
    const { id } = params;
    const json = (await request.json()) as Record<string, unknown>;

    return mockedResponseStatusAccepted(JSON.stringify({ id: Number(id), ...json }));
  }),
];
