<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
    <form @submit.prevent="doSignUp" class="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg w-full max-w-md">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Tạo tài khoản</h2>
        <p class="text-gray-600 dark:text-gray-300">Đăng ký để tiếp tục</p>
      </div>

      <!-- Username -->
      <div class="mb-6">
        <label for="signUpUsername" class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Tên tài khoản</label>
        <InputText id="signUpUsername" v-model="signUpUsername" type="text" placeholder="Nhập tài khoản" :invalid="signUpErrors.user_name != null" class="w-full" />
        <span class="text-red-500 text-sm mt-1 block">{{ signUpErrors.user_name }}</span>
      </div>

      <!-- Email -->
      <div class="mb-6">
        <label for="signUpEmail" class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Email</label>
        <InputText id="signUpEmail" v-model="signUpEmail" type="text" placeholder="Nhập email" :invalid="signUpErrors.email != null" class="w-full" />
        <span class="text-red-500 text-sm mt-1 block">{{ signUpErrors.email }}</span>
      </div>

      <!-- Password -->
      <div class="mb-6">
        <label for="signUpPassword" class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Mật khẩu</label>
        <Password id="signUpPassword" v-model="signUpPassword" placeholder="Nhập mật khẩu" toggle-mask fluid :feedback="false" :invalid="signUpErrors.password != null" class="w-full" />
        <span class="text-red-500 text-sm mt-1 block">{{ signUpErrors.password }}</span>
      </div>

      <!-- Submit -->
      <Button type="submit" label="Đăng ký" class="w-full !bg-blue-600 hover:!bg-blue-700 !text-white !border-none" />

      <!-- Link to Login -->
      <div class="text-center mt-8">
        <p class="text-gray-600 dark:text-gray-300">
          Đã có tài khoản?
          <NuxtLink to="/login" class="ml-1 text-blue-600 hover:underline cursor-pointer">Đăng nhập</NuxtLink>        </p>
      </div>
    </form>
    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { AuthService } from '~/packages/base/services/auth.service';
import { useToast } from 'primevue/usetoast';

definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
});

const toast = useToast();
const loading = ref(false);

const signUpSchema = yup.object({
  user_name: yup.string().required('Vui lòng nhập tài khoản!').min(2, 'Tài khoản phải có ít nhất 2 ký tự!'),
  email: yup.string().required('Vui lòng nhập email!').min(2, 'Email phải có ít nhất 2 ký tự!'),
  password: yup.string().required('Vui lòng nhập mật khẩu!').min(6, 'Mật khẩu phải có ít nhất 6 ký tự!'),
});

const { defineField: defineSignUpField, handleSubmit: handleSignUpSubmit, errors: signUpErrors, resetForm } = useForm({
  validationSchema: signUpSchema,
});

const [signUpUsername] = defineSignUpField('user_name');
const [signUpEmail] = defineSignUpField('email');
const [signUpPassword] = defineSignUpField('password');

const doSignUp = handleSignUpSubmit(async () => {
  const response = await AuthService.signUp(
    {
      user_name: signUpUsername.value,
      email: signUpEmail.value,
      password: signUpPassword.value,
    },
    {
      callbackUrl: null,
      external: true,
    }
  );

  if (response.status === 'OK') {
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Đăng ký thành công! Chuyển hướng đến trang đăng nhập...',
      life: 2000,
    });
    resetForm();
    
    // Chuyển hướng đến trang đăng nhập sau 2 giây
    setTimeout(() => {
      navigateTo('/login');
    }, 2000);
  } else {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Tài khoản hoặc email này đã tồn tại trên hệ thống!',
      life: 2000,
    });
  }
});
</script>