<script setup lang="ts">
import { useAuthStore } from '~/packages/base/stores/auth.store';

// Kiểm tra quyền truy cập CMS
const authStore = useAuthStore();

// Redirect nếu không có quyền
onMounted(() => {
  if (!authStore.isAuthenticated || !authStore.isStaffOrAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Bạn không có quyền truy cập trang quản trị'
    });
  }
});

useHead({
  htmlAttrs: {
    class: 'sakai-theme',
  },
});

const { layoutConfig, layoutState, isSidebarActive, resetMenu } = useLayout();

const outsideClickListener = ref(null);

watch(isSidebarActive, (newVal) => {
  if (newVal) {
    bindOutsideClickListener();
  }
  else {
    unbindOutsideClickListener();
  }
});

const containerClass = computed(() => {
  return {
    'layout-overlay': layoutConfig.menuMode === 'overlay',
    'layout-static': layoutConfig.menuMode === 'static',
    'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive,
    'layout-mobile-active': layoutState.staticMenuMobileActive,
  };
});
const bindOutsideClickListener = () => {
  if (!outsideClickListener.value) {
    outsideClickListener.value = (event) => {
      if (isOutsideClicked(event)) {
        resetMenu();
      }
    };
    document.addEventListener('click', outsideClickListener.value);
  }
};
const unbindOutsideClickListener = () => {
  if (outsideClickListener.value) {
    document.removeEventListener('click', outsideClickListener);
    outsideClickListener.value = null;
  }
};
const isOutsideClicked = (event) => {
  const sidebarEl = document.querySelector('.layout-sidebar');
  const topbarEl = document.querySelector('.layout-menu-button');

  return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
  <div
    class="layout-wrapper"
    :class="containerClass"
  >
    <SharedTopBar />
    <SharedSidebar />
    <div class="layout-main-container">
      <div class="layout-main">
        <NuxtPage />
      </div>
      <SharedFooter />
    </div>
    <div class="layout-mask animate-fadein" />
    <Toast />
  </div>
</template>

<script setup lang="ts"></script>

<style>
@import url("~/packages/cms/assets/styles.scss");
</style>
