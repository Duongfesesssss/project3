const mongoose = require('mongoose');
const MembershipTier = require('../models/membershipTierModel');
const { MemberCard, MemberPointHistory } = require('../models/memberCardModel');
const { Voucher } = require('../models/voucherModel');
const User = require('../models/userModel');
const {
  getOrCreateMemberCard,
  redeemPointsForUser,
  adjustPointsForUser,
  recalculateTierForUser
} = require('../services/memberService');

const LOYALTY_VOUCHER_VALUE_PER_POINT = parseInt(process.env.LOYALTY_VOUCHER_VALUE_PER_POINT || '1000', 10);
const LOYALTY_VOUCHER_VALID_DAYS = parseInt(process.env.LOYALTY_VOUCHER_VALID_DAYS || '30', 10);
const LOYALTY_REDEEM_OPTIONS = {
  50: { discount: 8, minOrderValue: 100000 },
  100: { discount: 18, minOrderValue: 100000 }
};

const generateVoucherCode = (prefix = 'LOYAL') => {
  const randomSegment = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${randomSegment}`;
};

const createPersonalVoucherFromPoints = async ({ userId, points, note }) => {
  if (!userId || !points || points <= 0) {
    throw new Error('Thiếu thông tin để tạo voucher cá nhân');
  }

  const option = LOYALTY_REDEEM_OPTIONS[points];
  if (!option) {
    throw new Error('Gói đổi điểm không hợp lệ. Chỉ hỗ trợ 50 hoặc 100 điểm.');
  }

  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + LOYALTY_VOUCHER_VALID_DAYS);

  const voucher = new Voucher({
    code: generateVoucherCode(),
    description: note || `Voucher giảm ${option.discount}% (đổi từ ${points} điểm)`,
    discount: option.discount,
    discount_type: 'percentage',
    valid_from: now,
    valid_until: validUntil,
    usage_limit: 1,
    min_order_value: option.minOrderValue,
    visibility: 'private',
    owner_user_id: userId,
    source: 'loyalty',
    auto_generated: true,
    metadata: {
      redeemed_points: points,
      discount_percent: option.discount,
      min_order_value: option.minOrderValue,
      conversion_rate: 'percentage'
    }
  });

  await voucher.save();
  return voucher;
};

// Lấy thông tin thẻ của chính user
const getMyMemberCard = async (req, res) => {
  try {
    const card = await getOrCreateMemberCard(req.user._id);
    res.json({
      status: 'OK',
      success: true,
      data: card
    });
  } catch (error) {
    console.error('Lỗi khi lấy thẻ thành viên:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể lấy thông tin thẻ thành viên'
    });
  }
};

// Lịch sử điểm của user
const getMyPointHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const history = await MemberPointHistory.find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await MemberPointHistory.countDocuments({ user_id: req.user._id });

    res.json({
      status: 'OK',
      success: true,
      data: history,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử điểm:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể lấy lịch sử tích điểm'
    });
  }
};

// User tự dùng điểm đổi ưu đãi
const redeemPoints = async (req, res) => {
  try {
    const { points, reason, reference_id } = req.body;
    if (!points || points <= 0) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Số điểm sử dụng phải lớn hơn 0'
      });
    }

    const option = LOYALTY_REDEEM_OPTIONS[points];
    if (!option) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Gói đổi điểm không hợp lệ. Chỉ hỗ trợ 50 hoặc 100 điểm.'
      });
    }

    const card = await redeemPointsForUser({
      userId: req.user._id,
      points,
      description: reason || 'Sử dụng điểm đổi ưu đãi',
      referenceId: reference_id,
      metadata: {
        redeem_reason: reason || 'voucher',
        converted_to: 'personal_voucher'
      }
    });

    let loyaltyVoucher = null;

    try {
      loyaltyVoucher = await createPersonalVoucherFromPoints({
        userId: req.user._id,
        points,
        note: reason
      });
    } catch (error) {
      console.error('Không thể tạo voucher cá nhân sau khi đổi điểm:', error);
      await adjustPointsForUser({
        userId: req.user._id,
        deltaPoints: points,
        source: 'adjust',
        description: 'Hoàn điểm do lỗi tạo voucher',
        referenceId: reference_id || `voucher_rollback_${Date.now()}`,
        affectLifetime: false
      });
      return res.status(500).json({
        status: 'ERROR',
        success: false,
        message: 'Không thể tạo voucher, điểm đã được hoàn lại. Vui lòng thử lại sau.'
      });
    }

    const estimatedValue = Math.floor(option.minOrderValue * option.discount / 100);

    res.json({
      status: 'OK',
      success: true,
      message: 'Đổi điểm thành công, voucher cá nhân đã được tạo',
      data: {
        card,
        voucher: loyaltyVoucher,
        points_spent: points,
        estimated_value: estimatedValue
      }
    });
  } catch (error) {
    console.error('Lỗi khi sử dụng điểm:', error);
    res.status(400).json({
      status: 'ERROR',
      success: false,
      message: error.message || 'Không thể sử dụng điểm'
    });
  }
};

// Admin/staff điều chỉnh điểm
const adjustMemberPoints = async (req, res) => {
  try {
    const { user_id, delta_points, reason, reference_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    if (!delta_points || delta_points === 0) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Giá trị điều chỉnh phải khác 0'
      });
    }

    const card = await adjustPointsForUser({
      userId: user_id,
      deltaPoints: delta_points,
      description: reason || 'Điều chỉnh điểm thủ công',
      referenceId: reference_id,
      source: 'manual'
    });

    res.json({
      status: 'OK',
      success: true,
      message: 'Điều chỉnh điểm thành công',
      data: card
    });
  } catch (error) {
    console.error('Lỗi điều chỉnh điểm:', error);
    res.status(400).json({
      status: 'ERROR',
      success: false,
      message: error.message || 'Không thể điều chỉnh điểm'
    });
  }
};

// Danh sách thẻ cho CMS
const listMemberCards = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = '' } = req.query;
    const query = {};

    if (keyword) {
      const users = await User.find({
        $or: [
          { full_name: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
          { phone: { $regex: keyword, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map((user) => user._id);
      if (userIds.length > 0) {
        query.user_id = { $in: userIds };
      } else {
        return res.json({
          status: 'OK',
          success: true,
          data: [],
          pagination: {
            total: 0,
            page: Number(page),
            limit: Number(limit)
          }
        });
      }
    }

    const data = await MemberCard.find(query)
      .populate('user_id', 'full_name email phone')
      .populate('tier_id', 'name discount_rate')
      .sort({ updated_at: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await MemberCard.countDocuments(query);

    res.json({
      status: 'OK',
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thẻ:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể lấy danh sách thẻ thành viên'
    });
  }
};

// Quản lý hạng thẻ
const getMembershipTiers = async (req, res) => {
  try {
    const tiers = await MembershipTier.find().sort({ priority: 1, min_points: 1 });
    res.json({
      status: 'OK',
      success: true,
      data: tiers
    });
  } catch (error) {
    console.error('Lỗi khi lấy hạng thẻ:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể lấy danh sách hạng thẻ'
    });
  }
};

const createMembershipTier = async (req, res) => {
  try {
    const tier = new MembershipTier(req.body);
    await tier.save();
    res.status(201).json({
      status: 'OK',
      success: true,
      message: 'Tạo hạng thẻ thành công',
      data: tier
    });
  } catch (error) {
    console.error('Lỗi khi tạo hạng thẻ:', error);
    res.status(400).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể tạo hạng thẻ'
    });
  }
};

const updateMembershipTier = async (req, res) => {
  try {
    const { tier_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tier_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID hạng thẻ không hợp lệ'
      });
    }

    const tier = await MembershipTier.findByIdAndUpdate(
      tier_id,
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true }
    );

    if (!tier) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy hạng thẻ'
      });
    }

    res.json({
      status: 'OK',
      success: true,
      message: 'Cập nhật hạng thẻ thành công',
      data: tier
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật hạng thẻ:', error);
    res.status(400).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể cập nhật hạng thẻ'
    });
  }
};

const deleteMembershipTier = async (req, res) => {
  try {
    const { tier_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tier_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID hạng thẻ không hợp lệ'
      });
    }

    const inUse = await MemberCard.findOne({ tier_id });
    if (inUse) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Không thể xóa hạng thẻ đang được sử dụng'
      });
    }

    await MembershipTier.findByIdAndDelete(tier_id);
    res.json({
      status: 'OK',
      success: true,
      message: 'Đã xóa hạng thẻ'
    });
  } catch (error) {
    console.error('Lỗi khi xóa hạng thẻ:', error);
    res.status(400).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể xóa hạng thẻ'
    });
  }
};

// Thống kê phục vụ dashboard
const getMemberStats = async (req, res) => {
  try {
    const byTier = await MemberCard.aggregate([
      {
        $group: {
          _id: '$tier_id',
          totalMembers: { $sum: 1 },
          totalPoints: { $sum: '$points_balance' },
          lifetimeSpend: { $sum: '$lifetime_spend' }
        }
      }
    ]);

    const totalCards = await MemberCard.countDocuments();

    res.json({
      status: 'OK',
      success: true,
      data: {
        totalCards,
        byTier
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê thẻ:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể lấy thống kê thẻ thành viên'
    });
  }
};

const triggerTierCheck = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    const updatedCard = await recalculateTierForUser(user_id);
    if (!updatedCard) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Người dùng chưa có thẻ thành viên'
      });
    }

    res.json({
      status: 'OK',
      success: true,
      message: 'Đã kiểm tra và cập nhật hạng thẻ',
      data: updatedCard
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra hạng thẻ:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể cập nhật hạng thẻ'
    });
  }
};

module.exports = {
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
};

