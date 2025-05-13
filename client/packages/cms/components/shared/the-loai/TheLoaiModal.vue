<template>
  <Dialog
    v-model:visible="internalVisible"
    class="w-[320px] sm:w-[800px]"
    :header="`${
      props.genre?._id === null || props.genre?._id === undefined
        ? 'Thêm mới '
        : 'Cập nhật '
    } thể loại sách`"
    :modal="true"
    :close-on-escape="closeEscapeKeyModalInfo"
  >
    <div>
      <form>
        <div class="flex flex-col gap-6">
          <div class="gap-4 grid grid-cols-1 sm:grid-cols-1">
            <div class="min-w-40">
              <label
                for="name"
                class="block font-bold mb-3 required"
              >Tên thể loại</label>
              <InputText
                id="name"
                v-model="name"
                fluid
                filter
                show-clear
                :invalid="errors.name != null"
                placeholder="Nhập tên thể loại"
              />
              <small class="text-red-500">{{ errors.name }}</small>
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
                placeholder="Nhập mô tả thể loại"
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
import { BookGenresModel } from '~/packages/base/models/dto/response/book/book-genres.model';
import { GenreService } from '~/packages/base/services/genre.service';

const props = defineProps({
  isVisible: {
    type: Boolean,
  },
  genre: {
    type: BookGenresModel,
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
  name: yup.string().required('Tên thể loại là bắt buộc').max(256, 'Tối đa 256 ký tự'),
  description: yup.string().max(1000, 'Tối đa 1000 ký tự'),
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema,
});

const [_id] = defineField('_id');
const [name] = defineField('name');
const [description] = defineField('description');

watch(
  () => props.genre,
  (newVal) => {
    if (newVal) {
      _id.value = newVal._id;
      name.value = newVal.name;
      description.value = newVal.description;
    }
  },
  { immediate: true }
);

const handleHideModal = () => {
  emit('hideModal');
};

const onSubmit = handleSubmit(async () => {
  const GenreDTO = {
    _id: _id.value || undefined,
    name: name.value,
    description: description.value,
  };

  ConfirmDialog.showConfirmDialog(
    confirm,
    `${
      GenreDTO._id
        ? 'Bạn có chắc muốn cập nhật thông tin thể loại này?'
        : 'Bạn có chắc muốn thêm thông tin thể loại này?'
    }`,
    'Xác nhận',
    'pi pi-question-circle',
    () => {
      if (GenreDTO._id != null) {
        GenreService.update(GenreDTO as BookGenresModel)
          .then((response) => {
            if (response?.status == EnumStatus.OK) {
              toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Cập nhật thông tin thể loại thành công!',
                life: 3000,
              });

              emit('reloadDataTable');
              handleHideModal();
            }
            else {
              toast.add({
                severity: 'error',
                summary: 'Thất bại',
                detail: 'Cập nhật thông tin thể loại không thành công!',
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
        GenreService.insert(GenreDTO as BookGenresModel)
          .then((response) => {
            if (response?.status == EnumStatus.OK) {
              toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Thêm mới thông tin thể loại thành công!',
                life: 3000,
              });

              emit('reloadDataTable');
              handleHideModal();
            }
            else {
              toast.add({
                severity: 'error',
                summary: 'Thất bại',
                detail: 'Thêm mới thông tin thể loại không thành công!',
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
