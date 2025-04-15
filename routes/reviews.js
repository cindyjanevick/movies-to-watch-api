const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviews');
const validate = require('../middleware/validator');
const { isAuthenticated } = require('../middleware/authenticate');

// Get all reviews
router.get('/', reviewController.getAll);

// Get a single review by ID
router.get('/:id', reviewController.getSingle);

// Create a new review (requires authentication)
router.post('/', isAuthenticated, validate.reviewRules(), validate.checkData, reviewController.createReview);

// Update a review (requires authentication)
router.put('/:id', isAuthenticated, validate.reviewRules(), validate.checkData, reviewController.updateReview);

// Delete a review (requires authentication)
router.delete('/:id', isAuthenticated, reviewController.deleteReview);

module.exports = router;
