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
  const watchlistId = req.params.id;
  const { movieId, status, remove } = req.body;
  const userId = req.session.user_id;

  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  // Validate ObjectId format for movieId
  if (!ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: 'Invalid movieId format' });
  }

  const movieObjectId = new ObjectId(movieId);

  try {
    const db = mongodb.getDatabase().db();

    // Find the existing watchlist
    const existingWatchlist = await db.collection('watchlists').findOne({ _id: new ObjectId(watchlistId) });

    if (!existingWatchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    if (existingWatchlist.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'You can only update your own watchlist' });
    }

    let updateOperation;

    if (remove) {
      // Remove the movie from the watchlist's array
      updateOperation = {
        $pull: { movies: { movieId: movieObjectId } }
      };
    } else {
      // Add or update the movie object in the watchlist
      updateOperation = {
        $addToSet: {
          movies: {
            movieId: movieObjectId,
            status
          }
        }
      };
    }

    const response = await db.collection('watchlists').updateOne(
      { _id: new ObjectId(watchlistId) },
      updateOperation
    );

    if (response.modifiedCount > 0) {
      res.status(200).json({ message: 'Watchlist updated successfully' });
    } else {
      res.status(200).json({ message: 'No changes made to the watchlist (movie may already exist or was not found)' });
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
