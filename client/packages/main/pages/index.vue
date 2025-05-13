<script lang="ts" setup>
import { BookService } from '~/packages/base/services/book.service';
import Carousel from 'primevue/carousel';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import { ref, computed, nextTick, onMounted } from 'vue';
import type { BookModel } from '~/packages/base/models/dto/response/book/book.model';

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
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Hero section -->
    <section class="bg-blue-100 py-10 text-center mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-blue-700">Chào mừng đến với BookStore 📚</h1>
      <p class="text-gray-700 mt-2 text-lg">Khám phá hàng ngàn đầu sách chất lượng với giá tốt nhất</p>
    </section>

    <div class="flex-1 bg-white px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Gợi ý thể loại -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12">
          <div v-for="cat in ['Văn học', 'Thiếu nhi', 'Kỹ năng', 'Ngoại ngữ']" :key="cat" class="text-center">
            <img :src="`https://placehold.co/100x100?text=${cat}`" :alt="`Thể loại ${cat}`" class="mx-auto rounded-full mb-2 border" />
            <p class="font-medium">{{ cat }}</p>
          </div>
        </div>

        <!-- Tiêu đề -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Sách nổi bật</h2>
          <p class="text-gray-500">Các tựa sách được yêu thích nhất hiện nay</p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8 text-gray-400">Đang tải sách...</div>

        <!-- Carousel sách nổi bật -->
        <Carousel v-else-if="books.length > 0" :value="books" :numVisible="4" :numScroll="2">
          <template #item="slotProps">
            <div class="border rounded shadow-sm hover:shadow-md transition-all m-2 p-4 bg-white cursor-pointer" @click="displayProduct($event, slotProps.data)">
              <NuxtLink :to="`/book/${slotProps.data.slug}`">
                <img class="w-full h-64 object-cover rounded mb-3" :src="slotProps.data.image" :alt="slotProps.data.title" />
                <h3 class="font-semibold text-sm line-clamp-2">{{ slotProps.data.title }}</h3>
                <p class="text-red-600 font-bold text-base mt-2">{{ slotProps.data.price }} đ</p>
              </NuxtLink>
              <div class="flex justify-between mt-3">
                <Button icon="pi pi-heart" severity="secondary" outlined />
                <Button icon="pi pi-shopping-cart" />
              </div>
            </div>
          </template>
        </Carousel>

        <!-- Tiêu đề Sách bán chạy -->
        <div class="mt-12 mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Sách bán chạy</h2>
          <p class="text-gray-500">Những cuốn sách được mua nhiều nhất</p>
        </div>

        <!-- Carousel sách bán chạy -->
        <Carousel v-if="books.length > 0" :value="books" :numVisible="4" :numScroll="2">
          <template #item="slotProps">
            <div class="border rounded shadow-sm hover:shadow-md transition-all m-2 p-4 bg-white cursor-pointer" @click="displayProduct($event, slotProps.data)">
              <NuxtLink :to="`/book/${slotProps.data.slug}`">
                <img class="w-full h-64 object-cover rounded mb-3" :src="slotProps.data.image" :alt="slotProps.data.title" />
                <h3 class="font-semibold text-sm line-clamp-2">{{ slotProps.data.title }}</h3>
                <p class="text-red-600 font-bold text-base mt-2">{{ slotProps.data.price }} đ</p>
              </NuxtLink>
              <div class="flex justify-between mt-3">
                <Button icon="pi pi-heart" severity="secondary" outlined />
                <Button icon="pi pi-shopping-cart" />
              </div>
            </div>
          </template>
        </Carousel>

        <!-- Popover chi tiết sách -->
        <Popover ref="op" v-if="selectedProduct">
          <div class="p-4 max-w-sm">
            <div class="flex flex-col items-center text-center">
              <img :src="selectedProduct.image" alt="Chi tiết sách" class="w-40 h-auto rounded shadow mb-4" />
              <div class="font-semibold text-lg">{{ selectedProduct.title }}</div>
              <p class="text-gray-600 text-sm mb-2">{{ selectedProduct.author }}</p>
              <div class="flex items-center justify-center gap-2 text-sm text-yellow-600">
                <i class="pi pi-star-fill"></i> {{ selectedProduct.rating }} / 5
              </div>
              <div class="text-red-600 font-bold text-lg mt-2">{{ selectedProduct.price }} đ</div>
              <div class="flex gap-2 mt-4">
                <Button icon="pi pi-shopping-cart" :label="'Mua ngay'" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" @click="hidePopover" />
                <Button icon="pi pi-heart" outlined @click="hidePopover" />
              </div>
            </div>
          </div>
        </Popover>
      </div>
    </div>

  </div>
</template>

<style scoped>
.p-carousel-indicators {
  margin-top: -30px;
}
</style>