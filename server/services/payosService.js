// server/services/payosService.js
const PayOS = require('@payos/node');

// Khởi tạo PayOS instance
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

/**
 * Tạo đơn hàng PayOS và trả về link/QR thanh toán
 * @param {Object} params
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
async function createPayOSOrder({ amount, description, orderCode, returnUrl, cancelUrl, buyerName, buyerEmail, buyerPhone, items }) {
  try {
    const requestData = {
      orderCode,
      amount,
      description,
      cancelUrl,
      returnUrl,
    };

    // Thêm các field optional nếu có
    if (buyerName) requestData.buyerName = buyerName;
    if (buyerEmail) requestData.buyerEmail = buyerEmail;
    if (buyerPhone) requestData.buyerPhone = buyerPhone;
    if (items && items.length > 0) requestData.items = items;

    console.log('PayOS Request Data:', requestData); // Debug log

    // Sử dụng PayOS SDK thay vì gọi API trực tiếp
    const paymentLinkResponse = await payOS.createPaymentLink(requestData);

    return {
      success: true,
      data: {
        checkoutUrl: paymentLinkResponse.checkoutUrl,
        qrCode: paymentLinkResponse.qrCode,
        orderCode: paymentLinkResponse.orderCode,
        amount,
        description,
      },
    };
  } catch (error) {
    console.error('PayOS Error:', error); // Debug log
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
    const result = await payOS.getPaymentLinkInformation(orderCode);
    
    return {
      success: true,
      data: {
        orderCode: result.orderCode,
        status: result.status,
        amount: result.amount,
        description: result.description,
        transactions: result.transactions,
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
    return payOS.verifyPaymentWebhookData(webhookData);
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
    const result = await payOS.cancelPaymentLink(orderCode);
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