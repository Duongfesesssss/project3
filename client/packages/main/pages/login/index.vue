<template>
  <form>
    <div class="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4">
      <div class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Chào mừng trở lại</h2>
          <p class="text-gray-600 dark:text-gray-300">Đăng nhập để tiếp tục</p>

        </div>

        <!-- Google Sign In -->
        <div class="border-t border-gray-300 dark:border-gray-600 mb-6"></div>

        <!-- Email/Password Login -->
        <div class="space-y-6">
          <div>
            <label for="email1" class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Email</label>
            <InputText v-model="loginEmail" id="email1" type="email" placeholder="Nhập địa chỉ email" class="w-full" />
            <span v-if="loginErrors.email" class="text-sm text-red-500 mt-1 block">{{ loginErrors.email }}</span>
          </div>
          
          <div>
            <label for="password1" class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Mật khẩu</label>
            <InputText v-model="loginPassword" id="password1" type="password" placeholder="Nhập mật khẩu" class="w-full" />
            <span v-if="loginErrors.password" class="text-sm text-red-500 mt-1 block">{{ loginErrors.password }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center">
              <Checkbox v-model="checked1" id="rememberme1" :binary="true" class="mr-2" />
              <label for="rememberme1" class="text-gray-700 dark:text-gray-300">Lưu mật khẩu</label>
            </div>
            <p>
            <NuxtLink to="/forgot-password" class="ml-1 text-blue-600 hover:underline cursor-pointer">Quên mật khẩu?</NuxtLink> </p>

          </div>

          <Button 
            label="Đăng nhập" 
            icon="pi pi-user" 
            class="w-full justify-center !bg-blue-600 hover:!bg-blue-700 !border-none !text-white" 
            @click="doLogin" 
          />

          <!-- Thêm nút đăng nhập khách -->
          <Button 
            label="Tiếp tục với tài khoản khách" 
            icon="pi pi-user-plus" 
            class="w-full mt-3 justify-center !bg-gray-500 hover:!bg-gray-600 !border-none !text-white" 
            @click="loginAsGuest" 
          />
        </div>

        <!-- Sign In with Google -->
        <div class="text-center mt-8">
          <p class="text-gray-600 dark:text-gray-300">
            Bạn chưa có tài khoản? 
            <NuxtLink to="/register" class="ml-1 text-blue-600 hover:underline cursor-pointer">Đăng ký ngay</NuxtLink>          </p>
          <Button 
            label="Đăng nhâp với Google" 
            icon="pi pi-google" 
            class="w-full mb-6 justify-center !bg-red-500 hover:!bg-red-600 !border-none !text-white" 
            @click="loginWithGoogle" 
          />
        </div>
      </div>
    </div>
    <Toast />
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import { useAuth } from '#imports';
import { AuthService } from '~/packages/base/services/auth.service';

definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  },
});

const checked1 = ref(false);
const loading = ref(false);
const toast = useToast();

const loginSchema = yup.object({
  email: yup.string()
    .required('Vui lòng nhập địa chỉ email!')
    .email('Email không đúng định dạng!')
    .min(2, 'Tài khoản phải có ít nhất 2 ký tự!'),
  password: yup.string()
    .required('Vui lòng nhập mật khẩu!')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự!')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
});

const { defineField: defineLoginField, handleSubmit: handleLoginSubmit, errors: loginErrors } = useForm({
  validationSchema: loginSchema,
});

const [loginEmail] = defineLoginField('email');
const [loginPassword] = defineLoginField('password');
const { signIn } = useAuth();

// Google login
const loginWithGoogle = async () => {
  try {
    await signIn('google', { callbackUrl: '/' });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Đăng nhập Google thất bại!',
      life: 2000,
    });
  }
};

// Email/Password login
const doLogin = handleLoginSubmit(async () => {
  try {
    await signIn(
      {
        email: loginEmail.value,
        password: loginPassword.value,
      },
      { callbackUrl: '/', external: true }
    );
    toast.add({
      severity: 'success',
      summary: 'Đăng nhập',
      detail: 'Đăng nhập thành công',
      life: 2000,
    });
  } catch (error) {
    if (error.response) {
      const responseErrors = error.response._data;
      if (responseErrors) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: '' + responseErrors.message,
          life: 2000,
        });
      }
    }
  }
});

// Thêm hàm đăng nhập khách
const loginAsGuest = async () => {
  try {
    toast.add({
      severity: 'success',
      summary: 'Đăng nhập',
      detail: 'Đăng nhập với tài khoản khách thành công',
      life: 2000,
    });
    navigateTo('/');
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Đăng nhập thất bại!',
      life: 2000,
    });
  }
};
</script>