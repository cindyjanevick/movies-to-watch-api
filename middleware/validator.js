const { body, validationResult } = require('express-validator');
const validate = {};

// Movie Validation Rules
validate.movieRules = () => {
  return [
    body('title')
      .exists({ checkFalsy: true })
      .withMessage('Title is required')
      .isString()
      .withMessage('Title must be a string')
      .isLength({ min: 1 })
      .withMessage('Title cannot be empty'),

    body('genre')
      .exists({ checkFalsy: true })
      .withMessage('Genre is required')
      .isString()
      .withMessage('Genre must be a string')
      .isLength({ min: 1 })
      .withMessage('Genre cannot be empty'),

    body('releaseYear')
      .exists()
      .withMessage('Release year is required')
      .isInt({ min: 1800 })
      .withMessage('Release year must be a valid year'),

    body('duration')
      .exists()
      .withMessage('Duration is required')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive number'),

    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),

    body('status')
      .exists({ checkFalsy: true })
      .withMessage('Status is required')
      .isIn(['completed', 'upcoming', 'on-hold', 'cancelled'])
      .withMessage('Status must be one of "completed", "upcoming", "on-hold", or "cancelled"'),

    body('rating')
      .exists()
      .withMessage('Rating is required')
      .isFloat({ min: 1, max: 10 })
      .withMessage('Rating must be a number between 1 and 10')
      .custom((value) => {
        // Optional: Ensure no more than two decimal places
        if (value.toString().split('.').length > 2) {
          throw new Error('Rating can only have up to two decimal places');
        }
        return true;
      }),
  ];
};

// User Validation Rules
validate.userRules = () => {
  return [
    body('username')
      .exists({ checkFalsy: true })
      .withMessage('Username is required')
      .isString()
      .withMessage('Username must be a string')
      .isLength({ min: 1 })
      .withMessage('Username cannot be empty'),

    body('password')
      .exists()
      .withMessage('Password is required')
      .isString()
      .withMessage('Password must be a string')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

    body('email')
      .exists({ checkFalsy: true })
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email format'),

    body('watchlists')
      .optional()
      .isArray()
      .withMessage('Watchlists must be an array')
      .isArray({ min: 1 })
      .withMessage('Watchlists must contain at least one item')
      .custom((value) => {
        return value.every(item => typeof item === 'string');
      })
      .withMessage('Each item in the watchlist must be a string'),
  ];
};

// Watchlist Validation Rules
validate.watchlistRules = () => {
  return [
    body('name')
      .exists({ checkFalsy: true })
      .withMessage('Name is required')
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 1 })
      .withMessage('Name cannot be empty'),

    body('movies')
      .isArray()
      .withMessage('Movies must be an array')
      .custom((value) => {
        if (value.length === 0) {
          throw new Error('Movies array cannot be empty');
        }
        value.forEach((movie) => {
          if (!movie.movieId || !movie.status) {
            throw new Error('Each movie must have movieId and status');
          }
        });
        return true;
      })
      .withMessage('Each movie object must have movieId and status'),

    body('movies.*.movieId')
      .exists()
      .withMessage('Movie ID is required for each movie')
      .isMongoId()
      .withMessage('Each Movie ID must be a valid MongoDB ObjectId'),

    body('movies.*.status')
      .exists()
      .withMessage('Status is required for each movie')
      .isIn(['watching', 'planToWatch', 'completed'])
      .withMessage('Status must be one of "watching", "planToWatch", or "completed"')
  ];
};

// Review Validation Rules
validate.reviewRules = () => {
  return [
    body('movieId')
      .exists({ checkFalsy: true })
      .withMessage('Movie ID is required')
      .isMongoId()
      .withMessage('Movie ID must be a valid MongoDB ObjectId'),

    body('rating')
      .exists()
      .withMessage('Rating is required')
      .isFloat({ min: 1, max: 10 })
      .withMessage('Rating must be a number between 1 and 10')
      .custom((value) => {
        // Optional: Ensure no more than two decimal places
        if (value.toString().split('.').length > 2) {
          throw new Error('Rating can only have up to two decimal places');
        }
        return true;
      }),

    body('comment')
      .optional()
      .isString()
      .withMessage('Comment must be a string'),

      body('title')
      .optional()
      .isString()
      .withMessage('Title must be a string'),  

    body('status')
      .optional()
      .isIn(['watching', 'planToWatch', 'completed'])
      .withMessage('Status must be one of "watching", "planToWatch", or "completed"')
  ];
};


// Shared Validation Result Checker
validate.checkData = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => err.msg),
    });
  }
  next();
};

module.exports = validate;
