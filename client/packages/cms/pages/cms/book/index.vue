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
          <Button
            label="Thêm sách mới"
            icon="pi pi-plus"
            class="mr-2"
            @click="onModalOpen"
          />
        </div>
      </template>
    </ToolBar>

    <DataTable
      :value="books"
      :rows="10"
      :rows-per-page-options="[5, 10, 20, 50]"
      column-resize-mode="expand"
      removable-sort
      show-gridlines
      :lazy="true"
      paginator
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="hiển thị {first} đến {last} trong {totalRecords} sách"
      :total-records="totalRecords"
      :loading="loading"
      data-key="id"
      @page="onPage($event)"
      @sort="onSort($event)"
    >
      <template #header>
        <div class="grid grid-cols-1 xl:grid-cols-8 md:grid-cols-4 gap-4 mb-4">
          <!-- Keyword Search -->
          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">Tìm kiếm</label>
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="keyWords"
                placeholder="Tên sách, tác giả, ISBN..."
                class="w-full"
                @keyup.enter="timKiem"
              />
            </IconField>
          </div>

          <!-- Genre Filter -->
          <div class="col-span-1">
            <label class="block text-sm font-medium mb-1">Thể loại</label>
            <Select
              v-model="selectedGenre"
              :options="genres"
              option-label="name"
              option-value="_id"
              placeholder="Chọn thể loại"
              class="w-full"
              show-clear
            />
          </div>

          <!-- Publisher Filter -->
          <div class="col-span-1">
            <label class="block text-sm font-medium mb-1">Nhà xuất bản</label>
            <Select
              v-model="selectedPublisher"
              :options="publishers"
              option-label="name"
              option-value="_id"
              placeholder="Chọn NXB"
              class="w-full"
              show-clear
            />
          </div>

          <!-- Supplier Filter -->
          <div class="col-span-1">
            <label class="block text-sm font-medium mb-1">Nhà cung cấp</label>
            <Select
              v-model="selectedSupplier"
              :options="suppliers"
              option-label="name"
              option-value="_id"
              placeholder="Chọn NCC"
              class="w-full"
              show-clear
            />
          </div>

          <!-- Price Range -->
          <div class="col-span-1">
            <label class="block text-sm font-medium mb-1">Giá từ</label>
            <InputNumber
              v-model="minPrice"
              :min="0"
              placeholder="0"
              class="w-full"
              currency="VND"
              locale="vi-VN"
            />
          </div>

          <div class="col-span-1">
            <label class="block text-sm font-medium mb-1">Giá đến</label>
            <InputNumber
              v-model="maxPrice"
              :min="0"
              placeholder="1000000"
              class="w-full"
              currency="VND"
              locale="vi-VN"
            />
          </div>

          <!-- Action Buttons -->
          <div class="col-span-1">
            <div class="block text-sm font-medium mb-1" style="height: 20px;"></div>
            <div class="flex flex-column gap-2">
              <Button
                type="button"
                icon="pi pi-filter"
                label="Lọc"
                class="w-full"
                @click="timKiem"
              />
              <Button
                type="button"
                icon="pi pi-filter-slash"
                label="Xóa lọc"
                outlined
                severity="danger"
                class="w-full"
                @click="clearFilter"
              />
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <div class="text-center p-4">
          <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
          <p class="text-lg text-500">Không có sách nào</p>
        </div>
      </template>
      
      <Column class="text-center" body-style="text-align:center">
        <template #header>
          <span class="m-auto"><b>STT</b></span>
        </template>
        <template #body="slotProps">
          {{ getRowSTT(slotProps.index) }}
        </template>
      </Column>

      <Column field="image_link" header="Ảnh" style="min-width: 8rem">
        <template #body="{ data }">
          <img 
            v-if="data.image_link"
            :src="data.image_link" 
            :alt="data.title"
            class="w-4rem h-4rem object-fit-cover border-round"
          />
          <span v-else class="text-400">Không có ảnh</span>
        </template>
      </Column>

      <Column field="title" header="Tên sách" sortable style="min-width: 15rem">
        <template #body="{ data }">
          <div class="flex flex-column">
            <span class="font-medium text-900">{{ data.title }}</span>
            <small class="text-600">{{ data.author }}</small>
          </div>
        </template>
      </Column>

      <Column field="genres" header="Thể loại" style="min-width: 10rem">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <Tag 
              v-for="genre in data.genres" 
              :key="genre._id"
              :value="genre.name"
              severity="info"
              class="text-xs"
            />
          </div>
        </template>
      </Column>

      <Column field="publisher.name" header="Nhà xuất bản" sortable />
      
      <Column field="supplier.name" header="Nhà cung cấp" sortable />

      <Column field="price" header="Giá bán" sortable>
        <template #body="{ data }">
          <span class="font-semibold text-primary">{{ formatCurrency(data.price) }}</span>
        </template>
      </Column>

      <Column field="stock_quantity" header="Tồn kho" sortable>
        <template #body="{ data }">
          <Tag 
            :value="data.stock_quantity"
            :severity="getStockSeverity(data.stock_quantity)"
          />
        </template>
      </Column>

      <Column field="stock_status" header="Trạng thái" sortable>
        <template #body="{ data }">
          <Tag 
            :value="getStatusLabel(data.stock_status)"
            :severity="getStatusSeverity(data.stock_status)"
          />
        </template>
      </Column>

      <Column header="Thao tác" style="min-width: 8rem" body-style="text-align:center">
        <template #body="{ data }">
          <div class="flex justify-center gap-2">
            <Button
              icon="pi pi-eye"
              class="p-button-rounded p-button-info p-button-text"
              v-tooltip.top="'Xem chi tiết'"
              @click="viewBookDetail(data)"
            />
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-success p-button-text"
              v-tooltip.top="'Chỉnh sửa'"
              @click="editBook(data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-danger p-button-text"
              v-tooltip.top="'Xóa'"
              @click="deleteBook(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

// Layout imports
definePageMeta({
  layout: 'cms-default'
})

// Breadcrumb data
const home = ref({ icon: 'pi pi-home', route: '/cms' })
const items = ref([{ label: 'Quản lý sách' }])

// Data
const books = ref([])
const genres = ref([])
const publishers = ref([])
const suppliers = ref([])
const loading = ref(false)
const toast = useToast()

// Filter data
const keyWords = ref('')
const selectedGenre = ref('')
const selectedPublisher = ref('')
const selectedSupplier = ref('')
const minPrice = ref(0)
const maxPrice = ref(0)

const filterProject = ref({
  rows: 10,
  first: 0,
  page: 0,
  sortField: '',
  sortOrder: 'desc'
})

const filters = ref({
  keyword: '',
  genre_id: '',
  publisher_id: '',
  supplier_id: '',
  min_price: 0,
  max_price: 0
})

const totalRecords = ref(0)

// Methods
const fetchBooks = async () => {
  loading.value = true
  try {
    const payload = Object.assign(filterProject.value, filters.value)
    const response = await fetch('/api/book/datatable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const res = await response.json()
    if (res && res.status === 'OK') {
      books.value = res.data || []
      totalRecords.value = res.totalRecords || 0
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách sách:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách sách',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const fetchDropdownData = async () => {
  try {
    // Fetch genres
    const genresResponse = await fetch('/api/book/genres')
    if (genresResponse.ok) {
      const genresData = await genresResponse.json()
      if (genresData.status === 'OK') {
        genres.value = genresData.data || []
      }
    }

    // Fetch publishers
    const publishersResponse = await fetch('/api/book/publishers')
    if (publishersResponse.ok) {
      const publishersData = await publishersResponse.json()
      if (publishersData.status === 'OK') {
        publishers.value = publishersData.data || []
      }
    }

    // Fetch suppliers
    const suppliersResponse = await fetch('/api/book/suppliers')
    if (suppliersResponse.ok) {
      const suppliersData = await suppliersResponse.json()
      if (suppliersData.status === 'OK') {
        suppliers.value = suppliersData.data || []
      }
    }
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu dropdown:', error)
  }
}

const timKiem = () => {
  filters.value.keyword = keyWords.value
  filters.value.genre_id = selectedGenre.value
  filters.value.publisher_id = selectedPublisher.value
  filters.value.supplier_id = selectedSupplier.value
  filters.value.min_price = minPrice.value || 0
  filters.value.max_price = maxPrice.value || 0
  
  filterProject.value.first = 0
  filterProject.value.page = 0
  fetchBooks()
}

const clearFilter = () => {
  keyWords.value = ''
  selectedGenre.value = ''
  selectedPublisher.value = ''
  selectedSupplier.value = ''
  minPrice.value = 0
  maxPrice.value = 0
  
  filters.value = {
    keyword: '',
    genre_id: '',
    publisher_id: '',
    supplier_id: '',
    min_price: 0,
    max_price: 0
  }
  
  filterProject.value.first = 0
  filterProject.value.page = 0
  fetchBooks()
}

const onPage = (event) => {
  filterProject.value.first = event.first
  filterProject.value.rows = event.rows
  filterProject.value.page = event.page
  fetchBooks()
}

const onSort = (event) => {
  filterProject.value.sortField = event.sortField
  filterProject.value.sortOrder = event.sortOrder
  fetchBooks()
}

const getRowSTT = (index: number) => {
  return filterProject.value.first + index + 1
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getStockSeverity = (quantity) => {
  if (quantity === 0) return 'danger'
  if (quantity < 10) return 'warning'
  return 'success'
}

const getStatusLabel = (status) => {
  const statusMap = {
    'in_stock': 'Còn hàng',
    'low_stock': 'Sắp hết',
    'out_of_stock': 'Hết hàng'
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'in_stock': 'success',
    'low_stock': 'warning',
    'out_of_stock': 'danger'
  }
  return severityMap[status] || 'info'
}

const onModalOpen = () => {
  // TODO: Implement add book modal
  console.log('Add book modal')
}

const viewBookDetail = (book) => {
  // TODO: Implement view book detail
  console.log('View book:', book)
}

const editBook = (book) => {
  // TODO: Implement edit book
  console.log('Edit book:', book)
}

const deleteBook = (book) => {
  // TODO: Implement delete book
  console.log('Delete book:', book)
}

// Lifecycle
onMounted(() => {
  fetchDropdownData()
  fetchBooks()
})
</script>

<style scoped>
.p-card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}
</style>