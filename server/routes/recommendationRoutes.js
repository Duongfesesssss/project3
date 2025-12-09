const express = require('express');
const mongoose = require('mongoose');
const Recommendation = require('../models/recommendationModel');
const { Book } = require('../models/bookModel');

const router = express.Router();

// Helpers
const parseLimit = (value, fallback = 12, max = 50) => {
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return fallback;
  return Math.min(num, max);
};

// Popular books (popularity score)
router.get('/popular', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const data = await Recommendation.aggregate([
      { $sort: { pop_score: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'books',
          localField: 'book_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $project: {
          _id: 0,
          book: 1,
          pop_score: 1,
          raw_sold: 1,
          wr_score: 1,
        },
      },
    ]);
    res.json({ status: 'OK', data });
  } catch (error) {
    console.error('Error fetching popular recommendations:', error);
    res.status(500).json({ status: 'ERROR', message: 'Không lấy được gợi ý' });
  }
});

// Highly rated books (weighted rating)
router.get('/rated', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const data = await Recommendation.aggregate([
      { $sort: { wr_score: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'books',
          localField: 'book_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $project: {
          _id: 0,
          book: 1,
          pop_score: 1,
          raw_sold: 1,
          wr_score: 1,
        },
      },
    ]);
    res.json({ status: 'OK', data });
  } catch (error) {
    console.error('Error fetching rated recommendations:', error);
    res.status(500).json({ status: 'ERROR', message: 'Không lấy được gợi ý' });
  }
});

// Related books for a given book
router.get('/related/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const limit = parseLimit(req.query.limit, 5, 10);
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ status: 'ERROR', message: 'BookId không hợp lệ' });
    }

    const rec = await Recommendation.findOne({ book_id: bookId })
      .select({ related: 1, pop_score: 1, raw_sold: 1, wr_score: 1 })
      .lean();

    if (!rec) {
      return res.json({ status: 'OK', data: { related: [], pop_score: 0, wr_score: 0 } });
    }

    const relatedIds = (rec.related || [])
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
      .slice(0, limit)
      .map((r) => r.book_id);

    const books = await Book.find({ _id: { $in: relatedIds } }).lean();
    const bookMap = new Map(books.map((b) => [String(b._id), b]));

    const related = relatedIds
      .map((id) => ({
        book: bookMap.get(String(id)) || null,
        weight: (rec.related || []).find((r) => String(r.book_id) === String(id))?.weight || 0,
      }))
      .filter((x) => x.book);

    res.json({
      status: 'OK',
      data: {
        related,
        pop_score: rec.pop_score || 0,
        raw_sold: rec.raw_sold || 0,
        wr_score: rec.wr_score || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching related recommendations:', error);
    res.status(500).json({ status: 'ERROR', message: 'Không lấy được gợi ý' });
  }
});

module.exports = router;