<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { VoucherService } from '~/packages/base/services/voucher.service';
import type { VoucherModel } from '~/packages/base/models/dto/response/voucher/voucher.model';

const props = defineProps({
  isVisible: {
    type: Boolean,
  },
  voucher: {
    type: Object as () => VoucherModel,
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
  code: yup.string().required('Mã voucher không được để trống').max(50, 'Tối đa 50 ký tự'),
  discount: yup
    .number()
    .typeError('Giảm giá phải là số')
    .required('Giảm giá không được để trống')
    .min(0, 'Giảm giá phải lớn hơn 0')
    .max(100, 'Giảm giá không được vượt quá 100%'),
  valid_from: yup.date().typeError('Ngày có hiệu lực không hợp lệ').required('Ngày có hiệu lực không được để trống'),
  valid_until: yup.date().typeError('Ngày hết hạn không hợp lệ').required('Ngày hết hạn không được để trống'),
  usage_limit: yup
    .number()
    .typeError('Giới hạn sử dụng phải là số')
    .required('Giới hạn sử dụng không được để trống')
    .min(1, 'Giới hạn sử dụng phải lớn hơn 0'),
  min_order_value: yup
    .number()
    .typeError('Giá trị đơn tối thiểu phải là số')
    .required('Giá trị đơn tối thiểu không được để trống')
    .min(0, 'Giá trị đơn tối thiểu phải lớn hơn 0'),
  visibility: yup.string().oneOf(['private', 'public']).required('Vui lòng chọn loại voucher'),
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
});

const [_id] = defineField('_id');
const [code] = defineField('code');
const [discount] = defineField('discount');
const [valid_from] = defineField('valid_from');
const [valid_until] = defineField('valid_until');
const [usage_limit] = defineField('usage_limit');
const [min_order_value] = defineField('min_order_value');
const [visibility] = defineField('visibility');

const visibilityOptions = [
  { label: 'Voucher cá nhân', value: 'private' },
  { label: 'Voucher cộng đồng', value: 'public' },
];

watch(
  () => props.voucher,
  (newVal) => {
    if (newVal) {
      _id.value = newVal._id;
      code.value = newVal.code;
      discount.value = newVal.discount;
      valid_from.value = newVal.valid_from;
      valid_until.value = newVal.valid_until;
      usage_limit.value = newVal.usage_limit;
      min_order_value.value = newVal.min_order_value;
      visibility.value = newVal.visibility || 'private';
    } else {
      visibility.value = 'private';
    }
  },
  { immediate: true }
);

const handleHideModal = () => {
  emit('hideModal');
};

const onSubmit = handleSubmit(async () => {
  const voucherDTO = {
      _id: _id.value || undefined,
      code: code.value,
      discount: discount.value,
      valid_from: valid_from.value,
      valid_until: valid_until.value,
      usage_limit: usage_limit.value,
      min_order_value: min_order_value.value,
      visibility: visibility.value || 'private',
      type: visibility.value || 'private', // Alias để backend map đúng nếu dùng field type
    };

  ConfirmDialog.showConfirmDialog(
    confirm,
    `${
      voucherDTO._id
        ? 'Bạn có chắc muốn cập nhật voucher này?'
        : 'Bạn có chắc muốn thêm voucher mới?'
    }`,
    'Xác nhận',
    'pi pi-question-circle',
    () => {
      const serviceFn = voucherDTO._id ? VoucherService.update : VoucherService.insert;

      serviceFn(voucherDTO as VoucherModel)
        .then((res) => {
          if (res?.status === EnumStatus.OK) {
            toast.add({
              severity: 'success',
              summary: 'Thành công',
              detail: voucherDTO._id ? 'Cập nhật voucher thành công' : 'Thêm mới voucher thành công',
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
</script>

<template>
  <Dialog
    v-model:visible="internalVisible"
    class="w-[320px] sm:w-[700px]"
    :header="`${
      props.voucher?._id === null || props.voucher?._id === undefined
        ? 'Thêm mới '
        : 'Cập nhật '
    } mã giảm giá`"
    :modal="true"
    :close-on-escape="closeEscapeKeyModalInfo"
  >
    <div>
      <form>
        <div class="flex flex-col gap-6">
          <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div class="min-w-40">
              <label for="code" class="block font-bold mb-3 required">Mã Voucher</label>
              <InputText
                id="code"
                v-model="code"
                fluid
                filter
                show-clear
                :invalid="errors.code != null"
                placeholder="Nhập mã voucher"
              />
              <small class="text-red-500">{{ errors.code }}</small>
            </div>
            <div class="min-w-40">
              <label for="discount" class="block font-bold mb-3 required">Giảm giá (%)</label>
              <InputNumber
                id="discount"
                v-model="discount"
                suffix="%"
                fluid
                :invalid="errors.discount != null"
                placeholder="Nhập % giảm giá"
              />
              <small class="text-red-500">{{ errors.discount }}</small>
            </div>
          </div>

          <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div class="min-w-40">
              <label for="valid_from" class="block font-bold mb-3 required">Ngày có hiệu lực</label>
              <DatePicker
                id="valid_from"
                v-model="valid_from"
                show-button-bar
                show-icon
                fluid
                date-format="dd/mm/yy"
                :invalid="errors.valid_from != null"
                placeholder="Chọn ngày có hiệu lực"
              />
              <small class="text-red-500">{{ errors.valid_from }}</small>
            </div>
            <div class="min-w-40">
              <label for="valid_until" class="block font-bold mb-3 required">Ngày hết hạn</label>
              <DatePicker
                id="valid_until"
                v-model="valid_until"
                show-button-bar
                show-icon
                fluid
                date-format="dd/mm/yy"
                :invalid="errors.valid_until != null"
                placeholder="Chọn ngày hết hạn"
              />
              <small class="text-red-500">{{ errors.valid_until }}</small>
            </div>
          </div>

          <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
            <div class="min-w-40">
              <label for="usage_limit" class="block font-bold mb-3 required">Giới hạn sử dụng</label>
              <InputNumber
                id="usage_limit"
                v-model="usage_limit"
                fluid
                :invalid="errors.usage_limit != null"
                placeholder="Nhập giới hạn sử dụng"
              />
              <small class="text-red-500">{{ errors.usage_limit }}</small>
            </div>
            <div class="min-w-40">
              <label for="min_order_value" class="block font-bold mb-3 required">Giá trị đơn tối thiểu</label>
              <InputNumber
                id="min_order_value"
                v-model="min_order_value"
                mode="currency"
                currency="VND"
                locale="vi-VN"
                fluid
                :invalid="errors.min_order_value != null"
                placeholder="Nhập giá trị đơn tối thiểu"
              />
              <small class="text-red-500">{{ errors.min_order_value }}</small>
            </div>
            <div class="min-w-40">
              <label for="visibility" class="block font-bold mb-3 required">Loại voucher</label>
              <Select
                id="visibility"
                v-model="visibility"
                :options="visibilityOptions"
                option-label="label"
                option-value="value"
                fluid
                :invalid="errors.visibility != null"
                placeholder="Chọn loại voucher"
              />
              <small class="text-red-500">{{ errors.visibility }}</small>
            </div>
          </div>
        </div>
      </form>
    </div>
    <template #footer>
      <div class="p-dialog-footer mt-4" style="width: 779px">
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
