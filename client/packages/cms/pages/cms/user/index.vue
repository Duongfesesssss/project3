<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import 'primeicons/primeicons.css';
import { UserManagementService } from '~/packages/base/services/userManagement.service';
import type { UserModel, UserListResponse } from '~/packages/base/services/userManagement.service';

const isOpenModal = ref<boolean>(false);
const isOpenUpdate = ref<boolean>(false);
const isOpenChangePassword = ref<boolean>(false);
const toast = useToast();
const confirm = useConfirm();
const dataUpdate = ref<UserModel>();
const dataList = ref<UserModel[]>([]);
const nameUserChangePassword = ref();
const loading = ref(true);
const currentPage = ref(1);
const totalRecords = ref(0);
const pageSize = ref(20);
const selectedRole = ref('');
const selectedStatus = ref('');

definePageMeta({ layout: 'cms-default' });
  
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
    .matches(/^[a-zA-Z0-9\s\-_]*$/, 'Chỉ được nhập chữ cái, số, dấu gạch ngang và khoảng trắng')
    .matches(/^(?!.*[<>{}[\]\\]).*$/, 'Không được chứa ký tự đặc biệt')
    .matches(/^(?!.*(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|DECLARE)\b)).*$/i, 'Không được chứa từ khóa SQL'),
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
// Kiểm tra quyền admin
const canManageUsers = computed(() => {
  // TODO: Kiểm tra role từ auth store
  return true; // Tạm thời cho phép tất cả
});

onMounted(async () => {
  loading.value = true;
  await loadUserData();
  loading.value = false;
});

// Load dữ liệu người dùng từ API mới
const loadUserData = async () => {
  try {
    loading.value = true;
    const response = await UserManagementService.getAllUsers({
      page: currentPage.value,
      limit: pageSize.value,
      role: selectedRole.value || undefined,
      is_active: selectedStatus.value ? selectedStatus.value === 'true' : undefined,
      search: keyWords.value || undefined,
    });
    
    if (response.success) {
      dataList.value = response.data.users;
      totalRecords.value = response.data.pagination.total_records;
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể tải danh sách người dùng',
        life: 3000,
      });
    }
  } catch (error) {
    console.error('Lỗi load user data:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Có lỗi xảy ra khi tải dữ liệu',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};


// Sửa lại hàm items để kiểm tra quyền
const items = (data: UserModel) => {
  if (!data || !canManageUsers.value) return [];
  return [
    {
      label: 'Cập nhật',
      icon: 'pi pi-user-edit',
      command: () => openModalUpdate(data),
    },
    {
      label: 'Đổi mật khẩu',
      icon: 'pi pi-lock',
      command: () => openModalChangePassword(data),
    },
    {
      label: data.is_active ? 'Khóa' : 'Mở khóa',
      icon: data.is_active ? 'pi pi-lock' : 'pi pi-unlock',
      command: () => openModalClock(data.user_name ?? '', !data.is_active),
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

const Status = {
  Approved: 'Đã phê duyệt',
  NotApproved: 'Chưa phê duyệt',
};

const State = {
  Active: 'Đang hoạt động',
  Locked: 'Đang khóa',
};

const reloadData = () => {
  loadUserData();
};

const reloadDatatable = () => {
  currentPage.value = 1;
  keyWords.value = '';
  selectedRole.value = '';
  selectedStatus.value = '';
  loadUserData();
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

// Options cho dropdown
const roleOptions = [
  { label: 'Tất cả vai trò', value: '' },
  { label: 'Khách hàng', value: 'customer' },
  { label: 'Nhân viên', value: 'staff' },
  { label: 'Quản lý', value: 'admin' },
];

const statusOptions = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Đang hoạt động', value: 'true' },
  { label: 'Đã khóa', value: 'false' },
];
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
          <div v-if="canManageUsers">
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
    
    <!-- Create User Modal -->
    <UserModalCreate
      v-model:visible="isOpenModal"
      @created="emitCreateModel"
    />
    
    <!-- Other modals (update, change password) would go here -->
  </div>
</template>
