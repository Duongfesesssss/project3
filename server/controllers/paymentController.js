const { createPayOSOrder, getPayOSOrderStatus, verifyPayOSWebhook } = require('../services/payosService');
const Order = require('../models/orderModel');

// Auto-cancel đơn hàng sau 5 phút nếu chưa thanh toán
const scheduleOrderCancellation = (orderId, orderCode) => {
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      
      if (order && order.payment_status === 'pending') {
        await Order.findByIdAndUpdate(orderId, {
          status: 'cancelled',
          payment_status: 'cancelled',
          updated_at: new Date()
        });
        
        console.log(`Đã tự động hủy đơn hàng ${orderCode} sau 5 phút`);
      }
    } catch (error) {
      console.error('Lỗi khi tự động hủy đơn hàng:', error);
    }
  }, 5 * 60 * 1000); // 5 phút
};

// Tạo đơn thanh toán PayOS
exports.createPayOSPayment = async (req, res) => {
  try {
    console.log('PayOS Request Body:', req.body); // Debug log
    
    const {
      orderCode,
      amount,
      description,
      returnUrl,
      cancelUrl,
      orderId // <-- ID của đơn hàng trong MongoDB để lưu liên kết nếu cần
    } = req.body;

    // Validate bắt buộc theo PayOS API
    if (!amount || !description || !returnUrl || !cancelUrl) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc (amount, description, returnUrl, cancelUrl)'
      });
    }

    // Sử dụng orderCode từ request hoặc tạo random nếu không có
    const finalOrderCode = orderCode || Math.floor(100000 + Math.random() * 900000);

    // Gọi service tạo đơn hàng với SDK
    const result = await createPayOSOrder({
      amount,
      description,
      orderCode: finalOrderCode,
      returnUrl,
      cancelUrl,
    });

    if (result.success) {
      // Lên lịch auto-cancel đơn hàng sau 5 phút nếu có orderId
      if (orderId) {
        scheduleOrderCancellation(orderId, finalOrderCode);
      }
      
      res.json({
        success: true,
        data: {
          orderCode: finalOrderCode,
          orderId,
          checkoutUrl: result.data.checkoutUrl,
          qrCode: result.data.qrCode
        },
        instructions: {
          title: 'Hướng dẫn thanh toán',
          steps: [
            '1. Nhấn vào link hoặc quét mã QR để thanh toán qua PayOS',
            '2. Sau khi thanh toán thành công, hệ thống sẽ tự động xác nhận',
            '3. Nếu có vấn đề, liên hệ hỗ trợ',
            '4. Đơn hàng sẽ tự động hủy sau 5 phút nếu chưa thanh toán'
          ]
        }
      });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Tạo thanh toán PayOS thất bại',
      detail: err.message
    });
  }
};

// Kiểm tra trạng thái đơn hàng PayOS qua orderCode
exports.getPayOSPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;

    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu orderCode'
      });
    }

    const result = await getPayOSOrderStatus(orderCode);

    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Kiểm tra trạng thái thanh toán thất bại',
      detail: err.message
    });
  }
};

// Xử lý webhook trả về từ PayOS
exports.handlePayOSWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    const isValid = await verifyPayOSWebhook(webhookData);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Webhook signature không hợp lệ'
      });
    }

    const { data } = webhookData;
    if (data && data.orderCode && data.status === 'PAID') {
      console.log('Đơn hàng đã thanh toán:', data);

      // Cập nhật payment_status trong database
      try {
        const updatedOrder = await Order.findOneAndUpdate(
          { order_code: data.orderCode },
          { 
            payment_status: 'paid',
            status: 'processing',
            updated_at: new Date()
          },
          { new: true }
        );

        if (updatedOrder) {
          console.log(`Đã cập nhật đơn hàng ${data.orderCode} thành đã thanh toán`);
        } else {
          console.log(`Không tìm thấy đơn hàng với orderCode: ${data.orderCode}`);
        }
      } catch (dbError) {
        console.error('Lỗi cập nhật database:', dbError);
      }

      return res.json({
        success: true,
        message: 'Webhook xử lý thành công'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Webhook không hợp lệ hoặc đơn chưa thanh toán'
      });
    }
  } catch (err) {
    console.error('Lỗi webhook:', err);
    res.status(500).json({
      success: false,
      message: 'Xử lý webhook thất bại',
      detail: err.message
    });
  }
};
