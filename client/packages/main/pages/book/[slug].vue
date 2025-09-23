<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { BookService } from '~/packages/base/services/book.service';
import { GioHangService } from '~/packages/base/services/gio-hang.service';
import type { BookModel } from '~/packages/base/models/dto/response/book/book.model';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import BookReviews from '@/packages/base/components/BookReviews.vue';

definePageMeta({
  layout: 'default',
  auth: false,
});

const route = useRoute();
const slug = route.params.slug as string;
const book = ref<BookModel | null>(null);
const quantity = ref(1);
const toast = useToast();
const { data: session } = useAuth();

onMounted(async () => {
  const data = await BookService.getBookBySlug(slug);
  book.value = data || null;
});

const handleAddToCart = () => {
  if (!book.value?._id) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không tìm thấy thông tin sách', life: 3000 });
    return;
  }

  if (!session.value?.user?._id) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng đăng nhập để thêm vào giỏ hàng', life: 3000 });
    return;
  }

  GioHangService.addToCart(
    session.value.user._id,
    book.value._id,
    quantity.value
  )
    .then((result) => {
      console.log(result);
      if (result) {
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm vào giỏ hàng', life: 3000 });
      } else {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm vào giỏ hàng', life: 3000 });
      }
    })
    .catch((error) => {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra khi thêm vào giỏ hàng', life: 3000 });
    });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Toast />
    
    <div v-if="book" class="max-w-7xl mx-auto px-4 py-6">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <NuxtLink to="/" class="hover:text-blue-600 transition-colors">SÁCH TIẾNG VIỆT</NuxtLink>
        <i class="pi pi-angle-right text-xs"></i>
        <NuxtLink to="/categories" class="hover:text-blue-600 transition-colors">KINH TẾ</NuxtLink>
        <i class="pi pi-angle-right text-xs"></i>
        <span class="text-gray-800 font-medium">{{ book.title }}</span>
      </nav>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column: Image Gallery -->
        <div class="lg:col-span-5">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <!-- Main Image -->
            <div class="mb-4">
              <img 
                :src="book.image_link || '/placeholder.jpg'" 
                :alt="book.title" 
                class="w-full max-w-md mx-auto rounded-lg shadow-md"
              />
            </div>
            
            <!-- Thumbnail Gallery -->
            <div class="flex justify-center space-x-2 mb-6">
              <div v-for="n in 4" :key="n" class="relative">
                <img 
                  :src="book.image_link || '/placeholder.jpg'" 
                  class="w-16 h-20 object-cover rounded border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
                />
                <div v-if="n === 4" class="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                  <span class="text-white text-sm font-semibold">+5</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <Button 
                @click="handleAddToCart"
                icon="pi pi-shopping-cart" 
                label="Thêm vào giỏ hàng" 
                outlined 
                class="w-full !border-red-500 !text-red-500 hover:!bg-red-50 !py-3"
              />
              <Button 
                label="Mua ngay" 
                class="w-full !bg-red-500 hover:!bg-red-600 !border-red-500 !py-3 !font-semibold"
              />
            </div>

            <!-- Store Policies -->
            <div class="mt-6 space-y-3 text-sm">
              <div class="flex items-center text-gray-700">
                <i class="pi pi-clock text-green-600 mr-2"></i>
                <span class="font-medium">Thời gian giao hàng:</span>
                <span class="ml-1">Giao nhanh và uy tín</span>
              </div>
              <div class="flex items-center text-gray-700">
                <i class="pi pi-refresh text-blue-600 mr-2"></i>
                <span class="font-medium">Chính sách đổi trả:</span>
                <span class="ml-1">Đổi trả miễn phí toàn quốc</span>
              </div>
              <div class="flex items-center text-gray-700">
                <i class="pi pi-users text-purple-600 mr-2"></i>
                <span class="font-medium">Chính sách khách sỉ:</span>
                <span class="ml-1">Ưu đãi khi mua số lượng lớn</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Book Information -->
        <div class="lg:col-span-7">
          <div class="bg-white rounded-lg shadow-sm p-6">
            
            <!-- Book Title and Basic Info -->
            <div class="mb-6">
              <div class="flex items-center mb-2">
              <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{{ book.title }}</h1>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mt-4">
              <div>
                <span class="font-medium">Nhà cung cấp:</span>
                  <span class="text-blue-600 ml-1">{{ book.supplier?.name || book.supplier || 'Rio Book' }}</span>
                </div>
                <div>
                  <span class="font-medium">Tác giả:</span>
                  <span class="ml-1">{{ book.author }}</span>
                </div>
                <div>
                  <span class="font-medium">Nhà xuất bản:</span>
                  <span class="ml-1">{{ book.publisher?.name || book.publisher || 'Chưa cập nhật' }}</span>
                </div>
                <div>
                  <span class="font-medium">Hình thức bìa:</span>
                  <span class="ml-1">Bìa Mềm</span>
                </div>
              </div>

              <!-- Rating and Sales -->
              <div class="flex items-center mt-4 space-x-4">
                <div class="flex items-center">
                  <div class="flex text-yellow-400 mr-1">
                    <i class="pi pi-star-fill text-sm"></i>
                    <i class="pi pi-star-fill text-sm"></i>
                    <i class="pi pi-star-fill text-sm"></i>
                    <i class="pi pi-star-fill text-sm"></i>
                    <i class="pi pi-star-fill text-sm"></i>
                  </div>
                  <span class="text-sm text-gray-600">(0 đánh giá)</span>
                </div>
                <div class="text-sm text-gray-600">
                  Đã bán <span class="font-semibold">174</span>
                </div>
              </div>
            </div>

            <!-- Flash Sale Section -->
            <div class="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-4 mb-6 text-white">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <span class="text-lg font-bold mr-3">⚡ FLASH SALE</span>
                  <div class="flex space-x-1">
                    <div class="bg-black bg-opacity-30 px-2 py-1 rounded text-sm font-bold">01</div>
                    <div class="bg-black bg-opacity-30 px-2 py-1 rounded text-sm font-bold">55</div>
                    <div class="bg-black bg-opacity-30 px-2 py-1 rounded text-sm font-bold">39</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm opacity-90">Đã bán</div>
                  <div class="font-bold">12</div>
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div class="bg-white bg-opacity-30 rounded-full h-2 mb-2">
                <div class="bg-white h-2 rounded-full w-[12%]"></div>
              </div>
            </div>

            <!-- Price Section -->
            <div class="mb-6">
              <div class="flex items-baseline space-x-3 mb-2">
                <span class="text-3xl font-bold text-red-600">{{ Number(book.price).toLocaleString() }}₫</span>
                <span class="text-lg text-gray-500 line-through">{{ Number((book.price || 0) + 20000).toLocaleString() }}₫</span>
                <span class="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">-24%</span>
              </div>
              <div class="text-sm text-blue-600 font-medium">4 nhà sách còn hàng</div>
            </div>

            <!-- Shipping Information -->
            <div class="border rounded-lg p-4 mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">Thông tin vận chuyển</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Giao hàng đến</span>
                  <span class="text-gray-900">Phường Bến Nghé, Quận 1, Hồ Chí Minh</span>
                  <button class="text-blue-600 hover:underline">Thay đổi</button>
                </div>
                <div class="flex items-center">
                  <i class="pi pi-truck text-green-600 mr-2"></i>
                  <span class="font-medium text-gray-900">Giao hàng tiêu chuẩn</span>
                </div>
                <div class="text-gray-600 ml-6">
                  Dự kiến giao <span class="font-medium">Thứ năm - 05/06</span>
                </div>
              </div>
            </div>

            <!-- Promotions -->
            <div class="mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">Ưu đãi liên quan</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <div class="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-3">
                    <i class="pi pi-percentage text-white text-sm"></i>
                  </div>
                  <div class="text-sm">
                    <div class="font-medium">Mã giảm 10k - to...</div>
                  </div>
                </div>
                <div class="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div class="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mr-3">
                    <i class="pi pi-credit-card text-white text-sm"></i>
                  </div>
                  <div class="text-sm">
                    <div class="font-medium">Home credit: giả...</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quantity Selector -->
            <div class="flex items-center space-x-4 mb-6">
              <span class="font-medium text-gray-900">Số lượng:</span>
              <div class="flex items-center border rounded">
                <button 
                  @click="quantity = Math.max(1, quantity - 1)"
                  class="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <i class="pi pi-minus text-sm"></i>
                </button>
                <input 
                  v-model="quantity"
                  type="number" 
                  min="1"
                  class="w-16 text-center py-2 border-0 focus:outline-none"
                />
                <button 
                  @click="quantity++"
                  class="px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <i class="pi pi-plus text-sm"></i>
                </button>
              </div>
            </div>

            <!-- Product Details -->
            <div class="border-t pt-6">
              <h3 class="font-semibold text-gray-900 mb-4">Thông tin chi tiết</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-600">Mã hàng</span>
                  <span class="font-medium">{{ book._id?.slice(-10) || '8936170870391' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-600">Tên Nhà Cung Cấp</span>
                  <span class="font-medium text-blue-600">{{ book.supplier?.name || 'Rio Book' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-600">Tác giả</span>
                  <span class="font-medium">{{ book.author }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-600">Nhà xuất bản</span>
                  <span class="font-medium">{{ book.publisher?.name || 'không có' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Book Description -->
      <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
        <div class="prose max-w-none text-gray-700 leading-relaxed mb-6">
          <p class="whitespace-pre-line">
            {{ book.description || 'Chưa có mô tả chi tiết cho cuốn sách này.' }}
          </p>
        </div>
        
        <!-- Audio Player Component -->
        <div v-if="book.description && book.description.trim().length > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">🎧 Nghe mô tả bằng giọng nói</h3>
          <AudioPlayer 
            :text="book.description" 
            :book-id="book._id"
          />
        </div>
      </div>

      <!-- Book Reviews Section -->
      <div v-if="book._id" class="mt-8">
        <BookReviews :book-id="book._id" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-3xl text-blue-600 mb-4"></i>
        <p class="text-gray-600 text-lg">Đang tải chi tiết sách...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose p {
  margin-bottom: 1rem;
}
</style>