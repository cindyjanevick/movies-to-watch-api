const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    try {
        const result = await mongodb.getDatabase().db().collection('students').find();
        const students = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving students', details: error.message });
    }
};

const getSingle = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Check for invalid ObjectId format
        if (!ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: 'Invalid Student ID format' });
        }

        const result = await mongodb.getDatabase().db().collection('students').find({ _id: new ObjectId(studentId) }).toArray();

        if (result.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving the student', details: error.message });
    }
};

const createStudent = async (req, res) => {
    try {
        const student = {
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            major: req.body.major,
            graduationYear: req.body.graduationYear,
            GPA: req.body.GPA,
            attendanceMode: req.body.attendanceMode,
            courses: req.body.courses
        };

        const response = await mongodb.getDatabase().db().collection('students').insertOne(student);

        if (response.acknowledged) {
            res.status(201).json({ message: 'Student created successfully', studentId: response.insertedId });
        } else {
            throw new Error('Student creation failed');
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the student', details: error.message });
    }
};

const updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Check for invalid ObjectId format
        if (!ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: 'Invalid Student ID format' });
        }

        const student = {
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            major: req.body.major,
            graduationYear: req.body.graduationYear,
            GPA: req.body.GPA,
            attendanceMode: req.body.attendanceMode,
            courses: req.body.courses
        };

        const response = await mongodb.getDatabase().db().collection('students').replaceOne({ _id: new ObjectId(studentId) }, student);

        if (response.modifiedCount > 0) {
            res.status(200).json({ message: 'Student updated successfully' });
        } else {
            res.status(404).json({ error: 'Student not found or no changes made' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the student', details: error.message });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Check for invalid ObjectId format
        if (!ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: 'Invalid Student ID format' });
        }

        const response = await mongodb.getDatabase().db().collection('students').deleteOne({ _id: new ObjectId(studentId) });

        if (response.deletedCount > 0) {
            res.status(200).json({ message: 'Student deleted successfully' });
        } else {
            res.status(404).json({ error: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the student', details: error.message });
    }
};

module.exports = {
    getAll,
    getSingle,
    createStudent,
    updateStudent,
    deleteStudent,
};
