<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <Toast />
    
    <div class="max-w-5xl mx-auto px-4">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-600 mb-6">
        <NuxtLink to="/" class="hover:text-blue-600">Trang chủ</NuxtLink>
        <i class="pi pi-angle-right mx-2 text-gray-400"></i>
        <NuxtLink to="/don-hang-da-thanh-toan" class="hover:text-blue-600">Đơn hàng đã thanh toán</NuxtLink>
        <i class="pi pi-angle-right mx-2 text-gray-400"></i>
        <span class="text-gray-800 font-medium">Chi tiết đơn hàng</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
        <p class="mt-4 text-gray-600 text-lg">Đang tải thông tin đơn hàng...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-16 bg-white rounded-xl shadow-sm">
        <div class="text-6xl mb-4">❌</div>
        <h3 class="text-xl font-medium text-gray-800 mb-2">Không tìm thấy đơn hàng</h3>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <NuxtLink to="/don-hang-da-thanh-toan" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition">
          Quay lại danh sách đơn hàng
        </NuxtLink>
      </div>

      <!-- Order detail -->
      <div v-else-if="order" class="space-y-6">
        
        <!-- Order header -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Chi tiết đơn hàng #{{ order.orderCode }}</h1>
              <div class="flex items-center space-x-4">
                <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                  {{ getStatusText(order.status) }}
                </span>
                <span class="text-sm text-gray-600">
                  <i class="pi pi-calendar mr-1"></i>
                  Đặt hàng: {{ formatDate(order.createdAt) }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-600 mb-1">Tổng tiền</div>
              <div class="text-3xl font-bold text-red-600">
                {{ (order.total_amount || 0).toLocaleString() }}đ
              </div>
            </div>
          </div>

          <!-- Order info summary -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div class="flex items-center space-x-3">
              <i class="pi pi-map-marker text-blue-600"></i>
              <div>
                <div class="text-sm text-gray-600">Địa chỉ giao hàng</div>
                <div class="font-medium">{{ order.shipping_address }}</div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <i class="pi pi-credit-card text-green-600"></i>
              <div>
                <div class="text-sm text-gray-600">Phương thức thanh toán</div>
                <div class="font-medium">{{ getPaymentMethodText(order.payment_method) }}</div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <i class="pi pi-clock text-orange-600"></i>
              <div>
                <div class="text-sm text-gray-600">Cập nhật lần cuối</div>
                <div class="font-medium">{{ formatDate(order.updatedAt) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order items -->
        <div class="bg-white rounded-xl shadow-sm">
          <div class="p-6 border-b">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <i class="pi pi-list mr-2 text-blue-600"></i>
              Sản phẩm đã đặt ({{ order.items?.length || 0 }} sản phẩm)
            </h2>
          </div>
          
          <div class="p-6">
            <div class="space-y-6">
              <div 
                v-for="item in order.items" 
                :key="item._id"
                class="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-b-0"
              >
                <!-- Book image -->
                <div class="flex-shrink-0">
                  <img 
                    :src="item.book_id?.image_link || '/placeholder.jpg'" 
                    :alt="item.book_id?.title || 'Không có tiêu đề'"
                    class="w-24 h-32 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    @click="viewBookDetail(item.book_id)"
                  />
                </div>

                <!-- Book info -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600" 
                      @click="viewBookDetail(item.book_id)">
                    {{ item.book_id?.title || 'Không có tiêu đề' }}
                  </h3>
                  
                  <div class="space-y-1 mb-4">
                    <p class="text-sm text-gray-600">
                      <span class="font-medium">Tác giả:</span> {{ item.book_id?.author || 'Không có tác giả' }}
                    </p>
                    <p class="text-sm text-gray-600">
                      <span class="font-medium">Nhà xuất bản:</span> {{ item.book_id?.publisher || 'Không có nhà xuất bản' }}
                    </p>
                    <p v-if="item.book_id?.category" class="text-sm text-gray-600">
                      <span class="font-medium">Thể loại:</span> {{ item.book_id.category }}
                    </p>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="text-lg font-bold text-red-600">
                        {{ (item.price || 0).toLocaleString() }}đ
                      </div>
                      <div class="text-sm text-gray-600">
                        Số lượng: <span class="font-medium">{{ item.quantity }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-sm text-gray-600">Thành tiền</div>
                      <div class="text-xl font-bold text-gray-900">
                        {{ ((item.price || 0) * (item.quantity || 0)).toLocaleString() }}đ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order summary and voucher info -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Payment breakdown -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i class="pi pi-calculator mr-2 text-green-600"></i>
              Chi tiết thanh toán
            </h3>
            
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Tạm tính ({{ getTotalQuantity() }} sản phẩm)</span>
                <span class="font-medium">{{ getSubtotal().toLocaleString() }}đ</span>
              </div>
              
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Phí vận chuyển</span>
                <span class="font-medium text-green-600">
                  {{ getShippingFee() === 0 ? 'Miễn phí' : getShippingFee().toLocaleString() + 'đ' }}
                </span>
              </div>
              
              <div v-if="order.voucher" class="flex justify-between text-sm">
                <span class="text-gray-600">Giảm giá (Voucher)</span>
                <span class="font-medium text-green-600">-{{ getDiscountAmount().toLocaleString() }}đ</span>
              </div>
              
              <Divider />
              
              <div class="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span class="text-red-600">{{ (order.total_amount || 0).toLocaleString() }}đ</span>
              </div>
            </div>
          </div>

          <!-- Voucher and note info -->
          <div class="space-y-6">
            
            <!-- Voucher info -->
            <div v-if="order.voucher" class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="pi pi-tag mr-2 text-purple-600"></i>
                Mã giảm giá đã sử dụng
              </h3>
              
              <div class="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-semibold text-purple-800">{{ voucherInfo?.code || 'N/A' }}</div>
                    <div class="text-sm text-purple-600 mt-1">{{ voucherInfo?.description || 'Mã giảm giá' }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-purple-700">-{{ getDiscountAmount().toLocaleString() }}đ</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order note -->
            <div v-if="order.note" class="bg-white rounded-xl shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="pi pi-comment mr-2 text-blue-600"></i>
                Ghi chú đơn hàng
              </h3>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-gray-700">{{ order.note }}</p>
              </div>
            </div>

            <!-- Empty state for additional info -->
            <div v-if="!order.voucher && !order.note" class="bg-white rounded-xl shadow-sm p-6">
              <div class="text-center text-gray-500">
                <i class="pi pi-info-circle text-4xl mb-2"></i>
                <p>Không có thông tin bổ sung</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <Button 
              label="Quay lại danh sách" 
              icon="pi pi-arrow-left"
              outlined
              @click="goBack"
            />
            
            <div class="flex items-center space-x-3">
              <Button 
                v-if="order.status === 'paid'"
                label="Mua lại đơn hàng" 
                icon="pi pi-refresh"
                class="!bg-blue-600 hover:!bg-blue-700"
                @click="reorderItems"
              />
              
              <Button 
                label="In đơn hàng" 
                icon="pi pi-print"
                outlined
                @click="printOrder"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { ThanhToanService } from '~/packages/base/services/thanh-toan.service';
import { GioHangService } from '~/packages/base/services/gio-hang.service';
import { VoucherService } from '~/packages/base/services/voucher.service';

definePageMeta({
  layout: 'default',
  auth: true,
});

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { data: authData } = useAuth();

// State
const loading = ref(false);
const order = ref(null);
const voucherInfo = ref(null);
const error = ref('');

// Computed
const orderId = computed(() => route.params.id);

// Methods
const fetchOrderDetail = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const orderData = await ThanhToanService.getOrderDetail(orderId.value);
    
    if (orderData) {
      order.value = orderData;
      
      // Lấy thông tin voucher nếu có
      if (orderData.voucher) {
        await fetchVoucherInfo(orderData.voucher);
      }
    } else {
      error.value = 'Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này.';
    }
  } catch (err) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', err);
    error.value = 'Có lỗi xảy ra khi tải thông tin đơn hàng. Vui lòng thử lại.';
  } finally {
    loading.value = false;
  }
};

const fetchVoucherInfo = async (voucherId) => {
  try {
    // Giả sử có API lấy thông tin voucher
    const voucher = await VoucherService.getVoucherById(voucherId);
    if (voucher) {
      voucherInfo.value = voucher;
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin voucher:', error);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Chờ thanh toán',
    'paid': 'Đã thanh toán',
    'processing': 'Đang xử lý',
    'shipped': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const statusClasses = {
    'pending': 'bg-yellow-100 text-yellow-700',
    'paid': 'bg-green-100 text-green-700',
    'processing': 'bg-blue-100 text-blue-700',
    'shipped': 'bg-purple-100 text-purple-700',
    'delivered': 'bg-green-100 text-green-700',
    'cancelled': 'bg-red-100 text-red-700'
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-700';
};

const getPaymentMethodText = (method) => {
  const methodMap = {
    'payos': 'PayOS',
    'cod': 'Thanh toán khi nhận hàng',
    'bank': 'Chuyển khoản ngân hàng',
    'momo': 'Ví MoMo',
    'zalopay': 'ZaloPay'
  };
  return methodMap[method] || method;
};

const getTotalQuantity = () => {
  if (!order.value?.items) return 0;
  return order.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
};

const getSubtotal = () => {
  if (!order.value?.items) return 0;
  return order.value.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
};

const getShippingFee = () => {
  const subtotal = getSubtotal();
  return subtotal >= 500000 ? 0 : 30000;
};

const getDiscountAmount = () => {
  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = order.value?.total_amount || 0;
  const calculatedTotal = subtotal + shippingFee;
  return Math.max(0, calculatedTotal - total);
};

const viewBookDetail = (book) => {
  if (book?.slug) {
    router.push(`/book/${book.slug}`);
  } else if (book?._id) {
    // Fallback về ID nếu không có slug
    router.push(`/book/${book._id}`);
  }
};

const goBack = () => {
  router.push('/don-hang-da-thanh-toan');
};

const reorderItems = async () => {
  try {
    const userId = authData.value?.user?._id;
    if (!userId) {
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Vui lòng đăng nhập', 
        life: 3000 
      });
      return;
    }

    let successCount = 0;
    for (const item of order.value.items) {
      try {
        await GioHangService.addToCart(userId, item.book_id._id, item.quantity);
        successCount++;
      } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
      }
    }

    if (successCount > 0) {
      toast.add({ 
        severity: 'success', 
        summary: 'Thành công', 
        detail: `Đã thêm ${successCount} sản phẩm vào giỏ hàng`, 
        life: 3000 
      });
      
      setTimeout(() => {
        router.push('/gio-hang');
      }, 1500);
    } else {
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Không thể thêm sản phẩm vào giỏ hàng', 
        life: 3000 
      });
    }
  } catch (error) {
    console.error('Lỗi khi mua lại:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Có lỗi xảy ra khi mua lại đơn hàng', 
      life: 3000 
    });
  }
};

const printOrder = () => {
  window.print();
};

onMounted(() => {
  fetchOrderDetail();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>