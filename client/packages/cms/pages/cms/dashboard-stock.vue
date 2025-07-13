<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">📊 Dashboard Quản lý Kho</h1>
      <p class="text-gray-600">Tổng quan thống kê và quản lý hàng tồn kho</p>
    </div>

    <!-- Stock Statistics Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100 text-sm">Tổng số sách</p>
            <p class="text-3xl font-bold">{{ stockStats.total_books }}</p>
          </div>
          <i class="pi pi-book text-4xl text-blue-200" />
        </div>
      </div>

      <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-sm">Còn hàng</p>
            <p class="text-3xl font-bold">{{ stockStats.in_stock_count }}</p>
          </div>
          <i class="pi pi-check-circle text-4xl text-green-200" />
        </div>
      </div>

      <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-100 text-sm">Sắp hết hàng</p>
            <p class="text-3xl font-bold">{{ stockStats.low_stock_count }}</p>
          </div>
          <i class="pi pi-exclamation-triangle text-4xl text-orange-200" />
        </div>
      </div>

      <div class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-100 text-sm">Hết hàng</p>
            <p class="text-3xl font-bold">{{ stockStats.out_of_stock_count }}</p>
          </div>
          <i class="pi pi-times-circle text-4xl text-red-200" />
        </div>
      </div>
    </div>

    <!-- Financial Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-lg p-6 border">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">💰 Tổng quan tài chính</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-4 bg-green-50 rounded-lg">
            <span class="text-green-700 font-medium">Tổng giá trị kho hàng</span>
            <span class="text-2xl font-bold text-green-600">
              {{ formatCurrency(stockStats.total_stock_value) }}
            </span>
          </div>
          <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <span class="text-blue-700 font-medium">Giá trị trung bình/sách</span>
            <span class="text-xl font-semibold text-blue-600">
              {{ formatCurrency(stockStats.total_books > 0 ? stockStats.total_stock_value / stockStats.total_books : 0) }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">📈 Tình trạng kho</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Còn hàng</span>
            <div class="flex items-center gap-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-500 h-2 rounded-full" 
                  :style="{ width: `${(stockStats.in_stock_count / stockStats.total_books) * 100}%` }"
                />
              </div>
              <span class="text-sm text-gray-500 w-12">
                {{ Math.round((stockStats.in_stock_count / stockStats.total_books) * 100) }}%
              </span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Sắp hết</span>
            <div class="flex items-center gap-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-orange-500 h-2 rounded-full" 
                  :style="{ width: `${(stockStats.low_stock_count / stockStats.total_books) * 100}%` }"
                />
              </div>
              <span class="text-sm text-gray-500 w-12">
                {{ Math.round((stockStats.low_stock_count / stockStats.total_books) * 100) }}%
              </span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-gray-600">Hết hàng</span>
            <div class="flex items-center gap-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-red-500 h-2 rounded-full" 
                  :style="{ width: `${(stockStats.out_of_stock_count / stockStats.total_books) * 100}%` }"
                />
              </div>
              <span class="text-sm text-gray-500 w-12">
                {{ Math.round((stockStats.out_of_stock_count / stockStats.total_books) * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-lg p-6 border">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">⚠️ Sách cần chú ý</h2>
        <div class="space-y-3">
          <div v-if="outOfStockBooks.length > 0">
            <h3 class="font-medium text-red-600 mb-2">Hết hàng ({{ outOfStockBooks.length }})</h3>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div 
                v-for="book in outOfStockBooks.slice(0, 5)" 
                :key="book._id"
                class="flex justify-between items-center p-2 bg-red-50 rounded text-sm"
              >
                <span class="text-red-700">{{ book.title }}</span>
                <Tag value="0 cuốn" severity="danger" class="text-xs" />
              </div>
            </div>
          </div>
          
          <div v-if="lowStockBooks.length > 0">
            <h3 class="font-medium text-orange-600 mb-2">Sắp hết ({{ lowStockBooks.length }})</h3>
            <div class="space-y-2 max-h-32 overflow-y-auto">
              <div 
                v-for="book in lowStockBooks.slice(0, 5)" 
                :key="book._id"
                class="flex justify-between items-center p-2 bg-orange-50 rounded text-sm"
              >
                <span class="text-orange-700">{{ book.title }}</span>
                <Tag :value="`${book.stock_quantity} cuốn`" severity="warning" class="text-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">🚀 Thao tác nhanh</h2>
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink to="/cms/kho-sach" class="block">
            <Button 
              label="Quản lý kho" 
              icon="pi pi-warehouse"
              class="w-full"
              severity="info"
            />
          </NuxtLink>
          
          <Button 
            label="Báo cáo" 
            icon="pi pi-chart-bar"
            class="w-full"
            severity="success"
            @click="generateReport"
          />
          
          <Button 
            label="Nhập hàng" 
            icon="pi pi-plus"
            class="w-full"
            severity="primary"
            @click="quickStock"
          />
          
          <Button 
            label="Xuất Excel" 
            icon="pi pi-file-excel"
            class="w-full"
            severity="help"
            @click="exportExcel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookService } from '~/packages/base/services/book.service';
import type { BookModel } from '~/packages/base/models/dto/response/book/book.model';
import { useToast } from 'primevue/usetoast';

definePageMeta({
  layout: 'cms-default',
});

const toast = useToast();

const stockStats = ref({
  total_books: 0,
  in_stock_count: 0,
  low_stock_count: 0,
  out_of_stock_count: 0,
  total_stock_value: 0
});

const outOfStockBooks = ref<BookModel[]>([]);
const lowStockBooks = ref<BookModel[]>([]);

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

// Load all data
const loadDashboardData = async () => {
  try {
    const [statsResponse, outOfStockResponse, lowStockResponse] = await Promise.all([
      BookService.getStockStats(),
      BookService.getOutOfStockBooks(),
      BookService.getLowStockBooks()
    ]);

    if (statsResponse?.status === 'OK') {
      stockStats.value = statsResponse.data;
    }

    if (outOfStockResponse?.status === 'OK') {
      outOfStockBooks.value = outOfStockResponse.data;
    }

    if (lowStockResponse?.status === 'OK') {
      lowStockBooks.value = lowStockResponse.data;
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi tải dữ liệu dashboard',
      life: 3000,
    });
  }
};

// Quick actions
const generateReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Tính năng đang phát triển',
    detail: 'Báo cáo sẽ được triển khai sớm',
    life: 3000,
  });
};

const quickStock = () => {
  navigateTo('/cms/kho-sach');
};

const exportExcel = () => {
  toast.add({
    severity: 'info',
    summary: 'Tính năng đang phát triển', 
    detail: 'Xuất Excel sẽ được triển khai sớm',
    life: 3000,
  });
};

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
/* Custom styles for dashboard */
</style>
