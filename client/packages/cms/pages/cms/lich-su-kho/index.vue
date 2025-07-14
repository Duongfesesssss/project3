<template>
  <div class="p-card">
    <ToolBar class="mb-6">
      <template #start>
        <div class="flex flex-column justify-center">
          <Breadcrumb
            :home="home"
            :model="items"
          >
            <template #item="{ item, props }">
              <router-link
                v-if="item.route"
                v-slot="{ href, navigate }"
                :to="item.route"
                custom
              >
                <a
                  :href="href"
                  v-bind="props.action"
                  @click="navigate"
                >
                  <span :class="[item.icon, 'text-color']" />
                  <span class="text-primary font-semibold">{{ item.label }}</span>
                </a>
              </router-link>
              <a
                v-else
                :href="item.url"
                :target="item.target"
                v-bind="props.action"
              >
                <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
              </a>
            </template>
          </Breadcrumb>
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <!-- Filter buttons -->
          <Button 
            label="Tất cả" 
            :class="filterType === 'all' ? 'p-button-primary' : 'p-button-outlined'"
            size="small"
            @click="filterType = 'all'; loadTransactions()" 
          />
          <Button 
            label="Nhập kho" 
            :class="filterType === 'stock_in' ? 'p-button-success' : 'p-button-outlined'"
            size="small"
            @click="filterType = 'stock_in'; loadTransactions()" 
          />
          <Button 
            label="Xuất kho" 
            :class="filterType === 'stock_out' ? 'p-button-danger' : 'p-button-outlined'"
            size="small"
            @click="filterType = 'stock_out'; loadTransactions()" 
          />
        </div>
      </template>
    </ToolBar>

    <!-- Data Table -->
    <DataTable
      v-model:loading="loading"
      :value="transactions"
      class="p-datatable-sm"
      :paginator="true"
      :rows="20"
      :total-records="totalRecords"
      :lazy="true"
      sort-mode="multiple"
      removable-sort
      show-gridlines
      responsive-layout="scroll"
      @page="onPage"
      @sort="onSort"
    >
      <Column field="createdAt" header="Thời gian" sortable style="min-width: 180px">
        <template #body="{ data }">
          <span class="text-900 font-medium">
            {{ formatDateTime(data.createdAt) }}
          </span>
        </template>
      </Column>

      <Column field="type" header="Loại" sortable style="min-width: 120px">
        <template #body="{ data }">
          <Tag 
            :value="data.type === 'stock_in' ? 'Nhập kho' : 'Xuất kho'"
            :severity="data.type === 'stock_in' ? 'success' : 'danger'"
            class="font-medium"
          />
        </template>
      </Column>

      <Column field="book" header="Sách" style="min-width: 300px">
        <template #body="{ data }">
          <div class="flex align-items-center gap-3">
            <div>
              <div class="text-900 font-medium">{{ data.book?.title }}</div>
              <div class="text-600 text-sm">{{ data.book?.author }}</div>
            </div>
          </div>
        </template>
      </Column>

      <Column field="quantity" header="Số lượng" sortable style="min-width: 120px">
        <template #body="{ data }">
          <span :class="data.type === 'stock_in' ? 'text-green-600' : 'text-red-600'" class="font-bold">
            {{ data.type === 'stock_in' ? '+' : '-' }}{{ data.quantity }}
          </span>
        </template>
      </Column>

      <Column field="reason" header="Lý do" style="min-width: 200px">
        <template #body="{ data }">
          <span class="text-900">{{ data.reason || 'Không có' }}</span>
        </template>
      </Column>

      <Column field="note" header="Ghi chú" style="min-width: 250px">
        <template #body="{ data }">
          <span class="text-600">{{ data.note || 'Không có ghi chú' }}</span>
        </template>
      </Column>

      <Column field="performedBy" header="Thực hiện bởi" style="min-width: 180px">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <Avatar 
              :label="data.performedBy?.user_name?.charAt(0).toUpperCase()" 
              class="mr-2"
              size="small"
              style="background-color: #6366f1; color: white"
            />
            <div>
              <div class="text-900 font-medium">{{ data.performedBy?.user_name }}</div>
              <Tag 
                :value="data.performedBy?.role === 'admin' ? 'Quản lý' : 'Nhân viên'"
                :severity="data.performedBy?.role === 'admin' ? 'info' : 'secondary'"
                class="text-xs"
              />
            </div>
          </div>
        </template>
      </Column>

      <Column field="stockAfter" header="Tồn kho sau" sortable style="min-width: 120px">
        <template #body="{ data }">
          <span class="text-900 font-medium">{{ data.stockAfter }}</span>
        </template>
      </Column>

      <template #empty>
        <div class="text-center py-6">
          <i class="pi pi-inbox text-gray-400 text-4xl mb-3" />
          <p class="text-gray-600 text-lg">Không có dữ liệu lịch sử kho</p>
        </div>
      </template>

      <template #loading>
        <div class="text-center py-6">
          <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
          <p class="text-gray-600 mt-3">Đang tải dữ liệu...</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '~/packages/base/stores/auth.store';
import { $api } from '~/packages/base/composables/useApi';

// Định nghĩa meta cho trang (chỉ admin)
definePageMeta({
  layout: 'cms-default'
});

// Kiểm tra quyền admin
const authStore = useAuthStore();
if (!authStore.isAdmin) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Chỉ quản lý mới có quyền truy cập trang này'
  });
}

// Breadcrumb navigation
const home = ref({ icon: 'pi pi-home', route: '/cms' });
const items = ref([
  { label: 'Lịch sử kho', icon: 'pi pi-clock' }
]);

// Interfaces
interface StockTransaction {
  _id: string;
  type: 'stock_in' | 'stock_out';
  book: {
    _id: string;
    title: string;
    author: string;
    image_link?: string;
  };
  quantity: number;
  reason?: string;
  note?: string;
  performedBy: {
    _id: string;
    user_name: string;
    role: string;
  };
  stockAfter: number;
  createdAt: string;
}

const toast = useToast();

// Reactive data
const loading = ref(false);
const transactions = ref<StockTransaction[]>([]);
const totalRecords = ref(0);
const filterType = ref<'all' | 'stock_in' | 'stock_out'>('all');

// Pagination
const currentPage = ref(0);
const rowsPerPage = ref(20);

// Load transactions data
const loadTransactions = async (page = 0) => {
  try {
    loading.value = true;
    currentPage.value = page;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: rowsPerPage.value.toString(),
    });

    if (filterType.value !== 'all') {
      params.append('type', filterType.value);
    }

    const response = await $api(`/api/stock-transactions/all?${params.toString()}`) as {
      success: boolean;
      data: StockTransaction[];
      totalRecords?: number;
      message?: string;
    };

    if (response.success) {
      transactions.value = response.data;
      totalRecords.value = response.totalRecords || 0;
    } else {
      throw new Error(response.message || 'Không thể tải dữ liệu');
    }
  } catch (error) {
    console.error('Lỗi tải lịch sử kho:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải dữ liệu lịch sử kho',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};

// Event handlers
const onPage = (event: { page: number }) => {
  loadTransactions(event.page);
};

const onSort = (event: unknown) => {
  // Implement sorting if needed
  console.log('Sort event:', event);
};

// Utility functions
const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// Lifecycle
onMounted(() => {
  loadTransactions();
});
</script>

<style scoped>
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  padding: 1rem 0.75rem;
}

:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

:deep(.p-button) {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}
</style>
