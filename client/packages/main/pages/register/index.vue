<template>
    <div class="flex flex-col items-center justify-center">
      <form
        style="
          border-radius: 56px;
          padding: 0.3rem;
          background: linear-gradient(
            180deg,
            var(--primary-color) 10%,
            rgba(33, 150, 243, 0) 30%
          );
        "
        @submit.prevent="doSignUp"
      >
        <div
          class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20"
          style="border-radius: 53px"
        >
          <div class="text-center mb-8 flex flex-col items-center gap-3">
            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium">
              Tạo tài khoản
            </div>
            <span class="text-muted-color font-medium">Đăng ký để tiếp tục</span>
          </div>
          <div>
            <!-- Trường Username -->
            <div style="padding-bottom: 10px">
              <label
                for="signUpUsername"
                class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2"
              >Tên tài khoản</label>
              <div style="height: 45px">
                <InputText
                  id="signUpUsername"
                  v-model="signUpUsername"
                  type="text"
                  placeholder="Nhập tài khoản"
                  :invalid="signUpErrors.user_name != null"
                  class="w-full md:w-[30rem] mb-8"
                />
              </div>
              <span class="text-red-500">{{ signUpErrors.user_name }}</span>
            </div>
  
            <!-- Trường Email -->
            <div style="padding-bottom: 10px">
              <label
                for="signUpEmail"
                class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2"
              >Email</label>
              <div style="height: 45px">
                <InputText
                  id="signUpEmail"
                  v-model="signUpEmail"
                  type="text"
                  placeholder="Nhập email"
                  :invalid="signUpErrors.email != null"
                  class="w-full md:w-[30rem] mb-8"
                />
              </div>
              <span class="text-red-500">{{ signUpErrors.email }}</span>
            </div>
  
            <!-- Trường Password -->
            <label
              for="signUpPassword"
              class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2"
            >Mật khẩu</label>
            <div style="height: 45px">
              <Password
                id="signUpPassword"
                v-model="signUpPassword"
                placeholder="Nhập mật khẩu"
                fluid
                :feedback="false"
                :toggle-mask="true"
                :invalid="signUpErrors.password != null"
                class="mb-4"
              />
            </div>
            <span class="text-red-500">{{ signUpErrors.password }}</span>
  
            <!-- Nút Đăng ký -->
            <Button
              type="submit"
              label="Đăng ký"
              class="w-full"
            />
          </div>
        </div>
      </form>
    </div>
    <Toast />
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useForm } from 'vee-validate';
  import * as yup from 'yup';
  import { AuthService } from '~/packages/base/services/auth.service';
  
  definePageMeta({
    layout: false,
    auth: {
      unauthenticatedOnly: true,
      navigateAuthenticatedTo: '/',
    },
  });
  
  const isOpenSendRequestForm = ref(false);
  const loading = ref(false);
  const toast = useToast();
  
  const openClickInfoModal = () => {
    isOpenSendRequestForm.value = !isOpenSendRequestForm.value;
  };
  
  // Schema cho form đăng ký
  const signUpSchema = yup.object({
    user_name: yup
      .string()
      .required('Vui lòng nhập tài khoản!')
      .min(2, 'Tài khoản phải có ít nhất 2 ký tự!'),
    email: yup
      .string()
      .required('Vui lòng nhập email!')
      .min(2, 'Email phải có ít nhất 2 ký tự!'),
    password: yup
      .string()
      .required('Vui lòng nhập mật khẩu!')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự!'),
  });
  
  const {
    defineField: defineSignUpField,
    handleSubmit: handleSignUpSubmit,
    errors: signUpErrors,
    resetForm
  } = useForm({
    validationSchema: signUpSchema,
  });
  
  const [signUpUsername] = defineSignUpField('user_name');
  const [signUpEmail] = defineSignUpField('email');
  const [signUpPassword] = defineSignUpField('password');
  
  // Schema cho form gửi yêu cầu quên mật khẩu
  const requestSchema = yup.object({
    email: yup
      .string()
      .required('Vui lòng nhập địa chỉ email!')
      .email('Vui lòng nhập địa chỉ email hợp lệ!'),
  });
  
  const {
    defineField: defineRequestField,
    handleSubmit: handleRequestSubmit,
    errors: requestErrors,
  } = useForm({
    validationSchema: requestSchema,
  });
  const [requestEmail] = defineRequestField('email');
  
  // Hàm xử lý gửi yêu cầu
  const onSubmit = handleRequestSubmit(async () => {
    loading.value = true;
  
    try {
      const res = await AuthService.resetPasswordUserAuth({ email: requestEmail.value });
      if (res.value === 'success') {
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Gửi yêu cầu thành công',
          life: 2000,
        });
      }
      else {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Địa chỉ email không tồn tại trên hệ thống!',
          life: 2000,
        });
      }
    }
    finally {
      loading.value = false;
    }
  });
  
  // Hàm xử lý đăng ký
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
        },
      );
      console.log('kết quả', response);
        if (response.status === 'OK') {
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đăng ký thành công',
            life: 2000,
          });

          resetForm();
        }
        else {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Tài khoản hoặc email này đã tồn tại trên hệ thống!',
            life: 2000,
          });
        }
  });
  
    
  </script>
  