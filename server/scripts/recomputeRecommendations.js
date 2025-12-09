/*
Batch script to compute recommendations:
- Popularity with time decay
- Weighted rating (IMDB formula)
- Co-occurrence related books (also bought)
Writes results into the `recommendations` collection for fast serving.
Run: node server/scripts/recomputeRecommendations.js
Env: DATABASE_URL, REC_HALF_LIFE_DAYS (optional), REC_MIN_VOTES (optional)
*/

require('dotenv').config();
const mongoose = require('mongoose');
const { connectToDB } = require('../db');
const { Book } = require('../models/bookModel');
const Order = require('../models/orderModel');
const Review = require('../models/reviewModel');

const HALF_LIFE_DAYS = Number(process.env.REC_HALF_LIFE_DAYS || 30);
const MIN_VOTES = Number(process.env.REC_MIN_VOTES || 10);
const DECAY_LAMBDA = Math.log(2) / HALF_LIFE_DAYS;
const VALID_ORDER_STATUSES = ['paid', 'processing', 'shipped', 'delivered'];

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

const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema);

async function computePopularity() {
  const now = new Date();
  const pipeline = [
    { $match: { status: { $in: VALID_ORDER_STATUSES } } },
    { $unwind: '$items' },
    {
      $addFields: {
        days: { $divide: [{ $subtract: [now, '$createdAt'] }, 1000 * 60 * 60 * 24] },
      },
    },
    {
      $addFields: {
        weight: { $exp: { $multiply: [-DECAY_LAMBDA, '$days'] } },
      },
    },
    {
      $group: {
        _id: '$items.book_id',
        pop_score: { $sum: { $multiply: ['$items.quantity', '$weight'] } },
        raw_sold: { $sum: '$items.quantity' },
      },
    },
  ];
  const results = await Order.aggregate(pipeline).allowDiskUse(true);
  const map = new Map();
  results.forEach((doc) => {
    map.set(String(doc._id), { pop_score: doc.pop_score || 0, raw_sold: doc.raw_sold || 0 });
  });
  return map;
}

async function computeWeightedRatings() {
  // Compute global mean C
  const global = await Review.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: null, C: { $avg: '$rating' } } },
  ]);
  const C = global[0]?.C || 0;

  const perBook = await Review.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$book_id', v: { $sum: 1 }, R: { $avg: '$rating' } } },
  ]);

  const map = new Map();
  perBook.forEach((doc) => {
    const v = doc.v || 0;
    const R = doc.R || 0;
    const m = MIN_VOTES;
    const wr = (v / (v + m)) * R + (m / (v + m)) * C;
    map.set(String(doc._id), wr);
  });
  return map;
}

async function computeCooccurrence() {
  const cursor = Order.find({ status: { $in: VALID_ORDER_STATUSES } }, { items: 1 }).cursor();
  const pairWeights = new Map();

  for await (const order of cursor) {
    const uniqueBooks = Array.from(new Set((order.items || []).map((it) => String(it.book_id)).filter(Boolean)));
    for (let i = 0; i < uniqueBooks.length; i++) {
      for (let j = i + 1; j < uniqueBooks.length; j++) {
        const a = uniqueBooks[i];
        const b = uniqueBooks[j];
        const key = `${a}::${b}`;
        pairWeights.set(key, (pairWeights.get(key) || 0) + 1);
      }
    }
  }

  const relatedMap = new Map();
  for (const [key, weight] of pairWeights.entries()) {
    const [a, b] = key.split('::');
    if (!relatedMap.has(a)) relatedMap.set(a, []);
    if (!relatedMap.has(b)) relatedMap.set(b, []);
    relatedMap.get(a).push({ book_id: b, weight });
    relatedMap.get(b).push({ book_id: a, weight });
  }

  // Sort and keep top 5
  for (const [bookId, arr] of relatedMap.entries()) {
    arr.sort((x, y) => y.weight - x.weight);
    relatedMap.set(bookId, arr.slice(0, 5));
  }

  return relatedMap;
}

async function upsertRecommendations(popMap, wrMap, relatedMap) {
  const bookIds = new Set([...popMap.keys(), ...wrMap.keys(), ...relatedMap.keys()]);
  if (bookIds.size === 0) return;
  const ops = [];
  for (const id of bookIds) {
    const update = {
      pop_score: popMap.get(id)?.pop_score || 0,
      raw_sold: popMap.get(id)?.raw_sold || 0,
      wr_score: wrMap.get(id) || 0,
      related: (relatedMap.get(id) || []).map((r) => ({ book_id: r.book_id, weight: r.weight })),
      updated_at: new Date(),
    };
    ops.push({
      updateOne: {
        filter: { book_id: new mongoose.Types.ObjectId(id) },
        update: { $set: update },
        upsert: true,
      },
    });
  }
  if (ops.length) {
    await Recommendation.bulkWrite(ops, { ordered: false });
  }
}

async function main() {
  await connectToDB();
  console.log('Computing popularity...');
  const popMap = await computePopularity();
  console.log(`Popularity computed for ${popMap.size} books`);

  console.log('Computing weighted ratings...');
  const wrMap = await computeWeightedRatings();
  console.log(`WR computed for ${wrMap.size} books`);

  console.log('Computing co-occurrence...');
  const relatedMap = await computeCooccurrence();
  console.log(`Co-occurrence computed for ${relatedMap.size} books`);

  console.log('Upserting recommendations...');
  await upsertRecommendations(popMap, wrMap, relatedMap);
  console.log('Done');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
