<script setup lang="ts">
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { VoucherService } from '~/packages/base/services/voucher.service';
import { VoucherModel } from '~/packages/base/models/dto/response/voucher/voucher.model';
const confirm = useConfirm();
const toast = useToast();
const closeEscapeKeyModalInfo = ref<boolean>(true);
const closeEscapeKeyModalMap = ref<boolean>(false);
const visible_map = ref(false);

const props = defineProps({
  isVisible: {
    type: Boolean,
  },
  voucher: {
    type: VoucherModel,
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

const schema = yup.object({
  code: yup.string().required('Mã voucher không được để trống'),
  description: yup.string(),
  discount: yup.number().min(0).required('Giảm giá không hợp lệ'),
  expiration_date: yup.date().required('Ngày hết hạn không hợp lệ'),
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
});

const [_id] = defineField('_id');
const [code] = defineField('code');
const [description] = defineField('description');
const [discount] = defineField('discount');
const [expiration_date] = defineField('expiration_date');

const emit = defineEmits(['hideModal', 'reloadDataTable']);

const handleHideModal = () => {
  emit('hideModal');
};

const onSubmit = handleSubmit(async () => {
  const dto = {
    _id: _id.value,
    code: code.value,
    description: description.value,
    discount: discount.value,
    expiration_date: expiration_date.value,
  };

  ConfirmDialog.showConfirmDialog(
    confirm,
    dto._id ? 'Bạn có chắc muốn cập nhật voucher?' : 'Bạn có chắc muốn thêm voucher mới?',
    'Xác nhận',
    'pi pi-question-circle',
    () => {
      const serviceFn = dto._id ? VoucherService.update : VoucherService.insert;

      serviceFn(dto as VoucherModel)
        .then((res) => {
          if (res?.status == EnumStatus.OK) {
            toast.add({
              severity: 'success',
              summary: 'Thành công',
              detail: dto._id ? 'Cập nhật thành công' : 'Thêm mới thành công',
              life: 3000,
            });
            emit('reloadDataTable');
          } else {
            toast.add({
              severity: 'error',
              summary: 'Thất bại',
              detail: 'Đã có lỗi xảy ra! Vui lòng thử lại',
              life: 3000,
            });
          }
          handleHideModal();
        })
        .catch(() => {
          toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Hệ thống gặp sự cố! Vui lòng thử lại sau',
            life: 3000,
          });
          handleHideModal();
        });
    },
    () => {},
    '',
    ' p-button-danger',
  );
});

watch(
  () => props.voucher,
  (newVoucher) => {
    if (newVoucher) {
      _id.value = newVoucher._id;
      code.value = newVoucher.code;
      description.value = newVoucher.description;
      discount.value = newVoucher.discount;
      expiration_date.value = newVoucher.expiration_date;
    }
  },
  { immediate: true }
);

</script>

<template>
  <ClientOnly>
    <Dialog
    v-model:visible="internalVisible"
    class="w-[320px] sm:w-[800px]"
    :header="`${
        props.voucher?.id === null || props.voucher?.id === undefined
          ? 'Thêm mới '
          : 'Cập nhật '
      } mã giảm giá`"
    :modal="true"
    :close-on-escape="closeEscapeKeyModalInfo"
    >

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <div>
        <label class="font-bold block mb-1">Mã Voucher</label>
        <InputText v-model="code" placeholder="Nhập mã" />
        <small class="text-red-500">{{ errors.code }}</small>
      </div>
      <div>
        <label class="font-bold block mb-1">Mô tả</label>
        <Textarea v-model="description" rows="3" placeholder="Mô tả chi tiết" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="font-bold block mb-1">Giảm giá (%)</label>
          <InputNumber v-model="discount" suffix="%" placeholder="Nhập % giảm giá" />
        </div>
        <div>
          <label class="font-bold block mb-1">Ngày hết hạn</label>
          <DatePicker v-model="expiration_date" show-button-bar show-icon date-format="dd/mm/yy" placeholder="Chọn ngày" />
        </div>
      </div>
      <div class="flex justify-end">
        <Button type="submit" label="Lưu" icon="pi pi-save" />
      </div>
    </form>
  </Dialog>
    </ClientOnly>
  
</template>
