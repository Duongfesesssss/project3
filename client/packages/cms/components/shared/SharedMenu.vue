<script setup lang="ts">
import { ref } from 'vue';
import SharedMenuItem from './SharedMenuItem.vue';

const model = ref([
  {
    label: 'Trang chủ',
    items: [{ label: 'Thống kê', icon: 'pi pi-fw pi-home', to: '/cms' }],
  },
  {
    label: 'Quản lý',
    items: [
      {
            label: 'Quản lý sách',
            icon: 'pi pi-fw pi-objects-column',
            to: '/cms/kho-sach',
          },
      {
            label: 'Quản lý khuyến mãi',
            icon: 'pi pi-fw pi-paypal',
            to: '/cms/khuyen-mai',
          },
          {
            label: 'Quản lý nhà cung cấp',
            icon: 'pi pi-fw pi-building-columns',
            to: '/cms/nha-cung-cap',
          },
          {
            label: 'Quản lý thể loại',
            icon: 'pi pi-fw pi-book',
            to: '/cms/the-loai',
          },
      {
        label: 'Hệ thống',
        items: [
          {
            label: 'Quản lý người dùng',
            to: '/cms/user',
          },
          {
            label: 'Quản lý nhóm người dùng',
            to: '/cms/user-group',
          },
        ],
        icon: 'pi pi-cog',
        to: '',
      },
    ],
    separator: null,
  },
]);
</script>

<template>
  <ul class="layout-menu">
    <template
      v-for="(item, i) in model"
      :key="item"
    >
      <SharedMenuItem
        v-if="!item.separator"
        :item="item"
        :index="i"
      />
      <li
        v-if="item.separator"
        class="menu-separator"
      />
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
