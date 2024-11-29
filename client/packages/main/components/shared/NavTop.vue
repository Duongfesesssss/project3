<script lang="ts" setup>
const { data } = useAuth();
const { signOut } = useAuth();
const toast = useToast();
const isOpenModal = ref(false);
const isOpenInfoModal = ref(false);
const isOpenChangePasswordModal = ref(false);
const doLogout = async () => {
  await signOut({
    callbackUrl: '/',
    external: true,
  });
  toast.add({
    severity: 'success',
    summary: 'Đăng xuất',
    detail: 'Đăng xuất thành công',
    life: 2000,
    closable: true,
  });
};
const user = ref(data.value?.data?.data?.user);
const isShowDropdown = ref(false);
const dropdown = ref(null);

const toggleDropdown = () => {
  isShowDropdown.value = !isShowDropdown.value;
};

const handleClickOutside = (event: any) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    isShowDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const openClipBoardModal = () => {
  isOpenModal.value = true;
};
const openClickInfoModal = () => {
  isOpenInfoModal.value = true;
};
const openClickChangePasswordModal = () => {
  isOpenChangePasswordModal.value = true;
};
</script>

<template>
  <ul class="nav-top">
    <li>
      <NuxtLink class="cursor-pointer no-underline">
        Giới thiệu
      </NuxtLink>
    </li>
    <li>
      <a
        class="cursor-pointer no-underline"
        @click="openClipBoardModal()"
      >Liên hệ</a>
    </li>
    <li>
      <NuxtLink class="cursor-pointer no-underline">
        Hướng dẫn
      </NuxtLink>
    </li>
  </ul>
  <div class="user-account">
    <NuxtLink
      v-if="user?.user_name == undefined"
      to="/login"
      class="btn btn-login"
    >
      <img
        alt=""
        width="16"
        height="16"
      >
      <span class="login-text">Đăng nhập</span>
    </NuxtLink>
    <div
      v-if="user?.user_name != undefined"
      ref="dropdown"
      class="dropdown"
    >
      <NuxtLink
        class="dropdown-toggle btn-acount"
        @click="toggleDropdown"
      >
        <img
          alt=""
          width="16"
          height="16"
        >
        <span
          class="acount-username"
          style="text-transform: uppercase"
        >CHÀO {{ user.user_info.full_name || user.user_name }}</span>
      </NuxtLink>
      <ul
        class="dropdown-menu"
        :class="{ show: isShowDropdown }"
      >
        <li>
          <span
            style="font-size: 15px"
            class="d-flex items-center"
          >
            <i
              class="pi pi-user"
              style="color: slateblue; padding-left: 14px"
            />
            <a
              class="cursor-pointer no-underline"
              @click="openClickInfoModal()"
            >Thông tin cá nhân</a></span>
          <SharedModalsThongTinCaNhan
            :is-visible="isOpenInfoModal"
            @hide-modal="isOpenInfoModal = false"
          />
        </li>
        <li>
          <span
            style="font-size: 15px"
            class="d-flex items-center"
          >
            <i
              class="pi pi-key"
              style="color: slateblue; padding-left: 14px"
            />
            <a
              class="cursor-pointer no-underline"
              @click="openClickChangePasswordModal()"
            >Thay đổi mật khẩu</a></span>
          <SharedModalsThayDoiMatKhau
            :is-visible="isOpenChangePasswordModal"
            @hide-modal="isOpenChangePasswordModal = false"
          />
        </li>
        <li>
          <NuxtLink
            to="/cms"
            style="font-size: 15px"
            class="d-flex items-center"
          >
            <i
              class="pi pi-desktop mr-2"
              style="color: slateblue"
            />

            <span style="padding-left: 8px">Vào trang quản trị</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            style="font-size: 15px"
            class="d-flex items-center cursor-pointer no-underline"
            @click.prevent="doLogout"
          >
            <i
              class="pi pi-sign-out mr-2"
              style="color: slateblue"
            />

            <span style="padding-left: 8px">Đăng xuất</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
  <!-- end user-account -->
</template>
