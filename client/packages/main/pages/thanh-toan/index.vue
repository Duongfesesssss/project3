<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import Divider from 'primevue/divider';
import Card from 'primevue/card';
import { definePageMeta } from '#imports';
import { ThanhToanService } from '~/packages/base/services/thanh-toan.service';

const router = useRouter();
const toast = useToast();
const { data: authData } = useAuth();

definePageMeta({
  layout: 'default',
  auth: true,
});

// State
const loading = ref(false);
const checkoutData = ref(null);
const appliedVoucher = ref(null);
const voucherCode = ref('');

// Form data
const customerInfo = ref({
  fullName: '',
  phone: '',
  email: '',
  address: '',
  ward: '',
  district: '',
  city: '',
  note: ''
});

const paymentMethod = ref('cod');
const shippingMethod = ref('standard');
const agreeTerms = ref(false);
const saveInfo = ref(false);

// Cart items from checkout data
const cartItems = computed(() => {
  return checkoutData.value?.items || [];
});

// Computed values
const subtotal = computed(() => {
  return checkoutData.value?.subtotal || 0;
});

const baseShippingFee = computed(() => {
  if (subtotal.value >= 500000) return 0;
  return shippingMethod.value === 'express' ? 35000 : 25000;
});

const shippingFee = computed(() => {
  // If applied discount includes free shipping
  if (checkoutData.value?.discount?.type === 'shipping') return 0;
  return baseShippingFee.value;
});

const existingDiscount = computed(() => {
  return checkoutData.value?.discountAmount || 0;
});

const voucherDiscount = computed(() => {
  if (!appliedVoucher.value) return 0;
  
  switch (appliedVoucher.value.type) {
    case 'percentage':
      return Math.floor(subtotal.value * appliedVoucher.value.value / 100);
    case 'fixed':
      return appliedVoucher.value.value;
    case 'shipping':
      return baseShippingFee.value;
    default:
      return 0;
  }
});

const totalDiscount = computed(() => {
  return existingDiscount.value + voucherDiscount.value;
});

const total = computed(() => {
  return subtotal.value + shippingFee.value - totalDiscount.value;
});

const paymentMethods = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: 'pi pi-money-bill' },
  { value: 'bank', label: 'Chuyển khoản ngân hàng', icon: 'pi pi-credit-card' },
  { value: 'momo', label: 'Ví MoMo', icon: 'pi pi-wallet' },
  { value: 'zalopay', label: 'ZaloPay', icon: 'pi pi-mobile' }
];

const shippingMethods = [
  { value: 'standard', label: 'Giao hàng tiêu chuẩn', time: '3-5 ngày', fee: 25000 },
  { value: 'express', label: 'Giao hàng nhanh', time: '1-2 ngày', fee: 35000 }
];

// Available vouchers
const availableVouchers = ref([
  {
    code: 'NEWUSER',
    label: 'Giảm 15% cho khách hàng mới',
    type: 'percentage',
    value: 15,
    minAmount: 200000
  },
  {
    code: 'SAVE100K',
    label: 'Giảm 100.000đ cho đơn từ 1.000.000đ',
    type: 'fixed',
    value: 100000,
    minAmount: 1000000
  }
]);

// Methods
const loadCheckoutData = () => {
  try {
    const storedData = sessionStorage.getItem('checkoutItems');
    console.log('storedData', storedData);
    if (storedData) {
      checkoutData.value = JSON.parse(storedData);
      console.log('Checkout data loaded:', checkoutData.value);
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không tìm thấy thông tin đơn hàng. Vui lòng quay lại giỏ hàng.',
        life: 3000
      });
      router.push('/gio-hang');
    }
  } catch (error) {
    console.error('Error loading checkout data:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Có lỗi khi tải thông tin đơn hàng',
      life: 3000
    });
  }
};

const loadUserInfo = () => {
  if (authData.value?.user) {
    const user = authData.value.user;
    customerInfo.value = {
      fullName: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      address: user.address || '',
      ward: user.ward || '',
      district: user.district || '',
      city: user.city || '',
      note: ''
    };
  }
};

const applyVoucher = () => {
  const voucher = availableVouchers.value.find(v => v.code === voucherCode.value.toUpperCase());
  
  if (!voucher) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Mã voucher không hợp lệ',
      life: 3000
    });
    return;
  }
  
  if (subtotal.value < voucher.minAmount) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: `Đơn hàng tối thiểu ${voucher.minAmount.toLocaleString()}đ để áp dụng voucher này`,
      life: 3000
    });
    return;
  }
  
  appliedVoucher.value = voucher;
  voucherCode.value = '';
  
  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: `Đã áp dụng voucher ${voucher.code}`,
    life: 3000
  });
};

const removeVoucher = () => {
  appliedVoucher.value = null;
  toast.add({
    severity: 'info',
    summary: 'Thông báo',
    detail: 'Đã hủy voucher',
    life: 2000
  });
};

const validateForm = () => {
  const required = ['fullName', 'phone', 'address', 'ward', 'district', 'city'];
  for (const field of required) {
    if (!customerInfo.value[field]) {
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Vui lòng điền đầy đủ thông tin giao hàng', 
        life: 3000 
      });
      return false;
    }
  }
  
  if (!agreeTerms.value) {
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Vui lòng đồng ý với điều khoản và điều kiện', 
      life: 3000 
    });
    return false;
  }
  
  return true;
};

const handlePlaceOrder = async () => {
  if (!validateForm()) return;
  
  try {
    loading.value = true;
    
    // Tạo địa chỉ giao hàng đầy đủ
    const shippingAddress = `${customerInfo.value.address}, ${customerInfo.value.ward}, ${customerInfo.value.district}, ${customerInfo.value.city}`;
    
    // Gọi service tạo đơn hàng
    const result = await ThanhToanService.createOrder(
      authData.value.user._id,
      shippingAddress,
      paymentMethod.value,
      appliedVoucher.value?.code,
      customerInfo.value.note
    );
    
    if (result) {
      toast.add({ 
        severity: 'success', 
        summary: 'Thành công', 
        detail: 'Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.', 
        life: 5000 
      });
      
      // Clear checkout data
      sessionStorage.removeItem('checkoutItems');
      
      // Redirect to success page with order ID
      setTimeout(() => {
        router.push(`/order-success?orderId=${result._id}`);
      }, 2000);
    } else {
      throw new Error('Không thể tạo đơn hàng');
    }
    
  } catch (error) {
    console.error('Lỗi đặt hàng:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', 
      life: 3000 
    });
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/gio-hang');
};

onMounted(() => {
  loadCheckoutData();
  loadUserInfo();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Toast />
    
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <Button 
              icon="pi pi-arrow-left" 
              text 
              @click="goBack"
              class="!text-gray-600 hover:!text-gray-900"
            />
            <h1 class="text-2xl font-bold text-gray-900">Thanh toán</h1>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <span class="bg-blue-100 text-blue-600 px-2 py-1 rounded">Bước 2/3</span>
            <span>Xác nhận đơn hàng</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="!checkoutData" class="flex justify-center items-center py-12">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
      <span class="ml-2 text-gray-600">Đang tải thông tin đơn hàng...</span>
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Forms -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Shipping Information -->
          <Card>
            <template #title>
              <div class="flex items-center">
                <i class="pi pi-map-marker text-blue-600 mr-2"></i>
                <span>Thông tin giao hàng</span>
              </div>
            </template>
            <template #content>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
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
                    Số điện thoại <span class="text-red-500">*</span>
                  </label>
                  <InputText 
                    v-model="customerInfo.phone"
                    placeholder="Nhập số điện thoại"
                    class="w-full"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <InputText 
                    v-model="customerInfo.email"
                    placeholder="Nhập email"
                    class="w-full"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ <span class="text-red-500">*</span>
                  </label>
                  <InputText 
                    v-model="customerInfo.address"
                    placeholder="Số nhà, tên đường"
                    class="w-full"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã <span class="text-red-500">*</span>
                  </label>
                  <InputText 
                    v-model="customerInfo.ward"
                    placeholder="Chọn phường/xã"
                    class="w-full"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện <span class="text-red-500">*</span>
                  </label>
                  <InputText 
                    v-model="customerInfo.district"
                    placeholder="Chọn quận/huyện"
                    class="w-full"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span class="text-red-500">*</span>
                  </label>
                  <InputText 
                    v-model="customerInfo.city"
                    placeholder="Chọn tỉnh/thành phố"
                    class="w-full"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <Textarea 
                    v-model="customerInfo.note"
                    placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                    rows="3"
                    class="w-full"
                  />
                </div>
              </div>
              
              <div class="mt-4">
                <div class="flex items-center">
                  <Checkbox v-model="saveInfo" inputId="saveInfo" binary />
                  <label for="saveInfo" class="ml-2 text-sm text-gray-700">
                    Lưu thông tin cho lần mua hàng tiếp theo
                  </label>
                </div>
              </div>
            </template>
          </Card>

          <!-- Shipping Method -->
          <Card>
            <template #title>
              <div class="flex items-center">
                <i class="pi pi-truck text-green-600 mr-2"></i>
                <span>Phương thức vận chuyển</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <div v-for="method in shippingMethods" :key="method.value" 
                     class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                     :class="{ 'border-blue-500 bg-blue-50': shippingMethod === method.value }"
                     @click="shippingMethod = method.value">
                  <div class="flex items-center">
                    <RadioButton 
                      v-model="shippingMethod" 
                      :inputId="method.value" 
                      :value="method.value" 
                    />
                    <div class="ml-3">
                      <label :for="method.value" class="font-medium text-gray-900 cursor-pointer">
                        {{ method.label }}
                      </label>
                      <p class="text-sm text-gray-600">{{ method.time }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="font-semibold text-gray-900">
                      {{ subtotal >= 500000 ? 'Miễn phí' : method.fee.toLocaleString() + 'đ' }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Payment Method -->
          <Card>
            <template #title>
              <div class="flex items-center">
                <i class="pi pi-credit-card text-purple-600 mr-2"></i>
                <span>Phương thức thanh toán</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-3">
                <div v-for="method in paymentMethods" :key="method.value" 
                     class="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                     :class="{ 'border-blue-500 bg-blue-50': paymentMethod === method.value }"
                     @click="paymentMethod = method.value">
                  <RadioButton 
                    v-model="paymentMethod" 
                    :inputId="method.value" 
                    :value="method.value" 
                  />
                  <i :class="method.icon" class="ml-3 mr-3 text-lg text-gray-600"></i>
                  <label :for="method.value" class="font-medium text-gray-900 cursor-pointer">
                    {{ method.label }}
                  </label>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Right Column: Order Summary -->
        <div class="lg:col-span-1">
          <div class="sticky top-4">
            <Card>
              <template #title>
                <span>Tóm tắt đơn hàng</span>
              </template>
              <template #content>
                <!-- Cart Items -->
                <div class="space-y-4 mb-6">
                  <div v-for="item in cartItems" :key="item._id" 
                       class="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                    <img 
                      :src="item.book_id.image_link || '/placeholder.jpg'" 
                      :alt="item.book_id.title" 
                      class="w-16 h-20 object-cover rounded" 
                    />
                    <div class="flex-1 min-w-0">
                      <h4 class="text-sm font-medium text-gray-900 line-clamp-2">
                        {{ item.book_id.title }}
                      </h4>
                      <p class="text-xs text-gray-600 mt-1">{{ item.book_id.author }}</p>
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
                </div>

                <!-- Voucher Section -->
                <div class="mb-6">
                  <div class="flex space-x-2 mb-3">
                    <InputText 
                      v-model="voucherCode"
                      placeholder="Mã voucher"
                      class="flex-1"
                    />
                    <Button 
                      @click="applyVoucher"
                      label="Áp dụng" 
                      outlined 
                      size="small" 
                    />
                  </div>
                  
                  <!-- Applied voucher -->
                  <div v-if="appliedVoucher" class="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="font-medium text-green-800">{{ appliedVoucher.code }}</span>
                        <p class="text-sm text-green-600">{{ appliedVoucher.label }}</p>
                      </div>
                      <button @click="removeVoucher" class="text-green-600 hover:text-green-800">
                        <i class="pi pi-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <Divider />

                <!-- Price Breakdown -->
                <div class="space-y-3">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Tạm tính</span>
                    <span class="font-medium">{{ subtotal.toLocaleString() }}đ</span>
                  </div>
                  
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Phí vận chuyển</span>
                    <span class="font-medium">
                      {{ shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString() + 'đ' }}
                    </span>
                  </div>
                  
                  <div v-if="totalDiscount > 0" class="flex justify-between text-sm">
                    <span class="text-gray-600">Giảm giá</span>
                    <span class="font-medium text-green-600">-{{ totalDiscount.toLocaleString() }}đ</span>
                  </div>
                  
                  <Divider />
                  
                  <div class="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span class="text-red-600">{{ total.toLocaleString() }}đ</span>
                  </div>
                </div>

                <!-- Terms and Place Order -->
                <div class="mt-6 space-y-4">
                  <div class="flex items-start">
                    <Checkbox v-model="agreeTerms" inputId="agreeTerms" binary class="mt-1" />
                    <label for="agreeTerms" class="ml-2 text-sm text-gray-700">
                      Tôi đồng ý với 
                      <a href="#" class="text-blue-600 hover:underline">Điều khoản và Điều kiện</a> 
                      và 
                      <a href="#" class="text-blue-600 hover:underline">Chính sách bảo mật</a>
                    </label>
                  </div>
                  
                  <Button 
                    @click="handlePlaceOrder"
                    :loading="loading"
                    label="Đặt hàng"
                    icon="pi pi-check"
                    class="w-full !bg-red-500 hover:!bg-red-600 !border-red-500 !py-3 !font-semibold"
                    :disabled="!agreeTerms || loading"
                  />
                  
                  <div class="text-center">
                    <Button 
                      @click="goBack"
                      label="Quay lại giỏ hàng"
                      text
                      class="!text-gray-600 hover:!text-gray-900"
                    />
                  </div>
                </div>
              </template>
            </Card>
          </div>
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