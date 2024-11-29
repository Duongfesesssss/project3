<template>
  <div class="p-card">
    <ToolBar class="mb-6">
      <template #start>
        <div class="flex flex-column justify-center">
          <Breadcrumb
            :home="home"
            :model="items"
          >
            <template #item="{ item, props }">
              <router-link
                v-if="item.route"
                v-slot="{ href, navigate }"
                :to="item.route"
                custom
              >
                <a
                  :href="href"
                  v-bind="props.action"
                  @click="navigate"
                >
                  <span :class="[item.icon, 'text-color']" />
                  <span class="text-primary font-semibold">{{ item.label }}</span>
                </a>
              </router-link>
              <a
                v-else
                :href="item.url"
                :target="item.target"
                v-bind="props.action"
              >
                <span class="text-surface-700 dark:text-surface-0">{{ item.label }}</span>
              </a>
            </template>
          </Breadcrumb>
        </div>
      </template>
      <template #end>
        <div class="flex items-center gap-2">
          <div>
            <Button
              label="Thêm mới"
              icon="pi pi-plus"
              class="mr-2"
            />
          </div>
        </div>
      </template>
    </ToolBar>

    <DataTable
      ref="dt"
      v-model:expandedRows="expandedRows"
      v-model:rows="filterProject.rows"
      :first="filterProject.first"
      data-key="id"
      column-resize-mode="expand"
      show-gridlines
      :total-records="totalRecords"
      :value="projectData"
      removable-sort
      :loading="loading"
      :rows-per-page-options="[5, 10, 20, 50]"
      :lazy="true"
      sort-field="ngay_phathanh"
      :sort-order="-1"
      paginator
      scrollable
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="hiển thị {first} đến {last} trong {totalRecords} kế hoạch"
      @page="onPage($event as PageEvent)"
      @sort="onSort($event as SortEvent)"
    >
      <template #header>
        <div class="grid grid-cols-1 xl:grid-cols-5 md:grid-cols-3 gap-4 mb-1">
          <div class="col-span-1">
            <IconField icon-position="left">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="keyWords"
                placeholder="Tìm kiếm"
                class="w-full"
              />
            </IconField>
            <span class="text-red-500">{{ errors.keyWords }}</span>
          </div>
          <div
            v-if="phanLoaiId == '7' || phanLoaiId == '8'"
            class="col-span-1"
          >
            <Select
              v-model="filter.capTaiLieuId"
              :options="listCapDonViId || []"
              :max-selected-labels="3"
              option-label="mo_ta"
              option-value="id"
              fulid
              placeholder="Chọn cấp đơn vị"
              filter
              :show-clear="filter.capTaiLieuId > 0 && filter.capTaiLieuId != null"
              class="w-full"
            />
          </div>
          <div class="col-span-1">
            <MultiSelect
              v-model="filter.listDonViPhatHanhId"
              :options="listDonViPhatHanhId || []"
              :max-selected-labels="3"
              :selected-items-label="`${filter.listDonViPhatHanhId.length} đơn vị phát hành`"
              option-label="mo_ta"
              option-value="id"
              fulid
              placeholder="Chọn đơn vị ban hành"
              filter
              class="w-full"
            />
          </div>
          <div class="col-span-1">
            <DatePicker
              v-model="filter.from"
              :max-date="filter.to"
              show-icon
              icon-display="input"
              date-format="dd/mm/yy"
              placeholder="Thời gian ban hành từ"
              class="w-full"
              show-button-bar
            />
          </div>
          <div class="col-span-1">
            <DatePicker
              v-model="filter.to"
              :min-date="filter.from"
              show-icon
              icon-display="input"
              date-format="dd/mm/yy"
              placeholder="Thời gian ban hành đến"
              class="w-full"
              show-button-bar
            />
          </div>
          <div
            v-if="phanLoaiId == '7' || phanLoaiId == '9'"
            class="col-span-1"
          >
            <MultiSelect
              v-model="filter.listGiaiDoanId"
              :options="listGiaiDoanId || []"
              :max-selected-labels="3"
              :selected-items-label="`${filter.listGiaiDoanId.length} giai đoạn`"
              option-label="mo_ta"
              option-value="id"
              placeholder="Chọn giai đoạn"
              filter
              class="w-full"
            />
          </div>
          <div
            v-if="phanLoaiId == '8' || phanLoaiId == '23'"
            class="col-span-1"
          >
            <MultiSelect
              v-model="filter.listNamTaiLieu"
              :options="listNamTaiLieu || []"
              :max-selected-labels="3"
              :selected-items-label="`${filter.listNamTaiLieu.length} năm tài liệu`"
              option-label="mo_ta"
              option-value="id"
              fulid
              placeholder="Chọn năm kế hoạch"
              filter
              class="w-full"
            />
          </div>
          <div class="col-span-1">
            <Button
              type="button"
              icon="pi pi-filter"
              label="Tìm kiếm"
              class="w-full"
              @click="timKiem"
            />
          </div>
          <div class="col-span-1">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Bỏ lọc"
              outlined
              severity="danger"
              class="w-full"
              @click="clearFilter()"
            />
          </div>
        </div>
      </template>
      <template #empty>
        <div class="text-center">
          <span class="font-bold">Không có kế hoạch nào!</span>
        </div>
      </template>
      <Column
        expander
        style="padding: 10px; width: 2rem"
      />
      <Column
        class="text-center"
        body-style="text-align:center"
      >
        <template #header>
          <span class="m-auto"><b>STT</b></span>
        </template>
        <template #body="slotProps">
          {{ getRowSTT(slotProps.index) }}
        </template>
      </Column>

      <Column
        field="so_vanban"
        header="Số Văn Bản"
        sortable
      />
      <Column
        field="ten_tailieu"
        header="Tên kế hoạch"
        sortable
      >
        <template #body="slotProps">
          <b>{{ slotProps.data.ten_tailieu }}</b>
        </template>
      </Column>
      <Column
        field="ngay_phathanh"
        header="Ngày ban hành"
        sortable
      >
        <template #body="slotProps">

        </template>
      </Column>
      <Column
        v-if="phanLoaiId == '7' || phanLoaiId == '9'"
        field="giaiDoanId"
        header="Giai đoạn"
        :show-filter-match-modes="false"
        sortable
      >
        <template #body="slotProps">
          {{ slotProps.data.giaidoan || '' }}
        </template>
      </Column>
      <Column
        v-if="phanLoaiId == '8' || phanLoaiId == '23'"
        field="nam_tailieu"
        header="Năm kế hoạch"
        :show-filter-match-modes="false"
        sortable
      >
        <template #body="slotProps">
          {{ slotProps.data.nam_tailieu || '' }}
        </template>
      </Column>
      <Column
        header="Đơn vị ban hành"
        filter-field="donViPhatHanhId"
        field="donvi_phathanh_id"
        :show-filter-match-modes="false"
        sortable
      >
        <template #body="slotProps">
          {{ slotProps.data.donvi_phathanh || '' }}
        </template>
      </Column>
      <Column
        header="Phân loại"
        sortable
        filter-field="phanloaiTaiLieuId"
        field="phanloai_tailieu_id"
        :show-filter-match-modes="false"
      >
        <template #body="slotProps">
          {{ slotProps.data.phanloai_tailieu || '' }}
        </template>
      </Column>

      <Column
        :exportable="false"
        style="min-width: 9rem"
        body-style="text-align:center"
        :frozen="true"
        align-frozen="right"
      >
        <template #header>
          <span class="m-auto"><b>Thao tác</b></span>
        </template>
        <template #body="slotProps">
          <div class="flex justify-center items-center space-x-4">
            <a
              v-if="slotProps.data.url"
              :href="`${UploadService.baseApiUrl}/_documents/${slotProps.data.tenfile_luutru}`"
              target="_blank"
              class="button-like"
            >
              <Button
                v-tooltip="'Xem kế hoạch'"
                icon="pi pi-eye"
                outlined
                rounded
                severity="primary"
                class="mr-2"
              />
            </a>
            <Button
              v-tooltip="'Chỉnh sửa kế hoạch'"
              icon="pi pi-pencil"
              outlined
              rounded
              severity="warn"
              class="mr-2"
              @click="onEditProject(slotProps.data)"
            />
            <Button
              v-tooltip="'Xoá kế hoạch'"
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              class="mr-2"
              @click="confirmDeleteProject(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useToast } from 'primevue/usetoast';
import { useDialog } from 'primevue/usedialog';
import { useConfirm } from 'primevue/useconfirm';
import type { RouteLocationPathRaw } from 'vue-router';
// import { KeHoachModel } from '~/packages/base/models/dto/request/tai-lieu/ke-hoach.model';
import { CategoryService } from '~/packages/base/services/category/category.service';
import { KeHoachService } from '~/packages/base/services/tai-lieu/ke-hoach.service';
import { UploadService } from '~/packages/base/services/upload/upload.service';
import type { PageEvent, SortEvent } from '~/packages/base/models/event';
import { TaiLieuService } from '~/packages/base/services/tai-lieu/tai-lieu.service';

definePageMeta({
  layout: 'cms-default',
  middleware: 'auth',
});

const route = useRoute();
const phanLoaiId = ref();
phanLoaiId.value = route.query.phanLoaiId;
const expandedRows = ref();
const home = ref({
  icon: 'pi pi-home',
  route: '/cms',
});

const items = ref([{ label: 'Quản lý' }, { label: 'Kế hoạch' }, { label: 'Kế Hoạch PCTT' }]);

const switchLabel = (phanLoaiId: string) => {
  switch (phanLoaiId) {
    case '7':
      items.value = [];
      items.value = [{ label: 'Quản lý' }, { label: 'Kế hoạch' }, { label: 'Kế hoạch 05 năm' }];
      break;
    case '8':
      items.value = [];
      items.value = [{ label: 'Quản lý' }, { label: 'Kế hoạch' }, { label: 'Kế hoạch hàng năm' }];
      break;
    case '9':
      items.value = [];
      items.value = [
        { label: 'Quản lý' },
        { label: 'Kế hoạch' },
        { label: 'Kế hoạch PCTT cấp tỉnh' },
        { label: '05 năm' },
      ];
      break;
    case '23':
      items.value = [];
      items.value = [
        { label: 'Quản lý' },
        { label: 'Kế hoạch' },
        { label: 'Kế hoạch PCTT cấp tỉnh' },
        { label: 'Hàng năm' },
      ];
      break;
  }
};

switchLabel(phanLoaiId.value);

const getRowSTT = (index: number): number => {
  return filterProject.value.first + index + 1;
};

// const listNamTaiLieu = ref<Array<{ id: number; mo_ta: string }>>([]);
// for (let i = new Date().getFullYear(); i >= new Date().getFullYear() - 10; i--) {
//   listNamTaiLieu.value.push({
//     id: i,
//     mo_ta: i.toString(),
//   });
// }

const toast = useToast();
const dialog = useDialog();
const confirm = useConfirm();
// const KeHoachModal = defineAsyncComponent(() => import('../../../../components/ke-hoach/ke-hoach-modal.vue'));

definePageMeta({
  layout: 'cms-default',
  middleware: 'auth',
});

const dt = ref();
const projectData = ref();
const totalRecords = ref(0);
const filter = ref();

const schema = yup.object({
  keyWords: yup
    .string()
    .max(256, 'Tối đa 256 ký tự!')
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
});
const [keyWords] = defineField('keyWords');
const filterProject = ref({
  rows: 10,
  first: 0,
  page: 0,
  keyword: '',
  nam_tailieu: 0,
  sortField: 'ngay_phathanh',
  sortOrder: 'desc',
});

const initFilters = () => {
  filter.value = {
    keyword: '',
    giaiDoanId: 0,
    donViPhatHanhId: 0,
    phanLoaiTaiLieuId: phanLoaiId.value || 0,
    nam_tailieu: null,
    listDonViPhatHanhId: [],
    listGiaiDoanId: [],
    listNamTaiLieu: [],
    listNgayBanHanh: [],
    listNgayHieuLuc: [],
    from: null,
    to: null,
    capTaiLieuId: 0,
  };

  if (phanLoaiId.value == '9' || phanLoaiId.value == '23') {
    filter.value.capTaiLieuId = 1;
  }
};

initFilters();

const clearFilter = () => {
  initFilters();
  filterProject.value.first = 0;
  filter.value.phanLoaiTaiLieuId = phanLoaiId.value;
  setTimeout(() => {
    reloadDataTable();
    keyWords.value = '';
  }, 200);
};

// get newRoute when change route
onBeforeRouteUpdate((newRoute: RouteLocationPathRaw) => {
  phanLoaiId.value = newRoute.query?.phanLoaiId ?? 0;
  if (phanLoaiId.value == '9' || phanLoaiId.value == '23') {
    filter.value.capTaiLieuId = 1;
  }
  switchLabel(phanLoaiId.value);
  clearFilter();
});

const loading = ref(true);

const { data: listNamTaiLieu } = await useAsyncData('listNamTaiLieu', () => CategoryService.ListNamTaiLieu());

const { data: listGiaiDoanId } = await useAsyncData('listGiaiDoanId', () => CategoryService.ListGiaiDoanId());

const { data: listDonViPhatHanhId } = await useAsyncData('listDonViPhatHanhId', () =>
  filter.value.capTaiLieuId
    ? CategoryService.ListDonViPhatHanhByCapDonVi(filter.value.capTaiLieuId)
    : CategoryService.ListDonViPhatHanhId(),
);

const { data: listPhanLoaiTaiLieuId } = await useAsyncData('listPhanLoaiTaiLieuId', () =>
  CategoryService.ListPhanLoaiTaiLieuId(2),
);

const { data: listCapDonViId } = await useAsyncData('listCapDonViId', () => CategoryService.ListCapDonVi());

const { data: listCapTinh } = await useAsyncData('listCapTinh', () => CategoryService.ListCapTinh());
const parentProvinceId = 'parent_id_value';
const { data: listCapHuyen } = await useAsyncData('listCapHuyen', () => CategoryService.ListCapHuyen(parentProvinceId));

const { data: listCapXa } = await useAsyncData('listCapXa', () => CategoryService.ListCapXa(parentProvinceId));

watch(
  () => filter.value.capTaiLieuId,
  async () => {
    if (filter.value.capTaiLieuId != null && filter.value.capTaiLieuId > 0) {
      await CategoryService.ListDonViPhatHanhByCapDonVi(filter.value.capTaiLieuId).then((response) => {
        if (response != null) {
          listDonViPhatHanhId.value = response;
        }
        else {
          listDonViPhatHanhId.value = [];
        }
      });
      filter.value.listDonViPhatHanhId = [];
    }
    else {
      await CategoryService.ListDonViPhatHanhId().then((response) => {
        if (response != null) {
          listDonViPhatHanhId.value = response;
        }
        else {
          listDonViPhatHanhId.value = [];
        }
      });
      filter.value.listDonViPhatHanhId = [];
    }
  },
  { deep: true },
);

const onLoadTable = () => {
  if (filter.value.from != null && filter.value.to != null) {
    if (filter.value.from > filter.value.to) {
      toast.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Thời gian bàn hành từ ngày lớn hơn đến!',
        life: 3000,
      });
      loading.value = false;
      return;
    }
  }

  filter.value.capTaiLieuId = filter.value.capTaiLieuId != null ? filter.value.capTaiLieuId : 0;
  KeHoachService.KeHoachDatatable(Object.assign(filterProject.value, filter.value)).then((result) => {
    projectData.value = result?.data;
    totalRecords.value = result?.recordsFiltered ?? 0;
    loading.value = false;
  });

  expandedRows.value = null;
};

const reloadDataTable = () => {
  loading.value = true;
  onLoadTable();
};

// const onCreateProject = () => {
//   dialog.open(KeHoachModal, {
//     props: {
//       header: 'Thêm mới kế hoạch',
//       style: {
//         width: '50vw',
//       },
//       breakpoints: {
//         '960px': '75vw',
//         '640px': '90vw',
//       },
//       modal: true,
//     },
//     onClose: (options) => {
//       const data = options?.data ?? null;
//       if (data) {
//         const buttonType = data;
//         if (buttonType === 'Save') {
//           reloadDataTable();
//         }
//       }
//     },
//     data: {
//       KeHoachModel: new KeHoachModel(),
//       listGiaiDoanId: listGiaiDoanId,
//       listDonViPhatHanhId: listDonViPhatHanhId,
//       listPhanLoaiTaiLieuId: listPhanLoaiTaiLieuId,
//       listCapTinh: listCapTinh,
//       listCapHuyen: listCapHuyen,
//       listCapXa: listCapXa,
//       phanLoaiId: phanLoaiId.value,
//       listCapDonViId: listCapDonViId,
//       listNamTaiLieu: listNamTaiLieu,
//     },
//   });
// };

// const onEditProject = async (props: KeHoachModel) => {
//   const taiLieuData = await TaiLieuService.getItem(props.id ?? 0);
//   props.cap_donvi_id = taiLieuData?.donViPhatHanh?.cap_donvi_id;

//   dialog.open(KeHoachModal, {
//     props: {
//       header: 'Cập nhật thông tin kế hoạch',
//       style: {
//         width: '50vw',
//       },
//       breakpoints: {
//         '960px': '75vw',
//         '640px': '90vw',
//       },
//       modal: true,
//     },
//     onClose: (options) => {
//       const data = options?.data ?? null;
//       if (data) {
//         const buttonType = data;
//         if (buttonType === 'Save') {
//           reloadDataTable();
//         }
//       }
//     },
//     data: {
//       KeHoachModel: props,
//       listGiaiDoanId: listGiaiDoanId,
//       listDonViPhatHanhId: listDonViPhatHanhId,
//       listPhanLoaiTaiLieuId: listPhanLoaiTaiLieuId,
//       listCapTinh: listCapTinh,
//       listCapHuyen: listCapHuyen,
//       listCapXa: listCapXa,
//       phanLoaiId: phanLoaiId.value,
//       listCapDonViId: listCapDonViId,
//       listNamTaiLieu: listNamTaiLieu,
//     },
//   });
// };

// const confirmDeleteProject = (props: KeHoachModel) => {
//   ConfirmDialog.showConfirmDialog(
//     confirm,
//     'Bạn có chắc chắn muốn xóa thông tin này?',
//     'Xác nhận',
//     'pi pi-question-circle',
//     () => {
//       KeHoachService.delete(props).then((result) => {
//         if (result?.status == EnumStatus.OK) {
//           toast.add({
//             severity: 'success',
//             summary: 'Thành công',
//             detail: 'Xóa thông tin kế hoạch thành công!',
//             life: 3000,
//           });
//           reloadDataTable();
//         }
//         else {
//           toast.add({
//             severity: 'error',
//             summary: 'Lỗi',
//             detail: 'Xóa thông tin kế hoạch thất bại!',
//             life: 3000,
//           });
//         }
//       });
//     },
//     () => {},
//     '',
//     ' p-button-danger',
//   );
// };

const onPage = (event: PageEvent) => {
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

onMounted(() => {
  onLoadTable();
});

const timKiem = handleSubmit(async () => {
  filter.value.keyword = keyWords.value;
  filterProject.value.first = 0;
  reloadDataTable();
});
</script>

<style lang="scss" scoped></style>
