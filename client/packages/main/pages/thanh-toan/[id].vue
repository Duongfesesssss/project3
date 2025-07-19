<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { ThanhToanService } from '~/packages/base/services/thanh-toan.service';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { data: authData } = useAuth();

definePageMeta({
  layout: 'default',
  auth: true,
});

// State
const loading = ref(false);
const order = ref(null);
const paymentLoading = ref(false);

// Customer info for PayOS
const customerInfo = ref({
  fullName: '',
  email: '',
  phone: ''
});

// Computed
const orderId = computed(() => route.params.id);
const total = computed(() => order.value?.total_amount || 0);
const orderCode = computed(() => order.value?.orderCode || 0);

// Methods
const loadOrder = async () => {
  try {
    loading.value = true;
    const orderData = await ThanhToanService.getOrderDetail(orderId.value);
    
    if (orderData) {
      order.value = orderData;
      console.log('Order loaded:', orderData);
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không tìm thấy đơn hàng',
        life: 3000
      });
      router.push('/gio-hang');
    }
  } catch (error) {
    console.error('Error loading order:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Có lỗi khi tải thông tin đơn hàng',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const loadUserInfo = () => {
  if (authData.value?.user) {
    const user = authData.value.user;
    customerInfo.value = {
      fullName: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    };
  }
};

const handlePayment = async () => {
  if (!order.value) return;
  
  if (!customerInfo.value.fullName || !customerInfo.value.email || !customerInfo.value.phone) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng điền đầy đủ thông tin thanh toán',
      life: 3000
    });
    return;
  }
  
  try {
    paymentLoading.value = true;
    
    const paymentData = await ThanhToanService.createPayOSPayment({
      orderId: order.value._id,
      orderCode: orderCode.value,
      amount: total.value,
      description: `đơn hàng #${orderCode.value}`,
      returnUrl: `${window.location.origin}/payment-success?orderId=${order.value._id}`,
      cancelUrl: `${window.location.origin}/payment-cancel`
    });
    
    if (paymentData?.checkoutUrl) {
      // Chuyển hướng đến PayOS
      window.location.href = paymentData.checkoutUrl;
    } else {
      throw new Error('Không thể tạo link thanh toán');
    }
    
  } catch (error) {
    console.error('Payment error:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Có lỗi khi tạo link thanh toán. Vui lòng thử lại.',
      life: 3000
    });
  } finally {
    paymentLoading.value = false;
  }
};

const goBack = () => {
  router.push('/gio-hang');
};

onMounted(() => {
  loadOrder();
  loadUserInfo();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Toast />
    
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <Button 
              icon="pi pi-arrow-left" 
              text 
              @click="goBack"
              class="!text-gray-600 hover:!text-gray-900"
            />
            <h1 class="text-2xl font-bold text-gray-900">Thanh toán đơn hàng</h1>
          </div>
          <div v-if="order" class="text-sm text-gray-600">
            Mã đơn hàng: #{{ orderCode }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
      <span class="ml-2 text-gray-600">Đang tải thông tin đơn hàng...</span>
    </div>

    <!-- Content -->
    <div v-else-if="order" class="max-w-4xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Left: Order Info -->
        <div class="space-y-6">
          <!-- Order Summary -->
          <Card>
            <template #title>
              <div class="flex items-center">
                <i class="pi pi-shopping-cart text-blue-600 mr-2"></i>
                <span>Thông tin đơn hàng</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-4">
                <div v-for="item in order.items" :key="item._id" 
                     class="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                  <img 
                    :src="item.book_id?.image_link || '/placeholder.jpg'" 
                    :alt="item.book_id?.title || 'Không có tiêu đề'" 
                    class="w-16 h-20 object-cover rounded shadow-sm" 
                  />
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 line-clamp-2">
                      {{ item.book_id?.title || 'Không có tiêu đề' }}
                    </h4>
                    <p class="text-xs text-gray-600 mt-1">{{ item.book_id?.author || 'Không có tác giả' }}</p>
                    <div class="flex items-center justify-between mt-2">
                      <span class="text-sm text-gray-600">SL: {{ item.quantity }}</span>
                      <div class="text-right">
                        <div class="text-sm font-semibold text-red-600">
                          {{ (item.price * item.quantity).toLocaleString() }}đ
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="pt-4 border-t">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-semibold text-gray-900">Tổng tiền:</span>
                    <span class="text-xl font-bold text-red-600">{{ total.toLocaleString() }}đ</span>
                  </div>
                  <div class="text-sm text-gray-600 mt-1">
                    Địa chỉ: {{ order.shipping_address }}
                  </div>
                  <div class="text-sm text-gray-600">
                    Phương thức: {{ order.payment_method === 'payos' ? 'PayOS' : order.payment_method }}
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Right: Payment Form -->
        <div class="space-y-6">
          <!-- Customer Info -->
          <Card>
            <template #title>
              <div class="flex items-center">
                <i class="pi pi-user text-green-600 mr-2"></i>
                <span>Thông tin thanh toán</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span class="text-red-500">*</span>
                  </label>
                  <InputText 
                    v-model="customerInfo.fullName"
                    placeholder="Nhập họ và tên"
                    class="w-full"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <InputText 
                    v-model="customerInfo.email"
                    placeholder="Nhập email"
                    class="w-full"
                    type="email"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span class="text-red-500">*</span>
                  </label>
                  <InputText 
                    v-model="customerInfo.phone"
                    placeholder="Nhập số điện thoại"
                    class="w-full"
                  />
                </div>
              </div>
            </template>
          </Card>

          <!-- Payment Action -->
          <Card>
            <template #title>
              <div class="flex items-center">
                <i class="pi pi-credit-card text-purple-600 mr-2"></i>
                <span>Thanh toán qua PayOS</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div class="flex items-start">
                    <i class="pi pi-info-circle text-blue-600 mt-1 mr-3"></i>
                    <div>
                      <h4 class="font-medium text-blue-900">Thanh toán an toàn với PayOS</h4>
                      <p class="text-sm text-blue-700 mt-1">
                        Bạn sẽ được chuyển hướng đến trang thanh toán PayOS để hoàn tất giao dịch.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div class="text-center space-y-3">
                  <div class="text-lg font-semibold text-gray-900">
                    Số tiền thanh toán: {{ total.toLocaleString() }}đ
                  </div>
                  
                  <Button 
                    @click="handlePayment"
                    :loading="paymentLoading"
                    label="Thanh toán ngay"
                    icon="pi pi-credit-card"
                    class="w-full !bg-blue-600 hover:!bg-blue-700 !border-blue-600 !py-3 !font-semibold"
                    :disabled="paymentLoading"
                  />
                  
                  <Button 
                    @click="goBack"
                    label="Quay lại giỏ hàng"
                    text
                    class="w-full !text-gray-600 hover:!text-gray-900"
                  />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>