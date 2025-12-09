const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const mongoose = require('mongoose');
const { addPointsFromReview } = require('../services/memberService');

const buildDisplayName = (user) => {
  if (!user) return 'Người dùng';
  if (user.full_name) return user.full_name;
  if (user.user_name) return user.user_name;
  if (user.email) return user.email.split('@')[0];
  return 'Người dùng';
};

const serializeReview = (review) => {
  if (!review) return review;
  const obj = review.toObject ? review.toObject() : review;
  const user = obj.user_id || obj.user || null;
  return {
    ...obj,
    user_id: user ? {
      _id: user._id,
      user_name: user.user_name,
      full_name: user.full_name,
      email: user.email,
      avatar: user.avatar,
      display_name: buildDisplayName(user)
    } : null
  };
};

// Tạo review mới
const createReview = async (req, res) => {
  try {
    const { book_id, rating, comment, order_id } = req.body;
    const user_id = req.user.id; // Từ middleware auth

    // Validate input
    if (!book_id || !rating || !comment || !order_id) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Đánh giá phải từ 1 đến 5 sao'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(book_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID sách không hợp lệ'
      });
    }

    // Kiểm tra user đã mua sách này chưa
    const order = await Order.findOne({
      _id: order_id,
      user_id: user_id,
      status: { $nin: ['cancelled'] }, // Cho phép review mọi đơn không bị hủy
      'items.book_id': new mongoose.Types.ObjectId(book_id)
    });

    if (!order) {
      return res.status(403).json({
        status: 'ERROR',
        success: false,
        message: 'Bạn cần mua sách này để có thể đánh giá'
      });
    }

    // Kiểm tra user đã review sách này chưa
    const existingReview = await Review.findOne({
      user_id: user_id,
      book_id: book_id
    }).populate('user_id', 'user_name full_name email avatar');

    if (existingReview) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Bạn đã đánh giá sách này rồi'
      });
    }

    // Tạo review mới
    const review = new Review({
      user_id,
      book_id,
      order_id,
      rating,
      comment: comment.trim()
    });

    await review.save();

    // Populate user info để trả về
    await review.populate('user_id', 'user_name full_name email avatar');

    try {
      await addPointsFromReview({ userId: user_id, reviewId: review._id });
    } catch (bonusError) {
      console.error('Không thể cộng điểm thưởng review:', bonusError);
    }

    res.status(201).json({
      status: 'OK',
      success: true,
      message: 'Đánh giá đã được tạo thành công',
      data: serializeReview(review)
    });

  } catch (error) {
    console.error('Lỗi khi tạo review:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Có lỗi xảy ra khi tạo đánh giá'
    });
  }
};

// Lấy reviews của một sách
const getBookReviews = async (req, res) => {
  try {
    const { book_id } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(book_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID sách không hợp lệ'
      });
    }

    // Xác định cách sắp xếp
    let sortOption = { created_at: -1 }; // Mới nhất
    if (sort === 'oldest') sortOption = { created_at: 1 };
    if (sort === 'highest') sortOption = { rating: -1, created_at: -1 };
    if (sort === 'lowest') sortOption = { rating: 1, created_at: -1 };
    if (sort === 'helpful') sortOption = { helpful_count: -1, created_at: -1 };

    const reviews = await Review.find({
      book_id: book_id,
      status: 'approved'
    })
    .populate('user_id', 'user_name full_name email avatar')
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Review.countDocuments({
      book_id: book_id,
      status: 'approved'
    });

    // Tính thống kê rating
    const ratingStats = await Review.aggregate([
      { $match: { book_id: new mongoose.Types.ObjectId(book_id), status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Tính phân bố rating
    let distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratingDistribution.forEach(rating => {
        distribution[rating]++;
      });
    }

    res.json({
      status: 'OK',
      success: true,
      data: {
        reviews: reviews.map(serializeReview),
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_reviews: total,
          limit: parseInt(limit)
        },
        statistics: {
          average_rating: ratingStats.length > 0 ? ratingStats[0].averageRating : 0,
          total_reviews: ratingStats.length > 0 ? ratingStats[0].totalReviews : 0,
          rating_distribution: distribution
        }
      }
    });

  } catch (error) {
    console.error('Lỗi khi lấy reviews:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách đánh giá'
    });
  }
};

// Cập nhật review
const updateReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(review_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID đánh giá không hợp lệ'
      });
    }

    const review = await Review.findOne({
      _id: review_id,
      user_id: user_id
    });

    if (!review) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa'
      });
    }

    // Update fields
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          status: 'ERROR',
          success: false,
          message: 'Đánh giá phải từ 1 đến 5 sao'
        });
      }
      review.rating = rating;
    }

    if (comment) {
      review.comment = comment.trim();
    }

    await review.save();
    await review.populate('user_id', 'user_name full_name email avatar');

    res.json({
      status: 'OK',
      success: true,
      message: 'Đánh giá đã được cập nhật',
      data: serializeReview(review)
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật review:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật đánh giá'
    });
  }
};

// Xóa review
const deleteReview = async (req, res) => {
  try {
    const { review_id } = req.params;
    const user_id = req.user.id;

    const review = await Review.findOneAndDelete({
      _id: review_id,
      user_id: user_id
    });

    if (!review) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa'
      });
    }

    res.json({
      status: 'OK',
      success: true,
      message: 'Đánh giá đã được xóa'
    });

  } catch (error) {
    console.error('Lỗi khi xóa review:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Có lỗi xảy ra khi xóa đánh giá'
    });
  }
};

// Kiểm tra user có thể review sách không
const canUserReview = async (req, res) => {
  try {
    const { book_id } = req.params;
    const user_id = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(book_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID sách không hợp lệ'
      });
    }

    // Kiểm tra đã mua sách
    const order = await Order.findOne({
      user_id: user_id,
      status: { $nin: ['cancelled'] },
      'items.book_id': new mongoose.Types.ObjectId(book_id)
    });

    if (!order) {
      return res.json({
        status: 'OK',
        success: true,
        data: {
          can_review: false,
          reason: 'not_purchased'
        }
      });
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({
      user_id: user_id,
      book_id: book_id
    });

    if (existingReview) {
      return res.json({
        status: 'OK',
        success: true,
        data: {
          can_review: false,
          reason: 'already_reviewed',
          existing_review: serializeReview(existingReview)
        }
      });
    }

    res.json({
      status: 'OK',
      success: true,
      data: {
        can_review: true,
        order_id: order._id
      }
    });

  } catch (error) {
    console.error('Lỗi khi kiểm tra quyền review:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Có lỗi xảy ra'
    });
  }
};

module.exports = {
  createReview,
  getBookReviews,
  updateReview,
  deleteReview,
  canUserReview
};