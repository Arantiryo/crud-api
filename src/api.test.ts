import http from 'http';
import { PORT, server } from './server';

const BASE_URL = `http://localhost:${PORT}`;

describe('User API', () => {
  afterAll((done) => {
    server?.close(done);
  });

  it('should get all users (initially empty)', (done) => {
    http.get(`${BASE_URL}/api/users`, (res) => {
      expect(res.statusCode).toBe(200);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const users = JSON.parse(data);
        expect(users).toEqual([]);
        done();
      });
    });
  });

  it('should create a new user', (done) => {
    const newUser = JSON.stringify({
      username: 'Test user',
      age: 24,
      hobbies: ['reading', 'gaming'],
    });

    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(newUser),
      },
    };

    const req = http.request(options, (res) => {
      expect(res.statusCode).toBe(201);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const user = JSON.parse(data);
        expect(user).toHaveProperty('id');
        expect(user.username).toBe('Test user');
        expect(user.age).toBe(24);
        expect(user.hobbies).toEqual(['reading', 'gaming']);
        done();
      });
    });

    req.on('error', (err) => {
      done(err);
    });

    req.write(newUser);
    req.end();
  });

  it('should get user by ID', (done) => {
    const newUser = JSON.stringify({
      username: 'New user',
      age: 25,
      hobbies: ['drawing', 'hiking'],
    });

    const createOptions = {
      hostname: 'localhost',
      port: PORT,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(newUser),
      },
    };

    const createReq = http.request(createOptions, (createRes) => {
      expect(createRes.statusCode).toBe(201);

      let data = '';
      createRes.on('data', (chunk) => {
        data += chunk;
      });

      createRes.on('end', () => {
        const createdUser = JSON.parse(data);
        const userId = createdUser.id;

        http.get(`${BASE_URL}/api/users/${userId}`, (getRes) => {
          expect(getRes.statusCode).toBe(200);

          let getData = '';
          getRes.on('data', (chunk) => {
            getData += chunk;
          });

          getRes.on('end', () => {
            const fetchedUser = JSON.parse(getData);
            expect(fetchedUser.id).toBe(userId);
            expect(fetchedUser.username).toBe('New user');
            expect(fetchedUser.age).toBe(25);
            expect(fetchedUser.hobbies).toEqual(['drawing', 'hiking']);
            done();
          });
        });
      });
    });

    createReq.on('error', (err) => {
      done(err);
    });

    createReq.write(newUser);
    createReq.end();
  });
});
