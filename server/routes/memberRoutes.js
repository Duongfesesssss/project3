const express = require('express');
const router = express.Router();
const {
  getMyMemberCard,
  getMyPointHistory,
  redeemPoints,
  adjustMemberPoints,
  listMemberCards,
  getMembershipTiers,
  createMembershipTier,
  updateMembershipTier,
  deleteMembershipTier,
  getMemberStats,
  triggerTierCheck
} = require('../controllers/memberController');
const { authenticateToken, staffAndAdmin } = require('../middlewares/roleMiddleware');

// ===== USER ROUTES =====
router.use(authenticateToken);
router.get('/me', getMyMemberCard);
router.get('/me/history', getMyPointHistory);
router.post('/me/redeem', redeemPoints);

// ===== STAFF & ADMIN ROUTES =====
router.use(staffAndAdmin);
router.get('/cards', listMemberCards);
router.post('/adjust', adjustMemberPoints);
router.post('/tiers/check', triggerTierCheck);

router.get('/tiers', getMembershipTiers);
router.post('/tiers', createMembershipTier);
router.put('/tiers/:tier_id', updateMembershipTier);
router.delete('/tiers/:tier_id', deleteMembershipTier);

router.get('/stats/summary', getMemberStats);

module.exports = router;


