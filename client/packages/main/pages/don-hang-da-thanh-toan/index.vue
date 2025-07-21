<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <Toast />
    
    <div class="max-w-7xl mx-auto px-4">
      <!-- Breadcrumb -->
      <div class="flex items-center text-sm text-gray-600 mb-6">
        <NuxtLink to="/" class="hover:text-blue-600">Trang chủ</NuxtLink>
        <i class="pi pi-angle-right mx-2 text-gray-400"></i>
        <span class="text-gray-800 font-medium">Đơn hàng đã thanh toán</span>
      </div>

      <!-- Page Title -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Đơn hàng đã thanh toán</h1>
        <div class="flex items-center space-x-4">
          <NuxtLink to="/gio-hang" class="text-blue-600 hover:underline flex items-center">
            <i class="pi pi-shopping-cart mr-1"></i>
            Giỏ hàng
          </NuxtLink>
          <NuxtLink to="/" class="text-blue-600 hover:underline flex items-center">
            <i class="pi pi-home mr-1"></i>
            Trang chủ
          </NuxtLink>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
        <p class="mt-4 text-gray-600 text-lg">Đang tải danh sách đơn hàng...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!orders || orders.length === 0" class="text-center py-16 bg-white rounded-xl shadow-sm">
        <div class="text-6xl mb-4">📦</div>
        <h3 class="text-xl font-medium text-gray-800 mb-2">Chưa có đơn hàng nào đã thanh toán</h3>
        <p class="text-gray-600 mb-6">Bạn chưa có đơn hàng nào đã được thanh toán thành công.</p>
        <NuxtLink to="/" class="inline-block bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition">
          Mua sắm ngay
        </NuxtLink>
      </div>

      <!-- Orders list -->
      <div v-else class="space-y-6">
        <div 
          v-for="order in orders" 
          :key="order._id"
          class="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
        >
          <!-- Order header -->
          <div class="p-6 border-b bg-gray-50 rounded-t-xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <i class="pi pi-check-circle text-green-600"></i>
                  <span class="font-semibold text-gray-900">Đơn hàng #{{ order.orderCode }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-600">Ngày đặt hàng</div>
                <div class="font-medium text-gray-900">{{ formatDate(order.createdAt) }}</div>
              </div>
            </div>
          </div>

          <!-- Order items -->
          <div class="p-6">
            <div class="space-y-4">
              <div 
                v-for="item in order.items" 
                :key="item._id"
                class="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
              >
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
                    {{ item.book_id?.title || 'Không có tiêu đề' }}
                  </h3>
                  <p class="text-sm text-gray-600 mb-1">{{ item.book_id?.author || 'Không có tác giả' }}</p>
                  <p class="text-sm text-gray-500">{{ item.book_id?.publisher || 'Không có nhà xuất bản' }}</p>
                  
                  <div class="mt-3 flex items-center justify-between">
                    <!-- Price and quantity -->
                    <div class="flex items-center space-x-4">
                      <span class="text-lg font-bold text-red-600">
                        {{ (item.price || 0).toLocaleString() }}đ
                      </span>
                      <span class="text-sm text-gray-600">x{{ item.quantity }}</span>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold text-gray-900">
                        {{ ((item.price || 0) * (item.quantity || 0)).toLocaleString() }}đ
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order summary -->
            <div class="mt-6 pt-6 border-t bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <div class="text-sm text-gray-600 mb-1">
                    <i class="pi pi-map-marker mr-1"></i>
                    Địa chỉ giao hàng: {{ order.shipping_address }}
                  </div>
                  <div class="text-sm text-gray-600">
                    <i class="pi pi-credit-card mr-1"></i>
                    Phương thức: {{ order.payment_method === 'payos' ? 'PayOS' : order.payment_method }}
                  </div>
                  <div v-if="order.note" class="text-sm text-gray-600 mt-1">
                    <i class="pi pi-comment mr-1"></i>
                    Ghi chú: {{ order.note }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm text-gray-600">Tổng tiền</div>
                  <div class="text-2xl font-bold text-red-600">
                    {{ (order.total_amount || 0).toLocaleString() }}đ
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-600">
                  <i class="pi pi-clock mr-1"></i>
                  Cập nhật lần cuối: {{ formatDate(order.updatedAt) }}
                </div>
                <div class="flex items-center space-x-3">
                  <Button 
                    label="Xem chi tiết" 
                    icon="pi pi-eye"
                    outlined 
                    size="small"
                    @click="viewOrderDetail(order._id)"
                  />
                  <Button 
                    v-if="order.status === 'paid'"
                    label="Mua lại" 
                    icon="pi pi-refresh"
                    size="small"
                    class="!bg-blue-600 hover:!bg-blue-700"
                    @click="reorderItems(order)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
          <Paginator 
            v-model:first="first" 
            :rows="limit" 
            :totalRecords="totalRecords"
            @page="onPageChange"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { ThanhToanService } from '~/packages/base/services/thanh-toan.service';
import { GioHangService } from '~/packages/base/services/gio-hang.service';

definePageMeta({
  layout: 'default',
  auth: true,
});

const { data: authData } = useAuth();
const toast = useToast();
const router = useRouter();

// State
const loading = ref(false);
const orders = ref([]);
const first = ref(0);
const limit = ref(10);
const totalRecords = ref(0);

// Computed
const totalPages = computed(() => Math.ceil(totalRecords.value / limit.value));
const currentPage = computed(() => Math.floor(first.value / limit.value) + 1);

// Methods
const fetchPaidOrders = async () => {
  try {
    loading.value = true;
    const userId = authData.value?.user?._id;
    
    if (!userId) {
      toast.add({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Vui lòng đăng nhập để xem đơn hàng', 
        life: 3000 
      });
      router.push('/login');
      return;
    }

    // Gọi API lấy đơn hàng đã thanh toán
    const paidOrders = await ThanhToanService.getUserPaidOrders();
    
    if (paidOrders) {
      orders.value = paidOrders;
      totalRecords.value = paidOrders.length;
    } else {
      orders.value = [];
      totalRecords.value = 0;
    }
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng đã thanh toán:', error);
    toast.add({ 
      severity: 'error', 
      summary: 'Lỗi', 
      detail: 'Có lỗi xảy ra khi tải danh sách đơn hàng', 
      life: 3000 
    });
  } finally {
    loading.value = false;
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
    'paid': 'Đã thanh toán',
    'processing': 'Đang xử lý',
    'shipped': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

const viewOrderDetail = (orderId) => {
  router.push(`/don-hang/${orderId}`);
};

const reorderItems = async (order) => {
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

    // Thêm từng sản phẩm vào giỏ hàng
    let successCount = 0;
    for (const item of order.items) {
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
      
      // Chuyển đến giỏ hàng
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

const onPageChange = (event) => {
  first.value = event.first;
  // Nếu cần phân trang từ server, gọi lại API ở đây
};

onMounted(() => {
  fetchPaidOrders();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 2;
}
</style>