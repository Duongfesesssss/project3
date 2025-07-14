const { Book } = require('../models/bookModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const StockTransaction = require('../models/stockTransactionModel');

// Dashboard dành cho Staff - Chỉ thông tin cơ bản
const getStaffDashboard = async (req, res) => {
  try {
    // Thống kê cơ bản mà staff được xem
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    // Đơn hàng theo trạng thái
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$order_status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top 5 sách bán chạy
    const topSellingBooks = await Book.find()
      .sort({ sales_count: -1 })
      .limit(5)
      .select('title sales_count stock_quantity');

    // Đơn hàng gần đây (10 đơn)
    const recentOrders = await Order.find()
      .sort({ created_at: -1 })
      .limit(10)
      .populate('user_id', 'user_name email')
      .select('order_id total_amount order_status created_at');

    res.status(200).json({
      status: 'OK',
      success: true,
      message: 'Lấy thông tin dashboard thành công',
      data: {
        stats: {
          total_books: totalBooks,
          total_orders: totalOrders,
          total_customers: totalCustomers
        },
        orders_by_status: ordersByStatus,
        top_selling_books: topSellingBooks,
        recent_orders: recentOrders
      }
    });

  } catch (error) {
    console.error('Lỗi lấy dashboard staff:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi lấy thông tin dashboard'
    });
  }
};

// Dashboard dành cho Admin - Thông tin đầy đủ
const getAdminDashboard = async (req, res) => {
  try {
    // Thống kê tổng quan
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalStaff = await User.countDocuments({ role: 'staff' });

    // Doanh thu
    const revenueStats = await Order.aggregate([
      { $match: { order_status: 'completed' } },
      {
        $group: {
          _id: null,
          total_revenue: { $sum: '$total_amount' },
          average_order_value: { $avg: '$total_amount' }
        }
      }
    ]);

    // Thống kê kho hàng
    const stockStats = await Book.aggregate([
      {
        $group: {
          _id: null,
          total_stock: { $sum: '$stock_quantity' },
          out_of_stock: {
            $sum: { $cond: [{ $eq: ['$stock_quantity', 0] }, 1, 0] }
          },
          low_stock: {
            $sum: { $cond: [{ $and: [{ $gt: ['$stock_quantity', 0] }, { $lt: ['$stock_quantity', 10] }] }, 1, 0] }
          }
        }
      }
    ]);

    // Đơn hàng theo trạng thái
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$order_status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Doanh thu 7 ngày gần đây
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const revenueByDay = await Order.aggregate([
      { 
        $match: { 
          order_status: 'completed',
          created_at: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' }
          },
          revenue: { $sum: '$total_amount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Giao dịch kho gần đây (10 giao dịch)
    const recentStockTransactions = await StockTransaction.find()
      .populate('book_id', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Top 10 sách bán chạy
    const topSellingBooks = await Book.find()
      .sort({ sales_count: -1 })
      .limit(10)
      .select('title sales_count stock_quantity');

    // Đơn hàng gần đây
    const recentOrders = await Order.find()
      .sort({ created_at: -1 })
      .limit(10)
      .populate('user_id', 'user_name email')
      .select('order_id total_amount order_status created_at');

    res.status(200).json({
      status: 'OK',
      success: true,
      message: 'Lấy thông tin dashboard admin thành công',
      data: {
        stats: {
          total_books: totalBooks,
          total_orders: totalOrders,
          total_customers: totalCustomers,
          total_staff: totalStaff,
          total_revenue: revenueStats[0]?.total_revenue || 0,
          average_order_value: revenueStats[0]?.average_order_value || 0,
          total_stock: stockStats[0]?.total_stock || 0,
          out_of_stock_books: stockStats[0]?.out_of_stock || 0,
          low_stock_books: stockStats[0]?.low_stock || 0
        },
        orders_by_status: ordersByStatus,
        revenue_by_day: revenueByDay,
        recent_stock_transactions: recentStockTransactions,
        top_selling_books: topSellingBooks,
        recent_orders: recentOrders
      }
    });

  } catch (error) {
    console.error('Lỗi lấy dashboard admin:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi lấy thông tin dashboard'
    });
  }
};

module.exports = {
  getStaffDashboard,
  getAdminDashboard
};
