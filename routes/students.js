const express = require('express');
const router = express.Router();

const studentsController = require('../controllers/students');

const validate = require('../validators/validator');
const {isAuthenticated} = require("../validators/authenticate");

router.get('/', studentsController.getAll);

router.get('/:id', studentsController.getSingle);

// POST - Create a student with validation and authentication
router.post(
  '/',
  isAuthenticated,                   // Ensure the user is authenticated
  validate.studentRules(),            // Validate request body
  validate.checkData,                // Check for validation errors
  studentsController.createStudent     // Create the student if validation passes
);

// PUT - Update a student with validation and authentication
router.put(
  '/:id',
  isAuthenticated,                   // Ensure the user is authenticated
  validate.studentRules(),            // Validate request body
  validate.checkData,                // Check for validation errors
  studentsController.updateStudent    // Update the student if validation passes
);

// DELETE student by ID with authentication
router.delete('/:id', isAuthenticated, studentsController.deleteStudent);
    
  
  
module.exports = router;