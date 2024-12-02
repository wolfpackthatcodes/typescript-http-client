import { http, HttpHandler } from 'msw';
import { mockedResponseStatusOk } from '../responses/mockedResponses';

export const optionMethodRoutes: HttpHandler[] = [
  http.options('https://api.example.local/status', () => {
    return mockedResponseStatusOk();
  }),
];
