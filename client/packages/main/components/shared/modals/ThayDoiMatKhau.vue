<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useForm } from 'vee-validate';
import * as Yup from 'yup';
import { AuthService } from '~/packages/base/services/auth.service';

const isOpenModal = ref(false);

const closeModal = () => {
  isOpenModal.value = false;
  handleHideModal();
  resetForm();
};

const props = defineProps({
  isVisible: {
    type: Boolean,
  },
});

const emit = defineEmits(['hideModal']);
const handleHideModal = () => {
  emit('hideModal');
};

const internalVisible = computed({
  get() {
    return props.isVisible;
  },
  set() {
    handleHideModal();
  },
});

// Định nghĩa schema
const schema = Yup.object({
  password: Yup.string().required('Nhập mật khẩu hiện tại!'),
  new_password: Yup.string()
    .required('Nhập mật khẩu mới!')
    .notOneOf([Yup.ref('password')], 'Mật khẩu mới không được giống mật khẩu cũ!')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự!')
    .matches(/[A-Z]/, 'Mật khẩu phải bao gồm ít nhất 1 chữ cái viết hoa!')
    .matches(/[a-z]/, 'Mật khẩu phải bao gồm 1 chữ cái viết thường!')
    .matches(/[0-9]/, 'Mật khẩu phải bao gồm 1 số!')
    .matches(
      /[!@#$%^&*()_+\-={};':"\\|,.<>/?]/,
      'Mật khẩu phải bao gồm 1 ký tự đặc biệt!',
    ),
  confirm_password: Yup.string()
    .required('Nhập lại mật khẩu mới!')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự!')
    .oneOf([Yup.ref('new_password')], 'Mật khẩu xác nhận không khớp!'),
});

// Sử dụng useForm
const { handleSubmit, errors, defineField, resetForm, setValues } = useForm({
  validationSchema: schema,
});

const toast = useToast();
const loading = ref(false);

watch(internalVisible, (newValue) => {
  if (newValue) {
  }
});
const [password] = defineField('password');
const [new_password] = defineField('new_password');
const [confirm_password] = defineField('confirm_password');

const onSubmit = handleSubmit(async (value) => {
  loading.value = true;
  try {
    AuthService.changePasswordUserAuth(value).then((res) => {
      if (res === EnumStatus.ERROR) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Đổi mật khẩu thất bại, vui lòng kiểm tra lại!',
          life: 3000,
          closable: true,
        });
      }
      else {
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đổi mật khẩu thành công!',
          life: 3000,
          closable: true,
        });
        resetForm();
        closeModal();
      }
    });
  }
  catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Đổi mật khẩu thất bại, vui lòng kiểm tra lại!',
      life: 3000,
      closable: true,
    });
  }
  finally {
    loading.value = false;
  }
});
</script>

<template>
  <Dialog
    v-model:visible="internalVisible"
    modal
    header="Đổi mật khẩu"
    class="w-[500px] xl:w-[400px]"
  >
    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div class="col-span-1">
          <div class="mb-4">
            <label
              for="password"
              class="block text-surface-900 text-lg font-medium mb-2 required"
            >Mật khẩu cũ</label>
            <Password
              id="password"
              v-model="password"
              type="text"
              fluid
              :toggle-mask="true"
              :feedback="false"
              placeholder="Nhập mật khẩu hiện tại"
              class="w-full"
            />
          </div>
          <div class="mb-4">
            <label
              for="email"
              class="block text-surface-900 text-lg font-medium mb-2 required"
            >Mật khẩu mới</label>
            <Password
              id="new_password"
              v-model="new_password"
              type="text"
              placeholder="Nhập mật khẩu mới"
              :invalid="errors.new_password != null"
              fluid
              :feedback="false"
              :toggle-mask="true"
              class="w-full"
            />
            <span class="text-red-500">{{ errors.new_password }}</span>
          </div>
          <div class="mb-4">
            <label
              for="phone_number"
              class="block text-surface-900 text-lg font-medium mb-2 required"
            >Xác nhận mật khẩu</label>
            <Password
              id="confirm_password"
              v-model="confirm_password"
              type="text"
              fluid
              :feedback="false"
              :toggle-mask="true"
              placeholder="Nhập lại mật khẩu mới"
              :invalid="errors.confirm_password != null"
              class="w-full"
            />
            <span class="text-red-500">{{ errors.confirm_password }}</span>
          </div>
        </div>
      </div>
      <div class="p-dialog-footer-custom">
        <Button
          class="mr-2"
          type="button"
          label="Đóng"
          icon="pi pi-times"
          severity="danger"
          @click="closeModal()"
        />
        <Button
          label="Lưu"
          icon="pi pi-check"
          :loading="loading"
          type="submit"
        />
      </div>
    </form>
  </Dialog>
</template>

<style>
.custom-dialog .p-dialog {
  background-color: #470707;
}
.p-dialog-footer-custom {
  flex-shrink: 0;
  padding: 0px !important;
  display: flex;
  justify-content: flex-end;
  gap: var(--p-dialog-footer-gap);
  margin-top: 3px;
}
</style>
