<template>
  <Dialog
    v-model:visible="internalVisible"
    class="w-[320px] sm:w-[800px]"
    header="Thêm mới tài khoản nhân viên"
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
                :invalid="errors.user_name != null"
                placeholder="Nhập tên đăng nhập"
              />
              <small class="text-red-500">{{ errors.user_name }}</small>
            </div>
            <div class="min-w-40">
              <label
                for="email"
                class="block font-bold mb-3 required"
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
                for="password"
                class="block font-bold mb-3 required"
              >Mật khẩu</label>
              <Password
                id="password"
                v-model="password"
                fluid
                :invalid="errors.password != null"
                placeholder="Nhập mật khẩu"
                toggle-mask
                :feedback="false"
              />
              <small class="text-red-500">{{ errors.password }}</small>
            </div>
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
          <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div class="min-w-40">
              <label
                for="full_name"
                class="block font-bold mb-3 required"
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
          <div class="gap-4 grid grid-cols-1">
            <div class="min-w-40">
              <label
                for="address"
                class="block font-bold mb-3"
              >Địa chỉ</label>
              <Textarea
                id="address"
                v-model="address"
                rows="3"
                fluid
                placeholder="Nhập địa chỉ"
              />
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
          label="Tạo tài khoản"
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
import type { CreateUserData } from '~/packages/base/services/userManagement.service';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'created']);

const toast = useToast();
const confirm = useConfirm();
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

const schema = yup.object({
  user_name: yup.string().required('Tên đăng nhập là bắt buộc').min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').max(50, 'Tên đăng nhập không được quá 50 ký tự'),
  email: yup.string().required('Email là bắt buộc').email('Email không hợp lệ'),
  password: yup.string().required('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  full_name: yup.string().required('Họ và tên là bắt buộc').max(100, 'Họ và tên không được quá 100 ký tự'),
  phone: yup.string().matches(/^[0-9+\-\s]*$/, 'Số điện thoại không hợp lệ'),
  role: yup.string().required('Vai trò là bắt buộc').oneOf(['staff', 'admin'], 'Vai trò không hợp lệ'),
});

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    user_name: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: '',
    role: 'staff',
  },
});

const [user_name] = defineField('user_name');
const [email] = defineField('email');
const [password] = defineField('password');
const [full_name] = defineField('full_name');
const [phone] = defineField('phone');
const [address] = defineField('address');
const [role] = defineField('role');

const roleOptions = [
  { label: 'Nhân viên', value: 'staff' },
  { label: 'Quản lý', value: 'admin' },
];

const handleHideModal = () => {
  emit('update:visible', false);
  resetForm();
};

const onSubmit = handleSubmit(async (values) => {
  const userData: CreateUserData = {
    user_name: values.user_name,
    email: values.email,
    password: values.password,
    full_name: values.full_name,
    phone: values.phone || '',
    address: values.address || '',
    role: values.role as 'staff' | 'admin',
  };

  ConfirmDialog.showConfirmDialog(
    confirm,
    'Bạn có chắc muốn tạo tài khoản nhân viên này?',
    'Xác nhận',
    'pi pi-question-circle',
    async () => {
      try {
        loading.value = true;
        const response = await UserManagementService.createUser(userData) as any;
        
        if (response.status === 'OK') {
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Tạo tài khoản nhân viên thành công!',
            life: 3000,
          });

          emit('created');
          handleHideModal();
        } else {
          toast.add({
            severity: 'error',
            summary: 'Thất bại',
            detail: response.message || 'Tạo tài khoản không thành công!',
            life: 3000,
          });
        }
      } catch (error) {
        console.error('Lỗi tạo tài khoản:', error);
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
