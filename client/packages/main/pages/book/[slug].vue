<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import { ref, onMounted } from 'vue';
  import { BookService } from '~/packages/base/services/book.service';
  import { GioHangService } from '~/packages/base/services/gio-hang.service';
  import type { BookModel } from '~/packages/base/models/dto/response/book/book.model';
  import { useToast } from 'primevue/usetoast';

  definePageMeta({
    layout: 'default',
    auth: false,
  });

  const route = useRoute();
  const slug = route.params.slug as string;
  const book = ref<BookModel | null>(null);
  const quantity = ref(1);
  const toast = useToast();
  const { data: user } = useAuth();
  onMounted(async () => {
    const data = await BookService.getBookBySlug(slug);
    book.value = data || null;
  });

  const handleAddToCart = async () => {
    try {
      if (!book.value?._id) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy thông tin sách', life: 3000 });
        return;
      }

      if (!user.value?.user?._id) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng đăng nhập để thêm vào giỏ hàng', life: 3000 });
        return;
      }

      const result = await GioHangService.addToCart(
        user.value.user._id,
        book.value._id,
        quantity.value
      );

      if (result) {
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm vào giỏ hàng', life: 3000 });
      } else {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm vào giỏ hàng', life: 3000 });
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi thêm vào giỏ hàng', life: 3000 });
    }
  };
</script>

<template>
  <div class="region-wrap-main" style="background-color: #f5f5f5;">
    <Toast />
    <div v-if="book" class="max-w-7xl mx-auto px-4 py-10">
    <!-- Breadcrumb -->
    <nav class="text-sm text-gray-500 mb-6">
      <NuxtLink to="/" class="hover:underline text-blue-600">Trang chủ</NuxtLink>
      <span class="mx-2">/</span>
      <NuxtLink to="/categories" class="hover:underline text-blue-600">Danh mục</NuxtLink>
      <span class="mx-2">/</span>
      <span class="text-gray-700 font-semibold">{{ book.title }}</span>
    </nav>

    <!-- Card Layout: 2 columns with ratio 1:2 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Left Column: Image -->
        <div class="col-span-1 flex flex-col items-center md:items-start">
          <img :src="book.image_link || '/placeholder.jpg'" :alt="book.title" class="w-64 h-auto rounded-lg shadow-md mb-4" />
          <div class="grid grid-cols-4 gap-2">
            <img v-for="n in 3" :key="n" :src="book.image_link || '/placeholder.jpg'" class="w-16 h-20 object-cover rounded border" />
            <div class="w-16 h-20 flex items-center justify-center border rounded text-xs text-gray-600">+3</div>
          </div>
        </div>

        <!-- Right Column: Book Information -->
        <div class="col-span-2 flex flex-col gap-4">
          <div class="text-sm text-orange-600 font-semibold uppercase">Xu hướng 🔥</div>
          <h1 class="text-2xl font-bold text-gray-800 leading-snug">{{ book.title }}</h1>

          <div class="text-sm text-gray-700 space-y-1">
            <p><span class="font-semibold">Tác giả:</span> {{ book.author }}</p>
            <p><span class="font-semibold">Nhà xuất bản:</span> {{ book.publisher }}</p>
            <p><span class="font-semibold">Nhà cung cấp:</span> {{ book.provider || 'Đang cập nhật' }}</p>
            <p><span class="font-semibold">Hình thức bìa:</span> {{ book.cover_type || 'Bìa mềm' }}</p>
          </div>

          <div class="flex items-center gap-3 mt-2 text-sm text-gray-700">
            <span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">⭐ {{ book.rating || '4.5' }}/5</span>
            <span class="text-gray-500">Đã bán: 3</span>
            <span class="text-green-600">Còn hàng</span>
          </div>

          <!-- Price and Discount -->
          <div class="flex items-baseline gap-4">
            <span class="text-red-600 text-2xl font-bold">{{ book.price }} đ</span>
            <span class="line-through text-gray-500 text-sm">{{ book.price + 20000 }} đ</span>
            <span class="bg-red-100 text-red-600 text-sm font-semibold px-2 py-1 rounded">-20%</span>
          </div>

          <!-- Flash Sale Bar -->
          <div class="bg-gray-100 w-full h-3 rounded-full overflow-hidden">
            <div class="bg-red-500 h-full w-[12%]"></div>
          </div>
          <p class="text-xs text-gray-500 italic">Chỉ còn 8 sản phẩm - Nhanh tay!</p>

          <!-- Add to Cart and Wishlist -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-4 mt-4">
            <input 
              type="number" 
              v-model="quantity"
              min="1" 
              class="w-20 border px-2 py-1 rounded text-sm" 
            />
            <button 
              @click="handleAddToCart"
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded text-sm font-semibold"
            >
              <i class="pi pi-shopping-cart mr-2"></i>Thêm vào giỏ hàng
            </button>
            <button class="border border-gray-300 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-100">
              <i class="pi pi-heart mr-1"></i>Yêu thích
            </button>
          </div>
        </div>
      </div>

      <!-- Book Description -->
      <div class="mt-12 border-t pt-8">
        <h2 class="text-xl font-bold mb-4">Mô tả sản phẩm</h2>
        <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
          {{ book.description || 'Chưa có mô tả chi tiết cho cuốn sách này.' }}
        </p>
      </div>
    </div>
  </div>

  <!-- Loading hoặc lỗi -->
  <div v-else class="text-center text-gray-500 py-20">Đang tải chi tiết sách...</div>
  </div>

</template>

<style scoped>
/* Responsive và style nhỏ nếu muốn thêm */
</style>  