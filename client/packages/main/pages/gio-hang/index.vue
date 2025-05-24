<template>
  <div class="min-h-screen py-12">
    <div class="max-w-7xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        <p class="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
      </div>

      <!-- Empty cart -->
      <div v-else-if="!cart" class="text-center py-16 rounded-xl shadow-sm">
        <i class="pi pi-shopping-cart text-6xl text-gray-300"></i>
        <p class="mt-4 text-gray-600 text-lg">Giỏ hàng của bạn đang trống</p>
        <NuxtLink to="/" class="mt-6 inline-block bg-primary text-white px-8 py-3 rounded-full hover:bg-primary-dark transition">
          Tiếp tục mua sắm
        </NuxtLink>
      </div>

      <!-- Cart content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left column - Book image and actions -->
        <div class="lg:col-span-1">
          <div class="rounded-xl shadow-sm p-6">
            <div class="aspect-[3/4] relative overflow-hidden rounded-lg">
              <img 
                :src="cart.items[0]?.book_id?.image_link || '/placeholder.jpg'" 
                :alt="cart.items[0]?.book_id?.title"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="mt-6 space-y-4">
              <button class="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition flex items-center justify-center gap-2">
                <i class="pi pi-shopping-cart"></i>
                Thêm vào giỏ hàng
              </button>
              <button class="w-full border-2 border-primary text-primary py-3 rounded-lg hover:bg-primary/5 transition flex items-center justify-center gap-2">
                <i class="pi pi-bolt"></i>
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        <!-- Right column - Book info and details -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Book info -->
          <div class="rounded-xl shadow-sm p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ cart.items[0]?.book_id?.title }}</h2>
            
            <div class="space-y-3 text-gray-600">
              <div class="flex items-center gap-2">
                <i class="pi pi-user text-gray-400"></i>
                <span>Tác giả: {{ cart.items[0]?.book_id?.author }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-building text-gray-400"></i>
                <span>Nhà xuất bản: {{ cart.items[0]?.book_id?.publisher }}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="pi pi-truck text-gray-400"></i>
                <span>Nhà cung cấp: {{ cart.items[0]?.book_id?.provider || 'Đang cập nhật' }}</span>
              </div>
            </div>

            <div class="mt-6 flex items-baseline gap-4">
              <span class="text-3xl font-bold text-red-600">{{ cart.items[0]?.price?.toLocaleString() }} đ</span>
              <span class="text-lg text-gray-500 line-through">{{ (cart.items[0]?.price * 1.2)?.toLocaleString() }} đ</span>
              <span class="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">-20%</span>
            </div>
          </div>

          <!-- Shipping and discounts -->
          <div class="rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Thông tin vận chuyển & Ưu đãi</h3>
            
            <!-- Shipping info -->
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                <div class="flex items-center gap-3">
                  <i class="pi pi-truck text-primary"></i>
                  <div>
                    <p class="font-medium text-gray-900">Miễn phí vận chuyển</p>
                    <p class="text-sm text-gray-500">Cho đơn hàng từ 500.000đ</p>
                  </div>
                </div>
                <span class="text-green-600 font-medium">Miễn phí</span>
              </div>

              <!-- Discount code -->
              <div class="border rounded-lg p-4">
                <div class="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Nhập mã giảm giá" 
                    class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition">
                    Áp dụng
                  </button>
                </div>
              </div>

              <!-- Available discounts -->
              <div class="space-y-2">
                <p class="font-medium text-gray-900">Mã giảm giá có thể áp dụng:</p>
                <div class="grid grid-cols-2 gap-4">
                  <div class="border rounded-lg p-3 hover:border-primary cursor-pointer transition">
                    <p class="font-medium text-primary">WELCOME10</p>
                    <p class="text-sm text-gray-500">Giảm 10% cho đơn hàng đầu tiên</p>
                  </div>
                  <div class="border rounded-lg p-3 hover:border-primary cursor-pointer transition">
                    <p class="font-medium text-primary">FREESHIP</p>
                    <p class="text-sm text-gray-500">Miễn phí vận chuyển cho mọi đơn hàng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order summary -->
          <div class="rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Tổng đơn hàng</h3>
            
            <div class="space-y-3">
              <div class="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{{ cart?.total_amount?.toLocaleString() }} đ</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span class="text-green-600">Miễn phí</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Giảm giá</span>
                <span class="text-red-600">-{{ (cart?.total_amount * 0.2)?.toLocaleString() }} đ</span>
              </div>
              <div class="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Tổng cộng</span>
                <span class="text-red-600">{{ (cart?.total_amount * 0.8)?.toLocaleString() }} đ</span>
              </div>
            </div>

            <button class="w-full mt-6 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition">
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { GioHangService } from '~/packages/base/services/gio-hang.service';

const { data: authData } = useAuth();
const toast = useToast();

// State
const cart = ref(null);
const loading = ref(false);

// Lấy giỏ hàng
const fetchCart = async () => {
  try {
    loading.value = true;

    const userId = authData.value?.user?._id;
    if (!userId) return;

    console.log("User ID:", userId);

    // Gọi API
    const res = await GioHangService.getGioHangByUserId(userId);
    console.log("Full response:", res);

    // Đúng chỗ lấy dữ liệu từ response.data
    const cartData = res?.data;

    // Kiểm tra và gán
    if (cartData?.items?.length > 0) {
      cart.value = cartData;
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

onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
.bg-primary {
  background: linear-gradient(90deg, #ff7e5f, #feb47b);
}

.bg-primary-dark {
  background: linear-gradient(90deg, #ff6b4f, #fea36b);
}

.text-primary {
  color: #ff7e5f;
}
</style>