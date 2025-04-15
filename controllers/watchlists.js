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
  const watchlistId = req.params.id;

  if (!ObjectId.isValid(watchlistId)) {
    return res.status(400).json({ error: 'Invalid Watchlist ID format' });
  }

  try {
    const result = await mongodb.getDatabase().db().collection('watchlists').findOne({ _id: new ObjectId(watchlistId) });

    if (!result) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving the watchlist', details: error.message });
  }
};


const createWatchlist = async (req, res) => {
  const { name, movies } = req.body;
  const userId = req.session.user_id;

  if (!Array.isArray(movies) || movies.length === 0) {
    return res.status(400).json({ error: 'Movies array is required and cannot be empty' });
  }

  try {
    // Convert each movie object to expected structure and validate
    const formattedMovies = movies.map(movie => {
      if (!ObjectId.isValid(movie.movieId)) {
        throw new Error(`Invalid movieId format: ${movie.movieId}`);
      }

      return {
        movieId: new ObjectId(movie.movieId),
        status: movie.status
      };
    });

    const watchlist = {
      name,
      user_id: new ObjectId(userId),
      movies: formattedMovies,
      // createdAt: new Date()
    };

    const response = await mongodb.getDatabase().db().collection('watchlists').insertOne(watchlist);

    if (response.acknowledged) {
      res.status(201).json({ message: 'Watchlist created successfully', watchlistId: response.insertedId });
    } else {
      throw new Error('Watchlist creation failed');
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the watchlist', details: error.message });
  }
};


// Update an existing watchlist
const updateWatchlist = async (req, res) => {
  const { name, movies } = req.body;

  if (!Array.isArray(movies) || movies.length === 0) {
    return res.status(400).json({ error: 'Movies array is required and cannot be empty' });
  }

  try {
    const formattedMovies = movies.map(movie => {
      if (!ObjectId.isValid(movie.movieId)) {
        throw new Error(`Invalid movieId format: ${movie.movieId}`);
      }
      return {
        movieId: new ObjectId(movie.movieId),
        status: movie.status
      };
    });

    const watchlistId = new ObjectId(req.params.id);

    const updateDoc = {
      $set: {
        name,
        movies: formattedMovies
      }
    };

    const response = await mongodb.getDatabase().db().collection('watchlists').updateOne({ _id: watchlistId }, updateDoc);

    if (response.modifiedCount > 0) {
      res.status(200).json({ message: 'Watchlist updated successfully' });
    } else {
      res.status(404).json({ message: 'Watchlist not found or no changes made' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the watchlist', details: error.message });
  }
};



// Delete a watchlist
const deleteWatchlist = async (req, res) => {
  const watchlistId = req.params.id;

  if (!ObjectId.isValid(watchlistId)) {
    return res.status(400).json({ error: 'Invalid Watchlist ID format' });
  }

  try {
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
