<script setup lang="ts">
const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();

const toast = useToast();
const isOpenModal = ref(false);
const isOpenInfoModal = ref(false);
const isOpenChangePasswordModal = ref(false);

const openClickInfoModal = () => {
  isOpenInfoModal.value = true;
};

const openClickChangePasswordModal = () => {
  isOpenChangePasswordModal.value = true;
};

const items = [
  {
    label: 'Thông tin cá nhân',
    icon: 'pi pi-user',
    command: () => {
      openClickInfoModal();
    },
  },
  {
    separator: true,
  },
  {
    label: 'Thay đổi mật khẩu',
    icon: 'pi pi-key',
    command: () => {
      openClickChangePasswordModal();
    },
  },
  {
    separator: true,
  },
  {
    label: 'Đăng xuất',
    icon: 'pi pi-sign-out',
    command: () => {
      toast.add({
        severity: 'success',
        summary: 'Đăng xuất',
        detail: 'Đăng xuất thành công',
        life: 2000,
      });

      setTimeout(dangXuat, 800);
    },
  },
];

// đăng xuất trở về màn hình login
const dangXuat = () => {
  const { signOut } = useAuth();

  signOut({ callbackUrl: '/', external: false }).then(() => {});
};
</script>

<template>
  <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button
        class="layout-menu-button layout-topbar-action"
        @click="onMenuToggle"
      >
        <i class="pi pi-bars" />
      </button>
      <NuxtLink
        to="/"
        class="layout-topbar-logo"
      >
        <span>Bookie</span>
      </NuxtLink>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button
          type="button"
          class="layout-topbar-action"
          @click="toggleDarkMode"
        >
          <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]" />
        </button>
        <div class="relative">
          <button
            v-styleclass="{
              selector: '@next',
              enterFromClass: 'hidden',
              enterActiveClass: 'animate-scalein',
              leaveToClass: 'hidden',
              leaveActiveClass: 'animate-fadeout',
              hideOnOutsideClick: true,
            }"
            type="button"
            class="layout-topbar-action layout-topbar-action-highlight"
          >
            <i class="pi pi-palette" />
          </button>
          <SharedConfigurator />
        </div>
      </div>

      <button
        v-styleclass="{
          selector: '@next',
          enterFromClass: 'hidden',
          enterActiveClass: 'animate-scalein',
          leaveToClass: 'hidden',
          leaveActiveClass: 'animate-fadeout',
          hideOnOutsideClick: true,
        }"
        class="layout-topbar-menu-button layout-topbar-action"
      >
        <i class="pi pi-ellipsis-v" />
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button
            type="button"
            class="layout-topbar-action"
          >
            <i class="pi pi-calendar" />
            <span>Calendar</span>
          </button>
          <button
            type="button"
            class="layout-topbar-action"
          >
            <i class="pi pi-inbox" />
            <span>Messages</span>
          </button>

          <!-- <Toast /> -->
          <SplitButton
            severity="secondary"
            icon="pi pi-user"
            :model="items"
          />
        </div>
      </div>
    </div>
    <!-- <Toast /> -->
    <ConfirmDialog
      class="w-auto"
      group="templateConfirmDialog"
    >
      <template #message="slotProps">
        <!-- <div class="flex flex-col items-center w-full gap-4 border-b border-surface-200 dark:border-surface-700">
          <i :class="slotProps.message.icon" class="!text-6xl text-neutral-500 pt-2" />
          <p>{{ slotProps.message.message }}</p>
        </div> -->
        <div
          class="flex flex-row items-center w-full gap-2 border-b border-surface-200 dark:border-surface-700"
        >
          <i
            :class="slotProps.message.icon"
            class="mr-3"
            style="font-size: 2rem"
          />
          <span>{{ slotProps.message.message }}</span>
        </div>
      </template>
    </ConfirmDialog>
    <DynamicDialog />
  </div>
</template>
