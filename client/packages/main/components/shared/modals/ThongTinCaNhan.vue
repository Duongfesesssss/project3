<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '~/packages/base/stores/auth.store';
import { AuthService } from '~/packages/base/services/auth.service';
import { useForm } from 'vee-validate';
import * as Yup from 'yup';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(['hideModal']);

const authStore = useAuthStore();
const toast = useToast();
const loading = ref(false);

// Validation schema với Yup
const schema = Yup.object({
  user_name: Yup.string().required('Vui lòng nhập tên đăng nhập'),
  full_name: Yup.string().required('Vui lòng nhập họ tên'),
  phone: Yup.string().optional(),
  address: Yup.string().optional()
});

// Sử dụng vee-validate với Yup
const { handleSubmit, errors, defineField, resetForm, setValues } = useForm({
  validationSchema: schema,
});

// Định nghĩa các fields
const [user_name] = defineField('user_name');
const [full_name] = defineField('full_name');
const [email] = defineField('email');
const [phone] = defineField('phone'); // Đổi từ phone_number thành phone
const [address] = defineField('address');

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
  resetForm();
};

// Hàm lấy dữ liệu người dùng
const getUserData = async () => {
  try {
    const response = await AuthService.getProfile();
    if (response.status === 'OK' && response.data) {
      const userData = response.data;
      setValues({
        user_name: userData.user_name || '',
        full_name: userData.full_name || '',
        email: userData.email || '',
        phone: userData.phone || '', // Đổi từ phone_number thành phone
        address: userData.address || ''
      });
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải thông tin người dùng',
      life: 3000,
    });
  }
};

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  try {
    const updateData = {
      user_name: values.user_name.trim(),
      full_name: values.full_name.trim(),
      phone: values.phone?.trim() || '',
      address: values.address?.trim() || ''
    };

    const response = await AuthService.updateProfile(updateData);

    if (response.status === 'OK') {
      // Cập nhật auth store nếu cần
      if (authStore.user) {
        authStore.user = { ...authStore.user, ...updateData };
      }
      
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật thông tin thành công!',
        life: 3000,
      });
      closeModal();
    } else {
      throw new Error(response.message || 'Cập nhật thất bại');
    }
  } catch (error) {
    console.error('Lỗi cập nhật thông tin:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể cập nhật thông tin!',
      life: 3000,
    });
  } finally {
    loading.value = false;
  }
});

watch(internalVisible, (newValue) => {
  if (newValue) {
    getUserData();
  }
});
</script>

<template>
  <Dialog
    v-model:visible="internalVisible"
    modal
    header="Thay đổi thông tin tài khoản"
    class="w-[500px] xl:w-[500px]"
  >
    <form @submit.prevent="onSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="col-span-1">
          <div class="mb-4">
            <label
              for="ho_ten"
              class="block text-surface-900 text-lg font-medium mb-2"
            >Tên đăng nhập</label>
            <InputText
              id="ho_ten"
              v-model="user_name"
              type="text"
              placeholder="Nhập tên đăng nhập"
              class="w-full"
              :invalid="errors.user_name != null"
            />
            <span class="text-red-500">{{ errors.user_name }}</span>
          </div>
          <div class="mb-4">
            <label
              for="email"
              class="block text-surface-900 text-lg font-medium mb-2"
            >Email</label>
            <InputText
              id="email"
              v-model="email"
              type="text"
              disabled
              class="w-full"
            />
            <small class="text-gray-500">Email không thể thay đổi</small>
          </div>
          <div class="mb-4">
            <label
              for="phone_number"
              class="block text-surface-900 text-lg font-medium mb-2"
            >Số điện thoại</label>
            <InputText
              id="phone_number"
              v-model="phone"
              type="text"
              placeholder="Nhập số điện thoại"
              class="w-full"
            />
          </div>
        </div>
        <div class="col-span-1">
          <div class="mb-4">
            <label
              for="full_name"
              class="block text-surface-900 text-lg font-medium mb-2 required"
            >Tên đầy đủ</label>
            <InputText
              id="full_name"
              v-model="full_name"
              type="text"
              placeholder="Nhập tên đầy đủ"
              class="w-full"
              :invalid="errors.full_name != null"
            />
            <span class="text-red-500">{{ errors.full_name }}</span>
          </div>
          <div class="mb-4">
            <label
              for="address"
              class="block text-surface-900 text-lg font-medium mb-2"
            >Địa chỉ</label>
            <InputText
              id="address"
              v-model="address"
              type="text"
              placeholder="Nhập địa chỉ"
              class="w-full"
            />
            <span class="text-red-500">{{ errors.address }}</span>
          </div>
          <!-- <div class="mb-4">
            <label
              for="unit"
              class="block text-surface-900 text-lg font-medium mb-2 "
            >Đơn vị công tác</label>
            <InputText
              id="unit"
              v-model="unit"
              type="text"
              placeholder="Nhập đơn vị công tác"
              class="w-full"
            />
          </div> -->
        </div>
      </div>
    </form>
    <template #footer>
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
          @click="onSubmit()"
        />
      </div>
    </template>
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
