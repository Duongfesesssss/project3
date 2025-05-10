<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <form @submit.prevent="submitResetPassword" class="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg w-full max-w-md">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Đặt lại mật khẩu</h2>
          <p class="text-gray-600 dark:text-gray-300">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>
  
        <!-- New Password -->
        <div class="mb-6">
          <label for="newPassword" class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Mật khẩu mới</label>
          <Password id="newPassword" v-model="password" fluid placeholder="Nhập mật khẩu mới" toggle-mask :feedback="false" class="w-full" />
        </div>
  
        <!-- Confirm Password -->
        <div class="mb-6">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Xác nhận mật khẩu</label>
          <Password id="confirmPassword" v-model="confirmPassword" fluid placeholder="Xác nhận mật khẩu" toggle-mask :feedback="false" class="w-full" />
          <span v-if="error" class="text-red-500 text-sm mt-1 block">{{ error }}</span>
        </div>
  
        <Button type="submit" label="Đặt lại mật khẩu" class="w-full !bg-blue-600 hover:!bg-blue-700 !text-white !border-none" />
  
        <div class="text-center mt-8">
          <NuxtLink to="/login" class="text-blue-600 hover:underline cursor-pointer">Quay lại đăng nhập</NuxtLink>
        </div>
      </form>
      <Toast />
    </div>
  </template>
  
  <script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { ref } from 'vue'
  import { useToast } from 'primevue/usetoast'
  


  definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
});

  const route = useRoute()
  const router = useRouter()
  const toast = useToast()
  
  const password = ref('')
  const confirmPassword = ref('')
  const error = ref('')
  
  const token = route.query.token || '' // token sẽ có trong URL ?token=abc123
  
  const submitResetPassword = async () => {
    if (!password.value || !confirmPassword.value) {
      error.value = 'Vui lòng nhập đầy đủ mật khẩu!'
      return
    }
  
    if (password.value !== confirmPassword.value) {
      error.value = 'Mật khẩu không khớp!'
      return
    }
  
    error.value = ''
  
    try {
      await $fetch('/api/auth/reset-password', {
        method: 'POST',
        body: {
          token,
          newPassword: password.value
        }
      })
  
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Mật khẩu đã được đặt lại!',
        life: 3000
      })
  
      router.push('/login')
    } catch (err) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể đặt lại mật khẩu!',
        life: 3000
      })
    }
  }
  </script>