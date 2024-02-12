import { HttpStatusCodes } from '../enums/httpStatusCodes';
import { delay, http, HttpResponse } from 'msw';

export const restHandlers = [
  http.all('https://api.example.local/test/', () => {
    return new HttpResponse(null, {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.get('https://api.example.local/test/:id', () => {
    return new HttpResponse(JSON.stringify({ title: 'Unit test', done: true }), { status: HttpStatusCodes.HTTP_OK });
  }),

  http.get('https://api.example.local/users', () => {
    return new HttpResponse(JSON.stringify([{ first_name: 'Luis', last_name: 'Aveiro' }]), {
      status: HttpStatusCodes.HTTP_OK,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.post('https://api.example.local/users', () => {
    return new HttpResponse(JSON.stringify({ first_name: 'Luis', last_name: 'Aveiro' }), {
      status: HttpStatusCodes.HTTP_CREATED,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.patch('https://api.example.local/users/:id', ({ params }) => {
    const { id } = params;

    return new HttpResponse(JSON.stringify({ id, first_name: 'Luis', last_name: 'Aveiro' }), {
      status: HttpStatusCodes.HTTP_ACCEPTED,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.put('https://api.example.local/users/:id', ({ params }) => {
    const { id } = params;

    return new HttpResponse(JSON.stringify({ id, first_name: 'Luis', last_name: 'Aveiro' }), {
      status: HttpStatusCodes.HTTP_ACCEPTED,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.delete('https://api.example.local/users/:id', () => {
    return new HttpResponse(null, {
      status: HttpStatusCodes.HTTP_ACCEPTED,
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }),

  http.get('https://api.example.local/timeout', async () => {
    await delay(5);

    return new HttpResponse(null, { status: HttpStatusCodes.HTTP_OK });
  }),

  http.get('https://api.example.local/unavailable', () => {
    return new HttpResponse(null, { status: HttpStatusCodes.HTTP_SERVICE_UNAVAILABLE });
  }),
];
