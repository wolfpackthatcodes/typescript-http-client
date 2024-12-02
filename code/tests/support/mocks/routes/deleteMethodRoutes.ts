import { http, HttpHandler } from 'msw';
import { mockedResponseStatusAccepted } from '../responses/mockedResponses';

export const deleteMethodRoutes: HttpHandler[] = [
  http.delete('https://api.example.local/users/:id', () => {
    return mockedResponseStatusAccepted();
  }),
];
