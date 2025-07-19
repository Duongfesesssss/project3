<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">Đơn hàng đã mua</h1>
      
      <!-- Loading State -->
      <div v-if="pending" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!orders || orders.length === 0" class="text-center py-12">
        <div class="mb-4">
          <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Chưa có đơn hàng nào</h3>
        <p class="text-gray-500 mb-4">Bạn chưa mua sản phẩm nào. Hãy khám phá các sản phẩm của chúng tôi!</p>
        <NuxtLink to="/" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Mua sắm ngay
        </NuxtLink>
      </div>

      <!-- Orders List -->
      <div v-else class="space-y-6">
        <div v-for="order in orders" :key="order._id" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Order Header -->
          <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-4">
                  <h3 class="text-lg font-semibold text-gray-900">
                    Đơn hàng #{{ order.order_code || order._id.slice(-8) }}
                  </h3>
                  <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  Ngày đặt: {{ formatDate(order.created_at) }}
                </p>
              </div>
              <div class="mt-4 sm:mt-0 text-right">
                <p class="text-lg font-bold text-gray-900">
                  {{ formatCurrency(order.total_amount) }}
                </p>
                <p class="text-sm text-green-600 font-medium">Đã thanh toán</p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="item in order.items" :key="item._id" class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img 
                  :src="item.book_id?.image_link || '/placeholder-book.jpg'" 
                  :alt="item.book_id?.title"
                  class="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                  @error="handleImageError"
                >
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 truncate">
                    {{ item.book_id?.title || 'Sản phẩm không xác định' }}
                  </h4>
                  <p class="text-sm text-gray-500 mt-1">
                    Tác giả: {{ item.book_id?.author || 'Không rõ' }}
                  </p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-sm text-gray-600">
                      Số lượng: {{ item.quantity }}
                    </span>
                    <span class="font-medium text-gray-900">
                      {{ formatCurrency(item.price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Details -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 class="font-medium text-gray-900 mb-2">Địa chỉ giao hàng</h5>
                  <p class="text-sm text-gray-600">{{ order.shipping_address }}</p>
                </div>
                <div>
                  <h5 class="font-medium text-gray-900 mb-2">Phương thức thanh toán</h5>
                  <p class="text-sm text-gray-600">{{ getPaymentMethodText(order.payment_method) }}</p>
                </div>
              </div>
              <div v-if="order.note" class="mt-4">
                <h5 class="font-medium text-gray-900 mb-2">Ghi chú</h5>
                <p class="text-sm text-gray-600">{{ order.note }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/packages/base/stores/auth.store'

// Reactive data
const orders = ref([])
const pending = ref(true)
const authStore = useAuthStore()
const { data: authData } = useAuth()

// Fetch paid orders
const fetchPaidOrders = async () => {
  try {
    pending.value = true
    
    // Kiểm tra nuxt auth
    if (!authData.value?.user) {
      console.error('Chưa đăng nhập')
      await navigateTo('/login')
      return
    }
    
    // Dùng proxy của nuxt-auth
    const response = await $fetch('/api/order/my-paid-orders')
    
    orders.value = response.data || []
  } catch (error) {
    console.error('Lỗi khi lấy đơn hàng:', error)
    if (error.status === 401) {
      await navigateTo('/login')
    }
  } finally {
    pending.value = false
  }
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get status class
const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'processing': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-purple-100 text-purple-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Get status text
const getStatusText = (status) => {
  const texts = {
    'pending': 'Chờ xử lý',
    'processing': 'Đang xử lý',
    'shipped': 'Đang giao',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy'
  }
  return texts[status] || 'Không xác định'
}

// Get payment method text
const getPaymentMethodText = (method) => {
  const methods = {
    'cash': 'Tiền mặt',
    'card': 'Thẻ tín dụng',
    'payos': 'PayOS',
    'bank_transfer': 'Chuyển khoản'
  }
  return methods[method] || 'Không xác định'
}

// Handle image error
const handleImageError = (event) => {
  event.target.src = '/placeholder-book.jpg'
}

// Lifecycle
onMounted(() => {
  // Nuxt auth sẽ tự động handle
  fetchPaidOrders()
})
</script>