const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', unique: true },
    pop_score: { type: Number, default: 0 },
    raw_sold: { type: Number, default: 0 },
    wr_score: { type: Number, default: 0 },
    related: [
      {
        book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        weight: Number,
      },
    ],
    updated_at: { type: Date, default: Date.now },
  },
  { collection: 'recommendations' }
);

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;