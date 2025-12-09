<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useWishlistStore } from '~/packages/base/stores/wishlist.store';
import { BookService } from '~/packages/base/services/book.service';

definePageMeta({
  layout: 'default',
  auth: false,
});

const wishlistStore = useWishlistStore();
const router = useRouter();
const toast = useToast();
const refreshing = ref(false);

const formatPrice = (value?: number) => {
  const safe = typeof value === 'number' ? value : 0;
  return safe.toLocaleString('vi-VN') + ' đ';
};

const refreshWishlistData = async () => {
  try {
    refreshing.value = true;
    wishlistStore.init();
    if (!wishlistStore.items.length) return;
    // Lấy lại thông tin sách mới nhất theo id
    const updatedItems = await Promise.all(
      wishlistStore.items.map(async (item) => {
        if (!item._id) return null;
        const latest = await BookService.getBookById(item._id);
        if (!latest) return item;
        return {
          ...item,
          title: latest.title || item.title,
          author: latest.author || item.author,
          price: latest.price ?? item.price,
          image_link: latest.image_link || item.image_link,
          slug: latest.slug || item.slug,
        };
      })
    );
    wishlistStore.items = updatedItems.filter(Boolean) as any;
    wishlistStore.persist();
  } catch (error) {
    console.error('Không thể cập nhật danh sách yêu thích:', error);
  } finally {
    refreshing.value = false;
  }
};

onMounted(() => {
  wishlistStore.init();
  refreshWishlistData();
});

const hasItems = computed(() => wishlistStore.total > 0);

const viewBook = (item) => {
  if (item.slug) {
    router.push(`/book/${item.slug}`);
    return;
  }
  router.push(`/book/${item._id}`);
};

const removeItem = (bookId: string) => {
  wishlistStore.remove(bookId);
  toast.add({
    severity: 'info',
    summary: 'Đã gỡ yêu thích',
    detail: 'Sách đã được xóa khỏi danh sách yêu thích',
    life: 2000,
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <Toast />
    <div class="max-w-6xl mx-auto px-4">
      <div class="text-center mb-10">
        <p class="text-sm uppercase tracking-wider text-blue-500 font-semibold">Danh sách cá nhân</p>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Sách yêu thích của bạn</h1>
        <p class="text-gray-600 mt-2">Quản lý nhanh danh sách các tựa sách muốn mua sau</p>
      </div>

      <div v-if="!hasItems" class="bg-white rounded-2xl shadow-sm p-10 text-center">
        <div class="text-5xl mb-4">💔</div>
        <p class="text-lg text-gray-700 mb-2">Bạn chưa lưu cuốn sách nào</p>
        <p class="text-gray-500 mb-6">Hãy khám phá và thêm sách vào danh sách yêu thích để dễ dàng mua sắm hơn.</p>
        <Button label="Khám phá ngay" class="!bg-blue-600 hover:!bg-blue-700 !border-blue-600" @click="router.push('/')" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-if="refreshing" class="sm:col-span-2 lg:col-span-3 text-sm text-gray-500 mb-2">Đang đồng bộ giá và thông tin sách...</div>
        <div
          v-for="item in wishlistStore.items"
          :key="item._id"
          class="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col"
        >
          <div class="relative group cursor-pointer" @click="viewBook(item)">
            <img :src="item.image_link || '/placeholder.jpg'" :alt="item.title" class="w-full h-64 object-cover rounded-xl" />
            <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition rounded-xl"></div>
            <Button
              icon="pi pi-times"
              text
              class="!absolute top-3 right-3 !text-white"
              @click.stop="removeItem(item._id)"
            />
          </div>

          <div class="mt-4 flex-1 flex flex-col">
            <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">{{ item.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ item.author || 'Chưa cập nhật tác giả' }}</p>
            <div class="mt-4 flex items-center justify-between">
              <span class="text-xl font-bold text-red-600">{{ formatPrice(item.price) }}</span>
              <Button label="Xem chi tiết" text class="!text-blue-600 hover:!text-blue-800" @click="viewBook(item)" />
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
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>
