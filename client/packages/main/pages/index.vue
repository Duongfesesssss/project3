<script lang="ts" setup>
import { BookService } from '~/packages/base/services/book.service';
import Carousel from 'primevue/carousel';
import Menubar from 'primevue/menubar';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Popover from 'primevue/popover';  // Import Popover
import { ref, computed, nextTick, onMounted } from 'vue';
import type { BookModel } from '~/packages/base/models/dto/response/book/book.model';

definePageMeta({
  layout: 'default',
});

const loading = ref(true);
const listBook = ref<BookModel[]>([]);

const onLoadTable = () => {
  loading.value = true;
  BookService.getAllBook()
    .then((res) => {
      if (res) {
        listBook.value = res.data;
      } else {
        listBook.value = [];
      }
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
  const vietnameseMap = {
    à: 'a', á: 'a', ạ: 'a', ả: 'a', ã: 'a', â: 'a', ầ: 'a', ấ: 'a', ậ: 'a', ẩ: 'a', ẫ: 'a', ă: 'a', ằ: 'a', ắ: 'a', ặ: 'a', ẳ: 'a', ẵ: 'a',
    è: 'e', é: 'e', ẹ: 'e', ẻ: 'e', ẽ: 'e', ê: 'e', ề: 'e', ế: 'e', ệ: 'e', ể: 'e', ễ: 'e',
    ì: 'i', í: 'i', ị: 'i', ỉ: 'i', ĩ: 'i',
    ò: 'o', ó: 'o', ọ: 'o', ỏ: 'o', õ: 'o', ô: 'o', ồ: 'o', ố: 'o', ộ: 'o', ổ: 'o', ỗ: 'o', ơ: 'o', ờ: 'o', ớ: 'o', ợ: 'o', ở: 'o', ỡ: 'o',
    ù: 'u', ú: 'u', ụ: 'u', ủ: 'u', ũ: 'u', ư: 'u', ừ: 'u', ứ: 'u', ự: 'u', ử: 'u', ữ: 'u',
    ỳ: 'y', ý: 'y', ỵ: 'y', ỷ: 'y', ỹ: 'y',
    đ: 'd',
    À: 'A', Á: 'A', Ạ: 'A', Ả: 'A', Ã: 'A', Â: 'A', Ầ: 'A', Ấ: 'A', Ậ: 'A', Ẩ: 'A', Ẫ: 'A', Ă: 'A', Ằ: 'A', Ắ: 'A', Ặ: 'A', Ẳ: 'A', Ẵ: 'A',
    È: 'E', É: 'E', Ẹ: 'E', Ẻ: 'E', Ẽ: 'E', Ê: 'E', Ề: 'E', Ế: 'E', Ệ: 'E', Ể: 'E', Ễ: 'E',
    Ì: 'I', Í: 'I', Ị: 'I', Ỉ: 'I', Ĩ: 'I',
    Ò: 'O', Ó: 'O', Ọ: 'O', Ỏ: 'O', Õ: 'O', Ô: 'O', Ồ: 'O', Ố: 'O', Ộ: 'O', Ổ: 'O', Ỗ: 'O', Ơ: 'O', Ờ: 'O', Ớ: 'O', Ợ: 'O', Ở: 'O', Ỡ: 'O',
    Ù: 'U', Ú: 'U', Ụ: 'U', Ủ: 'U', Ũ: 'U', Ư: 'U', Ừ: 'U', Ứ: 'U', Ự: 'U', Ử: 'U', Ữ: 'U',
    Ỳ: 'Y', Ý: 'Y', Ỵ: 'Y', Ỷ: 'Y', Ỹ: 'Y',
    Đ: 'D',
  };

  title = title.replace(/[^A-Za-z0-9\s]/g, (char) => vietnameseMap[char] || char);

  // Chuyển thành chữ thường, thay khoảng trắng bằng dấu gạch ngang, và loại bỏ ký tự đặc biệt
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-'); // Loại bỏ dấu gạch ngang thừa
}

const books = computed(() =>
  (listBook.value || []).map((book: any) => ({
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
    <header class="fixed top-0 left-0 right-0 z-50 shadow-md">
      <div class="max-w-7xl mx-auto px-4">
        <ClientOnly>

        </ClientOnly>
      </div>
    </header>

    <!-- <div class="h-16"></div> -->

    <div class="flex-1 bg-gray-50 py-6 px-4">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-semibold mb-4">Chào mừng đến với cửa hàng sách online!</h1>
        <p class="text-gray-600 mb-4">
          Duyệt qua hàng ngàn tựa sách hấp dẫn thuộc nhiều thể loại khác nhau.
        </p>

        <!-- Hiển thị Loading khi đang tải sách -->
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-400">Đang tải sách...</p>
        </div>

        <!-- Hiển thị sách trong Carousel -->
        <Carousel v-else-if="books.length > 0" :value="books" :numVisible="4" :numScroll="2">
          <template #item="slotProps">
            <NuxtLink
      :to="`/book/${slotProps.data.slug}`"
      class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4 cursor-pointer block"
    >
            <div
              class="border border-surface-200 dark:border-surface-700 rounded m-2 p-4 cursor-pointer"
              @click="displayProduct($event, slotProps.data)"
            >
              <div class="mb-4">
                <div class="relative mx-auto">
                  <img   class="w-full h-64  rounded"
                  :src="slotProps.data.image" :alt="slotProps.data.title" />
                </div>
              </div>
              <div class="mb-4 font-medium">{{ slotProps.data.title }}</div>
              <div class="flex justify-between items-center">
                <div class="mt-0 font-semibold text-xl">${{ slotProps.data.price }}</div>
                <span>
                  <Button icon="pi pi-heart" severity="secondary" outlined />
                  <Button icon="pi pi-shopping-cart" class="ml-2" />
                </span>
              </div>
            </div>
            </NuxtLink>
          </template>
        </Carousel>

        <!-- Hiển thị Popover cho sản phẩm được chọn -->
        <Popover ref="op" v-if="selectedProduct">
          <div v-if="selectedProduct" class="rounded flex flex-col">
            <div class="flex justify-center rounded">
              <div class="relative mx-auto">
                <img
                  class="rounded w-44 sm:w-64"
                />
              </div>
            </div>
            <div class="pt-4">
              <div class="flex flex-row justify-between items-start gap-2 mb-4">
                <div>
                  <span class="font-medium text-surface-500 dark:text-surface-400 text-sm">{{ selectedProduct.author }}</span> <!-- Tên tác giả -->
                  <div class="text-lg font-medium mt-1">{{ selectedProduct.title }}</div> <!-- Tiêu đề sách -->
                </div>
                <div class="bg-surface-100 p-1" style="border-radius: 30px">
                  <div
                    class="bg-surface-0 flex items-center gap-2 justify-center py-1 px-2"
                    style="border-radius: 30px; box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)"
                  >
                    <span class="text-surface-900 font-medium text-sm">{{ selectedProduct.rating }} ⭐</span> <!-- Rating của sản phẩm -->
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <Button icon="pi pi-shopping-cart" :label="'Buy Now | $' + selectedProduct.price" @click="hidePopover" />
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
/* Có thể thêm các styles tùy chỉnh tại đây nếu cần */
.p-carousel-indicators {
  margin-top: -30px;
}

html, body {
  background: none !important; /* Loại bỏ màu nền trắng */
} 
</style>
