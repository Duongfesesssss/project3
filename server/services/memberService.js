const mongoose = require('mongoose');
const MembershipTier = require('../models/membershipTierModel');
const { MemberCard, MemberPointHistory } = require('../models/memberCardModel');

const POINTS_PER_CURRENCY_UNIT = 1000; // 1 điểm cho mỗi 1,000đ
const REVIEW_BONUS_POINTS = 20;

const ensureDefaultTier = async () => {
  const existing = await MembershipTier.findOne().sort({ priority: 1 });
  if (existing) {
    return existing;
  }

  const tier = new MembershipTier({
    name: 'Thành viên',
    description: 'Hạng mặc định cho khách hàng mới',
    min_points: 0,
    priority: 1,
    benefits: ['Ưu đãi độc quyền', 'Tích điểm đổi quà']
  });
  return tier.save();
};

const getDefaultTier = async () => {
  const tier = await MembershipTier.findOne().sort({ priority: 1, min_points: 1 });
  if (tier) {
    return tier;
  }
  return ensureDefaultTier();
};

const recalculateTierForCard = async (card) => {
  const tiers = await MembershipTier.find({ is_active: true }).sort({ min_points: 1, priority: 1 });
  if (!tiers || tiers.length === 0) {
    await ensureDefaultTier();
    return card;
  }

  let matchedTier = tiers[0];
  tiers.forEach((tier) => {
    const threshold = tier.min_points || 0;
    if (card.lifetime_points >= threshold) {
      matchedTier = tier;
    }
  });

  const hasNewTier = card.tier_id ? card.tier_id.toString() !== matchedTier._id.toString() : true;
  if (hasNewTier) {
    card.tier_id = matchedTier._id;
    card.last_tier_change = new Date();
  }

  await card.save();
  return card.populate('tier_id');
};

const getOrCreateMemberCard = async (userId) => {
  let card = await MemberCard.findOne({ user_id: userId }).populate('tier_id');
  if (card) {
    return card;
  }

  const defaultTier = await getDefaultTier();
  card = new MemberCard({
    user_id: userId,
    tier_id: defaultTier._id
  });
  await card.save();
  return card.populate('tier_id');
};

const logPointHistory = async ({
  cardId,
  userId,
  source,
  type,
  points,
  description,
  referenceId,
  metadata = {}
}) => {
  const history = new MemberPointHistory({
    card_id: cardId,
    user_id: userId,
    source,
    type,
    points,
    description,
    reference_id: referenceId,
    metadata
  });
  await history.save();
  return history;
};

const earnPoints = async ({ userId, points, source, description, referenceId, metadata }) => {
  if (points <= 0) {
    return null;
  }
  const card = await getOrCreateMemberCard(userId);
  card.points_balance += points;
  card.lifetime_points += points;
  await card.save();

  await logPointHistory({
    cardId: card._id,
    userId,
    source,
    type: 'earn',
    points,
    description,
    referenceId,
    metadata
  });

  await recalculateTierForCard(card);
  return card;
};

const redeemPointsForUser = async ({ userId, points, source = 'redeem', description, referenceId }) => {
  if (points <= 0) {
    throw new Error('Số điểm sử dụng phải lớn hơn 0');
  }

  const card = await getOrCreateMemberCard(userId);
  if (card.points_balance < points) {
    throw new Error('Điểm tích lũy không đủ để thực hiện giao dịch này');
  }

  card.points_balance -= points;
  await card.save();

  await logPointHistory({
    cardId: card._id,
    userId,
    source,
    type: 'spend',
    points: -points,
    description,
    referenceId
  });

  return card.populate('tier_id');
};

const adjustPointsForUser = async ({ userId, deltaPoints, source = 'adjust', description, referenceId }) => {
  if (!deltaPoints || deltaPoints === 0) {
    throw new Error('Giá trị điều chỉnh phải khác 0');
  }

  const card = await getOrCreateMemberCard(userId);
  const nextBalance = card.points_balance + deltaPoints;
  if (nextBalance < 0) {
    throw new Error('Điểm sau điều chỉnh không được âm');
  }

  card.points_balance = nextBalance;
  if (deltaPoints > 0) {
    card.lifetime_points += deltaPoints;
  }
  await card.save();

  await logPointHistory({
    cardId: card._id,
    userId,
    source,
    type: deltaPoints > 0 ? 'earn' : 'adjust',
    points: deltaPoints,
    description,
    referenceId
  });

  await recalculateTierForCard(card);
  return card.populate('tier_id');
};

const addPointsFromOrder = async (order) => {
  if (!order || !order.user_id || !order.total_amount) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(order._id)) {
    return null;
  }

  const duplicated = await MemberPointHistory.findOne({
    source: 'order',
    reference_id: order._id
  });
  if (duplicated) {
    return null;
  }

  const points = Math.floor(order.total_amount / POINTS_PER_CURRENCY_UNIT);
  if (points <= 0) {
    return null;
  }

  const card = await getOrCreateMemberCard(order.user_id);
  card.points_balance += points;
  card.lifetime_points += points;
  card.lifetime_spend += order.total_amount;
  await card.save();

  await logPointHistory({
    cardId: card._id,
    userId: order.user_id,
    source: 'order',
    type: 'earn',
    points,
    description: `Tích điểm từ đơn hàng ${order.orderCode || order._id}`,
    referenceId: order._id,
    metadata: {
      orderCode: order.orderCode,
      total_amount: order.total_amount
    }
  });

  await recalculateTierForCard(card);
  return card;
};

const addPointsFromReview = async ({ userId, reviewId }) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(reviewId)) {
    return null;
  }

  const duplicated = await MemberPointHistory.findOne({
    source: 'review',
    reference_id: reviewId
  });
  if (duplicated) {
    return null;
  }

  return earnPoints({
    userId,
    points: REVIEW_BONUS_POINTS,
    source: 'review',
    description: 'Thưởng điểm khi viết đánh giá',
    referenceId: reviewId
  });
};

const recalculateTierForUser = async (userId) => {
  const card = await MemberCard.findOne({ user_id: userId });
  if (!card) {
    return null;
  }
  return recalculateTierForCard(card);
};

module.exports = {
  getOrCreateMemberCard,
  earnPoints,
  redeemPointsForUser,
  adjustPointsForUser,
  addPointsFromOrder,
  addPointsFromReview,
  recalculateTierForUser
};



