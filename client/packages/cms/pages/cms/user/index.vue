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
          <Button
            v-if="activeTab === 'staff'"
            icon="pi pi-plus"
            label="Thêm nhân viên"
            class="p-button-primary"
            severity="primary"
            @click="openCreateStaffModal"
          />
        </div>
      </template>
    </ToolBar>

    <!-- Tab View -->
    <TabView v-model:activeIndex="activeTabIndex" @tab-change="onTabChange">
      <!-- Tab Khách hàng -->
      <TabPanel header="Khách hàng">
        <!-- Customer DataTable -->
        <DataTable
          v-model:loading="loadingCustomers"
          :value="customerList"
          class="p-datatable-sm"
          :paginator="true"
          :rows="20"
          :total-records="totalCustomers"
          :lazy="true"
          sort-mode="multiple"
          removable-sort
          show-gridlines
          responsive-layout="scroll"
          @page="onCustomerPage"
          @sort="onCustomerSort"
        >
          <Column header="STT" style="min-width: 80px" body-style="text-align:center">
            <template #body="{ index }">
              <span class="text-900 font-medium">{{ (currentCustomerPage * 20) + index + 1 }}</span>
            </template>
          </Column>

          <Column field="user_name" header="Tên đăng nhập" sortable style="min-width: 180px">
            <template #body="{ data }">
              <span class="text-900 font-medium">{{ data.user_name }}</span>
            </template>
          </Column>

          <Column field="full_name" header="Họ và tên" sortable style="min-width: 200px">
            <template #body="{ data }">
              <span class="text-900">{{ data.full_name || 'Chưa cập nhật' }}</span>
            </template>
          </Column>

          <Column field="email" header="Email" sortable style="min-width: 250px">
            <template #body="{ data }">
              <span class="text-900">{{ data.email || 'Chưa cập nhật' }}</span>
            </template>
          </Column>

          <Column field="phone" header="Số điện thoại" style="min-width: 150px">
            <template #body="{ data }">
              <span class="text-900">{{ data.phone || 'Chưa cập nhật' }}</span>
            </template>
          </Column>

          <Column field="is_active" header="Trạng thái" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag 
                :value="data.is_active ? 'Hoạt động' : 'Đã khóa'"
                :severity="data.is_active ? 'success' : 'danger'"
                class="font-medium"
              />
            </template>
          </Column>

          <Column field="created_at" header="Ngày tạo" sortable style="min-width: 150px">
            <template #body="{ data }">
              <span class="text-900 font-medium">
                {{ formatDateTime(data.created_at) }}
              </span>
            </template>
          </Column>

          <Column header="Thao tác" :exportable="false" style="min-width: 120px" body-style="text-align:center">
            <template #header>
              <span class="m-auto"><b>Thao tác</b></span>
            </template>
            <template #body="{ data }">
              <div class="flex justify-center items-center space-x-2">
                <Button
                  v-tooltip="data.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'"
                  :icon="data.is_active ? 'pi pi-lock' : 'pi pi-unlock'"
                  :severity="data.is_active ? 'warning' : 'success'"
                  outlined
                  rounded
                  :disabled="isCurrentUser(data)"
                  @click="toggleCustomerStatus(data)"
                />
                <Button
                  v-tooltip="'Xóa tài khoản'"
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  rounded
                  :disabled="isCurrentUser(data)"
                  @click="deleteCustomer(data)"
                />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="text-center py-6">
              <i class="pi pi-users text-gray-400 text-4xl mb-3" />
              <p class="text-gray-600 text-lg">Không có dữ liệu khách hàng</p>
            </div>
          </template>

          <template #loading>
            <div class="text-center py-6">
              <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
              <p class="text-gray-600 mt-3">Đang tải dữ liệu...</p>
            </div>
          </template>
        </DataTable>
      </TabPanel>

      <!-- Tab Nhân viên -->
      <TabPanel header="Nhân viên">
        <!-- Staff DataTable -->
        <DataTable
          v-model:loading="loadingStaff"
          :value="staffList"
          class="p-datatable-sm"
          :paginator="true"
          :rows="20"
          :total-records="totalStaff"
          :lazy="true"
          sort-mode="multiple"
          removable-sort
          show-gridlines
          responsive-layout="scroll"
          @page="onStaffPage"
          @sort="onStaffSort"
        >
          <Column header="STT" style="min-width: 80px" body-style="text-align:center">
            <template #body="{ index }">
              <span class="text-900 font-medium">{{ (currentStaffPage * 20) + index + 1 }}</span>
            </template>
          </Column>

          <Column field="user_name" header="Tên đăng nhập" sortable style="min-width: 180px">
            <template #body="{ data }">
              <span class="text-900 font-medium">{{ data.user_name }}</span>
            </template>
          </Column>

          <Column field="full_name" header="Họ và tên" sortable style="min-width: 200px">
            <template #body="{ data }">
              <span class="text-900">{{ data.full_name || 'Chưa cập nhật' }}</span>
            </template>
          </Column>

          <Column field="email" header="Email" sortable style="min-width: 250px">
            <template #body="{ data }">
              <span class="text-900">{{ data.email || 'Chưa cập nhật' }}</span>
            </template>
          </Column>

          <Column field="role" header="Vai trò" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag 
                :value="data.role === 'admin' ? 'Quản lý' : 'Nhân viên'"
                :severity="data.role === 'admin' ? 'info' : 'secondary'"
                class="font-medium"
              />
            </template>
          </Column>

          <Column field="is_active" header="Trạng thái" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag 
                :value="data.is_active ? 'Hoạt động' : 'Đã khóa'"
                :severity="data.is_active ? 'success' : 'danger'"
                class="font-medium"
              />
            </template>
          </Column>

          <Column field="created_at" header="Ngày tạo" sortable style="min-width: 150px">
            <template #body="{ data }">
              <span class="text-900 font-medium">
                {{ formatDateTime(data.created_at) }}
              </span>
            </template>
          </Column>

          <Column header="Thao tác" :exportable="false" style="min-width: 150px" body-style="text-align:center">
            <template #header>
              <span class="m-auto"><b>Thao tác</b></span>
            </template>
            <template #body="{ data }">
              <div class="flex justify-center items-center space-x-2">
                <Button
                  v-tooltip="'Chỉnh sửa nhân viên'"
                  icon="pi pi-pencil"
                  severity="warn"
                  outlined
                  rounded
                  :disabled="data.role === 'admin' && !isCurrentUser(data)"
                  @click="editStaff(data)"
                />
                <Button
                  v-tooltip="data.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'"
                  :icon="data.is_active ? 'pi pi-lock' : 'pi pi-unlock'"
                  :severity="data.is_active ? 'warning' : 'success'"
                  outlined
                  rounded
                  :disabled="isCurrentUser(data)"
                  @click="toggleStaffStatus(data)"
                />
                <Button
                  v-tooltip="'Xóa tài khoản'"
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  rounded
                  :disabled="data.role === 'admin' || isCurrentUser(data)"
                  @click="deleteStaff(data)"
                />
              </div>
            </template>
          </Column>

          <template #empty>
            <div class="text-center py-6">
              <i class="pi pi-id-card text-gray-400 text-4xl mb-3" />
              <p class="text-gray-600 text-lg">Không có dữ liệu nhân viên</p>
            </div>
          </template>

          <template #loading>
            <div class="text-center py-6">
              <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
              <p class="text-gray-600 mt-3">Đang tải dữ liệu...</p>
            </div>
          </template>
        </DataTable>
      </TabPanel>
    </TabView>

    <!-- Modal tạo nhân viên -->
    <UserModalCreate
      v-model:visible="showCreateModal"
      @created="onStaffCreated"
    />

    <!-- Modal sửa nhân viên -->
    <UserModalEdit
      v-model:visible="showEditModal"
      :user="selectedUser"
      @updated="onStaffUpdated"
    />

    <!-- Toast & Confirm Dialog -->
    <Toast />
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { UserManagementService } from '~/packages/base/services/userManagement.service';
import type { UserModel } from '~/packages/base/services/userManagement.service';
import UserModalCreate from '~/packages/cms/components/shared/user/UserModalCreate.vue';
import UserModalEdit from '~/packages/cms/components/shared/user/UserModalEdit.vue';
import { useAuthStore } from '~/packages/base/stores/auth.store';

definePageMeta({ layout: 'cms-default' });

const toast = useToast();
const confirm = useConfirm();
const authStore = useAuthStore();

// Breadcrumb navigation
const home = ref({ icon: 'pi pi-home', route: '/cms' });
const items = ref([
 { label: 'Hệ thống' }, { label: 'Quản lý người dùng', icon: 'pi pi-users' }
]);

// Tab management
const activeTabIndex = ref(0);
const activeTab = computed(() => activeTabIndex.value === 0 ? 'customers' : 'staff');

// Customer data
const customerList = ref<UserModel[]>([]);
const customerSearch = ref('');
const loadingCustomers = ref(false);
const totalCustomers = ref(0);
const currentCustomerPage = ref(0);

// Staff data  
const staffList = ref<UserModel[]>([]);
const staffSearch = ref('');
const loadingStaff = ref(false);
const totalStaff = ref(0);
const currentStaffPage = ref(0);

// Common
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedUser = ref<UserModel | null>(null);

// Kiểm tra xem có phải user hiện tại không
const isCurrentUser = (user: UserModel) => {
  return user._id === authStore.user?.id;
};

// Load customers
const loadCustomers = async (page = 0) => {
  try {
    loadingCustomers.value = true;
    currentCustomerPage.value = page;

    const response = await UserManagementService.getAllUsers({
      page: page + 1, // Backend expects 1-based pagination
      limit: 20,
      role: 'customer',
      search: customerSearch.value || undefined,
    });
    
    if (response.success) {
      customerList.value = response.data.users;
      totalCustomers.value = response.data.pagination.total_records;
    }
  } catch (error) {
    console.error('Lỗi load customers:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách khách hàng',
      life: 3000,
    });
  } finally {
    loadingCustomers.value = false;
  }
};

// Load staff
const loadStaff = async (page = 0) => {
  try {
    loadingStaff.value = true;
    currentStaffPage.value = page;

    const response = await UserManagementService.getAllUsers({
      page: page + 1, // Backend expects 1-based pagination
      limit: 20,
      role: 'staff,admin', // Lấy cả staff và admin
      search: staffSearch.value || undefined,
    });
    
    if (response.success) {
      staffList.value = response.data.users;
      totalStaff.value = response.data.pagination.total_records;
    }
  } catch (error) {
    console.error('Lỗi load staff:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách nhân viên',
      life: 3000,
    });
  } finally {
    loadingStaff.value = false;
  }
};

// Event handlers
const onCustomerPage = (event: { page: number }) => {
  loadCustomers(event.page);
};

const onStaffPage = (event: { page: number }) => {
  loadStaff(event.page);
};

const onCustomerSort = (event: unknown) => {
  // Implement sorting if needed
  console.log('Customer sort event:', event);
};

const onStaffSort = (event: unknown) => {
  // Implement sorting if needed
  console.log('Staff sort event:', event);
};

const onTabChange = () => {
  // Reload data when switching tabs if needed
  if (activeTabIndex.value === 0 && customerList.value.length === 0) {
    loadCustomers();
  } else if (activeTabIndex.value === 1 && staffList.value.length === 0) {
    loadStaff();
  }
};

// Utility functions
const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Toggle user status
const toggleCustomerStatus = (user: UserModel) => {
  const action = user.is_active ? 'khóa' : 'mở khóa';
  confirm.require({
    message: `Bạn có chắc chắn muốn ${action} tài khoản "${user.user_name}"?`,
    header: 'Xác nhận',
    icon: 'pi pi-question-circle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const response = await UserManagementService.toggleUserStatus(user._id!) as any;
        if (response.status === 'OK') {
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã ${action} tài khoản thành công`,
            life: 3000,
          });
          loadCustomers();
        }
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: `Không thể ${action} tài khoản`,
          life: 3000,
        });
      }
    }
  });
};

const toggleStaffStatus = (user: UserModel) => {
  const action = user.is_active ? 'khóa' : 'mở khóa';
  confirm.require({
    message: `Bạn có chắc chắn muốn ${action} tài khoản "${user.user_name}"?`,
    header: 'Xác nhận',
    icon: 'pi pi-question-circle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const response = await UserManagementService.toggleUserStatus(user._id!) as any;
        if (response.status === 'OK') {
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã ${action} tài khoản thành công`,
            life: 3000,
          });
          loadStaff();
        }
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: `Không thể ${action} tài khoản`,
          life: 3000,
        });
      }
    }
  });
};

// Delete functions
const deleteCustomer = (user: UserModel) => {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa tài khoản khách hàng "${user.user_name}"?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const response = await UserManagementService.deleteUser(user._id!) as any;
        if (response.status === 'OK') {
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã xóa tài khoản khách hàng',
            life: 3000,
          });
          loadCustomers();
        }
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể xóa tài khoản',
          life: 3000,
        });
      }
    }
  });
};

const deleteStaff = (user: UserModel) => {
  confirm.require({
    message: `Bạn có chắc chắn muốn xóa tài khoản nhân viên "${user.user_name}"?`,
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        const response = await UserManagementService.deleteUser(user._id!) as any;
        if (response.status === 'OK') {
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã xóa tài khoản nhân viên',
            life: 3000,
          });
          loadStaff();
        }
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể xóa tài khoản',
          life: 3000,
        });
      }
    }
  });
};

// Modal handlers
const openCreateStaffModal = () => {
  showCreateModal.value = true;
};

const editStaff = (user: UserModel) => {
  selectedUser.value = user;
  showEditModal.value = true;
};

const onStaffCreated = () => {
  loadStaff();
};

const onStaffUpdated = () => {
  loadStaff();
};

onMounted(() => {
  loadCustomers();
  loadStaff();
});
</script>

<style scoped>
:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  padding: 1rem 0.75rem;
}

:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

:deep(.p-button) {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

/* Tab styling */
.user-management-tabs :deep(.p-tabview-nav) {
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.user-management-tabs :deep(.p-tabview-nav li a) {
  border: none;
  border-radius: 0;
  padding: 1rem 1.5rem;
  font-weight: 500;
}

.user-management-tabs :deep(.p-tabview-nav li.p-highlight a) {
  border-bottom: 2px solid #3b82f6;
  color: #3b82f6;
}

.user-management-tabs :deep(.p-tabview-panels) {
  padding: 1.5rem;
  background: white;
}
</style>

