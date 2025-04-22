<template>
  <form>
    <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-20">
      <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow rounded-border w-full lg:w-6/12 mx-auto">
        <div class="text-center mb-8">
          <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome Back</div>
          <span class="text-surface-600 dark:text-surface-200 font-medium leading-normal">Don't have an account?</span>
          <a class="font-medium no-underline ml-2 text-primary cursor-pointer">Create today!</a>
        </div>

        <div>
          <label for="email1" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">Email</label>
          <InputText v-model="loginEmail" id="email1" type="text" placeholder="Email address" class="w-full mb-4" />

          <label for="password1" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">Password</label>
          <InputText v-model="loginPassword" id="password1" type="password" placeholder="Password" class="w-full mb-4" />

          <div class="flex items-center justify-between mb-12">
            <div class="flex items-center">
              <Checkbox v-model="checked1" id="rememberme1" :binary="true" class="mr-2" />
              <label for="rememberme1">Remember me</label>
            </div>
            <a class="font-medium no-underline ml-2 text-primary text-right cursor-pointer">Forgot password?</a>
          </div>

          <Button label="Sign In" icon="pi pi-user" class="w-full" @click="doLogin" />
        </div>
      </div>
    </div>
  </form>
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

// Schema cho form đăng nhập
const loginSchema = yup.object({
  email: yup
    .string()
    .required('Vui lòng nhập tài khoản!')
    .min(2, 'Tài khoản phải có ít nhất 2 ký tự!'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu!')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự!'),
});

const {
  defineField: defineLoginField,
  handleSubmit: handleLoginSubmit,
  errors: loginErrors,
} = useForm({
  validationSchema: loginSchema,
});
const [loginEmail] = defineLoginField('email');
const [loginPassword] = defineLoginField('password');

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

// Hàm xử lý đăng nhập
const { signIn } = useAuth();
const doLogin = handleLoginSubmit(async () => {
  try {
    await signIn(
      {
        user_name: loginEmail.value,
        password: loginPassword.value,
      },
      {
        callbackUrl: '/',
        external: true,
      },
    );
    toast.add({
      severity: 'success',
      summary: 'Đăng nhập',
      detail: 'Đăng nhập thành công',
      life: 2000,
    });
  }
  catch (error) {
    if (error.response) {
      // lấy dữ liệu message lỗi khi được trả về
      const responseErrors = error.response._data;
      if (responseErrors) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: '' + responseErrors.message,
          life: 2000,
        });
      }
  
}}});

</script>
