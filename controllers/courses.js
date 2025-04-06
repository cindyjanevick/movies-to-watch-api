const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    try {
        const result = await mongodb.getDatabase().db().collection('courses').find();
        const courses = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving courses', details: error.message });
    }
};

const getSingle = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for invalid ObjectId format
        if (!ObjectId.isValid(id) || id.length !== 24) {
            return res.status(400).json({ error: 'Invalid Course ID format' });
        }

        const courseId = new ObjectId(id);
        const result = await mongodb.getDatabase().db().collection('courses').findOne({ _id: courseId });

        if (!result) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving the course', details: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const course = {
            courseCode: req.body.courseCode,
            courseName: req.body.courseName,
            instructor: req.body.instructor,
            semester: req.body.semester
        };
        const response = await mongodb.getDatabase().db().collection('courses').insertOne(course);

        if (response.acknowledged) {
            res.status(201).json({ message: 'Course created successfully', courseId: response.insertedId });
        } else {
            throw new Error('Course creation failed');
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the course', details: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for invalid ObjectId format
        if (!ObjectId.isValid(id) || id.length !== 24) {
            return res.status(400).json({ error: 'Invalid Course ID format' });
        }

        const courseId = new ObjectId(id);
        const course = {
            courseCode: req.body.courseCode,
            courseName: req.body.courseName,
            instructor: req.body.instructor,
            semester: req.body.semester
        };
        const response = await mongodb.getDatabase().db().collection('courses').replaceOne({ _id: courseId }, course);

        if (response.modifiedCount > 0) {
            res.status(200).json({ message: 'Course updated successfully' });
        } else {
            res.status(404).json({ error: 'Course not found or no changes made' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the course', details: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for invalid ObjectId format
        if (!ObjectId.isValid(id) || id.length !== 24) {
            return res.status(400).json({ error: 'Invalid Course ID format' });
        }

        const courseId = new ObjectId(id);
        const response = await mongodb.getDatabase().db().collection('courses').deleteOne({ _id: courseId });

        if (response.deletedCount > 0) {
            res.status(200).json({ message: 'Course deleted successfully' });
        } else {
            res.status(404).json({ error: 'Course not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the course', details: error.message });
    }
};

module.exports = {
    getAll,
    getSingle,
    createCourse,
    updateCourse,
    deleteCourse,
};
