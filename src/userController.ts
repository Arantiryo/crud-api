import { IncomingMessage, ServerResponse } from 'http';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './userService';
import { parse } from 'url';
import { validate as validateUuid } from 'uuid';

export const handleRequest = (
  req: IncomingMessage,
  res: ServerResponse,
): void => {
  const { method, url } = req;
  const parsedUrl = parse(url || '', true);
  const pathSegments = parsedUrl.pathname?.split('/').filter(Boolean);

  // Handle non-existent routes
  if (
    !(pathSegments && pathSegments[0] === 'api' && pathSegments[1] === 'users')
  ) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const handleInternalError = () => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  };

  const handleRequestError = (message: string) => {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end(message);
  };

  const userId = pathSegments[2];

  try {
    // Handle Get users
    if (method === 'GET' && pathSegments.length === 2) {
      const users = getAllUsers();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
      return;
    }

    // Handle Get user by ID
    if (method === 'GET' && pathSegments.length === 3) {
      if (!validateUuid(userId!)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid user ID');
        return;
      }

      const user = getUserById(userId!);

      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('User not found');
      }

      return;
    }

    // Handle Create new user
    if (method === 'POST' && pathSegments.length === 2) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          if (!body) return handleRequestError('Invalid request body');

          const { username, age, hobbies } = JSON.parse(body);

          if (!(username && typeof age === 'number' && Array.isArray(hobbies)))
            return handleRequestError('Invalid request body');

          const newUser = createUser(username, age, hobbies);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newUser));
        } catch (error) {
          handleInternalError();
        }
      });

      return;
    }

    // Handle Update existing user
    if (method === 'PUT' && pathSegments.length === 3) {
      if (!validateUuid(userId!)) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid user ID');
        return;
      }

      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          if (!body) return handleRequestError('Invalid request body');

          const { username, age, hobbies } = JSON.parse(body);

          if (username && typeof age === 'number' && Array.isArray(hobbies)) {
            const updatedUser = updateUser(userId!, username, age, hobbies);

            if (updatedUser) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(updatedUser));
            } else {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('User not found');
            }
          } else {
            handleRequestError('Invalid request body');
          }
        } catch (error) {
          handleInternalError();
        }
      });

      return;
    }

    // Handle Delete a user
    if (method === 'DELETE' && pathSegments.length === 3) {
      if (!validateUuid(userId!)) {
        handleRequestError('Invalid user ID');
        return;
      }

      const isDeleted = deleteUser(userId!);

      if (isDeleted) {
        res.writeHead(204);
        res.end();
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('User not found');
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  } catch (error) {
    handleInternalError();
  }
};
