import { HttpStatusCodes } from 'tests/support/enums/httpStatusCodes';
import { http, HttpHandler, HttpResponse } from 'msw';

export const optionMethodRoutes: HttpHandler[] = [
  http.options('https://api.example.local/status', () => {
    return new HttpResponse(null, { status: HttpStatusCodes.HTTP_OK });
  }),
];
