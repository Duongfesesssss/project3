<script setup lang="ts">
useHead({
  htmlAttrs: {
    class: 'main-theme',
  },
  bodyAttrs: {
    class: 'define-top define-fixed',
  },
});

const { data } = useAuth();
console.log('data user', data.value);
const { isMenuSpActive, toggleMenuSp, isMobileSp, doCheckSp } = useMainLayout();
onMounted(() => {
  doCheckSp();
});
window?.addEventListener('resize', () => {
  doCheckSp();
});

const items = ref([
    {
        label: 'Danh mục',
        root: true,
        items: [
            [
                {
                    items: [
                        { label: 'Features', icon: 'pi pi-list', subtext: 'Subtext of item' },
                        { label: 'Customers', icon: 'pi pi-users', subtext: 'Subtext of item' },
                        { label: 'Case Studies', icon: 'pi pi-file', subtext: 'Subtext of item' }
                    ]
                }
            ],
            [
                {
                    items: [
                        { label: 'Solutions', icon: 'pi pi-shield', subtext: 'Subtext of item' },
                        { label: 'Faq', icon: 'pi pi-question', subtext: 'Subtext of item' },
                        { label: 'Library', icon: 'pi pi-search', subtext: 'Subtext of item' }
                    ]
                }
            ],
            [
                {
                    items: [
                        { label: 'Community', icon: 'pi pi-comments', subtext: 'Subtext of item' },
                        { label: 'Rewards', icon: 'pi pi-star', subtext: 'Subtext of item' },
                        { label: 'Investors', icon: 'pi pi-globe', subtext: 'Subtext of item' }
                    ]
                }
            ],
            [
                {
                    items: [{ image: 'https://primefaces.org/cdn/primevue/images/uikit/uikit-system.png', label: 'GET STARTED', subtext: 'Build spectacular apps in no time.' }]
                }
            ]
        ]
    },
    {
        label: 'Resources',
        root: true
    },
    {
        label: 'Contact',
        root: true
    }
]);
</script>

<template>
  <div>
    <MegaMenu :model="items" class="p-4"
    style="background: none; border-radius; background: linear-gradient(90deg, #ff7e5f, #feb47b);">
            <template #start>
                <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8">
                    <path
                        d="M25.87 18.05L23.16 17.45L25.27 20.46V29.78L32.49 23.76V13.53L29.18 14.73L25.87 18.04V18.05ZM25.27 35.49L29.18 31.58V27.67L25.27 30.98V35.49ZM20.16 17.14H20.03H20.17H20.16ZM30.1 5.19L34.89 4.81L33.08 12.33L24.1 15.67L30.08 5.2L30.1 5.19ZM5.72 14.74L2.41 13.54V23.77L9.63 29.79V20.47L11.74 17.46L9.03 18.06L5.72 14.75V14.74ZM9.63 30.98L5.72 27.67V31.58L9.63 35.49V30.98ZM4.8 5.2L10.78 15.67L1.81 12.33L0 4.81L4.79 5.19L4.8 5.2ZM24.37 21.05V34.59L22.56 37.29L20.46 39.4H14.44L12.34 37.29L10.53 34.59V21.05L12.42 18.23L17.45 26.8L22.48 18.23L24.37 21.05ZM22.85 0L22.57 0.69L17.45 13.08L12.33 0.69L12.05 0H22.85Z"
                        fill="var(--p-primary-color)"
                    />
                    <path
                        d="M30.69 4.21L24.37 4.81L22.57 0.69L22.86 0H26.48L30.69 4.21ZM23.75 5.67L22.66 3.08L18.05 14.24V17.14H19.7H20.03H20.16H20.2L24.1 15.7L30.11 5.19L23.75 5.67ZM4.21002 4.21L10.53 4.81L12.33 0.69L12.05 0H8.43002L4.22002 4.21H4.21002ZM21.9 17.4L20.6 18.2H14.3L13 17.4L12.4 18.2L12.42 18.23L17.45 26.8L22.48 18.23L22.5 18.2L21.9 17.4ZM4.79002 5.19L10.8 15.7L14.7 17.14H14.74H15.2H16.85V14.24L12.24 3.09L11.15 5.68L4.79002 5.2V5.19Z"
                        fill="var(--p-text-color)"
                    />
                </svg>
            </template>
            <template #item="{ item }">
                <a v-if="item.root" class="flex items-center cursor-pointer px-4 py-2 overflow-hidden relative font-semibold text-lg uppercase" style="border-radius: 2rem">
                    <span>{{ item.label }}</span>
                </a>
                <a v-else-if="!item.image" class="flex items-center p-4 cursor-pointer mb-2 gap-3">
                    <span class="inline-flex items-center justify-center rounded-full bg-primary text-primary-contrast w-12 h-12">
                        <i :class="[item.icon, 'text-lg']"></i>
                    </span>
                    <span class="inline-flex flex-col gap-1">
                        <span class="font-bold text-lg">{{ item.label }}</span>
                        <span class="whitespace-nowrap">{{ item.subtext }}</span>
                    </span>
                </a>
                <div v-else class="flex flex-col items-start gap-4 p-2">
                    <img alt="megamenu-demo" :src="item.image" class="w-full" />
                    <span>{{ item.subtext }}</span>
                    <Button :label="item.label" outlined />
                </div>
            </template>
            <template #end>
  <div class="flex items-center gap-4">
    <OverlayBadge value="4" class="inline-flex">
      <Avatar icon="pi pi-shopping-cart" size="large" />
    </OverlayBadge>

    <template v-if="session?.user">
      <div class="relative group">
        <button class="flex items-center gap-2 text-white font-medium px-4 py-2 rounded-full hover:bg-white/10 transition">
          <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png" shape="circle" size="large" />
          <span class="hidden sm:inline">Chào, {{ session.user.name }}</span>
          <i class="pi pi-chevron-down"></i>
        </button>

        <!-- Dropdown menu -->
        <div
          class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all"
        >
          <NuxtLink to="/profile" class="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Thông tin</NuxtLink>
          <NuxtLink to="/admin" class="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Quản lý</NuxtLink>
          <button @click="handleLogout" class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Đăng xuất</button>
        </div>
      </div>
    </template>

    <template v-else>
      <NuxtLink to="/login" class="bg-white text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition">
        Đăng nhập
      </NuxtLink>
    </template>
  </div>
</template>
        </MegaMenu>
    <main>
      <NuxtPage /> <!-- Quan trọng: Thêm NuxtPage để render nội dung trang -->
    </main>

    <!-- Footer -->
    <footer class="bg-white shadow-md py-4 mt-auto">
      <div class="max-w-7xl mx-auto text-center text-sm text-gray-500">
        © 2025 Hệ thống bán sách online dựa trên nền tảng web.
      </div>
    </footer>
  </div>
</template>

<style lang="scss">


</style>




