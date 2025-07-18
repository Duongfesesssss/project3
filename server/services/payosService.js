// server/services/payosService.js
const PayOS = require('@payos/node');
const crypto = require('crypto');

// Khởi tạo PayOS với biến môi trường
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

/**
 * Tạo đơn hàng PayOS và trả về link/QR thanh toán
 * @param {Object} params
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
async function createPayOSOrder({ amount, description, orderCode, returnUrl, cancelUrl, buyerName, buyerEmail, buyerPhone }) {
  try {
    const order = await payos.createOrder({
      amount,
      description,
      orderCode,
      returnUrl,
      cancelUrl,
      buyerName,
      buyerEmail,
      buyerPhone,
    });

    return {
      success: true,
      data: {
        checkoutUrl: order.checkoutUrl,
        qrCode: order.qrCode,
        orderCode: order.orderCode,
        amount,
        description,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Lỗi tạo đơn hàng PayOS',
    };
  }
}


/**
 * Kiểm tra trạng thái đơn hàng PayOS
 * @param {string|number} orderCode
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
async function getPayOSOrderStatus(orderCode) {
  try {
    const order = await payos.getOrder(orderCode);
    return {
      success: true,
      data: {
        orderCode: order.orderCode,
        status: order.status,
        amount: order.amount,
        description: order.description,
        transactions: order.transactions,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Lỗi kiểm tra trạng thái đơn hàng PayOS',
    };
  }
}

/**
 * Verify webhook signature từ PayOS
 * @param {Object} webhookData
 * @returns {Promise<boolean>}
 */
async function verifyPayOSWebhook(webhookData) {
  try {
    const { signature, ...data } = webhookData;
    
    // Tạo signature để so sánh
    const sortedKeys = Object.keys(data).sort();
    const signatureStr = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY)
      .update(signatureStr)
      .digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

/**
 * Hủy đơn hàng PayOS
 * @param {string|number} orderCode
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
async function cancelPayOSOrder(orderCode) {
  try {
    const result = await payos.cancelOrder(orderCode);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Lỗi hủy đơn hàng PayOS',
    };
  }
}

module.exports = {
  createPayOSOrder,
  getPayOSOrderStatus,
  verifyPayOSWebhook,
  cancelPayOSOrder,
};