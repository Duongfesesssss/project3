<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

definePageMeta({
  layout: 'default',
  auth: true,
});

const handleBackToPayment = () => {
  // Lấy orderId từ sessionStorage để quay lại trang thanh toán
  const pendingData = sessionStorage.getItem('pendingOrderItems');
  if (pendingData) {
    const { orderId } = JSON.parse(pendingData);
    router.push(`/thanh-toan/${orderId}`);
  } else {
    router.push('/gio-hang');
  }
};

const handleBackToCart = () => {
  router.push('/gio-hang');
};

onMounted(() => {
  toast.add({
    severity: 'warn',
    summary: 'Thanh toán bị hủy',
    detail: 'Bạn đã hủy thanh toán. Đơn hàng vẫn được giữ trong hệ thống.',
    life: 5000
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Toast />
    
    <div class="max-w-2xl mx-auto px-4 py-16">
      <div class="text-center space-y-6">
        <!-- Cancel Icon -->
        <div class="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
          <i class="pi pi-times text-3xl text-orange-600"></i>
        </div>
        
        <!-- Cancel Message -->
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Thanh toán bị hủy</h1>
          <p class="text-gray-600">Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu trong hệ thống.</p>
        </div>
        
        <!-- Info -->
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div class="flex items-start">
            <i class="pi pi-info-circle text-orange-600 mt-1 mr-3"></i>
            <div class="text-left">
              <h4 class="font-medium text-orange-900">Điều gì xảy ra tiếp theo?</h4>
              <p class="text-sm text-orange-700 mt-1">
                • Sản phẩm vẫn còn trong giỏ hàng của bạn<br>
                • Đơn hàng vẫn được giữ với trạng thái "Chờ thanh toán"<br>
                • Bạn có thể thử thanh toán lại hoặc chọn phương thức khác
              </p>
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="space-y-3">
          <Button 
            @click="handleBackToPayment"
            label="Thử thanh toán lại"
            icon="pi pi-refresh"
            class="w-full !bg-blue-600 hover:!bg-blue-700 !border-blue-600 !py-3"
          />
          
          <Button 
            @click="handleBackToCart"
            label="Quay lại giỏ hàng"
            icon="pi pi-shopping-cart"
            outlined
            class="w-full !border-gray-300 !text-gray-700 hover:!bg-gray-50 !py-3"
          />
        </div>
      </div>
    </div>
  </div>
</template>