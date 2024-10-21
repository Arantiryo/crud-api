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

  console.log('parsedUrl', parsedUrl.pathname?.split('/'));

  if (
    pathSegments &&
    pathSegments[0] === 'api' &&
    pathSegments[1] === 'users'
  ) {
    const userId = pathSegments[2];

    try {
      if (method === 'GET' && pathSegments.length === 2) {
        // Get all users
        const users = getAllUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
      } else if (method === 'GET' && pathSegments.length === 3) {
        // Get user by ID
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
      } else if (method === 'POST' && pathSegments.length === 2) {
        // Create a new user
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          const { username, age, hobbies } = JSON.parse(body);
          if (username && typeof age === 'number' && Array.isArray(hobbies)) {
            const newUser = createUser(username, age, hobbies);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
          } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid request body');
          }
        });
      } else if (method === 'PUT' && pathSegments.length === 3) {
        // Update an existing user
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
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid request body');
          }
        });
      } else if (method === 'DELETE' && pathSegments.length === 3) {
        // Delete a user
        if (!validateUuid(userId!)) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid user ID');
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
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
};
