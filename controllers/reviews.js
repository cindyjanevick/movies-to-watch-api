const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

// Get all reviews
const getAll = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('reviews').find();
    const reviews = await result.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving reviews', details: error.message });
  }
};

// Get single review by ID
const getSingle = async (req, res) => {
  const reviewId = req.params.id;

  if (!ObjectId.isValid(reviewId)) {
    return res.status(400).json({ error: 'Invalid Review ID format' });
  }

  try {
    const result = await mongodb.getDatabase().db().collection('reviews').findOne({ _id: new ObjectId(reviewId) });

    if (!result) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving the review', details: error.message });
  }
};

// Create a new review
const createReview = async (req, res) => {
  const { movieId, rating, comment } = req.body;
  const userId = req.session.user_id; // Assuming user is authenticated and user_id is stored in session

  // Validate input
  if (!ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: 'Invalid movieId format' });
  }

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  if (rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'Rating must be between 1 and 10' });
  }

  const review = {
    user_id: new ObjectId(userId), // Using the user_id from session
    movieId: new ObjectId(movieId),
    rating,
    comment,
    createdAt: new Date()
  };

  try {
    const response = await mongodb.getDatabase().db().collection('reviews').insertOne(review);

    if (response.acknowledged) {
      res.status(201).json({ message: 'Review created successfully', reviewId: response.insertedId });
    } else {
      throw new Error('Review creation failed');
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the review', details: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  const reviewId = req.params.id;

  if (!ObjectId.isValid(reviewId)) {
    return res.status(400).json({ error: 'Invalid Review ID format' });
  }

  const { rating, comment } = req.body;

  // Validate input
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  if (rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'Rating must be between 1 and 10' });
  }

  const updatedReview = {
    rating,
    comment,
    updatedAt: new Date()
  };

  try {
    const response = await mongodb.getDatabase().db().collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: updatedReview }
    );

    if (response.modifiedCount > 0) {
      res.status(200).json({ message: 'Review updated successfully' });
    } else {
      res.status(404).json({ error: 'Review not found or no changes made' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the review', details: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  const reviewId = req.params.id;

  if (!ObjectId.isValid(reviewId)) {
    return res.status(400).json({ error: 'Invalid Review ID format' });
  }

  try {
    const response = await mongodb.getDatabase().db().collection('reviews').deleteOne({ _id: new ObjectId(reviewId) });

    if (response.deletedCount > 0) {
      res.status(200).json({ message: 'Review deleted successfully' });
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the review', details: error.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createReview,
  updateReview,
  deleteReview
};
