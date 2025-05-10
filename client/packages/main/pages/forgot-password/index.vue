<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <form @submit.prevent="submitForgotPassword" class="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg w-full max-w-md">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Quên mật khẩu</h2>
          <p class="text-gray-600 dark:text-gray-300">Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
        </div>
  
        <div class="mb-6">
          <label for="email" class="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Email</label>
          <InputText id="email" v-model="email" type="email" placeholder="Nhập email" class="w-full" />
          <span v-if="error" class="text-red-500 text-sm mt-1 block">{{ error }}</span>
        </div>
  
        <Button type="submit" label="Gửi yêu cầu" class="w-full !bg-blue-600 hover:!bg-blue-700 !text-white !border-none" />
  
        <div class="text-center mt-8">
          <NuxtLink to="/login" class="text-blue-600 hover:underline cursor-pointer">Quay lại đăng nhập</NuxtLink>
        </div>
      </form>
      <Toast />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useToast } from 'primevue/usetoast'
  


  definePageMeta({
  layout: false,
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
});


  const email = ref('')
  const error = ref('')
  const toast = useToast()
  
  const submitForgotPassword = async () => {
    if (!email.value) {
      error.value = 'Vui lòng nhập email!'
      return
    }
  
    error.value = ''
  
    try {
      // Call your own API here (mock)
      await $fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: email.value }
      })
  
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đã gửi hướng dẫn đến email của bạn',
        life: 3000
      })
    } catch (err) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể gửi email. Vui lòng thử lại!',
        life: 3000
      })
    }
  }
  </script>