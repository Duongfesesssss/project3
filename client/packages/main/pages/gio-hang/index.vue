<template>
    <div class="min-h-screen bg-gray-100 py-12 px-6">
      <!-- Giỏ hàng -->
      <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 class="text-3xl font-semibold text-gray-800 mb-6">Giỏ Hàng</h1>
  
        <!-- Danh sách sản phẩm trong giỏ -->
        <div v-if="cartItems.length > 0" class="space-y-6">
          <div v-for="(item, index) in cartItems" :key="index" class="flex items-center justify-between p-4 border-b">
            <div class="flex items-center">
              <img :src="item.image" alt="product image" class="w-20 h-20 object-cover rounded-lg mr-4" />
              <div>
                <h3 class="font-medium text-lg text-gray-800">{{ item.title }}</h3>
                <p class="text-gray-500 text-sm">{{ item.author }}</p>
                <p class="text-gray-600 text-base">{{ item.price }} đ</p>
              </div>
            </div>
            
            <!-- Số lượng và nút sửa -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center border rounded-md overflow-hidden">
                <button @click="decrementQuantity(index)" class="px-2 py-1 text-gray-600 hover:bg-gray-200">-</button>
                <span class="px-3 py-1 text-gray-700">{{ item.quantity }}</span>
                <button @click="incrementQuantity(index)" class="px-2 py-1 text-gray-600 hover:bg-gray-200">+</button>
              </div>
              <button @click="removeItem(index)" class="text-red-500 hover:text-red-700">
                <i class="pi pi-trash"></i> Xóa
              </button>
            </div>
          </div>
        </div>
  
        <!-- Thông tin giỏ hàng nếu giỏ rỗng -->
        <div v-else class="text-center py-8 text-gray-400">
          <p>Giỏ hàng của bạn hiện tại đang trống. Hãy thêm sản phẩm vào giỏ!</p>
        </div>
  
        <!-- Tổng tiền -->
        <div v-if="cartItems.length > 0" class="mt-6 border-t pt-6">
          <div class="flex justify-between text-lg font-semibold text-gray-800">
            <span>Tổng tiền:</span>
            <span>{{ totalPrice }} đ</span>
          </div>
          <div class="flex justify-between text-lg font-semibold text-gray-800 mt-2">
            <span>Phí vận chuyển:</span>
            <span>30,000 đ</span>
          </div>
          <div class="flex justify-between text-2xl font-bold text-gray-800 mt-4">
            <span>Tổng cộng:</span>
            <span>{{ totalPrice + 30000 }} đ</span>
          </div>
        </div>
  
        <!-- Các nút hành động -->
        <div class="mt-8 flex justify-between">
          <button @click="clearCart" class="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
            Xóa giỏ hàng
          </button>
          <button @click="checkout" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 ml-4">
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const cartItems = ref([
    {
      title: 'Sách Lập Trình Vue.js',
      author: 'Nguyễn Văn A',
      price: 200000,
      quantity: 1,
      image: 'https://placehold.co/200x300?text=Book1',
    },
    {
      title: 'Sách Lập Trình React',
      author: 'Trần Thị B',
      price: 250000,
      quantity: 2,
      image: 'https://placehold.co/200x300?text=Book2',
    },
  ]);
  
  // Tính tổng tiền
  const totalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
  });
  
  // Hàm giảm số lượng
  const decrementQuantity = (index) => {
    if (cartItems.value[index].quantity > 1) {
      cartItems.value[index].quantity--;
    }
  };
  
  // Hàm tăng số lượng
  const incrementQuantity = (index) => {
    cartItems.value[index].quantity++;
  };
  
  // Hàm xóa sản phẩm
  const removeItem = (index) => {
    cartItems.value.splice(index, 1);
  };
  
  // Hàm xóa toàn bộ giỏ hàng
  const clearCart = () => {
    cartItems.value = [];
  };
  
  // Hàm thanh toán
  const checkout = () => {
    alert('Thanh toán thành công!');
  };
  </script>
  
  <style scoped>
  /* Tùy chỉnh các thành phần */
  </style>