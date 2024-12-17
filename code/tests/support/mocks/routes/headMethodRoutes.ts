import { HttpHandler, http } from 'msw';
import { mockedResponseStatusBadRequest, mockedResponseStatusOk } from 'tests/support/mocks/responses/mockedResponses';

export const headMethodRoutes: HttpHandler[] = [
  http.head('https://api.example.local/status', ({ request }) => {
    const url = new URL(request.url);
    const timestamp = url.searchParams.get('timestamp');

    const response = {
      timestamp: timestamp ?? Date.now(),
      status: 'OK',
    };

    return mockedResponseStatusOk(JSON.stringify(response));
  }),

  http.head('https://api.example.local/validate/headers', ({ request }) => {
    if (!request.headers.has('Accept-Encoding') || !request.headers.has('Content-Type')) {
      return mockedResponseStatusBadRequest(JSON.stringify({ error: 'Invalid header' }));
    }

    return mockedResponseStatusOk(JSON.stringify({ status: 'OK' }));
  }),

  http.head('https://api.example.local/validate/headers/accept-encoding', ({ request }) => {
    if (!request.headers.has('Accept-Encoding')) {
      return mockedResponseStatusBadRequest(JSON.stringify({ error: 'Invalid header' }));
    }

    return mockedResponseStatusOk(JSON.stringify({ status: 'OK' }));
  }),

  http.head('https://api.example.local/validate/headers/content-type', ({ request }) => {
    if (!request.headers.has('Content-Type')) {
      return mockedResponseStatusBadRequest(JSON.stringify({ error: 'Invalid header' }));
    }

    return mockedResponseStatusOk(JSON.stringify({ status: 'OK' }));
  }),

  http.head('https://api.example.local/validate/mode', ({ request }) => {
    if (request.mode !== 'same-origin') {
      return mockedResponseStatusBadRequest(JSON.stringify({ error: 'Invalid mode' }));
    }

    return mockedResponseStatusOk(JSON.stringify({ status: 'OK' }));
  }),

  http.head('https://api.example.local/validate/options', ({ request }) => {
    if (request.mode !== 'same-origin' || request.keepalive === false) {
      return mockedResponseStatusBadRequest(JSON.stringify({ error: 'Invalid options' }));
    }

    return mockedResponseStatusOk(JSON.stringify({ status: 'OK' }));
  }),
];
