const express = require('express');
const router = express.Router();

const coursesController = require('../controllers/courses');
const validate = require('../validators/validator');
const { isAuthenticated } = require("../validators/authenticate");

// GET all courses
router.get('/', coursesController.getAll);

// GET a single course by ID
router.get('/:id', coursesController.getSingle);

// POST - Create a course with validation and authentication
router.post(
  '/',
  isAuthenticated,                   // Ensure the user is authenticated
  validate.courseRules(),            // Validate request body
  validate.checkData,                // Check for validation errors
  coursesController.createCourse     // Create the course if validation passes
);

// PUT - Update a course with validation and authentication
router.put(
  '/:id',
  isAuthenticated,                   // Ensure the user is authenticated
  validate.courseRules(),            // Validate request body
  validate.checkData,                // Check for validation errors
  coursesController.updateCourse     // Update the course if validation passes
);

// DELETE course by ID with authentication
router.delete('/:id', isAuthenticated, coursesController.deleteCourse);

module.exports = router;
