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

// ✅ Review Validation
validate.reviewRules = () => [
  body('movie_id')
    .exists().withMessage('Movie ID is required')
    .custom(value => ObjectId.isValid(value)).withMessage('Invalid Movie ID'),

  body('user_id')
    .exists().withMessage('User ID is required')
    .custom(value => ObjectId.isValid(value)).withMessage('Invalid User ID'),

  body('title')
    .exists({ checkFalsy: true }).withMessage('Review title is required')
    .isString().withMessage('Review title must be a string'),

  body('comment')
    .exists().withMessage('Comment is required')
    .isString().withMessage('Comment must be a string'),

  body('rating')
    .exists().withMessage('Rating is required')
    .isFloat({ min: 1, max: 10 }).withMessage('Rating must be between 1 and 10')
];

// ✅ Watchlist Validation
validate.watchlistRules = () => [
  body('name')
    .exists({ checkFalsy: true }).withMessage('Watchlist name is required')
    .isString().withMessage('Watchlist name must be a string'),

  body('movies')
    .optional()
    .isArray().withMessage('Movies must be an array')
    .custom((movies) => {
      for (const movie of movies) {
        if (!movie.movieId || !movie.status) {
          throw new Error('Each movie must have a movieId and status');
        }
        if (!['watching', 'planToWatch', 'completed', 'onHold', 'dropped'].includes(movie.status)) {
          throw new Error(`Invalid movie status: ${movie.status}`);
        }
        if (!ObjectId.isValid(movie.movieId)) {
          throw new Error('Each movieId must be a valid MongoDB ID');
        }
      }
      return true;
    })
];

// ✅ Shared Validation Result Middleware
validate.checkData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

module.exports = validate;