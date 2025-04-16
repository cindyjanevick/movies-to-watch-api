const request = require('supertest');
const express = require('express');
const userRoutes = require('../routes/users');

// Mock database and middleware
jest.mock('../data/database', () => ({
  getDatabase: () => ({
    db: () => ({
      collection: () => ({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { _id: '1', username: 'User1', email: 'user1@example.com' },
            { _id: '2', username: 'User2', email: 'user2@example.com' }
          ])
        }),
        findOne: jest.fn(),
        insertOne: jest.fn().mockResolvedValue({ acknowledged: true, insertedId: '123' }),
        replaceOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
      })
    })
  })
}));

// Mock middleware
jest.mock('../middleware/authenticate', () => ({
  isAuthenticated: (req, res, next) => next()
}));
jest.mock('../middleware/validator', () => ({
  userRules: () => (req, res, next) => next(),
  checkData: (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/users', userRoutes);

describe('User Route', () => {

  // Test: GET all users
  it('GET /users should return all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('username', 'User1');
    expect(res.body[1]).toHaveProperty('email', 'user2@example.com');
  });

  // Test: POST create a user
  it('POST /users should create a new user', async () => {
    const res = await request(app).post('/users').send({
      username: 'TestUser',
      password: 'password123',
      email: 'testuser@example.com'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');
    expect(res.body).toHaveProperty('userId');
  });

  // Test: PUT update a user
  it('PUT /users/:id should update user details', async () => {
    const res = await request(app).put('/users/123456789012345678901234').send({
      username: 'UpdatedUser',
      email: 'updateduser@example.com',
      password: 'newpassword123'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User updated successfully');
  });

  // Test: DELETE remove a user
  it('DELETE /users/:id should delete a user', async () => {
    const res = await request(app).delete('/users/123456789012345678901234');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User deleted successfully');
  });

});
