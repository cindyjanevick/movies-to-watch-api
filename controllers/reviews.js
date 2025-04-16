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
  const { user_id, movieId, rating, title, comment } = req.body;

  if (!ObjectId.isValid(user_id) || !ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: 'Invalid user_id or movieId format' });
  }

  try {
    const review = {
      user_id: new ObjectId(user_id),
      movieId: new ObjectId(movieId),
      rating,
      title,
      comment,
      // createdAt: new Date()
    };

    const response = await mongodb.getDatabase().db().collection('reviews').insertOne(review);

    if (response.acknowledged) {
      res.status(201).json({ message: 'Review created successfully', reviewId: response.insertedId });
    } else {
      res.status(500).json({ error: 'Failed to create review' });
    }
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while creating the review', details: err.message });
  }
};


// Update a review
const updateReview = async (req, res) => {
  const reviewId = req.params.id;
  const { user_id, rating, title, comment } = req.body;

  // Validate reviewId and user_id
  if (!ObjectId.isValid(reviewId)) {
    return res.status(400).json({ error: 'Invalid review ID format' });
  }

  if (!ObjectId.isValid(user_id)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    const db = mongodb.getDatabase().db();
    const existingReview = await db
      .collection('reviews')
      .findOne({ _id: new ObjectId(reviewId) });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Manual user_id check for authorization
    if (existingReview.user_id.toString() !== user_id) {
      return res.status(403).json({ error: 'You can only update your own reviews' });
    }

    // Prepare updated fields
    const updatedFields = {
      rating,
      title,
      comment
    };

    const result = await db
      .collection('reviews')
      .updateOne(
        { _id: new ObjectId(reviewId) },
        { $set: updatedFields }
      );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'Review update failed or no changes made' });
    }

    res.status(200).json({ message: 'Review updated successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred while updating the review',
      details: error.message
    });
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
