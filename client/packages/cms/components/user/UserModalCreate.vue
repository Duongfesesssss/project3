<script setup lang="ts">
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { UserManagementService } from '~/packages/base/services/userManagement.service';
import type { CreateUserData } from '~/packages/base/services/userManagement.service';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'created': [];
}>();

const toast = useToast();
const loading = ref(false);

// Schema validation
const schema = yup.object({
  user_name: yup
    .string()
    .required('Tên đăng nhập là bắt buộc')
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(30, 'Tên đăng nhập không được quá 30 ký tự'),
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  full_name: yup
    .string()
    .max(100, 'Họ tên không được quá 100 ký tự'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s]*$/, 'Số điện thoại không hợp lệ'),
  role: yup
    .string()
    .required('Vai trò là bắt buộc')
    .oneOf(['customer', 'staff', 'admin'], 'Vai trò không hợp lệ'),
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

// Role options
const roleOptions = [
  { label: 'Khách hàng', value: 'customer' },
  { label: 'Nhân viên', value: 'staff' },
  { label: 'Quản lý', value: 'admin' },
];

// Computed cho modal visible
const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
});

// Submit form
const onSubmit = handleSubmit(async (values) => {
  try {
    loading.value = true;
    
    const userData: CreateUserData = {
      user_name: values.user_name,
      email: values.email,
      password: values.password,
      full_name: values.full_name || '',
      phone: values.phone || '',
      address: values.address || '',
      role: values.role as 'customer' | 'staff' | 'admin',
    };

    const response = await UserManagementService.createUser(userData);
    
    if (response.success) {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: `Tạo tài khoản ${values.role === 'staff' ? 'nhân viên' : values.role === 'admin' ? 'quản lý' : 'khách hàng'} thành công`,
        life: 3000,
      });
      
      resetForm();
      isVisible.value = false;
      emit('created');
    } else {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: response.message || 'Có lỗi xảy ra khi tạo tài khoản',
        life: 3000,
      });
    }
  } catch (error: unknown) {
    console.error('Lỗi tạo user:', error);
    const errorMessage = error && typeof error === 'object' && 'response' in error 
      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
      : 'Có lỗi xảy ra khi tạo tài khoản';
    
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: errorMessage || 'Có lỗi xảy ra khi tạo tài khoản',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
});

// Reset form khi đóng modal
watch(isVisible, (newValue) => {
  if (!newValue) {
    resetForm();
  }
});
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    header="Thêm tài khoản người dùng"
    :style="{ width: '600px' }"
    :closable="!loading"
  >
    <form @submit="onSubmit">
      <div class="grid">
        <!-- Tên đăng nhập -->
        <div class="col-12 md:col-6">
          <label for="user_name" class="block text-sm font-medium mb-2">
            Tên đăng nhập <span class="text-red-500">*</span>
          </label>
          <InputText
            id="user_name"
            v-model="user_name"
            :class="{ 'p-invalid': errors.user_name }"
            placeholder="Nhập tên đăng nhập"
            class="w-full"
            :disabled="loading"
          />
          <small v-if="errors.user_name" class="p-error">{{ errors.user_name }}</small>
        </div>

        <!-- Email -->
        <div class="col-12 md:col-6">
          <label for="email" class="block text-sm font-medium mb-2">
            Email <span class="text-red-500">*</span>
          </label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            :class="{ 'p-invalid': errors.email }"
            placeholder="Nhập email"
            class="w-full"
            :disabled="loading"
          />
          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
        </div>

        <!-- Mật khẩu -->
        <div class="col-12 md:col-6">
          <label for="password" class="block text-sm font-medium mb-2">
            Mật khẩu <span class="text-red-500">*</span>
          </label>
          <Password
            id="password"
            v-model="password"
            :class="{ 'p-invalid': errors.password }"
            placeholder="Nhập mật khẩu"
            class="w-full"
            :disabled="loading"
            toggle-mask
            :feedback="false"
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <!-- Vai trò -->
        <div class="col-12 md:col-6">
          <label for="role" class="block text-sm font-medium mb-2">
            Vai trò <span class="text-red-500">*</span>
          </label>
          <Dropdown
            id="role"
            v-model="role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            :class="{ 'p-invalid': errors.role }"
            placeholder="Chọn vai trò"
            class="w-full"
            :disabled="loading"
          />
          <small v-if="errors.role" class="p-error">{{ errors.role }}</small>
        </div>

        <!-- Họ và tên -->
        <div class="col-12">
          <label for="full_name" class="block text-sm font-medium mb-2">
            Họ và tên
          </label>
          <InputText
            id="full_name"
            v-model="full_name"
            :class="{ 'p-invalid': errors.full_name }"
            placeholder="Nhập họ và tên"
            class="w-full"
            :disabled="loading"
          />
          <small v-if="errors.full_name" class="p-error">{{ errors.full_name }}</small>
        </div>

        <!-- Số điện thoại -->
        <div class="col-12 md:col-6">
          <label for="phone" class="block text-sm font-medium mb-2">
            Số điện thoại
          </label>
          <InputText
            id="phone"
            v-model="phone"
            :class="{ 'p-invalid': errors.phone }"
            placeholder="Nhập số điện thoại"
            class="w-full"
            :disabled="loading"
          />
          <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
        </div>

        <!-- Địa chỉ -->
        <div class="col-12">
          <label for="address" class="block text-sm font-medium mb-2">
            Địa chỉ
          </label>
          <Textarea
            id="address"
            v-model="address"
            placeholder="Nhập địa chỉ"
            class="w-full"
            :disabled="loading"
            rows="3"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <Button
        :disabled="loading"
        label="Hủy"
        severity="secondary"
        @click="isVisible = false"
      />
      <Button
        :loading="loading"
        label="Tạo tài khoản"
        @click="onSubmit"
      />
    </template>
  </Dialog>
</template>
