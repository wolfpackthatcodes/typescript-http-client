import {
  deleteMethodRoutes,
  getMethodRoutes,
  headMethodRoutes,
  optionMethodRoutes,
  patchMethodRoutes,
  postMethodRoutes,
  putMethodRoutes,
} from './routes';
import { HttpHandler } from 'msw';
import { SetupServer, setupServer } from 'msw/node';

const restHandlers: HttpHandler[] = [
  ...deleteMethodRoutes,
  ...getMethodRoutes,
  ...headMethodRoutes,
  ...optionMethodRoutes,
  ...patchMethodRoutes,
  ...postMethodRoutes,
  ...putMethodRoutes,
];

export const server: SetupServer = setupServer(...restHandlers);
