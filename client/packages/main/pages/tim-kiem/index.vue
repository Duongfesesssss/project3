<template>
  <div class="advanced-search-page">
    <!-- Header Section -->
    <div class="search-header">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-2">Tìm kiếm nâng cao</h1>
        <p class="text-gray-600 text-center mb-8">Tìm cuốn sách yêu thích của bạn với các bộ lọc chi tiết</p>
      </div>
    </div>

    <!-- Advanced Search Form -->
    <div class="search-form-section">
      <div class="container mx-auto px-4">
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            <!-- Keyword Search -->
            <div class="col-span-full lg:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="pi pi-search mr-2"></i>Từ khóa tìm kiếm
              </label>
              <div class="relative">
                <input
                  v-model="searchParams.keyword"
                  type="text"
                  placeholder="Tên sách, tác giả, ISBN..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @keyup.enter="performSearch"
                />
                <i class="pi pi-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            <!-- Genre MultiSelect -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="pi pi-tags mr-2"></i>Thể loại
              </label>
              <MultiSelect
                v-model="searchParams.selectedGenres"
                :options="genres"
                option-label="name"
                option-value="_id"
                placeholder="Chọn thể loại"
                class="w-full"
                :max-selected-labels="2"
                display="chip"
              />
            </div>

            <!-- Publisher Select -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="pi pi-building mr-2"></i>Nhà xuất bản
              </label>
              <Select
                v-model="searchParams.selectedPublisher"
                :options="publishers"
                option-label="name"
                option-value="_id"
                placeholder="Chọn nhà xuất bản"
                class="w-full"
                show-clear
              />
            </div>

            <!-- Price Range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="pi pi-money-bill mr-2"></i>Khoảng giá
              </label>
              <div class="flex gap-2">
                <InputNumber
                  v-model="searchParams.minPrice"
                  :min="0"
                  placeholder="Từ"
                  class="flex-1"
                  currency="VND"
                  locale="vi-VN"
                />
                <span class="self-center">-</span>
                <InputNumber
                  v-model="searchParams.maxPrice"
                  :min="0"
                  placeholder="Đến"
                  class="flex-1"
                  currency="VND"
                  locale="vi-VN"
                />
              </div>
            </div>

            <!-- Language Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="pi pi-globe mr-2"></i>Ngôn ngữ
              </label>
              <Select
                v-model="searchParams.selectedLanguage"
                :options="languages"
                option-label="label"
                option-value="value"
                placeholder="Chọn ngôn ngữ"
                class="w-full"
                show-clear
              />
            </div>

            <!-- Stock Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="pi pi-check-circle mr-2"></i>Trạng thái
              </label>
              <Select
                v-model="searchParams.stockStatus"
                :options="stockStatusOptions"
                option-label="label"
                option-value="value"
                placeholder="Tình trạng sách"
                class="w-full"
                show-clear
              />
            </div>

            <!-- Sort Options -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="pi pi-sort mr-2"></i>Sắp xếp theo
              </label>
              <Select
                v-model="searchParams.sortBy"
                :options="sortOptions"
                option-label="label"
                option-value="value"
                placeholder="Sắp xếp"
                class="w-full"
              />
            </div>

            <!-- Action Buttons -->
            <div class="col-span-full flex gap-4 justify-center mt-4">
              <Button
                icon="pi pi-search"
                label="Tìm kiếm"
                class="px-8 py-3"
                @click="performSearch"
                :loading="loading"
              />
              <Button
                icon="pi pi-refresh"
                label="Đặt lại"
                outlined
                class="px-8 py-3"
                @click="resetSearch"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Results Section -->
    <div class="search-results-section">
      <div class="container mx-auto px-4">
        
        <!-- Results Header -->
        <div class="flex justify-between items-center mb-6" v-if="searchResults.length > 0 || hasSearched">
          <div>
            <h2 class="text-xl font-semibold">Kết quả tìm kiếm</h2>
            <p class="text-gray-600">
              {{ hasSearched ? `Tìm thấy ${totalResults} cuốn sách` : 'Chưa có tìm kiếm nào' }}
            </p>
          </div>
          
          <!-- View Toggle -->
          <div class="flex gap-2">
            <Button
              :class="viewMode === 'grid' ? 'p-button-filled' : 'p-button-outlined'"
              icon="pi pi-th-large"
              @click="viewMode = 'grid'"
            />
            <Button
              :class="viewMode === 'list' ? 'p-button-filled' : 'p-button-outlined'"
              icon="pi pi-list"
              @click="viewMode = 'list'"
            />
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <ProgressSpinner />
          <p class="mt-4 text-gray-600">Đang tìm kiếm...</p>
        </div>

        <!-- No Results -->
        <div v-else-if="hasSearched && searchResults.length === 0" class="text-center py-12">
          <i class="pi pi-search text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy kết quả</h3>
          <p class="text-gray-600 mb-6">Hãy thử thay đổi từ khóa hoặc bộ lọc tìm kiếm</p>
          <Button label="Đặt lại tìm kiếm" outlined @click="resetSearch" />
        </div>

        <!-- Results Grid View -->
        <div v-else-if="viewMode === 'grid' && searchResults.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div
            v-for="book in searchResults"
            :key="book._id"
            class="book-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewBookDetail(book)"
          >
            <div class="aspect-w-3 aspect-h-4">
              <img
                :src="book.image_link || '/placeholder-book.jpg'"
                :alt="book.title"
                class="w-full h-48 object-cover rounded-t-lg"
              />
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-sm mb-1 line-clamp-2">{{ book.title }}</h3>
              <p class="text-gray-600 text-xs mb-2">{{ book.author }}</p>
              <div class="flex justify-between items-center">
                <span class="text-red-600 font-bold">{{ formatCurrency(book.price) }}</span>
                <Tag
                  :value="getStockStatusLabel(book.stock_status)"
                  :severity="getStockStatusSeverity(book.stock_status)"
                  class="text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Results List View -->
        <div v-else-if="viewMode === 'list' && searchResults.length > 0" class="space-y-4">
          <div
            v-for="book in searchResults"
            :key="book._id"
            class="book-list-item bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewBookDetail(book)"
          >
            <div class="flex gap-4">
              <img
                :src="book.image_link || '/placeholder-book.jpg'"
                :alt="book.title"
                class="w-20 h-28 object-cover rounded"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-lg mb-2">{{ book.title }}</h3>
                <p class="text-gray-600 mb-2">Tác giả: {{ book.author }}</p>
                <p class="text-gray-600 mb-2">Nhà xuất bản: {{ book.publisher?.name }}</p>
                <div class="flex flex-wrap gap-2 mb-3">
                  <Tag
                    v-for="genre in book.genres"
                    :key="genre._id"
                    :value="genre.name"
                    severity="info"
                    class="text-xs"
                  />
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-red-600 font-bold text-xl">{{ formatCurrency(book.price) }}</span>
                  <Tag
                    :value="getStockStatusLabel(book.stock_status)"
                    :severity="getStockStatusSeverity(book.stock_status)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="searchResults.length > 0" class="flex justify-center mt-8">
          <Paginator
            v-model:first="paginationFirst"
            :rows="paginationRows"
            :total-records="totalResults"
            :rows-per-page-options="[12, 24, 48]"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            @page="onPageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

definePageMeta({
  layout: 'default',
  auth: false,
});

// Reactive Data
const loading = ref(false)
const hasSearched = ref(false)
const viewMode = ref('grid') // 'grid' | 'list'
const searchResults = ref([])
const totalResults = ref(0)

// Dropdown Data
const genres = ref([])
const publishers = ref([])

// Search Parameters
const searchParams = reactive({
  keyword: '',
  selectedGenres: [],
  selectedPublisher: '',
  minPrice: 0,
  maxPrice: 0,
  selectedLanguage: '',
  stockStatus: '',
  sortBy: 'newest'
})

// Pagination
const paginationFirst = ref(0)
const paginationRows = ref(12)

// Static Options
const languages = ref([
  { label: 'Tiếng Việt', value: 'vi' },
  { label: 'Tiếng Anh', value: 'en' },
  { label: 'Tiếng Trung', value: 'zh' },
  { label: 'Tiếng Nhật', value: 'ja' },
  { label: 'Tiếng Hàn', value: 'ko' }
])

const stockStatusOptions = ref([
  { label: 'Còn hàng', value: 'in_stock' },
  { label: 'Sắp hết', value: 'low_stock' },
  { label: 'Hết hàng', value: 'out_of_stock' }
])

const sortOptions = ref([
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Giá: Thấp đến cao', value: 'price_asc' },
  { label: 'Giá: Cao đến thấp', value: 'price_desc' },
  { label: 'Tên A-Z', value: 'name_asc' },
  { label: 'Tên Z-A', value: 'name_desc' },
  { label: 'Bán chạy', value: 'bestseller' }
])

// Methods
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
  } catch (error) {
    console.error('Error loading dropdown data:', error)
  }
}

const performSearch = async () => {
  loading.value = true
  hasSearched.value = true
  
  try {
    // Build search payload
    const payload = {
      rows: paginationRows.value,
      first: paginationFirst.value,
      page: Math.floor(paginationFirst.value / paginationRows.value),
      sortField: getSortField(searchParams.sortBy),
      sortOrder: getSortOrder(searchParams.sortBy),
      keyword: searchParams.keyword,
      genre_ids: searchParams.selectedGenres,
      publisher_id: searchParams.selectedPublisher,
      min_price: searchParams.minPrice || 0,
      max_price: searchParams.maxPrice || 0,
      language: searchParams.selectedLanguage,
      stock_status: searchParams.stockStatus ? [searchParams.stockStatus] : []
    }

    const response = await fetch('/api/book/datatable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (result && result.status === 'OK') {
      searchResults.value = result.data || []
      totalResults.value = result.totalRecords || 0
    }
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
}

const resetSearch = () => {
  searchParams.keyword = ''
  searchParams.selectedGenres = []
  searchParams.selectedPublisher = ''
  searchParams.minPrice = 0
  searchParams.maxPrice = 0
  searchParams.selectedLanguage = ''
  searchParams.stockStatus = ''
  searchParams.sortBy = 'newest'
  
  searchResults.value = []
  totalResults.value = 0
  hasSearched.value = false
  paginationFirst.value = 0
}

const onPageChange = (event) => {
  paginationFirst.value = event.first
  paginationRows.value = event.rows
  performSearch()
}

const viewBookDetail = (book) => {
  // Navigate to book detail page
  navigateTo(`/book/${book.slug}`)
}

// Helper Functions
const getSortField = (sortValue) => {
  const sortMap = {
    'newest': 'createdAt',
    'oldest': 'createdAt', 
    'price_asc': 'price',
    'price_desc': 'price',
    'name_asc': 'title',
    'name_desc': 'title',
    'bestseller': 'sold_quantity'
  }
  return sortMap[sortValue] || 'createdAt'
}

const getSortOrder = (sortValue) => {
  const orderMap = {
    'newest': 'desc',
    'oldest': 'asc',
    'price_asc': 'asc', 
    'price_desc': 'desc',
    'name_asc': 'asc',
    'name_desc': 'desc',
    'bestseller': 'desc'
  }
  return orderMap[sortValue] || 'desc'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getStockStatusLabel = (status) => {
  const statusMap = {
    'in_stock': 'Còn hàng',
    'low_stock': 'Sắp hết',
    'out_of_stock': 'Hết hàng'
  }
  return statusMap[status] || status
}

const getStockStatusSeverity = (status) => {
  const severityMap = {
    'in_stock': 'success',
    'low_stock': 'warning', 
    'out_of_stock': 'danger'
  }
  return severityMap[status] || 'info'
}

// Lifecycle
onMounted(() => {
  fetchDropdownData()
  
  // Check if there are URL params for initial search
  const route = useRoute()
  if (route.query.q) {
    searchParams.keyword = route.query.q
  }
    performSearch()
})
</script>

<style scoped>
.advanced-search-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
}

.search-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
}

.search-form-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
}

.search-results-section {
  background: #f8fafc;
  min-height: 50vh;
  padding: 2rem 0;
}

.book-card {
  transition: all 0.3s ease;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-list-item {
  transition: all 0.3s ease;
}

.book-list-item:hover {
  transform: translateX(4px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>