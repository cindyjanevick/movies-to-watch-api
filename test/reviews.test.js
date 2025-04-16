const request = require('supertest');
const express = require('express');
const reviewRoutes = require('../routes/reviews'); // Import the review routes
const mongodb = require('../data/database'); // Mock the mongodb connection object
const { reviewRules } = require('../middleware/validator');

// Create a new Express app instance for the test
const app = express();

// Mock middleware (Example: any authentication middleware or validation middleware)
// Mock middleware
jest.mock('../middleware/authenticate', () => ({
    isAuthenticated: (req, res, next) => next()
  }));
  jest.mock('../middleware/validator', () => ({
    reviewRules: () => (req, res, next) => next(),
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
app.use('/reviews', reviewRoutes); // Use the review routes for testing

// Test creating a review
describe('Reviews Route', () => {
  describe('POST /reviews', () => {
    it('should create a review', async () => {
      const newReview = {
        user_id: '123456789012345678901234', // Mock valid ObjectId
        movieId: '123456789012345678901234', // Mock movieId
        rating: 5,
        title: 'Great Movie!',
        comment: 'This movie was fantastic!',
      };

      // Mock the database response for inserting a review
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

      const res = await request(app).post('/reviews').send(newReview);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('reviewId');
    });
  });

  // Test updating a review
  describe('PUT /reviews/:id', () => {
    it('should update a review', async () => {
      const reviewId = '60c72b2f9e1d9f4d2c96b3c3';
      const updatedReview = {
        rating: 4,
        title: 'Good Movie!',
        comment: 'The movie was good, but could have been better.',
      };

      // Mock the response for fetching and updating a review
      mongodb.getDatabase.mockReturnValue({
        db: () => ({
          collection: () => ({
            findOne: jest.fn().mockResolvedValue({
              _id: '60c72b2f9e1d9f4d2c96b3c3', // Mock existing review
              ...updatedReview,
            }),
            updateOne: jest.fn().mockResolvedValue({
              modifiedCount: 1,
            }),
          }),
        }),
      });

      const res = await request(app)
        .put(`/reviews/${reviewId}`)
        .send(updatedReview);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Review updated successfully');
    });
  });

  // Test deleting a review
  describe('DELETE /reviews/:id', () => {
    it('should delete a review', async () => {
      const reviewId = '60c72b2f9e1d9f4d2c96b3c3';

      // Mock the database response for deleting a review
      mongodb.getDatabase.mockReturnValue({
        db: () => ({
          collection: () => ({
            deleteOne: jest.fn().mockResolvedValue({
              deletedCount: 1,
            }),
          }),
        }),
      });

      const res = await request(app).delete(`/reviews/${reviewId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Review deleted successfully');
    });
  });

  // Test getting all reviews
  describe('GET /reviews', () => {
    it('should return all reviews', async () => {
      const mockReviews = [
        {
          _id: '60c72b2f9e1d9f4d2c96b3c3',
          user_id: '123456789012345678901234',
          movieId: '234567890123456789012345',
          rating: 5,
          title: 'Great Movie!',
          comment: 'This movie was fantastic!',
        },
      ];

      // Mock the database response for fetching all reviews
      mongodb.getDatabase.mockReturnValue({
        db: () => ({
          collection: () => ({
            find: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue(mockReviews),
            }),
          }),
        }),
      });

      const res = await request(app).get('/reviews');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockReviews);
    });
  });

  // Test getting a single review
  describe('GET /reviews/:id', () => {
    it('should return a single review', async () => {
      const reviewId = '60c72b2f9e1d9f4d2c96b3c3';
      const mockReview = {
        _id: reviewId,
        user_id: '123456789012345678901234',
        movieId: '234567890123456789012345',
        rating: 5,
        title: 'Great Movie!',
        comment: 'This movie was fantastic!',
      };

      // Mock the database response for finding a single review
      mongodb.getDatabase.mockReturnValue({
        db: () => ({
          collection: () => ({
            findOne: jest.fn().mockResolvedValue(mockReview),
          }),
        }),
      });

      const res = await request(app).get(`/reviews/${reviewId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockReview);
    });
  });
});
