import { HttpStatusCodes } from 'tests/support/enums/httpStatusCodes';
import { http, HttpHandler, HttpResponse } from 'msw';

export const headMethodRoutes: HttpHandler[] = [
  http.head('https://api.example.local/status', ({ request }) => {
    const url = new URL(request.url);
    const timestamp = url.searchParams.get('timestamp');

    const response = {
      timestamp: timestamp ?? Date.now(),
      status: 'OK',
    };

    return new HttpResponse(JSON.stringify(response), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.head('https://api.example.local/validate/headers', ({ request }) => {
    if (!request.headers.has('Accept-Encoding') || !request.headers.has('Content-Type')) {
      return new HttpResponse(JSON.stringify({ error: 'Invalid header' }), {
        status: HttpStatusCodes.HTTP_BAD_REQUEST,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    return new HttpResponse(JSON.stringify({ status: 'OK' }), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.head('https://api.example.local/validate/headers/accept-encoding', ({ request }) => {
    if (!request.headers.has('Accept-Encoding')) {
      return new HttpResponse(JSON.stringify({ error: 'Invalid header' }), {
        status: HttpStatusCodes.HTTP_BAD_REQUEST,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    return new HttpResponse(JSON.stringify({ status: 'OK' }), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.head('https://api.example.local/validate/headers/content-type', ({ request }) => {
    if (!request.headers.has('Content-Type')) {
      return new HttpResponse(JSON.stringify({ error: 'Invalid header' }), {
        status: HttpStatusCodes.HTTP_BAD_REQUEST,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    return new HttpResponse(JSON.stringify({ status: 'OK' }), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.head('https://api.example.local/validate/mode', ({ request }) => {
    if (request.mode !== 'same-origin') {
      return new HttpResponse(JSON.stringify({ error: 'Invalid mode' }), {
        status: HttpStatusCodes.HTTP_BAD_REQUEST,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    return new HttpResponse(JSON.stringify({ status: 'OK' }), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.head('https://api.example.local/validate/options', ({ request }) => {
    if (request.mode !== 'same-origin' || request.keepalive === false) {
      return new HttpResponse(JSON.stringify({ error: 'Invalid options' }), {
        status: HttpStatusCodes.HTTP_BAD_REQUEST,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
    }

    return new HttpResponse(JSON.stringify({ status: 'OK' }), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),
];
