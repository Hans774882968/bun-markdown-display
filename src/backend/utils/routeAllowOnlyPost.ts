import { RouteMethod } from '@/types/auth';
import { errorResponse } from './apiResponse';

function methodNotAllowed(method: string) {
  return Response.json(
    errorResponse(405, `Method ${method} Not Allowed`)
  );
}

export const routeAllowOnlyPost = (method: RouteMethod) => {
  return {
    GET: () => methodNotAllowed('GET'),
    POST: method,
    PUT: () => methodNotAllowed('PUT'),
    DELETE: () => methodNotAllowed('DELETE'),
  };
};
