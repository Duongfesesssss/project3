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
    </ToolBar>

    <DataTable
      :value="orders"
      :rows="10"
      :rows-per-page-options="[5, 10, 20, 50]"
      column-resize-mode="expand"
      removable-sort
      show-gridlines
      :lazy="true"
      paginator
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="hiển thị {first} đến {last} trong {totalRecords} đơn hàng"
      :total-records="totalRecords"
      :loading="loading"
      data-key="id"
      @page="onPage($event)"
      @sort="onSort($event)"
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
                placeholder="Tìm kiếm theo mã đơn hàng, địa chỉ..."
                class="w-full"
                @keyup.enter="timKiem"
              />
            </IconField>
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
              @click="clearFilter"
            />
          </div>
        </div>
      </template>

            <template #empty>
              <div class="text-center p-4">
                <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
                <p class="text-lg text-500">Không có đơn hàng nào</p>
              </div>
            </template>
            
            <Column
              field="orderCode"
              header="Mã đơn hàng"
              :sortable="true"
              style="min-width: 8rem"
            >
              <template #body="{ data }">
                <span class="font-semibold">#{{ data.orderCode }}</span>
              </template>
            </Column>
            
            <Column
              field="user_id"
              header="Khách hàng"
              :sortable="true"
              style="min-width: 10rem"
            >
              <template #body="{ data }">
                <span>{{ data.user_id?.email || 'N/A' }}</span>
              </template>
            </Column>
            
            <Column
              field="items"
              header="Sản phẩm"
              style="min-width: 20rem"
            >
              <template #body="{ data }">
                <div class="flex flex-column gap-1">
                  <div 
                    v-for="item in data.items" 
                    :key="item._id"
                    class="p-2 border-round-sm surface-100 mb-1"
                  >
                    <div class="font-medium text-900 mb-1">{{ item.book_id?.title || 'N/A' }}</div>
                    <div class="text-600 text-sm">
                      Số lượng: <span class="font-semibold">{{ item.quantity }}</span> × {{ formatCurrency(item.price) }}
                    </div>
                  </div>
                </div>
              </template>
            </Column>
            
            <Column
              field="total_amount"
              header="Tổng tiền"
              :sortable="true"
              style="min-width: 8rem"
            >
              <template #body="{ data }">
                <span class="font-semibold text-primary">{{ formatCurrency(data.total_amount) }}</span>
              </template>
            </Column>
            
            <Column
              field="status"
              header="Trạng thái"
              :sortable="true"
              style="min-width: 8rem"
            >
              <template #body="{ data }">
                <Tag 
                  :value="getStatusLabel(data.status)" 
                  :severity="getStatusSeverity(data.status)"
                />
              </template>
            </Column>
            
            <Column
              field="payment_method"
              header="Phương thức thanh toán"
              :sortable="true"
              style="min-width: 10rem"
            >
              <template #body="{ data }">
                <span>{{ getPaymentMethodLabel(data.payment_method) }}</span>
              </template>
            </Column>
            
            <Column
              field="createdAt"
              header="Ngày tạo"
              :sortable="true"
              style="min-width: 10rem"
            >
              <template #body="{ data }">
                <span>{{ formatDate(data.createdAt) }}</span>
              </template>
            </Column>
            
            <Column
              header="Thao tác"
              style="min-width: 8rem"
            >
              <template #body="{ data }">
                <div class="flex gap-2">
                  <Button
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-info p-button-text"
                    v-tooltip.top="'Xem chi tiết'"
                    @click="viewOrderDetail(data)"
                  />
                  <Button
                    v-if="data.status !== 'delivered' && data.status !== 'cancelled'"
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-success p-button-text"
                    v-tooltip.top="'Cập nhật trạng thái'"
                    @click="updateOrderStatus(data)"
                  />
                </div>
              </template>
            </Column>
    </DataTable>

    <!-- Dialog xem chi tiết đơn hàng -->
    <Dialog
      v-model:visible="orderDetailVisible"
      :style="{ width: '60vw' }"
      header="Chi tiết đơn hàng"
      :modal="true"
      class="p-fluid"
    >
      <div v-if="selectedOrder" class="grid">
        <div class="col-12 md:col-6">
          <h6>Thông tin đơn hàng</h6>
          <div class="field">
            <label>Mã đơn hàng:</label>
            <span class="font-semibold">#{{ selectedOrder.orderCode }}</span>
          </div>
          <div class="field">
            <label>Trạng thái:</label>
            <Tag 
              :value="getStatusLabel(selectedOrder.status)" 
              :severity="getStatusSeverity(selectedOrder.status)"
            />
          </div>
          <div class="field">
            <label>Phương thức thanh toán:</label>
            <span>{{ getPaymentMethodLabel(selectedOrder.payment_method) }}</span>
          </div>
          <div class="field">
            <label>Tổng tiền:</label>
            <span class="font-semibold text-primary">{{ formatCurrency(selectedOrder.total_amount) }}</span>
          </div>
          <div class="field">
            <label>Ngày tạo:</label>
            <span>{{ formatDate(selectedOrder.createdAt) }}</span>
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <h6>Địa chỉ giao hàng</h6>
          <div class="field">
            <span>{{ selectedOrder.shipping_address || 'Chưa có địa chỉ' }}</span>
          </div>
          
          <h6>Ghi chú</h6>
          <div class="field">
            <span>{{ selectedOrder.note || 'Không có ghi chú' }}</span>
          </div>
        </div>
        
        <div class="col-12">
          <h6>Chi tiết sản phẩm</h6>
          <DataTable :value="selectedOrder.items" responsiveLayout="scroll">
            <Column field="book_id.title" header="Tên sách">
              <template #body="{ data }">
                <div class="flex align-items-center gap-3">
                  <img 
                    v-if="data.book_id?.image_link"
                    :src="data.book_id.image_link" 
                    :alt="data.book_id?.title"
                    class="w-4rem h-4rem object-fit-cover border-round"
                  />
                  <span>{{ data.book_id?.title || 'N/A' }}</span>
                </div>
              </template>
            </Column>
            <Column field="quantity" header="Số lượng" />
            <Column field="price" header="Đơn giá">
              <template #body="{ data }">
                {{ formatCurrency(data.price) }}
              </template>
            </Column>
            <Column header="Thành tiền">
              <template #body="{ data }">
                <span class="font-semibold">{{ formatCurrency(data.price * data.quantity) }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { DonHangService } from '~/packages/base/services/don-hang.service'

// Layout imports
definePageMeta({
  layout: 'cms-default'
})

// Breadcrumb data
const home = ref({ icon: 'pi pi-home', route: '/cms' })
const items = ref([{ label: 'Quản lý đơn hàng' }])

// Data
const orders = ref([])
const loading = ref(false)
const orderDetailVisible = ref(false)
const selectedOrder = ref(null)
const toast = useToast()

// Search data
const keyWords = ref('')
const filterProject = ref({
  rows: 10,
  first: 0,
  page: 0,
  sortField: '',
  sortOrder: 'desc'
})
const filters = ref({
  keyword: ''
})
const totalRecords = ref(0)


// Methods
const fetchOrders = async () => {
  loading.value = true
  try {
    const payload = Object.assign(filterProject.value, filters.value)
    const response = await DonHangService.getDatatable(payload)
    
    if (response) {
      orders.value = response.data || []
      totalRecords.value = response.totalRecords || 0
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách đơn hàng:', error)
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách đơn hàng',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const timKiem = () => {
  filters.value.keyword = keyWords.value
  filterProject.value.first = 0
  filterProject.value.page = 0
  fetchOrders()
}

const clearFilter = () => {
  keyWords.value = ''
  filters.value.keyword = ''
  filterProject.value.first = 0
  filterProject.value.page = 0
  fetchOrders()
}

const onPage = (event) => {
  filterProject.value.first = event.first
  filterProject.value.rows = event.rows
  filterProject.value.page = event.page
  fetchOrders()
}

const onSort = (event) => {
  filterProject.value.sortField = event.sortField
  filterProject.value.sortOrder = event.sortOrder
  fetchOrders()
}


const viewOrderDetail = (order) => {
  selectedOrder.value = order
  orderDetailVisible.value = true
}

const updateOrderStatus = (order) => {
  // TODO: Implement status update functionality
  console.log('Update status for order:', order)
}

const getStatusLabel = (status) => {
  const statusMap = {
    'pending': 'Chờ thanh toán',
    'paid': 'Đã thanh toán',
    'processing': 'Đang xử lý',
    'shipped': 'Đang giao',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy'
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'pending': 'warning',
    'paid': 'success',
    'processing': 'info',
    'shipped': 'info',
    'delivered': 'success',
    'cancelled': 'danger'
  }
  return severityMap[status] || 'info'
}

const getPaymentMethodLabel = (method) => {
  const methodMap = {
    'cod': 'Thanh toán khi nhận hàng',
    'bank_transfer': 'Chuyển khoản ngân hàng',
    'payos': 'PayOS'
  }
  return methodMap[method] || method
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('vi-VN')
}

// Lifecycle
onMounted(() => {
  fetchOrders()
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