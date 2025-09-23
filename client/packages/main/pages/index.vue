<script lang="ts" setup>
import { BookService } from '~/packages/base/services/book.service';
import Carousel from 'primevue/carousel';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import { ref, computed, nextTick, onMounted } from 'vue';
import type { BookModel } from '~/packages/base/models/dto/response/book/book.model';
import { definePageMeta } from '#imports';
import Dialog from 'primevue/dialog';

definePageMeta({
  layout: 'default',
  auth: false,
});

const loading = ref(true);
const listBook = ref<BookModel[]>([]);

const onLoadTable = () => {
  loading.value = true;
  BookService.getAllBook()
    .then((res) => {
      listBook.value = res?.data || [];
    })
    .catch((error) => {
      console.error('Error loading data:', error);
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  onLoadTable();
});

function toSlug(title: string): string {
  const vietnameseMap = { đ: 'd', Đ: 'D' };
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (c) => vietnameseMap[c])
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

const books = computed(() =>
  listBook.value.map((book) => ({
    ...book,
    image: book.image_link || '/placeholder.jpg',
    slug: toSlug(book.title),
  }))
);

const op = ref();
const selectedProduct = ref<BookModel | null>(null);

const displayProduct = (event: Event, product: BookModel) => {
  selectedProduct.value = product;
  nextTick(() => {
    op.value?.show(event);
  });
};

const hidePopover = () => {
  op.value?.hide();
};

const categories = [
  { name: 'Văn học', icon: 'pi pi-book', color: 'bg-blue-500' },
  { name: 'Kinh tế', icon: 'pi pi-chart-line', color: 'bg-green-500' },
  { name: 'Kỹ năng sống', icon: 'pi pi-users', color: 'bg-purple-500' },
  { name: 'Thiếu nhi', icon: 'pi pi-star', color: 'bg-yellow-500' },
];

const showDealsModal = ref(false);

const openDealsModal = () => {
  showDealsModal.value = true;
};

const closeDealsModal = () => {
  showDealsModal.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div class="text-center space-y-6">
          <h1 class="text-4xl lg:text-6xl font-bold leading-tight">
            Chào mừng đến với 
            <span class="text-yellow-300">Bookkie</span> 📚
          </h1>
          <p class="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
            Khám phá hàng ngàn đầu sách chất lượng với giá tốt nhất
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button label="Khám phá ngay" class="!bg-yellow-400 hover:!bg-yellow-500 !text-gray-900 !px-8 !py-3 !rounded-full !font-semibold !text-lg !border-yellow-400 hover:!scale-105 !shadow-lg !transition-all" />
            <Button label="Xem ưu đãi" outlined class="!border-2 !border-white !text-white hover:!bg-white hover:!text-gray-900 !px-8 !py-3 !rounded-full !font-semibold !text-lg !transition-all" @click="openDealsModal" />
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      
      <!-- Featured Books Section -->
      <section class="mb-16">
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Sách nổi bật</h2>
            <p class="text-xl text-gray-600">Các tựa sách được yêu thích nhất hiện nay</p>
            <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <div v-if="loading" class="text-center py-12">
            <div class="inline-flex items-center space-x-2 text-gray-500">
              <i class="pi pi-spin pi-spinner text-2xl"></i>
              <span class="text-lg">Đang tải sách...</span>
            </div>
          </div>

          <Carousel v-else-if="books.length > 0" :value="books" :numVisible="4" :numScroll="2" :responsiveOptions="[
            { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
            { breakpoint: '768px', numVisible: 2, numScroll: 1 },
            { breakpoint: '560px', numVisible: 1, numScroll: 1 }
          ]">
            <template #item="slotProps">
              <div class="p-3">
                <div class="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                  <div class="relative overflow-hidden cursor-pointer" @click="displayProduct($event, slotProps.data)">
                    <NuxtLink :to="`/book/${slotProps.data.slug}`">
                      <img 
                        class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" 
                        :src="slotProps.data.image" 
                        :alt="slotProps.data.title" 
                      />
                    </NuxtLink>
                    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button icon="pi pi-heart" severity="secondary" outlined class="!bg-white/90 !border-none shadow-lg" />
                    </div>
                  </div>
                  
                  <div class="p-6">
                    <NuxtLink :to="`/book/${slotProps.data.slug}`">
                      <h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {{ slotProps.data.title }}
                      </h3>
                    </NuxtLink>
                    
                    <div class="flex items-center justify-between mt-4">
                      <div class="text-2xl font-bold text-red-600">
                        {{ slotProps.data.price }} đ
                      </div>
                      <Button icon="pi pi-shopping-cart" class="!bg-blue-600 hover:!bg-blue-700 !border-blue-600 shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Carousel>
        </div>
      </section>

      <!-- Bestsellers Section -->
      <section>
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Sách bán chạy</h2>
            <p class="text-xl text-gray-600">Những cuốn sách được mua nhiều nhất</p>
            <div class="w-24 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <Carousel v-if="books.length > 0" :value="books" :numVisible="4" :numScroll="2" :responsiveOptions="[
            { breakpoint: '1024px', numVisible: 3, numScroll: 1 },
            { breakpoint: '768px', numVisible: 2, numScroll: 1 },
            { breakpoint: '560px', numVisible: 1, numScroll: 1 }
          ]">
            <template #item="slotProps">
              <div class="p-3">
                <div class="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                  <div class="relative overflow-hidden cursor-pointer" @click="displayProduct($event, slotProps.data)">
                    <NuxtLink :to="`/book/${slotProps.data.slug}`">
                      <img 
                        class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" 
                        :src="slotProps.data.image" 
                        :alt="slotProps.data.title" 
                      />
                    </NuxtLink>
                    <div class="absolute top-4 left-4">
                      <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Bán chạy
                      </span>
                    </div>
                    <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button icon="pi pi-heart" severity="secondary" outlined class="!bg-white/90 !border-none shadow-lg" />
                    </div>
                  </div>
                  
                  <div class="p-6">
                    <NuxtLink :to="`/book/${slotProps.data.slug}`">
                      <h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {{ slotProps.data.title }}
                      </h3>
                    </NuxtLink>
                    
                    <div class="flex items-center justify-between mt-4">
                      <div class="text-2xl font-bold text-red-600">
                        {{ slotProps.data.price }} đ
                      </div>
                      <Button icon="pi pi-shopping-cart" class="!bg-blue-600 hover:!bg-blue-700 !border-blue-600 shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Carousel>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="mt-16">
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Danh mục sách</h2>
            <p class="text-xl text-gray-600">Khám phá các thể loại sách phong phú</p>
            <div class="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="category in categories" :key="category.name" 
                class="group cursor-pointer">
              <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2">
                <div :class="[category.color, 'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform']">
                  <i :class="[category.icon, 'text-2xl text-white']"></i>
                </div>
                <h3 class="text-lg font-semibold text-gray-900">{{ category.name }}</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Section -->
      <section class="mt-16">
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 class="text-3xl lg:text-4xl font-bold mb-4">
            Đăng ký nhận tin tức mới nhất
          </h2>
          <p class="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Nhận thông báo về sách mới, ưu đãi đặc biệt và các sự kiện thú vị
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Nhập email của bạn"
              class="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <Button label="Đăng ký" class="!bg-yellow-400 hover:!bg-yellow-500 !text-gray-900 !px-8 !py-3 !rounded-full !font-semibold !border-yellow-400 !shadow-lg" />
          </div>
        </div>
      </section>
    </div>

    <!-- Popover chi tiết sách (giữ nguyên logic) -->
    <Popover ref="op" v-if="selectedProduct">
      <div class="p-6 max-w-sm">
        <div class="flex flex-col items-center text-center">
          <img :src="selectedProduct.image" alt="Chi tiết sách" class="w-40 h-auto rounded-xl shadow-lg mb-4" />
          <div class="font-bold text-xl text-gray-900 mb-2">{{ selectedProduct.title }}</div>
          <p class="text-gray-600 text-sm mb-2">{{ selectedProduct.author }}</p>
          <div class="flex items-center justify-center gap-2 text-sm text-yellow-600 mb-3">
            <i class="pi pi-star-fill"></i> {{ selectedProduct.rating }} / 5
          </div>
          <div class="text-red-600 font-bold text-2xl mb-4">{{ selectedProduct.price }} đ</div>
          <div class="flex gap-3 w-full">
            <Button icon="pi pi-shopping-cart" label="Mua ngay" class="flex-1 !bg-red-500 hover:!bg-red-600 !border-red-500" @click="hidePopover" />
            <Button icon="pi pi-heart" outlined @click="hidePopover" />
          </div>
        </div>
      </div>
    </Popover>
    <!-- Deals Modal -->
    <Dialog v-model:visible="showDealsModal" modal header="🔥 Ưu đãi đặc biệt hôm nay" :style="{ width: '90vw', maxWidth: '800px' }" class="deals-modal">
      <div class="space-y-6">
        <!-- Flash Sale -->
        <!-- Flash Sale -->
        <div class="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-2xl font-bold">⚡ Flash Sale</h3>
            <div class="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
              Còn 2 giờ
            </div>
          </div>
          <p class="text-lg mb-4">Giảm đến 50% cho tất cả sách văn học</p>
          <Button label="Mua ngay" class="!bg-white !text-red-500 hover:!bg-gray-100 !font-semibold" />
        </div>

        <!-- Combo Deals -->
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-6 text-white">
            <h4 class="text-xl font-bold mb-2">📚 Combo 3 cuốn</h4>
            <p class="mb-4">Mua 3 tặng 1 - Tiết kiệm 25%</p>
            <Button label="Xem combo" outlined class="!border-white !text-white hover:!bg-white hover:!text-blue-500" />
          </div>
          
          <div class="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white">
            <h4 class="text-xl font-bold mb-2">🎁 Freeship</h4>
            <p class="mb-4">Miễn phí vận chuyển đơn từ 200k</p>
            <Button label="Áp dụng ngay" outlined class="!border-white !text-white hover:!bg-white hover:!text-green-500" />
          </div>
        </div>

        <!-- Voucher Codes -->
        <div class="bg-gray-50 rounded-xl p-6">
          <h4 class="text-xl font-bold text-gray-900 mb-4">🎫 Mã giảm giá</h4>
          <div class="grid gap-3">
            <div class="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
              <div>
                <span class="font-bold text-lg text-red-600">BOOK20</span>
                <p class="text-gray-600">Giảm 20% đơn từ 300k</p>
              </div>
              <Button label="Copy" size="small" outlined />
            </div>
            
            <div class="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
              <div>
                <span class="font-bold text-lg text-blue-600">NEWBIE15</span>
                <p class="text-gray-600">Giảm 15% cho khách hàng mới</p>
              </div>
              <Button label="Copy" size="small" outlined />
            </div>
          </div>
        </div>

        <!-- Member Benefits -->
        <div class="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-6">
          <h4 class="text-xl font-bold text-gray-900 mb-4">👑 Ưu đãi thành viên VIP</h4>
          <div class="grid md:grid-cols-3 gap-4 text-center">
            <div class="bg-white/80 rounded-lg p-4">
              <i class="pi pi-star text-2xl text-yellow-600 mb-2"></i>
              <p class="font-semibold">Tích điểm x2</p>
            </div>
            <div class="bg-white/80 rounded-lg p-4">
              <i class="pi pi-gift text-2xl text-red-600 mb-2"></i>
              <p class="font-semibold">Quà tặng sinh nhật</p>
            </div>
            <div class="bg-white/80 rounded-lg p-4">
              <i class="pi pi-truck text-2xl text-blue-600 mb-2"></i>
              <p class="font-semibold">Freeship không giới hạn</p>
            </div>
          </div>
          <div class="text-center mt-4">
            <Button label="Đăng ký VIP ngay" class="!bg-gray-900 !text-white hover:!bg-gray-800 !font-semibold" />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

:deep(.p-carousel-indicators) {
  margin-top: 1.5rem;
}

:deep(.p-carousel-indicator button) {
  background-color: #e5e7eb;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  transition: all 0.3s ease;
}

:deep(.p-carousel-indicator.p-highlight button) {
  background-color: #3b82f6;
  transform: scale(1.2);
}

:deep(.p-carousel-prev),
:deep(.p-carousel-next) {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(.p-carousel-prev:hover),
:deep(.p-carousel-next:hover) {
  background: white;
  color: #1f2937;
}
</style>