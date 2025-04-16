const request = require('supertest');
const express = require('express');
const watchlistRoutes = require('../routes/watchlists'); // Import the watchlist routes
const mongodb = require('../data/database'); // Mock the MongoDB connection
const { watchlistRules } = require('../middleware/validator'); // Assuming you have a similar validator for watchlists

// Create a new Express app instance for the test
const app = express();

// Mock middleware (Example: any authentication or validation middleware)
jest.mock('../middleware/authenticate', () => ({
  isAuthenticated: (req, res, next) => next()
}));

jest.mock('../middleware/validator', () => ({
  watchlistRules: () => (req, res, next) => next(),
  checkData: (req, res, next) => next()
}));

// Mock the database methods using jest.mock()
jest.mock('../data/database', () => {
  return {
    getDatabase: jest.fn().mockReturnValue({
      db: () => ({
        collection: () => ({
          find: jest.fn(),
          findOne: jest.fn(),
          insertOne: jest.fn(),
          updateOne: jest.fn(),
          deleteOne: jest.fn(),
        }),
      }),
    }),
  };
});

// Setup the middleware and routes
app.use(express.json());
app.use('/watchlists', watchlistRoutes); // Use the watchlist routes for testing

// Test creating a watchlist item
describe('Watchlist Route', () => {
  describe('POST /watchlists', () => {
    it('should create a watchlist item', async () => {
      const newWatchlist = {
        user_id: '123456789012345678901234', // Mock valid ObjectId
        name: 'My Watchlist',
        movies: [
          { movieId: '123456789012345678901234', status: 'watched' }
        ]
      };

      // Mock the database response for inserting a watchlist
      mongodb.getDatabase.mockReturnValue({
        db: () => ({
          collection: () => ({
            insertOne: jest.fn().mockResolvedValue({
              acknowledged: true,
              insertedId: '60c72b2f9e1d9f4d2c96b3c3', // Mock insertedId
            }),
          }),
        }),
      });

      const res = await request(app).post('/watchlists').send(newWatchlist);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('watchlistId');
    });
  });

  // Test updating a watchlist item
  describe('PUT /watchlists/:id', () => {
    it('should update a watchlist item', async () => {
      const watchlistId = '60c72b2f9e1d9f4d2c96b3c3';
      const updatedWatchlist = {
        name: 'Updated Watchlist',
        movies: [
          { movieId: '234567890123456789012345', status: 'not watched' }
        ]
      };

      // Mock the response for fetching and updating a watchlist item
      mongodb.getDatabase.mockReturnValue({
        db: () => ({
          collection: () => ({
            findOne: jest.fn().mockResolvedValue({
              _id: '60c72b2f9e1d9f4d2c96b3c3', // Mock existing watchlist
              ...updatedWatchlist,
            }),
            updateOne: jest.fn().mockResolvedValue({
              modifiedCount: 1,
            }),
          }),
        }),
      });

      const res = await request(app)
        .put(`/watchlists/${watchlistId}`)
        .send(updatedWatchlist);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Watchlist updated successfully');
    });
  });

  // Test deleting a watchlist item
  describe('DELETE /watchlists/:id', () => {
    it('should delete a watchlist item', async () => {
      const watchlistId = '60c72b2f9e1d9f4d2c96b3c3';

      // Mock the database response for deleting a watchlist item
      mongodb.getDatabase.mockReturnValue({
        db: () => ({
          collection: () => ({
            deleteOne: jest.fn().mockResolvedValue({
              deletedCount: 1,
            }),
          }),
        }),
      });

      const res = await request(app).delete(`/watchlists/${watchlistId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Watchlist deleted successfully');
    });
  });

  // Test getting all watchlist items
  describe('GET /watchlists', () => {
    it('should return all watchlists', async () => {
      const mockWatchlists = [
        {
          _id: '60c72b2f9e1d9f4d2c96b3c3',
          user_id: '123456789012345678901234',
          name: 'My Watchlist',
          movies: [
            { movieId: '123456789012345678901234', status: 'watched' }
          ],
        },
      ];

      // Mock the database response for fetching all watchlists
      mongodb.getDatabase.mockReturnValue({
        db: () => ({
          collection: () => ({
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue(mockWatchlists),
            }),
          }),
        }),
      });

      const res = await request(app).get('/watchlists');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockWatchlists);
    });
  });

  // Test getting a single watchlist item
  describe('GET /watchlists/:id', () => {
    it('should return a single watchlist item', async () => {
      const watchlistId = '60c72b2f9e1d9f4d2c96b3c3';
      const mockWatchlist = {
        _id: watchlistId,
        user_id: '123456789012345678901234',
        name: 'My Watchlist',
        movies: [
          { movieId: '123456789012345678901234', status: 'watched' }
        ],
      };

      // Mock the database response for finding a single watchlist item
      mongodb.getDatabase.mockReturnValue({
        db: () => ({
          collection: () => ({
            findOne: jest.fn().mockResolvedValue(mockWatchlist),
          }),
        }),
      });

      const res = await request(app).get(`/watchlists/${watchlistId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockWatchlist);
    });
  });
});
