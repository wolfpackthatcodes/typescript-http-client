import { HttpStatusCodes } from 'tests/support/enums/httpStatusCodes';
import { http, HttpHandler, HttpResponse } from 'msw';

export const deleteMethodRoutes: HttpHandler[] = [
  http.delete('https://api.example.local/users/:id', () => {
    return new HttpResponse(null, {
      status: HttpStatusCodes.HTTP_ACCEPTED,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),
];
