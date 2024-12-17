import { mockedResponseStatusOk } from '../responses/mockedResponses';
import { HttpHandler, http } from 'msw';

export const optionMethodRoutes: HttpHandler[] = [
  http.options('https://api.example.local/status', () => {
    return mockedResponseStatusOk();
  }),
];
