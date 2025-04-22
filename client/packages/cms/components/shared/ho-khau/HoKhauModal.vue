<script setup lang="ts">

import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { HoKhauModel } from '~/packages/base/models/dto/response/ho-khau/ho-khau.model';
import { HoKhauService } from '~/packages/base/services/ho-khau.service';

const thongTin = ref<HoKhauModel>();
const confirm = useConfirm();
const toast = useToast();
const closeEscapeKeyModalInfo = ref<boolean>(true);
const closeEscapeKeyModalMap = ref<boolean>(false);
const visible_map = ref(false);

const props = defineProps({
  isVisible: {
    type: Boolean,
  },
  hoKhau: {
    type: HoKhauModel,
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
  
});

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema,
});

const [id] = defineField('id');
const [ma_ho_khau] = defineField('ma_ho_khau');
const [so_thanh_vien] = defineField('so_thanh_vien');
const [dia_chi_thuong_tru] = defineField('dia_chi_thuong_tru');
const [noi_cap] = defineField('noi_cap');
const [ngay_cap] = defineField('ngay_cap');

const onSubmit = handleSubmit(async () => {
  const hoKhauDTO = {
    id: id.value,
    ma_ho_khau: ma_ho_khau.value,
    so_thanh_vien: so_thanh_vien.value,
    dia_chi_thuong_tru: dia_chi_thuong_tru.value,
    noi_cap: noi_cap.value,
    ngay_cap: ngay_cap.value,
  };

  console.log(hoKhauDTO.ma_ho_khau);
  ConfirmDialog.showConfirmDialog(
    confirm,
    `${
      hoKhauDTO.ma_ho_khau
        ? 'Bạn có chắc muốn cập nhật thông tin cơn bão này?'
        : 'Bạn có chắc muốn thêm thông tin cơn bão này?'
    }`,
    'Xác nhận',
    'pi pi-question-circle',
    () => {
      if (hoKhauDTO.ma_ho_khau != null) {
        HoKhauService.update(hoKhauDTO as HoKhauModel)
          .then((response) => {
            if (response?.status == EnumStatus.OK) {
              toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Cập nhật thông tin cơn bão thành công!',
                life: 3000,
              });

              emit('reloadDataTable');
              handleHideModal();
            }
            else {
              toast.add({
                severity: 'error',
                summary: 'Thất bại',
                detail: 'Cập nhật thông tin cơn bão không thành công!',
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
        HoKhauService.insert(hoKhauDTO as HoKhauModel)
          .then((response) => {
            if (response?.status == EnumStatus.OK) {
              toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Thêm mới thông tin cơn bão thành công!',
                life: 3000,
              });

              emit('reloadDataTable');
              handleHideModal();
            }
            else {
              toast.add({
                severity: 'error',
                summary: 'Thất bại',
                detail: 'Thêm mới thông tin cơn bão không thành công!',
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

watch(
  () => props.isVisible,
  () => {
    if (props.isVisible) {
      thongTin.value = props.hoKhau;
      console.log('thongtin bao', thongTin);
    }
  },
  { immediate: true },
);

watchEffect(() => {
  if (thongTin.value?._id != undefined) {
    id.value = thongTin.value._id;
    ma_ho_khau.value = thongTin.value?.ma_ho_khau;
    so_thanh_vien.value = thongTin.value?.so_thanh_vien;
    dia_chi_thuong_tru.value = thongTin.value?.dia_chi_thuong_tru;
    noi_cap.value = thongTin.value?.noi_cap;
    ngay_cap.value = thongTin.value?.ngay_cap;

  }
});

watch(visible_map, () => {
  if (!visible_map.value) {
    closeEscapeKeyModalInfo.value = true;
  }
});

const emit = defineEmits(['hideModal', 'reloadDataTable']);

const handleHideModal = () => {
  emit('hideModal');
};
</script>

<template>
  <ClientOnly>
    <Dialog
      v-model:visible="internalVisible"
      class="w-[320px] sm:w-[800px]"
      :header="`${
        props.hoKhau?.id === null || props.hoKhau?.id === undefined
          ? 'Thêm mới '
          : 'Cập nhật '
      } thông tin hộ khẩu`"
      :modal="true"
      :close-on-escape="closeEscapeKeyModalInfo"
    >
      <div>
        <form>
          <div class="flex flex-col gap-6">
            <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div class="min-w-40">
                <label
                  for="donvi_phathanh_id"
                  class="block font-bold mb-3 required"
                >Mã hộ khẩu</label>
                <InputText
                  id="ten_tiengviet"
                  v-model="ma_ho_khau"
                  fluid
                  filter
                  show-clear
                  :invalid="errors.lon != null"
                  placeholder="Nhập tên cơn bão"
                />
                <small class="text-red-500">{{ errors.ten_tiengviet }}</small>
              </div>
              <div class="min-w-40">
                <label class="block font-bold mb-3">Số thành viên</label>
                <InputText
                  id="ten_tienganh"
                  v-model="so_thanh_vien"
                  fluid
                  for="ten_tienganh"
                  filter
                  show-clear
                  placeholder="Nhập tên quốc tế"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="min-w-40">
                <label class="block font-bold mb-3">Địa chỉ thường chú</label>
                <InputText
                  id="level"
                  v-model="dia_chi_thuong_tru"
                  fluid
                  filter
                  show-clear
                  placeholder="Nhập cấp độ"
                />
              </div>
              <div class="min-w-40">
                <label class="block font-bold mb-3">Nơi cấp</label>
                <InputText
                  id="huong_dichuyen"
                  v-model="noi_cap"
                  fluid
                  filter
                  show-clear
                  placeholder="Nhập hướng đi cơn bão"
                />
              </div>
            </div>

            <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div class="min-w-40 flex space-x-4">
                <div class="flex-1">
                  <label
                    for="ngay_phathanh"
                    class="block font-bold mb-3"
                  >Ngày cấp</label>
                  <DatePicker
                    id="ngay_batdau"
                    v-model="ngay_cap"
                    show-icon
                    icon-display="input"
                    date-format="dd/mm/yy"
                    fluid
                    show-clear
                    placeholder="Từ"
                    show-button-bar
                  />
                </div>
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
  </ClientOnly>
</template>
