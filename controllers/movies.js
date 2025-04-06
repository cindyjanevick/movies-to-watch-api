const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    try {
        const result = await mongodb.getDatabase().db().collection('movies').find();
        const movies = await result.toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving movies', details: error.message });
    }
};

const getSingle = async (req, res) => {
    try {
        const movieId = req.params.id;

        // Check for invalid ObjectId format
        if (!ObjectId.isValid(movieId)) {
            return res.status(400).json({ error: 'Invalid movie ID format' });
        }

        const result = await mongodb.getDatabase().db().collection('movies').find({ _id: new ObjectId(movieId) }).toArray();

        if (result.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while retrieving the movie', details: error.message });
    }
};

const createMovie = async (req, res) => {
    try {
        const movie = {
            title: req.body.title,
            genre: req.body.genre,
            releaseYear: req.body.releaseYear,
            duration: req.body.duration,
            description: req.body.description,
            status: req.body.status,
            rating: req.body.rating
        };
        const response = await mongodb.getDatabase().db().collection('movies').insertOne(movie);

        if (response.acknowledged) {
            res.status(201).json({ message: 'Movie created successfully', movieId: response.insertedId });
        } else {
            throw new Error('Movie creation failed');
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the movie', details: error.message });
    }
};

const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for invalid ObjectId format
        if (!ObjectId.isValid(id) || id.length !== 24) {
            return res.status(400).json({ error: 'Invalid Movie ID format' });
        }

        const movieId = new ObjectId(id);
        const movie = {
            title: req.body.title,
            genre: req.body.genre,
            releaseYear: req.body.releaseYear,
            duration: req.body.duration,
            description: req.body.description,
            status: req.body.status,
            rating: req.body.rating
        };
        const response = await mongodb.getDatabase().db().collection('movies').replaceOne({ _id: movieId }, movie);

        if (response.modifiedCount > 0) {
            res.status(200).json({ message: 'Movie updated successfully' });
        } else {
            res.status(404).json({ error: 'Movie not found or no changes made' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while updating the movie', details: error.message });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        // Check for invalid ObjectId format
        if (!ObjectId.isValid(id) || id.length !== 24) {
            return res.status(400).json({ error: 'Invalid Movie ID format' });
        }

        const movieId = new ObjectId(id);
        const response = await mongodb.getDatabase().db().collection('movies').deleteOne({ _id: movieId });

        if (response.deletedCount > 0) {
            res.status(200).json({ message: 'Movie deleted successfully' });
        } else {
            res.status(404).json({ error: 'Movie not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting the movie', details: error.message });
    }
};

module.exports = {
    getAll,
    getSingle,
    createMovie,
    updateMovie,
    deleteMovie,
};