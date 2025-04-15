const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;


// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('reviews').find();
    const reviews = await result.toArray();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving reviews', details: error.message });
  }
};

// Get a single review by ID
const getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid Review ID format' });
    }

    const review = await mongodb.getDatabase().db().collection('reviews').findOne({ _id: new ObjectId(reviewId) });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving the review', details: error.message });
  }
};

// Create a new review
const createReview = async (req, res) => {
  try {
    // Validate the review data
    await reviewRules.validateAsync(req.body);

    const review = {
      user_id: new ObjectId(req.body.user_id),
      movie_id: new ObjectId(req.body.movie_id),
      title: req.body.title,
      rating: req.body.rating,
      comment: req.body.comment
    };

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

// Update an existing review by ID
const updateReview = async (req, res) => {
  try {
    await reviewRules.validateAsync(req.body);

    const reviewId = req.params.id;
    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid Review ID format' });
    }

    const review = {
      user_id: new ObjectId(req.body.user_id),
      movie_id: new ObjectId(req.body.movie_id),
      title: req.body.title,
      rating: req.body.rating,
      comment: req.body.comment
    };

    const response = await mongodb.getDatabase().db().collection('reviews').replaceOne({ _id: new ObjectId(reviewId) }, review);

    if (response.modifiedCount > 0) {
      res.status(200).json({ message: 'Review updated successfully' });
    } else {
      res.status(404).json({ error: 'Review not found or no changes made' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the review', details: error.message });
  }
};

// Delete a review by ID
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    if (!ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid Review ID format' });
    }

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
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
