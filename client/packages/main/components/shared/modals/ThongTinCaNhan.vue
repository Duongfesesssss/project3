<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useForm } from 'vee-validate';
import * as Yup from 'yup';
import { AuthService } from '~/packages/base/services/auth.service';

const isOpenModal = ref(false);

const user_name = ref('');

const closeModal = () => {
  isOpenModal.value = false;
  handleHideModal();
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
  full_name: Yup.string()
    .required('Nhập họ và tên!')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự!')
    .matches(EnumRegex.FILTER_EXPRESSION, EnumRegexMessage.FILTER_EXPRESSION_MESSAGE)
    .matches(EnumRegex.FILTER_EXPRESSION_SQL, EnumRegexMessage.FILTER_EXPRESSION_SQL_MESSAGE),
  email: Yup.string()
    .required('Nhập email!')
    .max(100, 'Email không được vượt quá 100 ký tự!')
    .matches(EnumRegex.FILTER_EMAIL, EnumRegexMessage.FILTER_EMAIL_MESSAGE),
  phone_number: Yup.string()
    .required('Nhập số điện thoại!')
    .max(30, 'Số điện thoại không được vượt quá 30 ký tự!')
    .matches(EnumRegex.FILTER_PHONE_NUMBER, EnumRegexMessage.FILTER_PHONE_NUMBER_MESSAGE),
  address: Yup.string()
    .matches(EnumRegex.FILTER_EXPRESSION, EnumRegexMessage.FILTER_EXPRESSION_MESSAGE)
    .matches(EnumRegex.FILTER_EXPRESSION_SQL, EnumRegexMessage.FILTER_EXPRESSION_SQL_MESSAGE)
    .max(256, 'Địa chỉ không được vượt quá 256 ký tự!'),
});

// Sử dụng useForm
const { handleSubmit, errors, defineField } = useForm({
  validationSchema: schema,
});

const toast = useToast();
const loading = ref(false);

// Hàm lấy dữ liệu người dùng
const getUserData = async () => {
  try {
    const { data: user } = await useAsyncData('user', () => AuthService.getUserAuth());
    if (user.value) {
      user_name.value = user.value.data.user.user_name;
      full_name.value = user.value.data.user.user_info.full_name;
      email.value = user.value.data.user.email;
      phone_number.value = user.value.data.user.phone_number;
      address.value = user.value.data.user.user_info.address;
      unit.value = user.value.data.user.unit.unit_name;
    }
  }
  catch (error) {
    console.error('Failed to fetch user data:', error);
  }
};

watch(internalVisible, (newValue) => {
  if (newValue) {
    getUserData();
  }
});
const [full_name] = defineField('full_name');
const [email] = defineField('email');
const [phone_number] = defineField('phone_number');
const [address] = defineField('address');
const [unit] = defineField('unit');
const onSubmit = handleSubmit(async (value) => {
  loading.value = true;
  try {
    await AuthService.updateUserAuth(value);
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thông tin đã được cập nhật!',
      life: 3000,
      closable: true,
    });
    closeModal();
  }
  catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể cập nhật thông tin!',
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
              disabled
              class="w-full"
            />
          </div>
          <div class="mb-4">
            <label
              for="email"
              class="block text-surface-900 text-lg font-medium mb-2 required"
            >Email</label>
            <InputText
              id="email"
              v-model="email"
              type="text"
              placeholder="Nhập email"
              :invalid="errors.email != null"
              class="w-full"
            />
            <span class="text-red-500">{{ errors.email }}</span>
          </div>
          <div class="mb-4">
            <label
              for="phone_number"
              class="block text-surface-900 text-lg font-medium mb-2 required"
            >Số điện thoại</label>
            <InputText
              id="phone_number"
              v-model="phone_number"
              type="text"
              placeholder="Nhập số điện thoại"
              :invalid="errors.phone_number != null"
              class="w-full"
            />
            <span class="text-red-500">{{ errors.phone_number }}</span>
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
