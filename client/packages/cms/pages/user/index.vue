<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import 'primeicons/primeicons.css';
import { UserService } from '~/packages/base/services/user.service';
import type {
  UserByGroup,
  UserModel,
} from '~/packages/base/models/dto/response/user/user.model';
import { UserGroupService } from '~/packages/base/services/user-group.service';

const isOpenModal = ref<boolean>(false);
const isOpenUpdate = ref<boolean>(false);
const isOpenChangePassword = ref<boolean>(false);
const toast = useToast();
const confirm = useConfirm();
const dataUpdate = ref<UserModel>();
const dataList = ref();
const nameUserChangePassword = ref();
const loading = ref(true);
const group_id = ref('');
definePageMeta({
  layout: 'cms-default',
  middleware: 'auth',
});

const home = ref({
  icon: 'pi pi-home',
  route: '/cms',
});

const itemss = ref([
  { label: 'Quản lý' },
  { label: 'Hệ thống' },
  { label: 'Quản lý người dùng' },
]);

const schema = yup.object({
  keyWords: yup
    .string()
    .max(256, 'Tối đa 256 ký tự!')
    .matches(EnumRegex.FILTER_LINK_URL, EnumRegexMessage.FILTER_LINK_URL_MESSAGE)
    .matches(
      EnumRegex.FILTER_EXPRESSION_SQL,
      EnumRegexMessage.FILTER_EXPRESSION_SQL_MESSAGE,
    )
    .matches(EnumRegex.FILTER_EXPRESSION, EnumRegexMessage.FILTER_EXPRESSION_MESSAGE),
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
});
const [keyWords] = defineField('keyWords');

const contextMenu = ref();
const dataMenu = ref();
const toggleContextMenu = (event: MouseEvent, data: UserModel) => {
  dataMenu.value = data; // Cập nhật dữ liệu đúng cách
  contextMenu.value.toggle(event);
};
onMounted(async () => {
  loading.value = true;
  initFilters();
  loading.value = false;
});
function initFilters() {}
const items = (data: UserModel) => {
  if (!data) return [];
  return [
    {
      label: 'Cập nhật',
      icon: 'pi pi-user-edit',
      command: () => openModalUpdate(data),
    },
    {
      label: 'Đổi mật khẩu',
      icon: 'pi pi-lock',
      command: () => openModalChangePassword(data.user_name ?? ''),
    },
    {
      label: data.lockout_enabled ? 'Mở khóa' : 'Khóa',
      icon: data.lockout_enabled ? 'pi pi-lock' : 'pi pi-unlock',
      command: () => openModalClock(data.user_name ?? '', data.lockout_enabled ?? false),
    },
    {
      label: 'Xóa',
      icon: 'pi pi-trash',
      command: () => openModalRemove(data),
    },
  ];
};

const getRowSTT = (index: number): number => {
  return index + 1;
};

const userGroupData = await useAsyncData<UserByGroup[]>(() => UserGroupService.list());
const userGroup = userGroupData.data || [];
// console.log('nhóm người dùng', userGroup.value);

const Status = {
  Approved: 'Đã phê duyệt',
  NotApproved: 'Chưa phê duyệt',
};

const State = {
  Active: 'Đang hoạt động',
  Locked: 'Đang khóa',
};

const onLoadData = () => {
  UserService.getUserList(keyWords.value, group_id.value).then((res) => {
    dataList.value = res;
    loading.value = false;
  });
};

onLoadData();

const reloadData = () => {
  loading.value = true;
  onLoadData();
};

const reloadDatatable = () => {
  loading.value = true;
  keyWords.value = '';
  group_id.value = null;
  UserService.getUserList(keyWords.value, group_id.value).then((res) => {
    dataList.value = res;
    loading.value = false;
  });
};

const openModalCreate = () => {
  isOpenModal.value = true;
};
const emitCreateModel = () => {
  reloadData();
};

const emitUpdateModel = () => {
  reloadData();
};

const openModalUpdate = (data: UserModel) => {
  if (data.user_name) {
    UserService.getUserByUsername(data.user_name).then((res) => {
      dataUpdate.value = res;
      isOpenUpdate.value = true;
    });
  }
};

const openModalChangePassword = (data: UserModel) => {
  isOpenChangePassword.value = true;
  nameUserChangePassword.value = data;
};
const openModalClock = (user_name: string, isLocked: boolean): void => {
  const message = !isLocked ? 'khóa' : 'mở khóa';
  ConfirmDialog.showConfirmDialog(
    confirm,
    `Bạn muốn ${message} người dùng này?`,
    'Xác nhận',
    'pi pi-question-circle',
    () => {
      UserService.lockUser(user_name, !isLocked)
        .then((res) => {
          if (res?.status === EnumStatus.OK) {
            reloadData();
            toast.add({
              severity: 'success',
              summary: 'Thành công',
              detail: `Đã ${message} thông tin người dùng`,
              life: 3000,
            });
          }
        })
        .catch(() => {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Khóa thông tin người dùng',
            life: 3000,
          });
        });
    },
    () => {},
    '',
    ' p-button-danger',
  );
};
const openModalRemove = (data: UserModel) => {
  ConfirmDialog.showConfirmDialog(
    confirm,
    'Bạn muốn xóa thông tin người dùng này?',
    'Xác nhận',
    'pi pi-question-circle',
    () => {
      if (data.user_name !== undefined) {
        UserService.deleteUser(data.user_name)
          .then((res) => {
            if (res?.status === EnumStatus.OK) {
              reloadData();
              toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Xóa thông tin người dùng',
                life: 3000,
              });
            }
            else {
              toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail:
                  'Xóa thông tin người dùng không thành công, hệ thống đang trục trặc, vui lòng thử lại sau!',
                life: 4000,
              });
            }
          })
          .catch(() => {
            toast.add({
              severity: 'error',
              summary: 'Lỗi',
              detail:
                'Xóa thông tin người dùng không thành công, hệ thống đang trục trặc, vui lòng thử lại sau!',
              life: 4000,
            });
          });
      }
      else {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Tên người dùng không tồn tại!',
          life: 4000,
        });
      }
    },
    () => {},
    '',
    ' p-button-danger',
  );
};

const timKiem = handleSubmit(async () => {
  reloadData();
});
</script>

<template>
  <div class="p-card">
    <ToolBar class="mb-6">
      <template #start>
        <div class="flex flex-column justify-center">
          <Breadcrumb
            :home="home"
            :model="itemss"
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
              @click="openModalCreate()"
            />
          </div>
        </div>
      </template>
    </ToolBar>

    <DataTable
      :value="dataList"
      paginator
      :rows-per-page-options="[5, 10, 20, 50]"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      current-page-report-template="hiển thị từ {first} đến {last} trong {totalRecords} người dùng"
      :rows="10"
      data-key="id"
      :row-hover="true"
      filter-display="menu"
      show-gridlines
      :loading="loading"
      :global-filter-fields="[
        'id',
        'user_name',
        'user_info.full_name',
        'email',
        'role_id',
      ]"
    >
      <template #header>
        <div class="grid grid-cols-1 xl:grid-cols-5 md:grid-cols-3 gap-4 mb-1">
          <div class="col-span-1">
            <Select
              v-model="group_id"
              :options="userGroup"
              option-label="name"
              option-value="id"
              placeholder="Chọn nhóm"
              class="w-full"
              :show-clear="!!group_id"
            />
          </div>
          <div class="col-span-1">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="keyWords"
                type="text"
                placeholder="Nhập từ khóa"
                class="w-full"
                @keyup.enter="timKiem"
              />
            </IconField>
            <span class="text-red-500">{{ errors.keyWords }}</span>
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
              @click="reloadDatatable()"
            />
          </div>
        </div>
      </template>
      <template #empty>
        Không có người dùng.
      </template>
      <template #loading>
        Đang tải dữ liệu. Vui lòng chờ trong giây lát.
      </template>
      <Column style="width: 50px">
        <template #header>
          <span class="m-auto"><b>STT</b></span>
        </template>
        <template #body="slotPros">
          {{ getRowSTT(slotPros.index) }}
        </template>
      </Column>
      <Column
        field="user_name"
        header="Tên đăng nhập"
        style="min-width: 12rem"
      />
      <Column
        field="user_info.full_name"
        header="Họ và tên"
        style="min-width: 12rem"
      />
      <Column
        field="email"
        header="Email"
        style="min-width: 12rem"
      />
      <!-- <Column
        field="unit"
        header="Đơn vị"
        style="min-width: 8rem"
      /> -->
      <Column
        header="Tình trạng phê duyệt"
        style="min-width: 10rem"
      >
        <template #body="slotProps">
          <Badge
            v-if="slotProps.data.approved"
            :value="Status.Approved"
            severity="success"
            class="text-lg font-medium"
          />
          <Badge
            v-else
            :value="Status.NotApproved"
            severity="danger"
            class="text-lg font-medium"
          />
        </template>
      </Column>
      <Column
        header="Trạng thái"
        style="min-width: 12rem"
      >
        <template #body="slotProps">
          <Badge
            v-if="slotProps.data.lockout_enabled"
            :value="State.Locked"
            severity="danger"
            class="text-lg font-medium"
          />
          <Badge
            v-else
            :value="State.Active"
            severity="success"
            class="text-lg font-medium"
          />
        </template>
      </Column>
      <Column>
        <template #header>
          <th>Thao tác</th>
        </template>
        <template #body="slotProps">
          <div class="flex justify-center items-center h-full">
            <Button
              icon="pi pi-ellipsis-h"
              title="Thao tác"
              class="p-button-text p-0 hover:bg-transparent focus:ring-0"
              @click="toggleContextMenu($event, slotProps.data)"
            />
            <ContextMenu
              ref="contextMenu"
              :model="items(dataMenu)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
    <UserDialogCreateUser
      :is-visible="isOpenModal"
      :user-group="userGroup"
      :data-list="dataList"
      @create-model="emitCreateModel()"
      @hide-modal="isOpenModal = false"
    />
    <UserDialogUpdateUser
      :is-visible="isOpenUpdate"
      :user-name-update="dataUpdate"
      :user-group="userGroup"
      @update-model="emitUpdateModel()"
      @hide-modal="isOpenUpdate = false"
    />
    <UserDialogChangePassword
      :is-visible="isOpenChangePassword"
      :data-change-password="nameUserChangePassword"
      @hide-modal="isOpenChangePassword = false"
    />
  </div>
</template>
