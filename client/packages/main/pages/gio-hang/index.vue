<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { GioHangService } from '~/packages/base/services/gio-hang.service';
import Toast from 'primevue/toast';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Divider from 'primevue/divider';

const { data: authData } = useAuth();
const toast = useToast();
const router = useRouter();

definePageMeta({
  layout: 'default',
  auth: true,
});

// State
const cart = ref(null);
const loading = ref(false);
const selectedItems = ref([]);
const discountCode = ref('');
const appliedDiscount = ref(null);

// Available discount codes
const availableDiscounts = ref([
  {
    code: 'WELCOME10',
    label: 'Giảm 10% cho đơn hàng đầu tiên',
    type: 'percentage',
    value: 10,
    minAmount: 0
  },
  {
    code: 'FREESHIP',
    label: 'Miễn phí vận chuyển',
    type: 'shipping',
    value: 0,
    minAmount: 0
  },
  {
    code: 'SAVE50K',
    label: 'Giảm 50.000đ cho đơn từ 500.000đ',
    type: 'fixed',
    value: 50000,
    minAmount: 500000
  }
]);

// Computed values
const selectedItemsData = computed(() => {
  if (!cart.value?.items) return [];
  return cart.value.items.filter(item => selectedItems.value.includes(item._id));
});

const subtotal = computed(() => {
  return selectedItemsData.value.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
});

const shippingFee = computed(() => {
  if (appliedDiscount.value?.type === 'shipping') return 0;
  return subtotal.value >= 500000 ? 0 : 30000;
});

const discountAmount = computed(() => {
  if (!appliedDiscount.value) return 0;
  
  switch (appliedDiscount.value.type) {
    case 'percentage':
      return Math.floor(subtotal.value * appliedDiscount.value.value / 100);
    case 'fixed':
      return appliedDiscount.value.value;
    case 'shipping':
      return shippingFee.value;
    default:
      return 0;
  }
});

const total = computed(() => {
  return subtotal.value + shippingFee.value - discountAmount.value;
});

const isAllSelected = computed(() => {
  return cart.value?.items?.length > 0 && selectedItems.value.length === cart.value.items.length;
});

// Methods
const fetchCart = async () => {
  try {
    loading.value = true;
    const userId = authData.value?.user?._id;
    if (!userId) return;

    const cartData = await GioHangService.getGioHangByUserId(userId);
    
    if (cartData?.items?.length > 0) {
      cart.value = cartData;
      // Auto select all items
      selectedItems.value = cartData.items.map(item => item._id);
    } else {
      cart.value = null;
    }
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    toast.add({
      severity: "error",
      summary: "Lỗi",
      detail: "Không thể lấy thông tin giỏ hàng",
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const updateQuantity = async (itemId, newQuantity) => {
  if (newQuantity < 1) return;
  
  try {
    const userId = authData.value?.user?._id;
    const item = cart.value.items.find(item => item._id === itemId);
    
    if (!item) return;
    
    await GioHangService.updateCartItem(userId, item.book_id._id, newQuantity);
    
    // Update local state
    item.quantity = newQuantity;
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Cập nhật số lượng thành công',
      life: 2000
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật số lượng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể cập nhật số lượng',
      life: 3000
    });
  }
};

const removeItem = async (itemId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
  
  try {
    const userId = authData.value?.user?._id;
    const item = cart.value.items.find(item => item._id === itemId);
    
    if (!item) return;
    
    await GioHangService.removeFromCart(userId, item.book_id._id);
    
    // Update local state
    cart.value.items = cart.value.items.filter(item => item._id !== itemId);
    selectedItems.value = selectedItems.value.filter(id => id !== itemId);
    
    if (cart.value.items.length === 0) {
      cart.value = null;
    }
    
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đã xóa sản phẩm khỏi giỏ hàng',
      life: 2000
    });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể xóa sản phẩm',
      life: 3000
    });
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = cart.value.items.map(item => item._id);
  }
};

const toggleSelectItem = (itemId) => {
  const index = selectedItems.value.indexOf(itemId);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(itemId);
  }
};

const applyDiscountCode = () => {
  const discount = availableDiscounts.value.find(d => d.code === discountCode.value.toUpperCase());
  
  if (!discount) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Mã giảm giá không hợp lệ',
      life: 3000
    });
    return;
  }
  
  if (subtotal.value < discount.minAmount) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: `Đơn hàng tối thiểu ${discount.minAmount.toLocaleString()}đ để áp dụng mã này`,
      life: 3000
    });
    return;
  }
  
  appliedDiscount.value = discount;
  discountCode.value = '';
  
  toast.add({
    severity: 'success',
    summary: 'Thành công',
    detail: `Đã áp dụng mã giảm giá ${discount.code}`,
    life: 3000
  });
};

const removeDiscount = () => {
  appliedDiscount.value = null;
  toast.add({
    severity: 'info',
    summary: 'Thông báo',
    detail: 'Đã hủy mã giảm giá',
    life: 2000
  });
};

const proceedToCheckout = () => {
  if (selectedItems.value.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán',
      life: 3000
    });
    return;
  }

  // Lưu dữ liệu giỏ hàng vào sessionStorage
  const checkoutData = {
    items: selectedItemsData.value,
    subtotal: subtotal.value,
    discount: appliedDiscount.value,
    discountAmount: appliedDiscount.value ? 
      (appliedDiscount.value.type === 'percentage' ? 
        Math.floor(subtotal.value * appliedDiscount.value.value / 100) : 
        appliedDiscount.value.value) : 0
  };
  
  sessionStorage.setItem('checkoutItems', JSON.stringify(checkoutData));
  router.push('/thanh-toan');
};

onMounted(() => {
  fetchCart();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <Toast />
    
    <div class="max-w-7xl mx-auto px-4">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-600 mb-6">
        <NuxtLink to="/" class="hover:text-blue-600">Trang chủ</NuxtLink>
        <i class="pi pi-angle-right mx-2 text-gray-400"></i>
        <span class="text-gray-800 font-medium">Giỏ hàng</span>
      </div>

      <!-- Page Title -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
        <NuxtLink to="/" class="text-blue-600 hover:underline flex items-center">
          <i class="pi pi-arrow-left mr-1"></i>
          Tiếp tục mua sắm
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
        <p class="mt-4 text-gray-600 text-lg">Đang tải giỏ hàng...</p>
      </div>

      <!-- Empty cart -->
      <div v-else-if="!cart" class="text-center py-16 bg-white rounded-xl shadow-sm">
        
        <h3 class="text-xl font-medium text-gray-800 mb-2">Giỏ hàng của bạn đang trống</h3>
        <p class="text-gray-600 mb-6">Hãy khám phá và thêm những cuốn sách yêu thích vào giỏ hàng!</p>
        <NuxtLink to="/" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition">
          Khám phá sách ngay
        </NuxtLink>
      </div>

      <!-- Cart content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left column - Cart items -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            
            <!-- Select all header -->
            <div class="p-4 border-b bg-gray-50 flex items-center justify-between">
              <div class="flex items-center">
                <Checkbox 
                  :modelValue="isAllSelected" 
                  @update:modelValue="toggleSelectAll"
                  inputId="selectAll" 
                  binary 
                />
                <label for="selectAll" class="ml-2 font-medium text-gray-900">
                  Chọn tất cả ({{ cart.items.length }} sản phẩm)
                </label>
              </div>
              <div class="text-sm text-gray-600">
                Đã chọn: {{ selectedItems.length }} sản phẩm
              </div>
            </div>

            <!-- Cart items list -->
            <div class="divide-y">
              <div 
                v-for="item in cart.items" 
                :key="item._id"
                class="p-4 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start space-x-4">
                  <!-- Checkbox -->
                  <div class="pt-2">
                    <Checkbox 
                      :modelValue="selectedItems.includes(item._id)"
                      @update:modelValue="toggleSelectItem(item._id)"
                      :inputId="`item-${item._id}`"
                      binary 
                    />
                  </div>

                  <!-- Book image -->
                  <div class="flex-shrink-0">
                    <img 
                      :src="item.book_id.image_link || '/placeholder.jpg'" 
                      :alt="item.book_id.title"
                      class="w-20 h-24 object-cover rounded-lg shadow-sm"
                    />
                  </div>

                  <!-- Book info -->
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 line-clamp-2 mb-1">
                      {{ item.book_id.title }}
                    </h3>
                    <p class="text-sm text-gray-600 mb-1">{{ item.book_id.author }}</p>
                    <p class="text-sm text-gray-500">{{ item.book_id.publisher }}</p>
                    
                    <div class="mt-3 flex items-center justify-between">
                      <!-- Price -->
                      <div class="flex items-baseline space-x-2">
                        <span class="text-lg font-bold text-red-600">
                          {{ item.price.toLocaleString() }}đ
                        </span>
                        <span class="text-sm text-gray-500 line-through">
                          {{ (item.price * 1.2).toLocaleString() }}đ
                        </span>
                      </div>

                      <!-- Quantity controls -->
                      <div class="flex items-center space-x-3">
                        <div class="flex items-center border rounded-lg">
                          <button 
                            @click="updateQuantity(item._id, item.quantity - 1)"
                            :disabled="item.quantity <= 1"
                            class="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <i class="pi pi-minus text-sm"></i>
                          </button>
                          <span class="px-4 py-1 border-x min-w-[3rem] text-center">
                            {{ item.quantity }}
                          </span>
                          <button 
                            @click="updateQuantity(item._id, item.quantity + 1)"
                            class="px-3 py-1 hover:bg-gray-100"
                          >
                            <i class="pi pi-plus text-sm"></i>
                          </button>
                        </div>

                        <!-- Remove button -->
                        <button 
                          @click="removeItem(item._id)"
                          class="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                          title="Xóa sản phẩm"
                        >
                          <i class="pi pi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column - Order summary -->
        <div class="lg:col-span-1">
          <div class="sticky top-4 space-y-6">
            
            <!-- Discount code -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Mã giảm giá</h3>
              
              <div class="flex space-x-2 mb-4">
                <input 
                  v-model="discountCode"
                  type="text" 
                  placeholder="Nhập mã giảm giá" 
                  class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button 
                  @click="applyDiscountCode"
                  label="Áp dụng"
                  class="!bg-blue-600 hover:!bg-blue-700"
                />
              </div>

              <!-- Applied discount -->
              <div v-if="appliedDiscount" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-medium text-green-800">{{ appliedDiscount.code }}</span>
                    <p class="text-sm text-green-600">{{ appliedDiscount.label }}</p>
                  </div>
                  <button @click="removeDiscount" class="text-green-600 hover:text-green-800">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>

              <!-- Available discounts -->
              <div class="space-y-2">
                <p class="text-sm font-medium text-gray-700">Mã giảm giá khả dụng:</p>
                <div class="space-y-2">
                  <div 
                    v-for="discount in availableDiscounts" 
                    :key="discount.code"
                    @click="discountCode = discount.code"
                    class="border border-gray-200 rounded-lg p-3 hover:border-blue-500 cursor-pointer transition"
                  >
                    <p class="font-medium text-blue-600">{{ discount.code }}</p>
                    <p class="text-sm text-gray-600">{{ discount.label }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order summary -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
              
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Tạm tính ({{ selectedItems.length }} sản phẩm)</span>
                  <span class="font-medium">{{ subtotal.toLocaleString() }}đ</span>
                </div>
                
                <div class="flex justify-between">
                  <span class="text-gray-600">Phí vận chuyển</span>
                  <span class="font-medium">
                    {{ shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString() + 'đ' }}
                  </span>
                </div>
                
                <div v-if="appliedDiscount" class="flex justify-between text-green-600">
                  <span>Giảm giá ({{ appliedDiscount.code }})</span>
                  <span>-{{ discountAmount.toLocaleString() }}đ</span>
                </div>
                
                <Divider />
                
                <div class="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span class="text-red-600">{{ total.toLocaleString() }}đ</span>
                </div>
              </div>

              <Button 
                @click="proceedToCheckout"
                :disabled="selectedItems.length === 0"
                label="Tiến hành thanh toán"
                icon="pi pi-arrow-right"
                iconPos="right"
                class="w-full mt-6 !bg-red-500 hover:!bg-red-600 !py-3 !font-semibold"
              />
              
              <div class="mt-4 text-center">
                <div class="flex items-center justify-center text-sm text-gray-600">
                  <i class="pi pi-shield mr-1"></i>
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
              </div>
            </div>

            <!-- Shipping info -->
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="flex items-start space-x-3">
                <i class="pi pi-truck text-blue-600 mt-1"></i>
                <div>
                  <h4 class="font-medium text-blue-900">Miễn phí vận chuyển</h4>
                  <p class="text-sm text-blue-700">Cho đơn hàng từ 500.000đ</p>
                  <p class="text-sm text-blue-600 mt-1">
                    Thêm {{ Math.max(0, 500000 - subtotal).toLocaleString() }}đ để được miễn phí ship
                  </p>
                </div>
              </div>
            </div>
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