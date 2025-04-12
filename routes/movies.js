const express = require('express');
const router = express.Router();

const moviesController = require('../controllers/movies');
const validate = require('../middleware/validator');
const { isAuthenticated } = require('../middleware/authenticate');

// Removed isAuthenticated to allow unauthenticated access

// GET all movies
router.get('/', moviesController.getAll);

// GET a single movie by ID
router.get('/:id', moviesController.getSingle);

// POST - Create a movie with validation (no auth)
router.post(
  '/',
  isAuthenticated,                   // Ensure the movie is authenticated
  validate.movieRules(),
  validate.checkData,
  moviesController.createMovie
);

// PUT - Update a movie by ID with validation (no auth)
router.put(
  '/:id',
  isAuthenticated,                   // Ensure the movie is authenticated
  validate.movieRules(),
  validate.checkData,
  moviesController.updateMovie
);

// DELETE - Remove a movie by ID (no auth)
router.delete('/:id', isAuthenticated, moviesController.deleteMovie);

module.exports = router;
