<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'main-theme',
  },
  bodyAttrs: {
    class: 'define-top define-fixed',
  },
});

const { isMenuSpActive, toggleMenuSp, isMobileSp, doCheckSp } = useMainLayout();
onMounted(() => {
  doCheckSp();
});
window?.addEventListener('resize', () => {
  doCheckSp();
});

const menuItems = ref([
  {
    label: "Trang chủ",
    icon: "pi pi-home",
  },
  {
    label: "Danh mục",
    icon: "pi pi-book",
    items: [
      { label: "Văn học", icon: "pi pi-bookmark" },
      { label: "Kỹ năng sống", icon: "pi pi-star" },
    ],
  },
  {
    label: "Giỏ hàng",
    icon: "pi pi-shopping-cart",
  },
  {
    label: "Tài khoản",
    icon: "pi pi-user",
    items: [
      { label: "Đăng nhập" },
      { label: "Đăng ký" },
    ],
  },
]);
</script>

<template>
   <div class="flex flex-col min-h-screen">
    <header class="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4">
        <Menubar :model="menuItems" class="h-16 flex items-center">

        <template #end>
        <div class="flex items-center gap-2">
            <InputText placeholder="Search" type="text" class="w-32 sm:w-auto" />
            <Avatar image="/images/avatar/amyelsner.png" shape="circle" />
        </div>
    </template>
        </Menubar>
      </div>
    </header>

    <!-- Spacer để đẩy nội dung xuống dưới header -->
    <div class="h-16"></div>

    <!-- Main content -->
    <main class="flex-1 bg-gray-50 py-6 px-4">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-semibold mb-4">Chào mừng đến với cửa hàng sách online!</h1>
        <p class="text-gray-600 mb-4">
          Duyệt qua hàng ngàn tựa sách hấp dẫn thuộc nhiều thể loại khác nhau.
        </p>

        <!-- Danh sách sách gợi ý (ví dụ) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="n in 4"
            :key="n"
            class="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition"
          >
            <div class="h-40 bg-gray-200 rounded mb-4"></div>
            <h2 class="font-bold text-lg mb-2">Tên sách {{ n }}</h2>
            <p class="text-sm text-gray-500">Tác giả: Nguyễn Văn A</p>
            <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white shadow-md py-4 mt-auto">
      <div class="max-w-7xl mx-auto text-center text-sm text-gray-500">
        © 2025 Hệ thống bán sách online dựa trên nền tảng web.
      </div>
    </footer>
  </div>


  <div
    style="height:700px"
    id="wrapper"
    :class="isMenuSpActive ? 'menu-sp-open menu-sp' : ''"
  >
    
  </div>


</template>

<style lang="scss">


</style>




