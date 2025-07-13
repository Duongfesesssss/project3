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
          <div>
            <Button
              label="Thêm mới"
              icon="pi pi-plus"
              class="mr-2"
              @click="onModalOpen"
            />
          </div>
        </div>
      </template>
    </ToolBar>

    <!-- Stock Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-600 text-sm font-medium">Còn hàng</p>
            <p class="text-2xl font-bold text-green-700">{{ stockStats.in_stock_count || 0 }}</p>
          </div>
          <i class="pi pi-check-circle text-green-500 text-2xl" />
        </div>
      </div>
      
      <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-orange-600 text-sm font-medium">Sắp hết</p>
            <p class="text-2xl font-bold text-orange-700">{{ stockStats.low_stock_count || 0 }}</p>
          </div>
          <i class="pi pi-exclamation-triangle text-orange-500 text-2xl" />
        </div>
      </div>
      
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-red-600 text-sm font-medium">Hết hàng</p>
            <p class="text-2xl font-bold text-red-700">{{ stockStats.out_of_stock_count || 0 }}</p>
          </div>
          <i class="pi pi-times-circle text-red-500 text-2xl" />
        </div>
      </div>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-600 text-sm font-medium">Tổng giá trị kho</p>
            <p class="text-2xl font-bold text-blue-700">
              {{ formatCurrency(stockStats.total_stock_value || 0) }}
            </p>
          </div>
          <i class="pi pi-dollar text-blue-500 text-2xl" />
        </div>
      </div>
    </div>

    <DataTable
      v-model:expanded-rows="expandedRows"
      v-model:rows="filterProject.rows"
      sort-field="ho_ten"
      :sort-order="-1"
      :rows-per-page-options="[1,5 , 10, 20, 50]"
      column-resize-mode="expand"
      removable-sort
      show-gridlines
      :lazy="true"
      :value="dataBook"
      paginator
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="hiển thị {first} đến {last} trong {totalRecords} công trình"
      :total-records="totalRecords"
      :loading="loading"
      data-key="id"
      @page="onPage($event as PageEvent)"
      @sort="onSort($event as SortEvent)"
    >
      <template #header>
        <div class="grid grid-cols-1 xl:grid-cols-5 md:grid-cols-3 gap-4 mb-1">
          <div class="col-span-1">
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="keyWords"
                placeholder="Tìm kiếm"
                class="w-full"
              />
            </IconField>
            <span class="text-red-500">{{ errors.keyWords }}</span>
          </div>
          <div class="col-span-1">
            <Button
              type="button"
              icon="pi pi-filter"
              label="Tìm kiếm"
              class="w-full"
              @click="timKiem"
            />
          </div>
          <div class="col-span-1">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Bỏ lọc"
              outlined
              severity="danger"
              class="w-full"
              @click="clearFilter()"
            />
          </div>
        </div>
      </template>
      <template #empty>
        <div class="text-center">
          <span class="font-bold">Không có sách nào!</span>
        </div>
      </template>
      <!-- <Column
        expander
        style="padding: 10px; width: 2rem"
      /> -->
      <Column
        class="text-center"
        body-style="text-align:center"
      >
        <template #header>
          <span class="m-auto"><b>STT</b></span>
        </template>
        <template #body="slotProps">
          {{ getRowSTT(slotProps.index) }}
        </template>
      </Column>

      <Column
  field="image_link"
  header="Ảnh"
  :exportable="false"
  body-style="text-align:center"
>
  <template #body="slotProps">
    <img
      v-if="slotProps.data.image_link"
      :src="slotProps.data.image_link"
      alt="Ảnh sách"
      class="h-20 w-20 object-cover rounded"
    >
    <span v-else>Không có ảnh</span>
  </template>
</Column>
      <Column
        field="title"
        header="Tên sách"
        sortable
      />
      <Column
        field="published_date"
        header="Thể loại sách"
        :show-filter-match-modes="false"
        sortable
      >
      <template #body="slotProps">
        {{ slotProps.data.genres.map(genre => genre.name).join(' & ') || '' }}
      </template>
      </Column>
      <Column
        field="author"
        header="Tác giả"
        sortable
      />
      <Column
        field="publisher"
        header="Nhà xuất bản"
        :show-filter-match-modes="false"
        sortable
      >
      <template #body="slotProps">
        {{ slotProps.data.publisher?.name ?? '' }}
      </template>
      </Column>

      <Column
        field="supplier"
        header="Nhà cung cấp"
        :show-filter-match-modes="false"
        sortable
      >
      <template #body="slotProps">
        {{ slotProps.data.supplier?.name ?? '' }}
      </template>
      </Column>

      <Column
        field="published_date"
        header="Ngày xuất bản"
        :show-filter-match-modes="false"
        sortable
      >
      <template #body="slotProps">
          {{ slotProps.data.published_date || '' }} 
        </template>
      </Column>
      <Column
        field="price"
        :show-filter-match-modes="false"
        sortable
        >
        <template #header>
          <span class="m-auto"><b>Giá tiền(nghìn đồng)</b></span>
        </template>
        </Column>
      
      <Column
        field="pages"
        :show-filter-match-modes="false"
        sortable
        >
        <template #header>
          <span class="m-auto"><b>Số trang</b></span>
        </template>
        </Column>
      
      <Column
        field="stock_quantity"
        :show-filter-match-modes="false"
        sortable
        >
        <template #header>
          <span class="m-auto"><b>Số lượng (cuốn)</b></span>
        </template>
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <span :class="getStockClass(slotProps.data.stock_status)">
              {{ slotProps.data.stock_quantity || 0 }}
            </span>
            <Tag 
              :value="getStockStatusText(slotProps.data.stock_status)" 
              :severity="getStockSeverity(slotProps.data.stock_status)"
              class="text-xs"
            />
          </div>
        </template>
        </Column>

      <Column
        field="sold_quantity"
        :show-filter-match-modes="false"
        sortable
        >
        <template #header>
          <span class="m-auto"><b>Đã bán</b></span>
        </template>
        <template #body="slotProps">
          {{ slotProps.data.sold_quantity || 0 }}
        </template>
        </Column>
      <Column
        :exportable="false"
        style="min-width: 9rem"
        body-style="text-align:center"
        :frozen="true"
        align-frozen="right"
      >
        <template #header>
          <span class="m-auto"><b>Thao tác</b></span>
        </template>
        <template #body="slotProps">
          <div class="flex justify-center items-center space-x-2">
            <Button
              v-tooltip="'Nhập hàng'"
              icon="pi pi-plus"
              outlined
              rounded
              severity="success"
              size="small"
              @click="onStockAdd(slotProps.data)"
            />
            <Button
              v-tooltip="'Bán hàng'"
              icon="pi pi-minus"
              outlined
              rounded
              severity="info"
              size="small"
              @click="onStockReduce(slotProps.data)"
            />
            <Button
              v-tooltip="'Chỉnh sửa sách'"
              icon="pi pi-pencil"
              outlined
              rounded
              severity="warn"
              size="small"
              @click="onModalOpenEdit(slotProps.data)"
            />
            <Button
              v-tooltip="'Xoá sách'"
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              size="small"
              @click="confirmDeleteProject(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <ClientOnly>
      <BookModal
        :is-visible="isOpenModal"
        :book="bookData"
        @reload-data-table="reloadDataTable()"
        @hide-modal="isOpenModal = false"
      />
      
      <StockTransactionModal
        :is-visible="isStockModalOpen"
        :book="selectedBookForStock"
        :transaction-type="stockTransactionType"
        @hide-modal="onStockModalClose"
        @reload-data="onStockTransactionComplete"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import type { PageEvent, SortEvent } from '~/packages/base/models/event';
import { BookService } from '~/packages/base/services/book.service';
import { BookModel } from '~/packages/base/models/dto/response/book/book.model';
import BookModal from '~/packages/cms/components/shared/book/BookModal.vue';
import StockTransactionModal from '~/packages/cms/components/shared/stock/StockTransactionModal.vue';
definePageMeta({
  layout: 'cms-default',
});

const route = useRoute();
const phanLoaiId = ref();
phanLoaiId.value = route.query.phanLoaiId;
const expandedRows = ref();
const home = ref({
  icon: 'pi pi-home',
  route: '/cms',
});

const getRowSTT = (index: number): number => {
  return currentPageNumber.value * 10 + index + 1;
};



const toast = useToast();
const confirm = useConfirm();
const dataBook = ref<BookModel[]>([]);
const stockStats = ref({
  total_books: 0,
  in_stock_count: 0,
  low_stock_count: 0,
  out_of_stock_count: 0,
  total_stock_value: 0
});
const items = ref([{ label: 'Quản lý' }, { label: 'Quản lý sách' }]);
const currentPageNumber = ref(0);
const isOpenModal = ref<boolean>(false);
const bookData = ref<BookModel>(new BookModel());

// Stock transaction modal states
const isStockModalOpen = ref<boolean>(false);
const selectedBookForStock = ref<BookModel | null>(null);
const stockTransactionType = ref<'stock_in' | 'stock_out'>('stock_in');


const totalRecords = ref(0);
const filters = ref();

const schema = yup.object({
  keyWords: yup
    .string()
    .max(256, 'Tối đa 256 ký tự!')
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
});
const [keyWords] = defineField('keyWords');

const filterProject = ref({
  rows: 5,
  first: 0,
  page: 0,
  sortField: '',
  sortOrder: 'desc',
});

const initFilters = () => {
  filters.value = {
    keyword: '',
  };
};

initFilters();

const clearFilter = () => {
  initFilters();
  filterProject.value.first = 0;
  setTimeout(() => {
    reloadDataTable();
    keyWords.value = '';
  }, 200);
};


const loading = ref(false);

const onLoadTable = () => {
  loading.value = true;
  BookService.BookDataTable( Object.assign(filterProject.value, filters.value))
    .then((res) => {
      if (res) {
        dataBook.value = res.data || [];
        totalRecords.value = res.totalRecords ?? 0;
      }
    })
    .catch((error) => {
      console.error('Error loading data:', error);
    })
    .finally(() => {
      loading.value = false;
      expandedRows.value = null;
    });
};


const reloadDataTable = () => {
  loading.value = true;
  expandedRows.value = [];
  onLoadTable();
  loadStockStats(); // Load stock stats cùng lúc
};


const onPage = (event: PageEvent) => {
  currentPageNumber.value = event.page;
  filterProject.value.first = event.first;
  reloadDataTable();
};

const onSort = (event: SortEvent) => {
  filterProject.value.sortField = event.sortField ?? '';
  if (event.sortOrder != null) {
    filterProject.value.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
  }
  else {
    filterProject.value.sortOrder = '';
  }
  reloadDataTable();
};

onMounted(() => {
  onLoadTable();
  loadStockStats(); // Load stock stats khi khởi tạo
});

const timKiem = handleSubmit(async () => {
  filters.value.keyword = keyWords.value;
  filterProject.value.first = 0;
  reloadDataTable();
});

const onModalOpen = () => {
  isOpenModal.value = true;
  bookData.value = new BookModel();
};

const onModalOpenEdit = (data: BookModel) => {
  console.log('Editing book:', data);
  isOpenModal.value = true;
  bookData.value = data;
};

const confirmDeleteProject = (props: BookModel) => {
  ConfirmDialog.showConfirmDialog(
    confirm,
    'Bạn có muốn xóa thông tin sách này?',
    'Xác nhận',
    'pi pi-question-circle',
    () => {
      BookService.delete(props).then((result) => {
        if (result?.status == EnumStatus.OK) {
          toast.add({
            severity: 'success',
            summary: 'Xóa thông tin sách thành công !',
            life: 3000,
          });
          reloadDataTable();
        }
        else {
          toast.add({
            severity: 'error',
            summary: 'Xóa thông tin sách thất bại !',
            life: 3000,
          });
        }
      });
    },
    () => {},
    '',
    ' p-button-danger',
  );
};

// Stock management methods
const getStockClass = (status: string) => {
  switch (status) {
    case 'out_of_stock':
      return 'text-red-600 font-bold';
    case 'low_stock':
      return 'text-orange-600 font-semibold';
    case 'in_stock':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

const getStockStatusText = (status: string) => {
  switch (status) {
    case 'out_of_stock':
      return 'Hết hàng';
    case 'low_stock':
      return 'Sắp hết';
    case 'in_stock':
      return 'Còn hàng';
    default:
      return 'Không rõ';
  }
};

const getStockSeverity = (status: string) => {
  switch (status) {
    case 'out_of_stock':
      return 'danger';
    case 'low_stock':
      return 'warning';
    case 'in_stock':
      return 'success';
    default:
      return 'info';
  }
};

// Nhập hàng
const onStockAdd = (book: BookModel) => {
  selectedBookForStock.value = book;
  stockTransactionType.value = 'stock_in';
  isStockModalOpen.value = true;
};

// Bán hàng
const onStockReduce = (book: BookModel) => {
  if (!book.stock_quantity || book.stock_quantity <= 0) {
    toast.add({
      severity: 'error',
      summary: 'Sách đã hết hàng!',
      detail: 'Không thể xuất hàng khi sách đã hết.',
      life: 3000,
    });
    return;
  }
  
  selectedBookForStock.value = book;
  stockTransactionType.value = 'stock_out';
  isStockModalOpen.value = true;
};

// Handle close stock modal
const onStockModalClose = () => {
  isStockModalOpen.value = false;
  selectedBookForStock.value = null;
};

// Handle reload data after stock transaction
const onStockTransactionComplete = () => {
  reloadDataTable();
  loadStockStats();
};

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

// Load stock statistics
const loadStockStats = async () => {
  try {
    const response = await BookService.getStockStats();
    if (response?.status === 'OK') {
      stockStats.value = response.data;
    }
  } catch (error) {
    console.error('Error loading stock stats:', error);
  }
};
</script>

<style lang="scss" scoped></style>
