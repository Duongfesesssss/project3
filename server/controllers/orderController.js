const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const mongoose = require('mongoose');
const { addPointsFromOrder } = require('../services/memberService');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const { user_id, items, shipping_address, payment_method, voucher_id, note, shipping_fee, discount_amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Danh sách sản phẩm không được trống'
      });
    }

    // Tính tổng tiền sản phẩm
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Tính phí ship (mặc định 30k nếu không có, miễn phí nếu >= 500k)
    const finalShippingFee = shipping_fee !== undefined ? shipping_fee : (subtotal >= 500000 ? 0 : 30000);
    
    // Tính discount (mặc định 0 nếu không có)
    const finalDiscountAmount = discount_amount || 0;
    
    // Tính tổng cuối cùng
    const total_amount = Math.max(0, subtotal + finalShippingFee - finalDiscountAmount);

    const generateOrderCode = () => {
      return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
    };

    const order = new Order({
      user_id,
      items,
      total_amount,
      shipping_address: shipping_address || '',
      payment_method: payment_method || 'payos',
      voucher: voucher_id || null,
      note: note || '',
      status: 'pending',
      orderCode: generateOrderCode()
    });

    await order.save();

    res.status(201).json({
      status: 'OK',
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi tạo đơn hàng'
    });
  }
};

// Lấy danh sách đơn hàng của user
const getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    const orders = await Order.find({ user_id })
      .populate({
        path: 'items',
        populate: {
          path: 'book_id',
          select: 'title image_link price slug'
        }
      })
      .sort({ created_at: -1 });

    res.json({
      status: 'OK',
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi lấy danh sách đơn hàng'
    });
  }
};

// Lấy chi tiết đơn hàng
const getOrderDetail = async (req, res) => {
  try {
    const { order_id } = req.params;
    const userId = req.user.id; // Từ middleware authenticateToken
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    const order = await Order.findById(order_id)
      .populate({
        path: 'items',
        populate: {
          path: 'book_id',
          select: 'title image_link price author publisher slug'
        }
      });

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Kiểm tra quyền: customer chỉ xem được đơn hàng của mình
    if (userRole === 'customer' && order.user_id.toString() !== userId) {
      return res.status(403).json({
        status: 'ERROR',
        success: false,
        message: 'Bạn không có quyền xem đơn hàng này'
      });
    }

    res.json({
      status: 'OK',
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi lấy chi tiết đơn hàng'
    });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Trạng thái đơn hàng không hợp lệ'
      });
    }

    const order = await Order.findByIdAndUpdate(
      order_id,
      { 
        status,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (status === 'delivered') {
      try {
        await addPointsFromOrder(order);
      } catch (bonusError) {
        console.error('Lỗi khi cộng điểm từ đơn hàng:', bonusError);
      }
    }

    res.json({
      status: 'OK',
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái đơn hàng'
    });
  }
};

// Lấy dữ liệu cho datatable
const getOrderDatatable = async (req, res) => {
  try {
    const { page = 0, rows = 10, first = 0, sort = '-createdAt', keyword = '', status } = req.body;
    
    // Tạo query tìm kiếm
    const query = {};
    
    // Filter theo status nếu có
    if (status) {
      query.status = status;
    }
    
    // Tìm kiếm theo keyword - cần tìm user trước
    let userIds = [];
    if (keyword && isNaN(keyword)) {
      // Tìm user có email chứa keyword
      const User = require('../models/userModel');
      const users = await User.find({ 
        email: { $regex: keyword, $options: 'i' } 
      }).select('_id');
      userIds = users.map(user => user._id);
    }

    // Tìm kiếm theo keyword
    if (keyword) {
      const searchConditions = [
        { 'shipping_address': { $regex: keyword, $options: 'i' } },
        { 'status': { $regex: keyword, $options: 'i' } }
      ];
      
      // Tìm kiếm theo orderCode (convert thành string để dùng regex)
      searchConditions.push({
        $expr: {
          $regexMatch: {
            input: { $toString: "$orderCode" },
            regex: keyword,
            options: "i"
          }
        }
      });
      
      // Thêm tìm kiếm theo user_id nếu có
      if (userIds.length > 0) {
        searchConditions.push({ 'user_id': { $in: userIds } });
      }
      
      query.$or = searchConditions;
    }

    // Lấy tổng số bản ghi
    const totalRecords = await Order.countDocuments(query);

    // Lấy dữ liệu với phân trang
    const orders = await Order.find(query)
      .populate({
        path: 'user_id',
        select: 'email name'
      })
      .populate({
        path: 'items',
        populate: {
          path: 'book_id',
          select: 'title image_link price slug'
        }
      })
      .sort(sort)
      .limit(Number(rows))
      .skip(first);

    res.json({
      status: 'OK',
      data: orders,
      rows: Number(rows),
      first: first,
      page: page,
      totalRecords: totalRecords,
      totalPages: Math.ceil(totalRecords / rows)
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu order datatable:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi lấy dữ liệu order datatable'
    });
  }
};

// Cập nhật đơn hàng
const updateOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    const order = await Order.findByIdAndUpdate(
      order_id,
      { 
        ...updateData,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      status: 'OK',
      success: true,
      message: 'Cập nhật đơn hàng thành công',
      data: order
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật đơn hàng:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi cập nhật đơn hàng'
    });
  }
};

// Xóa đơn hàng
const deleteOrder = async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }

    // Xóa các order items trước
    await OrderItem.deleteMany({ order_id });

    // Sau đó xóa order
    const order = await Order.findByIdAndDelete(order_id);

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      status: 'OK',
      success: true,
      message: 'Xóa đơn hàng thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa đơn hàng:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi xóa đơn hàng'
    });
  }
};

// Cập nhật trạng thái thanh toán đơn hàng thành "paid"
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;

    if (!orderCode) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Thiếu mã đơn hàng'
      });
    }

    const order = await Order.findOneAndUpdate(
      { orderCode: Number(orderCode) },
      { 
        status: 'paid',
        updated_at: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.json({
      status: 'OK',
      success: true,
      message: 'Cập nhật trạng thái thanh toán thành công',
      data: order
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái thanh toán'
    });
  }
};


// Lấy đơn hàng đã thanh toán của user
const getUserPaidOrders = async (req, res) => {
  try {
    const user_id = req.user._id; // Lấy từ user object

    const orders = await Order.find({ 
      user_id,
      status: 'paid'
    })
    .populate({
      path: 'items',
      populate: {
        path: 'book_id',
        select: 'title author image_link price slug'
      }
    })
    .sort({ created_at: -1 });

    res.json({
      status: 'OK',
      success: true,
      message: 'Lấy danh sách đơn hàng đã thanh toán thành công',
      data: orders
    });
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng đã thanh toán:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi lấy đơn hàng đã thanh toán'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetail,
  updateOrderStatus,
  getOrderDatatable,
  updateOrder,
  deleteOrder,
  updatePaymentStatus,
  getUserPaidOrders
}; 