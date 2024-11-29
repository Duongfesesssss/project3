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
        to: '/cms/book',
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
          {
            label: 'Quản lý danh mục',
            to: '/cms/ke-hoach',
          },
        ],
        icon: 'pi pi-cog',
        to: '',
      },
      // {
      //   label: 'Mô hình quản lý rủi ro thiên tai dựa vào cộng đồng',
      //   icon: 'pi pi-fw pi-user',
      //   to: '/cms/manageModel',
      // },
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
