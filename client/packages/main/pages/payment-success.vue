<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { GioHangService } from '~/packages/base/services/gio-hang.service';
import { ThanhToanService } from '~/packages/base/services/thanh-toan.service';

const route = useRoute();
const router = useRouter();
const toast = useToast();

definePageMeta({
  layout: 'default',
  auth: true,
});

const loading = ref(true);
const order = ref(null);

const updatePaidStatus = async (orderData: any) => {
  if (!orderData?.orderCode) return;

  const updatedOrder = await ThanhToanService.updatePaymentStatus(orderData.orderCode);
  
  if (updatedOrder) {
    order.value = updatedOrder;
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Chưa xác nhận thanh toán',
      detail: 'Không thể cập nhật trạng thái đơn hàng. Vui lòng kiểm tra lại sau.',
      life: 3000
    });
  }
};

const clearCartItems = async () => {
  try {
    // Lấy thông tin items cần xóa từ sessionStorage
    const pendingData = sessionStorage.getItem('pendingOrderItems');
    if (!pendingData) return;
    
    const { selectedItems, userId } = JSON.parse(pendingData);
    
    // Lấy thông tin giỏ hàng để map item ID với book ID
    const cartData = await GioHangService.getGioHangByUserId(userId);
    if (!cartData?.items) return;
    
    // Xóa từng item khỏi giỏ hàng
    for (const itemId of selectedItems) {
      const item = cartData.items.find(i => i._id === itemId);
      if (item?.book_id?._id) {
        await GioHangService.removeItem(userId, item.book_id._id);
      }
    }
    
    // Xóa thông tin pending
    sessionStorage.removeItem('pendingOrderItems');
    
    console.log('Cart items cleared successfully');
  } catch (error) {
    console.error('Error clearing cart items:', error);
  }
};

const loadOrderInfo = async () => {
  try {
    const orderId = route.query.orderId;
    if (orderId) {
      const orderData = await ThanhToanService.getOrderDetail(orderId);
      if (orderData) {
        order.value = orderData;
        await updatePaidStatus(orderData);
      }
    }
  } catch (error) {
    console.error('Error loading order:', error);
  }
};

const handleContinueShopping = () => {
  router.push('/');
};

const handleViewOrders = () => {
  router.push('/tai-khoan/don-hang');
};

onMounted(async () => {
  try {
    // Load order info
    await loadOrderInfo();
    
    // Clear cart items after successful payment
    await clearCartItems();
    
    toast.add({
      severity: 'success',
      summary: 'Thanh toán thành công!',
      detail: 'Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ liên hệ sớm nhất.',
      life: 5000
    });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Toast />
    
    <div class="max-w-2xl mx-auto px-4 py-16">
      <!-- Loading -->
      <div v-if="loading" class="text-center">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
        <p class="text-gray-600">Đang xử lý thanh toán...</p>
      </div>
      
      <!-- Success Content -->
      <div v-else class="text-center space-y-6">
        <!-- Success Icon -->
        <div class="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <i class="pi pi-check text-3xl text-green-600"></i>
        </div>
        
        <!-- Success Message -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
          <p class="text-gray-600">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
        </div>
        
        <!-- Order Info -->
        <div v-if="order" class="bg-white rounded-lg shadow-sm p-6 text-left">
          <h3 class="font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Mã đơn hàng:</span>
              <span class="font-medium">#{{ order.orderCode }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Tổng tiền:</span>
              <span class="font-medium text-red-600">{{ order.total_amount?.toLocaleString() }}đ</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Trạng thái:</span>
              <span class="font-medium text-green-600">Đã thanh toán</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Địa chỉ giao hàng:</span>
              <span class="font-medium">{{ order.shipping_address }}</span>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="space-y-3">
          <Button 
            @click="handleViewOrders"
            label="Xem đơn hàng của tôi"
            icon="pi pi-list"
            class="w-full !bg-blue-600 hover:!bg-blue-700 !border-blue-600 !py-3"
          />
          
          <Button 
            @click="handleContinueShopping"
            label="Tiếp tục mua sắm"
            icon="pi pi-shopping-cart"
            outlined
            class="w-full !border-gray-300 !text-gray-700 hover:!bg-gray-50 !py-3"
          />
        </div>
        
        <!-- Additional Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start">
            <i class="pi pi-info-circle text-blue-600 mt-1 mr-3"></i>
            <div class="text-left">
              <h4 class="font-medium text-blue-900">Lưu ý quan trọng</h4>
              <p class="text-sm text-blue-700 mt-1">
                • Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng 24h<br>
                • Thời gian giao hàng: 2-5 ngày làm việc<br>
                • Mọi thắc mắc vui lòng liên hệ hotline: 1900-xxxx
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
