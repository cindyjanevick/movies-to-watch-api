const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

// Get all watchlists
const getAll = async (req, res) => {
  try {
    const result = await mongodb.getDatabase().db().collection('watchlists').find();
    const watchlists = await result.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(watchlists);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving watchlists', details: error.message });
  }
};

// Get single watchlist by ID
const getSingle = async (req, res) => {
  try {
    const watchlistId = req.params.id;

    if (!ObjectId.isValid(watchlistId)) {
      return res.status(400).json({ error: 'Invalid Watchlist ID format' });
    }

    const result = await mongodb.getDatabase().db().collection('watchlists').find({ _id: new ObjectId(watchlistId) }).toArray();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving the watchlist', details: error.message });
  }
};

// Create a new watchlist
const createWatchlist = async (req, res) => {
  try {
    const watchlist = {
      user_id: new ObjectId(req.body.user_id),
      name: req.body.name,
      movies: req.body.movies.map((movie) => ({
        movie_id: new ObjectId(movie.movie_id),
        status: movie.status
      }))
    };

    const response = await mongodb.getDatabase().db().collection('watchlists').insertOne(watchlist);

    if (response.acknowledged) {
      res.status(201).json({ message: 'Watchlist created successfully', watchlistId: response.insertedId });
    } else {
      throw new Error('Watchlist creation failed');
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the Watchlist', details: error.message });
  }
};

// Update an existing watchlist
const updateWatchlist = async (req, res) => {
  try {
    const watchlistId = req.params.id;

    if (!ObjectId.isValid(watchlistId)) {
      return res.status(400).json({ error: 'Invalid Watchlist ID format' });
    }

    const watchlist = {
      user_id: new ObjectId(req.body.user_id),
      name: req.body.name,
      movies: req.body.movies.map((movie) => ({
        movie_id: new ObjectId(movie.movie_id),
        status: movie.status
      }))
    };

    const response = await mongodb.getDatabase().db().collection('watchlists').replaceOne(
      { _id: new ObjectId(watchlistId) },
      watchlist
    );

    if (response.modifiedCount > 0) {
      res.status(200).json({ message: 'Watchlist updated successfully' });
    } else {
      res.status(404).json({ error: 'Watchlist not found or no changes made' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the Watchlist', details: error.message });
  }
};

// Delete a watchlist
const deleteWatchlist = async (req, res) => {
  try {
    const watchlistId = req.params.id;

    if (!ObjectId.isValid(watchlistId)) {
      return res.status(400).json({ error: 'Invalid Watchlist ID format' });
    }

    const response = await mongodb.getDatabase().db().collection('watchlists').deleteOne({ _id: new ObjectId(watchlistId) });

    if (response.deletedCount > 0) {
      res.status(200).json({ message: 'Watchlist deleted successfully' });
    } else {
      res.status(404).json({ error: 'Watchlist not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the Watchlist', details: error.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist
};
