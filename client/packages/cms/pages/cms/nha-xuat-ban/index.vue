<template>
  <div class="p-card">
    <ToolBar class="mb-6">
      <template #start>
        <div class="flex flex-column justify-center">
          <Breadcrumb :home="home" :model="items">
            <template #item="{ item, props }">
              <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                <a :href="href" v-bind="props.action" @click="navigate">
                  <span :class="[item.icon, 'text-color']" />
                  <span class="text-primary font-semibold">{{ item.label }}</span>
                </a>
              </router-link>
              <a v-else :href="item.url" :target="item.target" v-bind="props.action">
                <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
              </a>
            </template>
          </Breadcrumb>
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <div>
            <Button label="Thêm mới" icon="pi pi-plus" class="mr-2" @click="onModalOpen" />
          </div>
        </div>
      </template>
    </ToolBar>

    <DataTable
      v-model:expandedRows="expandedRows"
      v-model:rows="filterProject.rows"
      sort-field="name"
      :sort-order="-1"
      :rows-per-page-options="[1, 10, 20, 50]"
      column-resize-mode="expand"
      removable-sort
      show-gridlines
      :lazy="true"
      :value="dataNhaXuatBan"
      paginator
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="hiển thị {first} đến {last} trong {totalRecords} nhà xuất bản"
      :total-records="totalRecords"
      :loading="loading"
      data-key="id"
      @page="onPage($event as PageEvent)"
      @sort="onSort($event as SortEvent)"
    >
      <template #header>
        <div class="grid grid-cols-1 xl:grid-cols-5 md:grid-cols-3 gap-4 mb-1">
          <div class="col-span-1">
            <IconField icon-position="left">
              <InputIcon><i class="pi pi-search" /></InputIcon>
              <InputText v-model="keyWords" placeholder="Tìm kiếm" class="w-full" @keyup.enter="timKiem" />
            </IconField>
            <span class="text-red-500">{{ errors.keyWords }}</span>
          </div>
          <div class="col-span-1">
            <Button type="button" icon="pi pi-filter" label="Tìm kiếm" class="w-full" @click="timKiem" />
          </div>
          <div class="col-span-1">
            <Button type="button" icon="pi pi-filter-slash" label="Bỏ lọc" outlined severity="danger" class="w-full" @click="clearFilter()" />
          </div>
        </div>
      </template>

      <template #empty>
        <div class="text-center"><span class="font-bold">Không có nhà xuất bản nào!</span></div>
      </template>

      <Column class="text-center" body-style="text-align:center">
        <template #header>
          <span class="m-auto"><b>STT</b></span>
        </template>
        <template #body="slotProps">
          {{ getRowSTT(slotProps.index) }}
        </template>
      </Column>

      <Column field="name" header="Tên nhà xuất bản" sortable />
      <Column field="phone" header="Số điện thoại" sortable />
      <Column field="email" header="Email" sortable />
      <Column field="address" header="Địa chỉ" sortable />
      <Column field="description" header="Mô tả" sortable />

      <Column :exportable="false" style="min-width: 9rem" body-style="text-align:center" :frozen="true" align-frozen="right">
        <template #header>
          <span class="m-auto"><b>Thao tác</b></span>
        </template>
        <template #body="slotProps">
          <div class="flex justify-center items-center space-x-4">
            <Button
              v-tooltip="'Chỉnh sửa nhà xuất bản'"
              icon="pi pi-pencil"
              outlined
              rounded
              severity="warn"
              class="mr-2"
              @click="onModalOpenEdit(slotProps.data)"
            />
            <Button
              v-tooltip="'Xoá nhà xuất bản'"
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              class="mr-2"
              @click="confirmDeleteNhaXuatBan(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <ClientOnly>
      <NhaXuatBanModal
        :is-visible="isOpenModal"
        :nha-xuat-ban="nhaXuatBanData"
        @reload-data-table="reloadDataTable()"
        @hide-modal="isOpenModal = false"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useToast } from 'primevue/usetoast';
import { useDialog } from 'primevue/usedialog';
import { useConfirm } from 'primevue/useconfirm';
import type { PageEvent, SortEvent } from '~/packages/base/models/event';
import { NhaXuatBanService } from '~/packages/base/services/nha-xuatban.service';
import { NhaXuatBanModel } from '~/packages/base/models/dto/response/nha-xuat-ban/nha-xuatban.model';
import NhaXuatBanModal from '~/packages/cms/components/shared/nha-xuat-ban/NhaXuatBanModal.vue';
import { useRoute } from 'vue-router';

definePageMeta({ layout: 'cms-default' });

const route = useRoute();
const expandedRows = ref();
const home = ref({
  icon: 'pi pi-home',
  route: '/cms',
});

const toast = useToast();
const dialog = useDialog();
const confirm = useConfirm();

const dataNhaXuatBan = ref<NhaXuatBanModel[]>([]);
const items = ref([{ label: 'Quản lý' }, { label: 'Quản lý nhà xuất bản' }]);
const currentPageNumber = ref(0);
const isOpenModal = ref<boolean>(false);
const nhaXuatBanData = ref<NhaXuatBanModel>(new NhaXuatBanModel());

const totalRecords = ref(0);
const filters = ref();
const loading = ref(false);

const schema = yup.object({
  keyWords: yup.string().max(256, 'Tối đa 256 ký tự!'),
});
const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema });
const [keyWords] = defineField('keyWords');

const filterProject = ref({
  rows: 10,
  first: 0,
  page: 0,
  sortField: '',
  sortOrder: 'desc',
});

const initFilters = () => {
  filters.value = {
    keyword: '',
  };
};

initFilters();

const getRowSTT = (index: number): number => {
  return currentPageNumber.value * 10 + index + 1;
};

const reloadDataTable = () => {
  loading.value = true;
  expandedRows.value = [];
  onLoadTable();
};

const onLoadTable = () => {
  loading.value = true;
  NhaXuatBanService.getNhaXuatBanDataTable(Object.assign(filterProject.value, filters.value))
    .then((res) => {
      if (res) {
        dataNhaXuatBan.value = res.data || [];
        totalRecords.value = res.totalRecords ?? 0;
      }
    })
    .catch((error) => {
      console.error('Error loading data:', error);
    })
    .finally(() => {
      loading.value = false;
      expandedRows.value = null;
    });
};

const onPage = (event: PageEvent) => {
  currentPageNumber.value = event.page;
  filterProject.value.first = event.first;
  reloadDataTable();
};

const onSort = (event: SortEvent) => {
  filterProject.value.sortField = event.sortField ?? '';
  if (event.sortOrder != null) {
    filterProject.value.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
  }
  else {
    filterProject.value.sortOrder = '';
  }
  reloadDataTable();
};

const timKiem = handleSubmit(async () => {
  filters.value.keyword = keyWords.value;
  filterProject.value.first = 0;
  reloadDataTable();
});

const clearFilter = () => {
  initFilters();
  filterProject.value.first = 0;
  setTimeout(() => {
    reloadDataTable();
    keyWords.value = '';
  }, 200);
};

const onModalOpen = () => {
  isOpenModal.value = true;
  nhaXuatBanData.value = new NhaXuatBanModel();
};

const onModalOpenEdit = (data: NhaXuatBanModel) => {
  console.log('Editing nha xuat ban:', data);
  isOpenModal.value = true;
  nhaXuatBanData.value = data;
};

const confirmDeleteNhaXuatBan = (props: NhaXuatBanModel) => {
  ConfirmDialog.showConfirmDialog(
    confirm,
    'Bạn có muốn xóa thông tin nhà xuất bản này?',
    'Xác nhận',
    'pi pi-question-circle',
    () => {
      NhaXuatBanService.delete(props).then((result) => {
        if (result?.status == EnumStatus.OK) {
          toast.add({
            severity: 'success',
            summary: 'Xóa thông tin nhà xuất bản thành công !',
            life: 3000,
          });
          reloadDataTable();
        }
        else {
          toast.add({
            severity: 'error',
            summary: 'Xóa thông tin nhà xuất bản thất bại !',
            life: 3000,
          });
        }
      });
    },
    () => {},
    '',
    ' p-button-danger',
  );
};

onMounted(() => {
  onLoadTable();
});
</script>

<style scoped lang="scss"></style> 