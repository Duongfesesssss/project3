const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const mongoose = require('mongoose');

// Tạo đơn hàng mới
const createOrder = async (req, res) => {
  try {
    const { user_id, items, shipping_address, payment_method, voucher_id, note } = req.body;

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

    // Tính tổng tiền
    const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
          select: 'title image_link price'
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
          select: 'title image_link price author publisher'
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

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
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
    const { page = 1, limit = 10, sort = '-created_at', search = '' } = req.query;
    
    // Tạo query tìm kiếm
    const query = {};
    if (search) {
      query.$or = [
        { 'user_id': { $regex: search, $options: 'i' } },
        { 'shipping_address': { $regex: search, $options: 'i' } },
        { 'status': { $regex: search, $options: 'i' } }
      ];
    }

    // Lấy tổng số bản ghi
    const totalRecords = await Order.countDocuments(query);

    // Lấy dữ liệu với phân trang
    const orders = await Order.find(query)
      .populate({
        path: 'items',
        populate: {
          path: 'book_id',
          select: 'title image_link price'
        }
      })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      status: 'OK',
      success: true,
      data: orders,
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit)
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

// Lấy đơn hàng đã thanh toán của user
const getUserPaidOrders = async (req, res) => {
  try {
    const user_id = req.user._id; // Lấy từ user object

    const orders = await Order.find({ 
      user_id,
      payment_status: 'paid'
    })
    .populate({
      path: 'items',
      populate: {
        path: 'book_id',
        select: 'title author image_link price'
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
  getUserPaidOrders
}; 