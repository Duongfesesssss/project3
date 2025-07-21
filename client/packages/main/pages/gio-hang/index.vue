<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { GioHangService } from '~/packages/base/services/gio-hang.service';
import { VoucherService } from '~/packages/base/services/voucher.service';
import { ThanhToanService } from '~/packages/base/services/thanh-toan.service';
import type { GioHangModel } from '~/packages/base/models/dto/response/gio-hang/gio-hang.model';
import type { VoucherModel } from '~/packages/base/models/dto/response/voucher/voucher.model';

const { data: authData } = useAuth();
const toast = useToast();
const router = useRouter();

const cart = ref<GioHangModel | null>(null);
const loading = ref(false);
const selectedItems = ref<string[]>([]);
const discountCode = ref('');
const appliedVoucher = ref<{ discount: number; voucher: VoucherModel } | null>(null);
const validatingVoucher = ref(false);

const selectedItemsData = computed(() => {
  if (!cart.value?.items) return [];
  return cart.value.items.filter(item => item._id && selectedItems.value.includes(item._id));
});

const subtotal = computed(() => {
  return selectedItemsData.value.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0), 0);
});

const shippingFee = computed(() => subtotal.value >= 500000 ? 0 : 30000);

const discountAmount = computed(() => {
  if (!appliedVoucher.value) return 0;
  const discountValue = appliedVoucher.value.discount || 0;
  const discount = Math.floor(subtotal.value * discountValue / 100);
  const maxDiscount = appliedVoucher.value.voucher?.max_discount;
  return maxDiscount ? Math.min(discount, maxDiscount) : discount;
});

const total = computed(() => Math.max(0, subtotal.value + shippingFee.value - discountAmount.value));

const isAllSelected = computed(() => !!cart.value?.items?.length && selectedItems.value.length === cart.value.items.length);

const fetchCart = async () => {
  try {
    loading.value = true;
    const userId = authData.value?.user?._id;
    console.log(authData.value?.user);
    if (!userId) return;
    const cartData = await GioHangService.getGioHangByUserId(userId);
    if (cartData?.items?.length > 0) {
      cart.value = cartData;
      console.log('cartData:', cartData);
      selectedItems.value = cartData.items.map(item => item._id!).filter(Boolean);
    } else {
      cart.value = null;
      selectedItems.value = [];
    }
  } catch (error: any) {
    // Xử lý lỗi auth - chuyển hướng đến trang đăng nhập
    if (error.message && error.message.includes('Phiên đăng nhập đã hết hạn')) {
      toast.add({ severity: "error", summary: "Lỗi", detail: error.message, life: 3000 });
      router.push('/dang-nhap');
      return;
    }
    toast.add({ severity: "error", summary: "Lỗi", detail: "Không thể lấy thông tin giỏ hàng", life: 3000 });
  } finally {
    loading.value = false;
  }
};

const updateQuantity = async (itemId: string, newQuantity: number) => {
  if (newQuantity < 1) return;
  try {
    const userId = authData.value?.user?._id;
    if (!userId) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng đăng nhập', life: 3000 });
      return;
    }
    const item = cart.value?.items?.find(item => item._id === itemId);
    if (!item || !item.book_id?._id) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy sản phẩm', life: 3000 });
      return;
    }
    await GioHangService.updateQuantity(userId, item.book_id._id, newQuantity);
    await fetchCart();
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật số lượng thành công', life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật số lượng', life: 3000 });
  }
};

const removeItem = async (itemId: string) => {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
  try {
    const userId = authData.value?.user?._id;
    if (!userId) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng đăng nhập', life: 3000 });
      return;
    }
    const item = cart.value?.items?.find(item => item._id === itemId);
    if (!item || !item.book_id?._id) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy sản phẩm', life: 3000 });
      return;
    }
    await GioHangService.removeItem(userId, item.book_id._id);
    await fetchCart();
    selectedItems.value = selectedItems.value.filter(id => id !== itemId);
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa sản phẩm khỏi giỏ hàng', life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa sản phẩm', life: 3000 });
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = cart.value?.items?.map(item => item._id!) || [];
  }
};

const toggleSelectItem = (itemId: string) => {
  const index = selectedItems.value.indexOf(itemId);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(itemId);
  }
};

const applyDiscountCode = async () => {
  if (!discountCode.value.trim()) {
    toast.add({ severity: 'warn', summary: 'Thông báo', detail: 'Vui lòng nhập mã giảm giá', life: 3000 });
    return;
  }
  if (!authData.value?.user?._id) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng đăng nhập để sử dụng voucher', life: 3000 });
    return;
  }
  try {
    validatingVoucher.value = true;
    const voucherData = await VoucherService.validateVoucher(
      discountCode.value.trim().toUpperCase(),
      authData.value.user._id,
      subtotal.value
    );
    if (voucherData) {
      appliedVoucher.value = voucherData;
      toast.add({ severity: 'success', summary: 'Thành công', detail: `Áp dụng voucher thành công!`, life: 3000 });
      discountCode.value = '';
    } else {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Mã giảm giá không hợp lệ hoặc không thể sử dụng', life: 3000 });
    }
  } catch {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi áp dụng voucher. Vui lòng thử lại.', life: 3000 });
  } finally {
    validatingVoucher.value = false;
  }
};

const removeAppliedVoucher = () => {
  appliedVoucher.value = null;
  toast.add({ severity: 'info', summary: 'Thông báo', detail: 'Đã hủy áp dụng voucher', life: 3000 });
};

const proceedToCheckout = async () => {
  if (selectedItems.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Thông báo',
      detail: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán',
      life: 3000
    });
    return;
  }
  
  try {
    const result = await ThanhToanService.createOrder(
      authData.value?.user?._id!,
      selectedItemsData.value.map(item => ({
        book_id: item.book_id?._id!,
        quantity: item.quantity!,
        price: item.price!
      })),
      'Hà Nội', // shipping_address
      'payos', // payment_method
      appliedVoucher.value?.voucher?._id || undefined, // voucher_id
      '', // note
      shippingFee.value, // shipping_fee
      discountAmount.value // discount_amount
    );

    if (result) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đơn hàng đã được tạo thành công!',
        life: 3000
      });
      
      // Lưu danh sách items đã chọn để xóa sau khi thanh toán thành công
      sessionStorage.setItem('pendingOrderItems', JSON.stringify({
        orderId: result._id,
        selectedItems: selectedItems.value,
        userId: authData.value?.user?._id
      }));
      
      // Chuyển đến trang thanh toán PayOS (không xóa items khỏi giỏ hàng)
      router.push(`/thanh-toan/${result._id}`);
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Tạo đơn hàng thất bại!',
        life: 3000
      });
    }
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.',
      life: 3000
    });
  }
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
        <div class="text-6xl mb-4">🛒</div>
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
                      :modelValue="selectedItems.includes(item._id!)"
                      @update:modelValue="toggleSelectItem(item._id!)"
                      :inputId="`item-${item._id}`"
                      binary 
                    />
                  </div>

                  <!-- Book image -->
                  <div class="flex-shrink-0">
                    <img 
                      :src="item.book_id?.image_link || '/placeholder.jpg'" 
                      :alt="item.book_id?.title || 'Không có tiêu đề'"
                      class="w-20 h-24 object-cover rounded-lg shadow-sm"
                    />
                  </div>

                  <!-- Book info -->
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-900 line-clamp-2 mb-1">
                      {{ item.book_id?.title ?? 'Không có tiêu đề' }}
                    </h3>
                    <p class="text-sm text-gray-600 mb-1">{{ item.book_id?.author ?? 'Không có tác giả' }}</p>
                    <p class="text-sm text-gray-500">{{ item.book_id?.publisher ?? 'Không có nhà xuất bản' }}</p>
                    
                    <div class="mt-3 flex items-center justify-between">
                      <!-- Price -->
                      <div class="flex items-baseline space-x-2">
                        <span class="text-lg font-bold text-red-600">
                          {{ (item.price ?? 0).toLocaleString() }}đ
                        </span>
                        <span class="text-sm text-gray-500 line-through">
                          {{ ((item.price ?? 0) * 1.2).toLocaleString() }}đ
                        </span>
                      </div>

                      <!-- Quantity controls -->
                      <div class="flex items-center space-x-3">
                        <div class="flex items-center border rounded-lg">
                          <button 
                            @click="updateQuantity(item._id!, item.quantity! - 1)"
                            :disabled="(item.quantity ?? 0) <= 1"
                            class="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <i class="pi pi-minus text-sm"></i>
                          </button>
                          <span class="px-4 py-1 border-x min-w-[3rem] text-center">
                            {{ item.quantity ?? 0 }}
                          </span>
                          <button 
                            @click="updateQuantity(item._id!, item.quantity! + 1)"
                            class="px-3 py-1 hover:bg-gray-100"
                          >
                            <i class="pi pi-plus text-sm"></i>
                          </button>
                        </div>

                        <!-- Remove button -->
                        <button 
                          @click="removeItem(item._id!)"
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
            
            <!-- Voucher section -->
            <div class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="font-semibold text-gray-900 mb-4">Mã giảm giá</h3>
              
              <!-- Nếu chưa có voucher được áp dụng -->
              <div v-if="!appliedVoucher" class="space-y-3">
                <div class="flex gap-3">
                  <input
                    v-model="discountCode"
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    @keyup.enter="applyDiscountCode"
                    :disabled="validatingVoucher"
                  />
                  <Button
                    @click="applyDiscountCode"
                    :loading="validatingVoucher"
                    :disabled="!discountCode.trim() || validatingVoucher"
                    class="px-6 py-2 !bg-blue-600 hover:!bg-blue-700 disabled:!opacity-50"
                  >
                    {{ validatingVoucher ? 'Đang kiểm tra...' : 'Áp dụng' }}
                  </Button>
                </div>

                <div class="text-sm text-gray-600">
                  💡 Nhập mã giảm giá để xem giá mới sau khi áp dụng
                </div>
              </div>

              <!-- Nếu đã có voucher được áp dụng -->
              <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <i class="pi pi-check-circle text-green-600"></i>
                    <div>
                      <div class="font-semibold text-green-800">{{ appliedVoucher.voucher.code }}</div>
                      <div class="text-sm text-green-600">
                        Giảm {{ appliedVoucher.discount }}% cho đơn hàng
                      </div>
                      <div class="text-sm text-green-600">
                        Tiết kiệm: {{ discountAmount.toLocaleString() }}đ
                      </div>
                    </div>
                  </div>
                  <Button
                    @click="removeAppliedVoucher"
                    class="!text-red-600 hover:!text-red-800 !p-2"
                    text
                  >
                    <i class="pi pi-times"></i>
                  </Button>
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
                  <span class="font-medium text-green-600">
                    {{ shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString() + 'đ' }}
                  </span>
                </div>

                <!-- Hiển thị discount nếu có -->
                <div v-if="appliedVoucher && discountAmount > 0" class="flex justify-between text-green-600">
                  <span>Giảm giá ({{ appliedVoucher.voucher.code }})</span>
                  <span>-{{ discountAmount.toLocaleString() }}đ</span>
                </div>

                <Divider />
                
                <div class="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span class="text-red-600">{{ total.toLocaleString() }}đ</span>
                </div>

                <!-- Hiển thị số tiền tiết kiệm nếu có voucher -->
                <div v-if="appliedVoucher && discountAmount > 0" class="text-center text-green-600 font-medium">
                  🎉 Bạn tiết kiệm được {{ discountAmount.toLocaleString() }}đ!
                </div>
              </div>

              <Button 
                @click="proceedToCheckout"
                :disabled="selectedItems.length === 0"
                class="w-full mt-6 !bg-red-500 hover:!bg-red-600 !py-3 !font-semibold"
              >
                <i class="pi pi-arrow-right mr-2"></i>
                Tiến hành thanh toán ({{ selectedItems.length }} sản phẩm)
              </Button>
              
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
                  <p v-if="subtotal < 500000" class="text-sm text-blue-600 mt-1">
                    Thêm {{ (500000 - subtotal).toLocaleString() }}đ để được miễn phí ship
                  </p>
                  <p v-else class="text-sm text-green-600 mt-1">
                    ✅ Bạn được miễn phí vận chuyển!
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
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>