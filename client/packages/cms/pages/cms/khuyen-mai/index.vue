<template>
  <div class="p-card">
    <ToolBar class="mb-6">
      <template #start>
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
      </template>
      <template #end>
        <Button label="Thêm mới" icon="pi pi-plus" class="mr-2" @click="onModalOpen" />
      </template>
    </ToolBar>

    <DataTable
      v-model:expandedRows="expandedRows"
      v-model:rows="filterProject.rows"
      :lazy="true"
      :value="dataVoucher"
      :loading="loading"
      :total-records="totalRecords"
      :rows-per-page-options="[10, 20, 50]"
      sort-field="name"
      :sort-order="-1"
      paginator
      data-key="_id"
      @page="onPage"
      @sort="onSort"
    >
      <template #header>
        <div class="grid grid-cols-1 xl:grid-cols-5 md:grid-cols-3 gap-4 mb-1">
          <div class="col-span-1">
            <IconField icon-position="left">
              <InputIcon><i class="pi pi-search" /></InputIcon>
              <InputText v-model="keyWords" placeholder="Tìm kiếm mã voucher, mô tả..." class="w-full" @keyup.enter="timKiem" />
            </IconField>
            <span class="text-red-500">{{ errors.keyWords }}</span>
          </div>
          <div class="col-span-1">
            <Button icon="pi pi-filter" label="Tìm kiếm" class="w-full" @click="timKiem" />
          </div>
          <div class="col-span-1">
            <Button icon="pi pi-filter-slash" label="Bỏ lọc" outlined severity="danger" class="w-full" @click="clearFilter()" />
          </div>
        </div>
      </template>

      <template #empty>
        <div class="text-center"><span class="font-bold">Không có voucher nào!</span></div>
      </template>

      <Column>
        <template #header><b>STT</b></template>
        <template #body="slotProps">{{ getRowSTT(slotProps.index) }}</template>
      </Column>

      <Column field="code" header="Mã voucher" sortable />
      <Column field="discount" header="Giảm (%)" sortable />
      <Column field="visibility" header="Loại" sortable>
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.visibility === 'public' ? 'Cộng đồng' : 'Cá nhân'"
            :severity="slotProps.data.visibility === 'public' ? 'success' : 'info'"
          />
        </template>
      </Column>
      <Column field="usage_limit" header="Giới hạn sử dụng" sortable />
      <Column field="used_count" header="Đã sử dụng" sortable />
      <Column field="min_order_value" header="Giá trị đơn tối thiểu" sortable>
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.min_order_value) }}
        </template>
      </Column>
      <Column field="valid_from" header="Ngày bắt đầu" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.valid_from) }}
        </template>
      </Column>
      <Column field="valid_until" header="Ngày kết thúc" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.valid_until) }}
        </template>
      </Column>

      <Column :exportable="false" style="min-width: 9rem" body-style="text-align:center">
        <template #header><b>Thao tác</b></template>
        <template #body="slotProps">
          <div class="flex justify-center items-center space-x-2">
            <Button icon="pi pi-pencil" outlined rounded severity="warn" @click="onModalOpenEdit(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteVoucher(slotProps.data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <ClientOnly>
      <VoucherModal
        :is-visible="isOpenModal"
        :voucher="voucherData"
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
import { useConfirm } from 'primevue/useconfirm';
import { VoucherService } from '~/packages/base/services/voucher.service';
import { VoucherModel } from '~/packages/base/models/dto/response/voucher/voucher.model';
import VoucherModal from '~/packages/cms/components/shared/voucher/VoucherModal.vue';
import { formatCurrency, formatDate } from '~/packages/base/utils/format';
import { useConfirmDialog } from '~/packages/base/composables/useConfirmDialog';

definePageMeta({ layout: 'cms-default' });

const toast = useToast();
const confirm = useConfirm();

const expandedRows = ref();
const isOpenModal = ref<boolean>(false);
const dataVoucher = ref<VoucherModel[]>([]);
const voucherData = ref<VoucherModel>(new VoucherModel());
const totalRecords = ref(0);
const loading = ref(false);
const currentPageNumber = ref(0);
const { showConfirmDialog } = useConfirmDialog();

const home = ref({ icon: 'pi pi-home', route: '/cms' });
const items = ref([{ label: 'Quản lý' }, { label: 'Quản lý voucher' }]);

const filterProject = ref({
  rows: 10,
  first: 0,
  page: 0,
  sortField: '',
  sortOrder: 'desc',
});
const filters = ref({ keyword: '' });

const schema = yup.object({
  keyWords: yup.string().max(256, 'Tối đa 256 ký tự!'),
});
const { defineField, handleSubmit, errors } = useForm({ validationSchema: schema });
const [keyWords] = defineField('keyWords');

const getRowSTT = (index: number) => currentPageNumber.value * filterProject.value.rows + index + 1;

const reloadDataTable = () => {
  loading.value = true;
  expandedRows.value = [];
  onLoadTable();
};

interface PageEvent {
  page: number;
  first: number;
}

interface DataTableResponse {
  data: VoucherModel[];
  totalRecords: number;
}

const onLoadTable = () => {
  loading.value = true;
  VoucherService.getVoucherDataTable(Object.assign(filterProject.value, filters.value))
    .then((res: DataTableResponse | null) => {
      if (res) {
        dataVoucher.value = res.data || [];
        totalRecords.value = res.totalRecords ?? 0;
      }
    })
    .catch(console.error)
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

const onSort = (event: DataTableSortEvent) => {
  filterProject.value.sortField = typeof event.sortField === 'string' ? event.sortField : '';
  filterProject.value.sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';
  reloadDataTable();
};

const timKiem = handleSubmit(() => {
  filters.value.keyword = keyWords.value;
  filterProject.value.first = 0;
  reloadDataTable();
});

const clearFilter = () => {
  filters.value.keyword = '';
  keyWords.value = '';
  filterProject.value.first = 0;
  reloadDataTable();
};

const onModalOpen = () => {
  voucherData.value = new VoucherModel();
  isOpenModal.value = true;
};

const onModalOpenEdit = (data: VoucherModel) => {
  voucherData.value = { ...data };
  isOpenModal.value = true;
};

const confirmDeleteVoucher = (voucher: VoucherModel) => {
  showConfirmDialog(
    confirm,
    'Bạn có chắc chắn muốn xóa voucher này?',
    'Xác nhận',
    'pi pi-question-circle',
    async () => {
      const result = await VoucherService.delete(voucher._id || (voucher as any).id || voucher);
      if (result?.status === 'OK') {
        toast.add({ severity: 'success', summary: 'Xóa voucher thành công!', life: 3000 });
        reloadDataTable();
      } else {
        toast.add({ severity: 'error', summary: 'Xóa thất bại!', life: 3000 });
      }
    },
    () => {},
    '',
    ' p-button-danger'
  );
};

onMounted(() => onLoadTable());
</script>

<style scoped lang="scss"></style>
