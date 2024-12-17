import { HttpResponse } from 'msw';
import { HttpStatusCodes } from 'tests/support/enums/httpStatusCodes';

export const mockedResponseStatusAccepted = (body: string | null = null) => {
  return new HttpResponse(body, {
    status: HttpStatusCodes.HTTP_ACCEPTED,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
};

export const mockedResponseStatusBadRequest = (body: string | null = null) => {
  return new HttpResponse(body, {
    status: HttpStatusCodes.HTTP_BAD_REQUEST,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
};

export const mockedResponseStatusCreated = (body: string | null = null) => {
  return new HttpResponse(body, {
    status: HttpStatusCodes.HTTP_CREATED,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
};

export const mockedResponseStatusOk = (body: string | null = null) => {
  return new HttpResponse(body, {
    status: HttpStatusCodes.HTTP_OK,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
};

export const mockedResponseStatusUnauthorized = (body: string | null = null) => {
  return new HttpResponse(body, {
    status: HttpStatusCodes.HTTP_UNAUTHORIZED,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
};

export const mockedResponseStatusUnavailable = (body: string | null = null) => {
  return new HttpResponse(body, {
    status: HttpStatusCodes.HTTP_SERVICE_UNAVAILABLE,
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
};
