const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
});

const Review = model('Review', reviewSchema);

module.exports = Review;
