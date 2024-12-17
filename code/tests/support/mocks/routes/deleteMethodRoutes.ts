import { mockedResponseStatusAccepted } from '../responses/mockedResponses';
import { HttpHandler, http } from 'msw';

export const deleteMethodRoutes: HttpHandler[] = [
  http.delete('https://api.example.local/users/:id', () => {
    return mockedResponseStatusAccepted();
  }),
];
