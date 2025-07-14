<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { AuthService } from '~/packages/base/services/auth.service';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(['hideModal']);

const toast = useToast();
const loading = ref(false);

// Form fields
const password = ref('');
const new_password = ref('');
const confirm_password = ref('');

// Form validation errors
const errors = ref({
  password: '',
  new_password: '',
  confirm_password: ''
});

const internalVisible = computed({
  get() {
    return props.isVisible;
  },
  set() {
    emit('hideModal');
  },
});

const closeModal = () => {
  internalVisible.value = false;
  clearForm();
};

const clearForm = () => {
  password.value = '';
  new_password.value = '';
  confirm_password.value = '';
  clearErrors();
};

const clearErrors = () => {
  errors.value = {
    password: '',
    new_password: '',
    confirm_password: ''
  };
};

// Validation functions
const validateForm = () => {
  clearErrors();
  let isValid = true;

  if (!password.value.trim()) {
    errors.value.password = 'Vui lòng nhập mật khẩu hiện tại';
    isValid = false;
  }

  if (!new_password.value.trim()) {
    errors.value.new_password = 'Vui lòng nhập mật khẩu mới';
    isValid = false;
  } else if (new_password.value.length < 6) {
    errors.value.new_password = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    isValid = false;
  } else if (new_password.value === password.value) {
    errors.value.new_password = 'Mật khẩu mới không được giống mật khẩu cũ';
    isValid = false;
  }

  if (!confirm_password.value.trim()) {
    errors.value.confirm_password = 'Vui lòng xác nhận mật khẩu mới';
    isValid = false;
  } else if (confirm_password.value !== new_password.value) {
    errors.value.confirm_password = 'Mật khẩu xác nhận không khớp';
    isValid = false;
  }

  return isValid;
};

const onSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  loading.value = true;
  try {
    const changeData = {
      current_password: password.value,
      new_password: new_password.value,
      confirm_password: confirm_password.value
    };

    const response = await AuthService.changePassword(changeData);

    if (response.status === 'OK') {
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Đổi mật khẩu thành công!',
        life: 3000,
      });
      closeModal();
    } else {
      throw new Error(response.message || 'Đổi mật khẩu thất bại');
    }
  } catch (error: any) {
    console.error('Lỗi đổi mật khẩu:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.message || 'Không thể đổi mật khẩu!',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
};
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
              :invalid="!!errors.password"
              class="w-full"
            />
            <span class="text-red-500 text-sm">{{ errors.password }}</span>
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
              :invalid="!!errors.new_password"
              fluid
              :feedback="false"
              :toggle-mask="true"
              class="w-full"
            />
            <span class="text-red-500 text-sm">{{ errors.new_password }}</span>
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
              :invalid="!!errors.confirm_password"
              class="w-full"
            />
            <span class="text-red-500 text-sm">{{ errors.confirm_password }}</span>
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
