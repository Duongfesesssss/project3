<script setup lang="ts">
import { useAuthStore } from '~/packages/base/stores/auth.store';
import ThongTinCaNhan from '~/components/shared/modals/ThongTinCaNhan.vue';
import ThayDoiMatKhau from '~/components/shared/modals/ThayDoiMatKhau.vue';

useHead({
  htmlAttrs: {
    class: 'main-theme',
  },
  bodyAttrs: {
    class: 'define-top define-fixed',
  },
});

const { data } = useAuth();
const { signOut } = useAuth();
const authStore = useAuthStore();
const toast = useToast();
const { isMenuSpActive, toggleMenuSp, isMobileSp, doCheckSp } = useMainLayout();
const isShowDropdown = ref(false);
const isShowCategoryMenu = ref(false);
const user = ref<any>(null);
const router = useRouter();

// Modal states
const showProfileModal = ref(false);
const showChangePasswordModal = ref(false);

// Functions to handle modal opening
const openProfileModal = () => {
  showProfileModal.value = true;
  isShowDropdown.value = false; // Đóng dropdown
};

const openChangePasswordModal = () => {
  showChangePasswordModal.value = true;
  isShowDropdown.value = false; // Đóng dropdown
};

// Computed property để kiểm tra quyền admin/staff
const canAccessAdmin = computed(() => {
  // Sử dụng data từ @sidebase/nuxt-auth trực tiếp
  const currentUser = (data.value as any)?.user || user.value;
  return currentUser?.role === 'admin' || currentUser?.role === 'staff';
});

// Cập nhật user data khi data thay đổi
watch(data, (newData: any) => {
  console.log('Auth data changed:', newData); // Debug log
  user.value = newData?.user;
  // Cập nhật auth store nếu có user mới
  if (newData?.user && newData?.access_token) {
    authStore.setAuth(newData.user, newData.access_token);
  } else if (newData?.user) {
    // Nếu không có access_token từ session, tạo một token tạm thời
    authStore.setAuth(newData.user, 'session-token');
  } else {
    // Nếu không có user, clear auth store
    authStore.clearAuth();
  }
}, { immediate: true });

onMounted(() => {
  doCheckSp();
});

window?.addEventListener('resize', () => {
  doCheckSp();
});

const categories = ref([
  {
    label: 'Văn học',
    icon: 'pi pi-book',
    items: [
      { label: 'Tiểu thuyết', link: '/category/tieu-thuyet' },
      { label: 'Truyện ngắn', link: '/category/truyen-ngan' },
      { label: 'Thơ', link: '/category/tho' }
    ]
  },
  {
    label: 'Kinh tế',
    icon: 'pi pi-chart-line',
    items: [
      { label: 'Quản trị kinh doanh', link: '/category/quan-tri-kinh-doanh' },
      { label: 'Marketing - Bán hàng', link: '/category/marketing-ban-hang' },
      { label: 'Tài chính', link: '/category/tai-chinh' }
    ]
  },
  {
    label: 'Kỹ năng sống',
    icon: 'pi pi-users',
    items: [
      { label: 'Phát triển bản thân', link: '/category/phat-trien-ban-than' },
      { label: 'Tâm lý', link: '/category/tam-ly' },
      { label: 'Sức khỏe', link: '/category/suc-khoe' }
    ]
  },
  {
    label: 'Thiếu nhi',
    icon: 'pi pi-star',
    items: [
      { label: 'Truyện tranh', link: '/category/truyen-tranh' },
      { label: 'Truyện cổ tích', link: '/category/truyen-co-tich' },
      { label: 'Sách tô màu', link: '/category/sach-to-mau' }
    ]
  }
]);

const doLogout = async () => {
  try {
    await signOut({
      callbackUrl: '/',
      external: false,
    });
    // Reset user data và auth store
    user.value = null;
    authStore.clearAuth();
    isShowDropdown.value = false;
    toast.add({
      severity: 'success',
      summary: 'Đăng xuất',
      detail: 'Đăng xuất thành công!',
      life: 3000,
    });
    router.push('/');
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể đăng xuất!',
      life: 3000,
    });
  }
};

const searchQuery = ref('');
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
    searchQuery.value = '';
  }
};

const toggleCategoryMenu = () => {
  isShowCategoryMenu.value = !isShowCategoryMenu.value;
};

const closeCategoryMenu = () => {
  isShowCategoryMenu.value = false;
};

const cartItemCount = ref(4); // Thay thế bằng dữ liệu thực từ store/service
</script>

<template>
  <div>
    <!-- Top Bar -->
    <!-- <div class="bg-gray-100 py-1 text-sm border-b">
      <div class="container mx-auto px-4 flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <a href="tel:1900123456" class="text-gray-600 hover:text-blue-600 flex items-center">
            <i class="pi pi-phone mr-1"></i> 1900 123 456
          </a>
          <a href="mailto:support@bookkie.vn" class="text-gray-600 hover:text-blue-600 hidden sm:flex items-center">
            <i class="pi pi-envelope mr-1"></i> support@bookkie.vn
          </a>
        </div>
        <div class="flex items-center space-x-4">
          <a href="/track-order" class="text-gray-600 hover:text-blue-600">
            <i class="pi pi-map-marker mr-1"></i> Theo dõi đơn hàng
          </a>
          <a href="/stores" class="text-gray-600 hover:text-blue-600 hidden sm:block">
            <i class="pi pi-home mr-1"></i> Hệ thống cửa hàng
          </a>
        </div>
      </div>
    </div> -->

    <!-- Main Navbar -->
    <div class="sticky top-0 z-50 shadow-md">
      <div class="bg-gradient-to-r from-blue-600 to-purple-600 py-3">
        <div class="container mx-auto px-4">
          <div class="flex items-center justify-between">
            <!-- Logo -->
            <div class="flex items-center">
              <NuxtLink to="/" class="flex items-center">
                <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-10">
                  <path
                    d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
                    fill="#ffffff"
                  />
                  <path
                    d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
                    fill="#ffffff"
                  />
                </svg>
                <span class="text-white font-bold text-2xl ml-2">Bookkie</span>
              </NuxtLink>
            </div>

            <!-- Category Button (Mobile) -->
            <div class="lg:hidden">
              <button 
                @click="toggleCategoryMenu"
                class="flex items-center text-white px-3 py-1 rounded-full hover:bg-white/10"
              >
                <i class="pi pi-bars mr-1"></i>
                <span>Danh mục</span>
              </button>
            </div>

            <!-- Categories (Desktop) -->
            <div class="hidden lg:flex items-center space-x-6">
              <div 
                v-for="category in categories" 
                :key="category.label"
                class="relative group"
              >
                <button class="flex items-center text-white hover:text-yellow-200 transition-colors">
                  <i :class="[category.icon, 'mr-1']"></i>
                  <span>{{ category.label }}</span>
                  <i class="pi pi-chevron-down ml-1 text-xs"></i>
                </button>
                
                <!-- Dropdown -->
                <div class="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
                  <NuxtLink 
                    v-for="item in category.items" 
                    :key="item.label"
                    :to="item.link"
                    class="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </div>
              </div>
              
              <NuxtLink to="/flash-sale" class="flex items-center text-white hover:text-yellow-200 transition-colors">
                <i class="pi pi-bolt mr-1"></i>
                <span>Flash Sale</span>
              </NuxtLink>
              
              <NuxtLink to="/new-releases" class="flex items-center text-white hover:text-yellow-200 transition-colors">
                <i class="pi pi-tag mr-1"></i>
                <span>Sách mới</span>
              </NuxtLink>
            </div>

            <!-- Search -->
            <div class="hidden md:block flex-grow mx-6 max-w-xl">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Tìm kiếm sách, tác giả..."
                  class="w-full px-4 py-2 rounded-full border-0 focus:ring-2 focus:ring-yellow-400"
                  @keyup.enter="handleSearch"
                />
                <button
                  @click="handleSearch"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
                >
                  <i class="pi pi-search"></i>
                </button>
              </div>
            </div>

            <!-- Right Actions -->
            <div class="flex items-center space-x-1 sm:space-x-4">
              <!-- Search Button (Mobile) -->
              <button class="md:hidden text-white p-2 rounded-full hover:bg-white/10">
                <i class="pi pi-search"></i>
              </button>
              
              <!-- Cart -->
              <NuxtLink to="/gio-hang" class="relative text-white p-2 rounded-full hover:bg-white/10">
                <i class="pi pi-shopping-cart text-xl"></i>
                <span 
                  v-if="cartItemCount > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {{ cartItemCount }}
                </span>
              </NuxtLink>
              
              <!-- User Menu -->
              <div class="relative">
                <template v-if="user">
                  <button 
                    @click="isShowDropdown = !isShowDropdown"
                    class="flex items-center gap-2 text-white px-3 py-1 rounded-full hover:bg-white/10"
                  >
                    <img 
                      src="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" 
                      alt="User Avatar" 
                      class="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                    <span class="hidden sm:inline">{{ user.user_name }}</span>
                    <i class="pi pi-chevron-down text-xs"></i>
                  </button>

                  <!-- Dropdown menu -->
                  <div
                    v-show="isShowDropdown"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                  >
                    <button @click="openProfileModal" class="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <i class="pi pi-user mr-2"></i> Thông tin tài khoản
                    </button>
                    <button @click="openChangePasswordModal" class="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <i class="pi pi-lock mr-2"></i> Đổi mật khẩu
                    </button>
                    <NuxtLink to="/orders" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <i class="pi pi-shopping-bag mr-2"></i> Đơn hàng của tôi
                    </NuxtLink>
                    <NuxtLink to="/wishlist" class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                      <i class="pi pi-heart mr-2"></i> Sách yêu thích
                    </NuxtLink>
                    <!-- Chỉ hiển thị cho admin/staff -->
                    <NuxtLink 
                      v-if="canAccessAdmin" 
                      to="/cms" 
                      class="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 border-t border-gray-200"
                    >
                      <i class="pi pi-cog mr-2"></i> Quản lý hệ thống
                    </NuxtLink>
                    <div class="border-t my-1"></div>
                    <button @click="doLogout" class="flex items-center w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                      <i class="pi pi-sign-out mr-2"></i> Đăng xuất
                    </button>
                  </div>
                </template>

                <template v-else>
                  <NuxtLink to="/login" class="flex items-center bg-white text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition">
                    <i class="pi pi-user mr-1"></i>
                    <span>Đăng nhập</span>
                  </NuxtLink>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile Search -->
      <div class="md:hidden bg-white py-2 px-4 border-b">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm sách, tác giả..."
            class="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            @keyup.enter="handleSearch"
          />
          <button
            @click="handleSearch"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
          >
            <i class="pi pi-search"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Category Menu -->
    <div 
      v-if="isShowCategoryMenu" 
      class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
      @click="closeCategoryMenu"
    >
      <div 
        class="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 overflow-y-auto"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">Danh mục sách</h3>
          <button @click="closeCategoryMenu" class="text-gray-500 hover:text-gray-700">
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <div class="space-y-4">
          <div v-for="category in categories" :key="category.label" class="border-b pb-2">
            <div class="font-medium text-gray-800 mb-2 flex items-center">
              <i :class="[category.icon, 'mr-2 text-blue-600']"></i>
              {{ category.label }}
            </div>
            <div class="pl-6 space-y-1">
              <NuxtLink 
                v-for="item in category.items" 
                :key="item.label"
                :to="item.link"
                class="block py-1 text-gray-600 hover:text-blue-600"
              >
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>
          
          <div class="border-b pb-2">
            <NuxtLink to="/flash-sale" class="flex items-center py-2 text-gray-800 hover:text-blue-600">
              <i class="pi pi-bolt mr-2 text-red-500"></i>
              <span>Flash Sale</span>
            </NuxtLink>
          </div>
          
          <div class="border-b pb-2">
            <NuxtLink to="/new-releases" class="flex items-center py-2 text-gray-800 hover:text-blue-600">
              <i class="pi pi-tag mr-2 text-green-500"></i>
              <span>Sách mới</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main>
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- About -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Về Bookkie</h3>
            <p class="text-gray-300 mb-4">Hệ thống bán sách online hàng đầu Việt Nam với hàng ngàn đầu sách chất lượng cao.</p>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-300 hover:text-white">
                <i class="pi pi-facebook text-xl"></i>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <i class="pi pi-instagram text-xl"></i>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <i class="pi pi-youtube text-xl"></i>
              </a>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul class="space-y-2">
              <li><a href="/about" class="text-gray-300 hover:text-white">Giới thiệu</a></li>
              <li><a href="/contact" class="text-gray-300 hover:text-white">Liên hệ</a></li>
              <li><a href="/faq" class="text-gray-300 hover:text-white">Câu hỏi thường gặp</a></li>
              <li><a href="/terms" class="text-gray-300 hover:text-white">Điều khoản sử dụng</a></li>
              <li><a href="/privacy" class="text-gray-300 hover:text-white">Chính sách bảo mật</a></li>
            </ul>
          </div>
          
          <!-- Customer Service -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Dịch vụ khách hàng</h3>
            <ul class="space-y-2">
              <li><a href="/shipping" class="text-gray-300 hover:text-white">Chính sách vận chuyển</a></li>
              <li><a href="/returns" class="text-gray-300 hover:text-white">Chính sách đổi trả</a></li>
              <li><a href="/payment" class="text-gray-300 hover:text-white">Phương thức thanh toán</a></li>
              <li><a href="/loyalty" class="text-gray-300 hover:text-white">Chương trình khách hàng thân thiết</a></li>
            </ul>
          </div>
          
          <!-- Contact -->
          <div>
            <h3 class="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
            <ul class="space-y-2">
              <li class="flex items-start">
                <i class="pi pi-map-marker mt-1 mr-2 text-gray-400"></i>
                <span class="text-gray-300">123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</span>
              </li>
              <li class="flex items-center">
                <i class="pi pi-phone mr-2 text-gray-400"></i>
                <span class="text-gray-300">1900 123 456</span>
              </li>
              <li class="flex items-center">
                <i class="pi pi-envelope mr-2 text-gray-400"></i>
                <span class="text-gray-300">support@bookkie.vn</span>
              </li>
              <li class="flex items-center">
                <i class="pi pi-clock mr-2 text-gray-400"></i>
                <span class="text-gray-300">8:00 - 21:00, Thứ 2 - Chủ nhật</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 Bookkie - Hệ thống bán sách online. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
    
    <Toast />
    
    <!-- Modals -->
    <ThongTinCaNhan 
      :is-visible="showProfileModal" 
      @hide-modal="showProfileModal = false" 
    />
    <ThayDoiMatKhau 
      :is-visible="showChangePasswordModal" 
      @hide-modal="showChangePasswordModal = false" 
    />
  </div>
</template>

<style lang="scss">
.group:hover .group-hover\:block {
  display: block;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>