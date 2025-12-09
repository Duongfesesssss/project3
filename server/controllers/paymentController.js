const { createPayOSOrder, getPayOSOrderStatus, verifyPayOSWebhook } = require('../services/payosService');
const Order = require('../models/orderModel');
const { applySalesForOrder } = require('../services/orderInventoryService');

// Auto-cancel đơn hàng sau 5 phút nếu chưa thanh toán (chưa áp dụng sales)
const scheduleOrderCancellation = (orderId, orderCode) => {
  setTimeout(async () => {
    try {
      const order = await Order.findById(orderId);
      
      if (order && order.status === 'pending') {
        await Order.findByIdAndUpdate(orderId, {
          status: 'cancelled',
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
      // Nếu trạng thái PayOS là PAID, tự động cập nhật database
      if (result.data.status === 'PAID') {
        try {
          const updatedOrder = await Order.findOneAndUpdate(
            { orderCode: Number(orderCode) },
            { 
              status: 'paid',
              updated_at: new Date()
            },
            { new: true }
          );

          if (updatedOrder) {
            console.log(`✅ Đã cập nhật đơn hàng ${orderCode} thành đã thanh toán từ status check`);
            try {
              const applied = await applySalesForOrder(updatedOrder._id);
              if (!applied.applied) console.log('ℹ️ Bỏ qua applySales (đã áp dụng trước đó)', applied.reason);
            } catch (invErr) {
              console.error('❌ Lỗi applySales từ status check:', invErr);
            }
          }
        } catch (dbError) {
          console.error('❌ Lỗi cập nhật database từ status check:', dbError);
        }
      }

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
    console.log('🎯 PayOS Webhook received:', JSON.stringify(webhookData, null, 2));

    const isValid = await verifyPayOSWebhook(webhookData);

    if (!isValid) {
      console.log('❌ Webhook signature không hợp lệ');
      return res.status(400).json({
        success: false,
        message: 'Webhook signature không hợp lệ'
      });
    }

    const { data } = webhookData;
    if (data && data.orderCode) {
      console.log(`📋 Processing orderCode: ${data.orderCode}, status: ${data.status}`);

      if (data.status === 'PAID') {
        // Cập nhật payment_status trong database
        try {
          const updatedOrder = await Order.findOneAndUpdate(
            { orderCode: Number(data.orderCode) },
            { 
              status: 'paid',
              updated_at: new Date()
            },
            { new: true }
          );

          if (updatedOrder) {
            console.log(`✅ Đã cập nhật đơn hàng ${data.orderCode} thành đã thanh toán qua webhook`);
            // Áp dụng tồn kho & sold nếu chưa cộng
            try {
              const result = await applySalesForOrder(updatedOrder._id);
              if (!result.applied) {
                console.log('ℹ️ Bỏ qua applySales (đã áp dụng trước đó)', result.reason);
              }
            } catch (invErr) {
              console.error('❌ Lỗi applySales khi nhận webhook:', invErr);
            }
          } else {
            console.log(`❌ Không tìm thấy đơn hàng với orderCode: ${data.orderCode}`);
          }
        } catch (dbError) {
          console.error('❌ Lỗi cập nhật database:', dbError);
        }
      }

      return res.json({
        success: true,
        message: 'Webhook xử lý thành công'
      });
    } else {
      console.log('❌ Webhook không có data hoặc orderCode');
      return res.status(400).json({
        success: false,
        message: 'Webhook không hợp lệ hoặc thiếu orderCode'
      });
    }
  } catch (err) {
    console.error('❌ Lỗi webhook:', err);
    res.status(500).json({
      success: false,
      message: 'Xử lý webhook thất bại',
      detail: err.message
    });
  }
};

// Sync manual payment status - gọi khi cần cập nhật trạng thái thủ công
exports.syncPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;

    if (!orderCode) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu orderCode'
      });
    }

    console.log(`🔄 Manual sync cho orderCode: ${orderCode}`);

    // Kiểm tra trạng thái từ PayOS
    const payosResult = await getPayOSOrderStatus(orderCode);

    if (!payosResult.success) {
      return res.status(400).json({
        success: false,
        message: `Không thể kiểm tra trạng thái PayOS: ${payosResult.message}`
      });
    }

    console.log(`📊 PayOS status: ${payosResult.data.status}`);

    // Nếu PayOS báo PAID, cập nhật database
    if (payosResult.data.status === 'PAID') {
      const updatedOrder = await Order.findOneAndUpdate(
        { orderCode: Number(orderCode) },
        { 
          status: 'paid',
          updated_at: new Date()
        },
        { new: true }
      );

      if (updatedOrder) {
        console.log(`✅ Manual sync thành công cho orderCode: ${orderCode}`);
        try {
          const applied = await applySalesForOrder(updatedOrder._id);
          if (!applied.applied) console.log('ℹ️ Bỏ qua applySales (đã áp dụng trước đó)', applied.reason);
        } catch (invErr) {
          console.error('❌ Lỗi applySales từ manual sync:', invErr);
        }

        return res.json({
          success: true,
          message: 'Đã cập nhật trạng thái thanh toán thành công',
          data: {
            orderCode: orderCode,
            oldStatus: 'pending',
            newStatus: 'paid',
            payosData: payosResult.data
          }
        });
      } else {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy đơn hàng với orderCode: ${orderCode}`
        });
      }
    } else {
      return res.json({
        success: false,
        message: `Đơn hàng chưa được thanh toán trên PayOS. Trạng thái hiện tại: ${payosResult.data.status}`,
        data: payosResult.data
      });
    }

  } catch (err) {
    console.error('❌ Lỗi sync payment status:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi sync trạng thái thanh toán',
      detail: err.message
    });
  }
};
