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


// Create a new watchlist
const createWatchlist = async (req, res) => {
  const { movieId } = req.body;
  const userId = req.session.user_id; // Assuming the user_id is in session

  // Validate input
  if (!movieId || !ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: 'Invalid movieId format' });
  }

  const watchlist = {
    user_id: new ObjectId(userId), // Use session user_id
    movies: [new ObjectId(movieId)], // Initialize with the provided movieId
    createdAt: new Date()
  };

  try {
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
  const { movieId, remove } = req.body; // movieId and remove are optional fields

  if (!ObjectId.isValid(watchlistId)) {
    return res.status(400).json({ error: 'Invalid Watchlist ID format' });
  }

  const userId = req.session.user_id; // Assuming the user_id is in session

  try {
    // Fetch the existing watchlist from the database
    const existingWatchlist = await mongodb.getDatabase().db().collection('watchlists').findOne({ _id: new ObjectId(watchlistId) });

    if (!existingWatchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    if (existingWatchlist.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'You can only update your own watchlist' });
    }

    let updateOperation;

    if (remove) {
      // If 'remove' is true, we remove the movieId from the watchlist
      updateOperation = {
        $pull: { movies: new ObjectId(movieId) }
      };
    } else {
      // If 'remove' is not set, we add the movieId to the watchlist
      updateOperation = {
        $addToSet: { movies: new ObjectId(movieId) } // Ensure no duplicates
      };
    }

    const response = await mongodb.getDatabase().db().collection('watchlists').updateOne(
      { _id: new ObjectId(watchlistId) },
      updateOperation
    );

    if (response.modifiedCount > 0) {
      res.status(200).json({ message: 'Watchlist updated successfully' });
    } else {
      res.status(404).json({ error: 'Watchlist not found or no changes made' });
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
