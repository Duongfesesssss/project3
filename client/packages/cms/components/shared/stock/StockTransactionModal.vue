<script setup lang="ts">
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { InputNumber, Textarea, Select } from 'primevue';
import type { BookModel } from '~/packages/base/models/dto/response/book/book.model';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  book: {
    type: Object as () => BookModel | null,
    default: null,
  },
  transactionType: {
    type: String as () => 'stock_in' | 'stock_out',
    default: 'stock_in',
  },
});

const emit = defineEmits(['hideModal', 'reloadData']);

const toast = useToast();
const confirm = useConfirm();

const internalVisible = computed({
  get() {
    return props.isVisible;
  },
  set() {
    handleHideModal();
  },
});

// Schema validation - dynamic computed
const currentSchema = computed(() => {
  if (props.transactionType === 'stock_in') {
    return yup.object({
      quantity: yup.number()
        .required('Vui lòng nhập số lượng')
        .min(1, 'Số lượng phải lớn hơn 0')
        .max(9999, 'Số lượng tối đa là 9999'),
      reason: yup.string().required('Vui lòng nhập lý do'),
      note: yup.string(),
    });
  } else {
    // stock_out - sử dụng giá trị real-time
    const currentStock = props.book?.stock_quantity || 0;
    return yup.object({
      quantity: yup.number()
        .required('Vui lòng nhập số lượng')
        .min(1, 'Số lượng phải lớn hơn 0')
        .max(currentStock, `Không đủ hàng trong kho (còn ${currentStock})`),
      reason: yup.string().required('Vui lòng nhập lý do'),
      note: yup.string(),
    });
  }
});

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: currentSchema,
});

const [quantity] = defineField('quantity');
const [reason] = defineField('reason');
const [note] = defineField('note');

// Predefined reasons
const stockInReasons = [
  { label: 'Nhập hàng từ nhà cung cấp', value: 'Nhập hàng từ nhà cung cấp' },
  { label: 'Nhận hàng trả lại', value: 'Nhận hàng trả lại' },
  { label: 'Điều chỉnh tồn kho', value: 'Điều chỉnh tồn kho' },
  { label: 'Khác', value: 'Khác' },
];

const stockOutReasons = [
  { label: 'Bán hàng cho khách', value: 'Bán hàng cho khách' },
  { label: 'Hàng hỏng/mất', value: 'Hàng hỏng/mất' },
  { label: 'Trả hàng cho nhà cung cấp', value: 'Trả hàng cho nhà cung cấp' },
  { label: 'Điều chỉnh tồn kho', value: 'Điều chỉnh tồn kho' },
  { label: 'Khác', value: 'Khác' },
];

const reasonOptions = computed(() => {
  return props.transactionType === 'stock_in' ? stockInReasons : stockOutReasons;
});

const onSubmit = handleSubmit(async (values) => {
  if (!props.book) return;
  
  const transactionData = {
    book_id: props.book._id,
    type: props.transactionType,
    quantity: values.quantity,
    reason: values.reason,
    note: values.note,
  };

  const confirmMessage = props.transactionType === 'stock_in' 
    ? `Bạn có chắc muốn nhập ${values.quantity} cuốn sách "${props.book.title}"?`
    : `Bạn có chắc muốn xuất ${values.quantity} cuốn sách "${props.book.title}"?`;

  ConfirmDialog.showConfirmDialog(
    confirm,
    confirmMessage,
    'Xác nhận',
    'pi pi-question-circle',
    async () => {
      try {
        // Gọi API nhập/xuất hàng với endpoint đúng
        const endpoint = props.transactionType === 'stock_in' 
          ? `/api/stock-transactions/${props.book?._id}/stock-in`
          : `/api/stock-transactions/${props.book?._id}/stock-out`;
          
        const response = await $fetch(endpoint, {
          method: 'POST',
          body: {
            quantity: transactionData.quantity,
            reason: transactionData.reason,
            note: transactionData.note
          },
        }) as { status: string; message?: string };

        if (response.status === 'OK') {
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `${props.transactionType === 'stock_in' ? 'Nhập' : 'Xuất'} hàng thành công!`,
            life: 3000,
          });
          
          emit('reloadData');
          handleHideModal();
        } else {
          throw new Error(response.message || 'Có lỗi xảy ra');
        }
      } catch (error) {
        console.error('Lỗi:', error);
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: `Có lỗi xảy ra khi ${props.transactionType === 'stock_in' ? 'nhập' : 'xuất'} hàng!`,
          life: 3000,
        });
      }
    },
    () => {},
    '',
    'p-button-danger',
  );
});

const handleHideModal = () => {
  resetForm();
  emit('hideModal');
};

// Reset form khi modal mở
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    resetForm();
  }
});
</script>

<template>
  <ClientOnly>
    <Dialog
      v-model:visible="internalVisible"
      class="w-[400px] sm:w-[600px]"
      :header="`${transactionType === 'stock_in' ? '📦 Nhập hàng' : '📤 Xuất hàng'}`"
      :modal="true"
    >
      <!-- Book Info -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 class="font-bold text-lg mb-2">{{ book?.title }}</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-600">Tác giả:</span> 
            <span class="font-medium">{{ book?.author }}</span>
          </div>
          <div>
            <span class="text-gray-600">Tồn kho hiện tại:</span> 
            <span class="font-bold text-blue-600">{{ book?.stock_quantity || 0 }} cuốn</span>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form class="space-y-6" @submit.prevent="onSubmit">
        <!-- Quantity -->
        <div>
          <label class="block font-bold mb-3 required">
            Số lượng {{ transactionType === 'stock_in' ? 'nhập' : 'xuất' }}
          </label>
          <InputNumber
            v-model="quantity"
            fluid
            :invalid="errors.quantity != null"
            :placeholder="`Nhập số lượng ${transactionType === 'stock_in' ? 'nhập' : 'xuất'}`"
            :min="1"
            :max="transactionType === 'stock_out' ? (book?.stock_quantity || 0) : 9999"
          />
          <small class="text-red-500">{{ errors.quantity }}</small>
        </div>

        <!-- Reason -->
        <div>
          <label class="block font-bold mb-3 required">Lý do</label>
          <Select
            v-model="reason"
            :options="reasonOptions"
            option-label="label"
            option-value="value"
            fluid
            :invalid="errors.reason != null"
            placeholder="Chọn lý do"
          />
          <small class="text-red-500">{{ errors.reason }}</small>
        </div>

        <!-- Note -->
        <div>
          <label class="block font-bold mb-3">Ghi chú</label>
          <Textarea
            v-model="note"
            rows="3"
            fluid
            placeholder="Ghi chú thêm (không bắt buộc)"
          />
          <small class="text-red-500">{{ errors.note }}</small>
        </div>

        <!-- Summary -->
        <div v-if="quantity" class="p-4 bg-blue-50 rounded-lg">
          <h4 class="font-bold text-blue-800 mb-2">Tóm tắt giao dịch:</h4>
          <div class="text-sm space-y-1">
            <div>
              <span class="text-gray-600">Sách:</span> 
              <span class="font-medium">{{ book?.title }}</span>
            </div>
            <div>
              <span class="text-gray-600">Số lượng:</span> 
              <span class="font-bold" :class="transactionType === 'stock_in' ? 'text-green-600' : 'text-red-600'">
                {{ transactionType === 'stock_in' ? '+' : '-' }}{{ quantity }} cuốn
              </span>
            </div>
            <div>
              <span class="text-gray-600">Tồn kho sau giao dịch:</span> 
              <span class="font-bold text-blue-600">
                {{ 
                  transactionType === 'stock_in' 
                    ? (book?.stock_quantity || 0) + (quantity || 0)
                    : (book?.stock_quantity || 0) - (quantity || 0)
                }} cuốn
              </span>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            type="button"
            label="Hủy"
            icon="pi pi-times"
            severity="secondary"
            @click="handleHideModal"
          />
          <Button
            :label="`${transactionType === 'stock_in' ? 'Nhập hàng' : 'Xuất hàng'}`"
            :icon="`pi ${transactionType === 'stock_in' ? 'pi-plus' : 'pi-minus'}`"
            :severity="transactionType === 'stock_in' ? 'success' : 'danger'"
            @click="onSubmit"
          />
        </div>
      </template>
    </Dialog>
  </ClientOnly>
</template>
