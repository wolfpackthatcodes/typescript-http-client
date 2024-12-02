import { setupServer, SetupServer } from 'msw/node';
import { HttpHandler } from 'msw';
import {
  deleteMethodRoutes,
  getMethodRoutes,
  headMethodRoutes,
  optionMethodRoutes,
  patchMethodRoutes,
  postMethodRoutes,
  putMethodRoutes,
} from './routes';

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
