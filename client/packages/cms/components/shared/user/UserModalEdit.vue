<template>
  <Dialog
    v-model:visible="internalVisible"
    class="w-[320px] sm:w-[800px]"
    :header="`${
      props.user?._id === null || props.user?._id === undefined
        ? 'Thêm mới '
        : 'Cập nhật '
    } thông tin nhân viên`"
    :modal="true"
    :close-on-escape="closeEscapeKeyModalInfo"
  >
    <div>
      <form>
        <div class="flex flex-col gap-6">
          <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div class="min-w-40">
              <label
                for="user_name"
                class="block font-bold mb-3 required"
              >Tên đăng nhập</label>
              <InputText
                id="user_name"
                v-model="user_name"
                fluid
                :readonly="isEditing"
                :invalid="errors.user_name != null"
                placeholder="Nhập tên đăng nhập"
              />
              <small class="text-red-500">{{ errors.user_name }}</small>
            </div>
            <div class="min-w-40">
              <label
                for="email"
                class="block font-bold mb-3"
              >Email</label>
              <InputText
                id="email"
                v-model="email"
                fluid
                type="email"
                :invalid="errors.email != null"
                placeholder="Nhập email"
              />
              <small class="text-red-500">{{ errors.email }}</small>
            </div>
          </div>
          <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div class="min-w-40">
              <label
                for="full_name"
                class="block font-bold mb-3"
              >Họ và tên</label>
              <InputText
                id="full_name"
                v-model="full_name"
                fluid
                :invalid="errors.full_name != null"
                placeholder="Nhập họ và tên"
              />
              <small class="text-red-500">{{ errors.full_name }}</small>
            </div>
            <div class="min-w-40">
              <label
                for="phone"
                class="block font-bold mb-3"
              >Số điện thoại</label>
              <InputText
                id="phone"
                v-model="phone"
                fluid
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          <div v-if="isAdmin && !isEditingSelf" class="gap-4 grid grid-cols-1">
            <div class="min-w-40">
              <label
                for="role"
                class="block font-bold mb-3 required"
              >Vai trò</label>
              <Select
                id="role"
                v-model="role"
                :options="roleOptions"
                option-label="label"
                option-value="value"
                fluid
                :invalid="errors.role != null"
                placeholder="Chọn vai trò"
              />
              <small class="text-red-500">{{ errors.role }}</small>
            </div>
          </div>
          <div v-if="isEditingSelf" class="gap-4 grid grid-cols-1">
            <div class="bg-blue-50 p-4 rounded border">
              <p class="text-sm text-blue-700 mb-2">
                <i class="pi pi-info-circle mr-1" />
                Bạn đang chỉnh sửa thông tin của chính mình
              </p>
              <div class="text-sm">
                <span class="font-medium">Vai trò:</span>
                <Badge 
                  :value="role === 'admin' ? 'Quản lý' : 'Nhân viên'"
                  :severity="role === 'admin' ? 'info' : 'secondary'"
                  class="ml-2"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
    <template #footer>
      <div
        class="p-dialog-footer mt-4"
        style="width: 779px"
      >
        <Button
          type="button"
          label="Đóng"
          icon="pi pi-times"
          severity="danger"
          @click="handleHideModal()"
        />
        <Button
          label="Cập nhật"
          icon="pi pi-check"
          type="submit"
          :loading="loading"
          @click="onSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { UserManagementService } from '~/packages/base/services/userManagement.service';
import type { UserModel } from '~/packages/base/services/userManagement.service';
import { useAuthStore } from '~/packages/base/stores/auth.store';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  user: {
    type: Object as () => UserModel | null,
    default: null,
  },
});

const emit = defineEmits(['update:visible', 'updated']);

const toast = useToast();
const confirm = useConfirm();
const authStore = useAuthStore();
const loading = ref(false);
const closeEscapeKeyModalInfo = ref<boolean>(true);

const internalVisible = computed({
  get() {
    return props.visible;
  },
  set() {
    handleHideModal();
  },
});

const isEditing = computed(() => !!props.user?._id);
const isAdmin = computed(() => authStore.user?.role === 'admin');
const isEditingSelf = computed(() => props.user?._id === authStore.user?.id);

const schema = yup.object({
  user_name: yup.string().required('Tên đăng nhập là bắt buộc').min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').max(50, 'Tên đăng nhập không được quá 50 ký tự'),
  email: yup.string().email('Email không hợp lệ'),
  full_name: yup.string().max(100, 'Họ và tên không được quá 100 ký tự'),
  phone: yup.string().matches(/^[0-9+\-\s]*$/, 'Số điện thoại không hợp lệ'),
  role: yup.string().oneOf(['staff', 'admin'], 'Vai trò không hợp lệ'),
});

const { defineField, handleSubmit, errors, resetForm, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    user_name: '',
    email: '',
    full_name: '',
    phone: '',
    role: 'staff',
  },
});

const [user_name] = defineField('user_name');
const [email] = defineField('email');
const [full_name] = defineField('full_name');
const [phone] = defineField('phone');
const [role] = defineField('role');

const roleOptions = [
  { label: 'Nhân viên', value: 'staff' },
  { label: 'Quản lý', value: 'admin' },
];

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      setValues({
        user_name: newUser.user_name || '',
        email: newUser.email || '',
        full_name: newUser.full_name || '',
        phone: newUser.phone || '',
        role: newUser.role || 'staff',
      });
    }
  },
  { immediate: true }
);

const handleHideModal = () => {
  emit('update:visible', false);
  resetForm();
};

const onSubmit = handleSubmit(async (values) => {
  if (!props.user?._id) return;

  const updateData = {
    full_name: values.full_name,
    email: values.email,
    phone: values.phone,
  };

  // Chỉ admin mới được thay đổi role của user khác
  if (isAdmin.value && !isEditingSelf.value) {
    Object.assign(updateData, { role: values.role });
  }

  ConfirmDialog.showConfirmDialog(
    confirm,
    'Bạn có chắc muốn cập nhật thông tin nhân viên này?',
    'Xác nhận',
    'pi pi-question-circle',
    async () => {
      try {
        loading.value = true;
        const response = await UserManagementService.updateUser(props.user!._id!, updateData) as any;
        
        if (response.status === 'OK') {
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Cập nhật thông tin nhân viên thành công!',
            life: 3000,
          });

          emit('updated');
          handleHideModal();
        } else {
          toast.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: response.message || 'Cập nhật thông tin không thành công!',
            life: 3000,
          });
        }
      } catch (error) {
        console.error('Lỗi cập nhật nhân viên:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Đã có lỗi xảy ra, vui lòng thử lại!',
          life: 3000,
        });
      } finally {
        loading.value = false;
      }
    },
    () => {},
    '',
    ' p-button-danger',
  );
});

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      resetForm();
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.field {
  margin-bottom: 1.5rem;
}

.required::after {
  content: ' *';
  color: red;
}
</style>
