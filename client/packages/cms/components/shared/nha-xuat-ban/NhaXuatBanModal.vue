<template>
    <Dialog
      v-model:visible="internalVisible"
      class="w-[320px] sm:w-[800px]"
      :header="`${
        props.nhaXuatBan?._id === null || props.nhaXuatBan?._id === undefined
          ? 'Thêm mới '
          : 'Cập nhật '
      } nhà xuất bản`"
      :modal="true"
      :close-on-escape="closeEscapeKeyModalInfo"
    >
      <div>
        <form>
          <div class="flex flex-col gap-6">
            <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div class="min-w-40">
                <label
                  for="name"
                  class="block font-bold mb-3 required"
                >Tên nhà xuất bản</label>
                <InputText
                  id="name"
                  v-model="name"
                  fluid
                  filter
                  show-clear
                  :invalid="errors.name != null"
                  placeholder="Nhập tên nhà xuất bản"
                />
                <small class="text-red-500">{{ errors.name }}</small>
              </div>
            </div>
            <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div class="min-w-40">
                <label
                  for="phone"
                  class="block font-bold mb-3"
                >Số điện thoại</label>
                <InputText
                  id="phone"
                  v-model="phone"
                  fluid
                  filter
                  show-clear
                  :invalid="errors.phone != null"
                  placeholder="Nhập số điện thoại"
                />
                <small class="text-red-500">{{ errors.phone }}</small>
              </div>
              <div class="min-w-40">
                <label
                  for="email"
                  class="block font-bold mb-3"
                >Email</label>
                <InputText
                  id="email"
                  v-model="email"
                  fluid
                  filter
                  show-clear
                  :invalid="errors.email != null"
                  placeholder="Nhập email"
                />
                <small class="text-red-500">{{ errors.email }}</small>
              </div>
            </div>
            <div class="gap-4 grid grid-cols-1">
              <div class="min-w-40">
                <label
                  for="address"
                  class="block font-bold mb-3"
                >Địa chỉ</label>
                <InputText
                  id="address"
                  v-model="address"
                  fluid
                  filter
                  show-clear
                  :invalid="errors.address != null"
                  placeholder="Nhập địa chỉ"
                />
                <small class="text-red-500">{{ errors.address }}</small>
              </div>
            </div>
            <div class="gap-4 grid grid-cols-1">
              <div class="min-w-40">
                <label
                  for="description"
                  class="block font-bold mb-3"
                >Mô tả</label>
                <Textarea
                  id="description"
                  v-model="description"
                  rows="5"
                  fluid
                  placeholder="Nhập mô tả nhà xuất bản"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      <template #footer>
        <div
          class="p-dialog-footer mt-4"
          style="width: 779px"
        >
          <Button
            type="button"
            label="Đóng"
            icon="pi pi-times"
            severity="danger"
            @click="handleHideModal()"
          />
          <Button
            label="Lưu"
            icon="pi pi-check"
            type="submit"
            @click="onSubmit"
          />
        </div>
      </template>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { useForm } from 'vee-validate';
  import * as yup from 'yup';
  import { useToast } from 'primevue/usetoast';
  import { useConfirm } from 'primevue/useconfirm';
  import type { NhaXuatBanModel } from '~/packages/base/models/dto/response/nha-xuat-ban/nha-xuatban.model';
  import { NhaXuatBanService } from '~/packages/base/services/nha-xuatban.service';
  
  const props = defineProps({
    isVisible: {
      type: Boolean,
    },
    nhaXuatBan: {
      type: Object as () => NhaXuatBanModel,
    },
  });
  
  const internalVisible = computed({
    get() {
      return props.isVisible;
    },
    set() {
      handleHideModal();
    },
  });
  
  const emit = defineEmits(['hideModal', 'reloadDataTable']);
  
  const toast = useToast();
  const confirm = useConfirm();
  const closeEscapeKeyModalInfo = ref<boolean>(true);
  
  const schema = yup.object({
    name: yup.string().required('Tên nhà xuất bản là bắt buộc').max(256, 'Tối đa 256 ký tự'),
    phone: yup.string().matches(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
    email: yup.string().email('Email không hợp lệ'),
    address: yup.string().max(500, 'Tối đa 500 ký tự'),
    description: yup.string().max(1000, 'Tối đa 1000 ký tự'),
  });
  
  const { defineField, handleSubmit, errors } = useForm({
    validationSchema: schema,
  });
  
  const [_id] = defineField('_id');
  const [name] = defineField('name');
  const [contact] = defineField('contact');
  const [phone] = defineField('phone');
  const [email] = defineField('email');
  const [address] = defineField('address');
  const [description] = defineField('description');
  
  watch(
    () => props.nhaXuatBan,
    (newVal) => {
      if (newVal) {
        _id.value = newVal._id;
        name.value = newVal.name;
        contact.value = newVal.contact;
        phone.value = newVal.phone;
        email.value = newVal.email;
        address.value = newVal.address;
        description.value = newVal.description;
      }
    },
    { immediate: true }
  );
  
  const handleHideModal = () => {
    emit('hideModal');
  };
  
  const onSubmit = handleSubmit(async () => {
    const NhaXuatBanDTO = {
      _id: _id.value || undefined,
      name: name.value,
      contact: contact.value,
      phone: phone.value,
      email: email.value,
      address: address.value,
      description: description.value,
    };
  
    ConfirmDialog.showConfirmDialog(
      confirm,
      `${
        NhaXuatBanDTO._id
          ? 'Bạn có chắc muốn cập nhật thông tin nhà xuất bản này?'
          : 'Bạn có chắc muốn thêm thông tin nhà xuất bản này?'
      }`,
      'Xác nhận',
      'pi pi-question-circle',
      () => {
        if (NhaXuatBanDTO._id != null) {
          NhaXuatBanService.update(NhaXuatBanDTO as NhaXuatBanModel)
            .then((response) => {
              if (response?.status == EnumStatus.OK) {
                toast.add({
                  severity: 'success',
                  summary: 'Thành công',
                  detail: 'Cập nhật thông tin nhà xuất bản thành công!',
                  life: 3000,
                });
  
                emit('reloadDataTable');
                handleHideModal();
              }
              else {
                toast.add({
                  severity: 'error',
                  summary: 'Thất bại',
                  detail: 'Cập nhật thông tin nhà xuất bản không thành công!',
                  life: 3000,
                });
  
                handleHideModal();
              }
            })
            .catch(() => {
              console.error('Lỗi khi cập nhật:', errors);
              toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Đã có lỗi xảy ra, vui lòng thử lại!',
                life: 3000,
              });
  
              handleHideModal();
            });
        }
        else {
          NhaXuatBanService.insert(NhaXuatBanDTO as NhaXuatBanModel)
            .then((response) => {
              if (response?.status == EnumStatus.OK) {
                toast.add({
                  severity: 'success',
                  summary: 'Thành công',
                  detail: 'Thêm mới thông tin nhà xuất bản thành công!',
                  life: 3000,
                });
  
                emit('reloadDataTable');
                handleHideModal();
              }
              else {
                toast.add({
                  severity: 'error',
                  summary: 'Thất bại',
                  detail: 'Thêm mới thông tin nhà xuất bản không thành công!',
                  life: 3000,
                });
  
                handleHideModal();
              }
            })
            .catch(() => {
              toast.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Đã có lỗi xảy ra, vui lòng thử lại!',
                life: 3000,
              });
  
              handleHideModal();
            });
        }
      },
      () => {},
      '',
      ' p-button-danger',
    );
  });
  </script>
  
  <style scoped lang="scss">
  .field {
    margin-bottom: 1.5rem;
  }
  </style> 