const request = require('supertest');
const express = require('express');
const movieRoutes = require('../routes/movies');

// Mock database and middleware
jest.mock('../data/database', () => ({
  getDatabase: () => ({
    db: () => ({
      collection: () => ({
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            { _id: '1', title: 'Movie 1', genre: 'Action' },
            { _id: '2', title: 'Movie 2', genre: 'Drama' }
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
  movieRules: () => (req, res, next) => next(),
  checkData: (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/movies', movieRoutes);

describe('Movies Route', () => {
  it('GET /movies should return all movies', async () => {
    const res = await request(app).get('/movies');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('title', 'Movie 1');
  });

  it('POST /movies should create a movie', async () => {
    const res = await request(app).post('/movies').send({
      title: 'Test Movie',
      genre: 'Comedy',
      releaseYear: 2023,
      duration: 120,
      description: 'Test description',
      status: 'Available',
      rating: 4.5
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('movieId');
  });

  it('PUT /movies/:id should update a movie', async () => {
    const res = await request(app).put('/movies/123456789012345678901234').send({
      title: 'Updated Movie',
      genre: 'Thriller',
      releaseYear: 2022,
      duration: 110,
      description: 'Updated description',
      status: 'Unavailable',
      rating: 4.8
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('DELETE /movies/:id should delete a movie', async () => {
    const res = await request(app).delete('/movies/123456789012345678901234');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
