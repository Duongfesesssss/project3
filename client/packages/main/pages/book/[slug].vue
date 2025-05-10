<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { BookService } from '~/packages/base/services/book.service';
import type { BookModel } from '~/packages/base/models/dto/response/book/book.model';

const route = useRoute();
const slug = route.params.slug;
const book =  ref<BookModel[]>([]);

onMounted(async () => {
  book.value = await BookService.getBookBySlug(slug);
});
console.log(book.value);
</script>

<template>
  <div class="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Hình ảnh sách -->
    <div class="flex flex-col items-center">
      <img :src="book.image_link || '/placeholder.jpg'" alt="Book Cover" class="w-72 h-auto rounded shadow-md" />
      <div class="mt-4 grid grid-cols-4 gap-2">
        <img v-for="n in 4" :key="n" :src="book.image_link || '/placeholder.jpg'" class="w-16 h-20 object-cover rounded border" />
        <div class="w-16 h-20 flex items-center justify-center border rounded text-sm text-gray-600">+3</div>
      </div>
    </div>

    <!-- Thông tin sách -->
    <div class="flex flex-col gap-4">
      <div class="text-sm text-orange-600 font-semibold uppercase">Xu hướng 🔥</div>
      <h1 class="text-2xl font-bold leading-snug">{{ book.title }}</h1>

      <div class="text-sm text-gray-700">
        <p><span class="font-semibold">Nhà cung cấp:</span> {{ book.provider || 'Đang cập nhật' }}</p>
        <p><span class="font-semibold">Nhà xuất bản:</span> {{ book.publisher }}</p>
        <p><span class="font-semibold">Tác giả:</span> {{ book.author }}</p>
        <p><span class="font-semibold">Hình thức bìa:</span> {{ book.cover_type || 'Bìa mềm' }}</p>
      </div>

      <div class="flex items-center gap-3">
        <span class="bg-red-500 text-white text-xs px-2 py-1 rounded font-semibold">FLASH SALE</span>
        <div class="flex gap-1 text-sm text-white font-semibold">
          <div class="bg-black px-2 py-1 rounded">00</div>
          <div class="bg-black px-2 py-1 rounded">00</div>
          <div class="bg-black px-2 py-1 rounded">00</div>
        </div>
      </div>

      <div class="flex items-baseline gap-4">
        <span class="text-red-600 text-2xl font-bold">{{ book.price }} đ</span>
        <span class="line-through text-gray-500 text-sm">{{ book.price }} đ</span>
        <span class="bg-red-100 text-red-600 text-sm font-semibold px-2 py-1 rounded">-20%</span>
      </div>

      <div class="bg-gray-100 w-full h-3 rounded-full overflow-hidden">
        <div class="bg-red-400 h-full w-[10%]"></div>
      </div>
      <p class="text-sm text-gray-500">Đã bán 3</p>

      <button class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 w-max">
        Thêm vào giỏ hàng
      </button>
    </div>
  </div>
</template>
