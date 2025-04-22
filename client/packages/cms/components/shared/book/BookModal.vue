<script setup lang="ts">

import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { HoKhauModel } from '~/packages/base/models/dto/response/ho-khau/ho-khau.model';
import { HoKhauService } from '~/packages/base/services/ho-khau.service';
import { BookService } from '~/packages/base/services/book.service';
import { BookModel } from '~/packages/base/models/dto/response/book/book.model';
import type { BookGenresModel } from '~/packages/base/models/dto/response/book/book-genres.model';
import { InputText } from 'primevue';
import { UploadService } from '~/packages/base/services/upload/upload.service';

const thongTin = ref<BookModel>();
const confirm = useConfirm();
const toast = useToast();
const closeEscapeKeyModalInfo = ref<boolean>(true);
const closeEscapeKeyModalMap = ref<boolean>(false);
const visible_map = ref(false);
const theLoaiSach = ref<BookGenresModel[]>([]);

const props = defineProps({
  isVisible: {
    type: Boolean,
  },
  book: {
    type: BookModel,
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



onMounted(async () => {
  try {
    const response = await BookService.getTheLoaiSach();
    console.log(response?.data);
    theLoaiSach.value = response.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách thể loại:', error);
  }
});

const schema = yup.object({
  
});

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: schema,
});

const [_id] = defineField('_id');
const [image_link] = defineField('image_link');
const [title] = defineField('title');
const [author] = defineField('author');
const [publisher] = defineField('publisher');
const [published_date] = defineField('published_date');
const [isbn] = defineField('isbn');
const [price] = defineField('price');
const [language] = defineField('language');
const [pages] = defineField('pages');
const [genre_ids] = defineField('genre_ids');

const onSubmit = handleSubmit(async () => {
  const BookDTO = {
    _id: _id.value,
    title: title.value,
    author: author.value,
    publisher: publisher.value,
    published_date: published_date.value,
    isbn: isbn.value,
    price: price.value,
    language: language.value,
    pages: pages.value,
    genre_ids: genre_ids.value,
    image_link: imageLink.value,
  };

  console.log('BookDTO:', BookDTO);

  ConfirmDialog.showConfirmDialog(
    confirm,
    `${
      BookDTO._id
        ? 'Bạn có chắc muốn cập nhật thông tin sách này?'
        : 'Bạn có chắc muốn thêm thông tin sách này?'
    }`,
    'Xác nhận',
    'pi pi-question-circle',
    () => {
      if (BookDTO._id != null) {
        BookService.update(BookDTO as BookModel)
          .then((response) => {
            if (response?.status == EnumStatus.OK) {
              toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Cập nhật thông tin sách thành công!',
                life: 3000,
              });

              emit('reloadDataTable');
              handleHideModal();
            }
            else {
              toast.add({
                severity: 'error',
                summary: 'Thất bại',
                detail: 'Cập nhật thông tin sách không thành công!',
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
        BookService.insert(BookDTO as BookModel)
          .then((response) => {
            if (response?.status == EnumStatus.OK) {
              toast.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Thêm mới thông tin sách thành công!',
                life: 3000,
              });

              emit('reloadDataTable');
              handleHideModal();
            }
            else {
              toast.add({
                severity: 'error',
                summary: 'Thất bại',
                detail: 'Thêm mới thông tin sách không thành công!',
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
  () => props.book,
  (newBook) => {
    if (newBook) {
      _id.value = newBook._id;
      title.value = newBook.title;
      author.value = newBook.author;
      publisher.value = newBook.publisher;
      published_date.value = newBook.published_date;
      isbn.value = newBook.isbn;
      price.value = newBook.price;
      language.value = newBook.language;
      pages.value = newBook.pages;
      genre_ids.value = newBook.genre_ids;
    }
  },
  { immediate: true }
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


const fileUpload = ref<any>(null); // Tham chiếu đến FileUpload
const imageLink = ref<string | null>(null); // URL ảnh sau khi tải lên

const onUploadBookImage = async (event: any) => {
  const file = event.files[0]; // Lấy file từ sự kiện upload
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await UploadService.Images(formData);
    if (response && response.data) {
      imageLink.value = response.data[0]; // Lấy URL ảnh từ API
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Tải ảnh lên thành công!',
        life: 3000,
      });
    } else {
      throw new Error('Không nhận được phản hồi từ server');
    }
  } catch (error) {
    console.error('Lỗi khi tải ảnh:', error);
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Tải ảnh lên thất bại!',
      life: 3000,
    });
  }
};


const onRemoveBookImage = (index: number) => {
  if (fileUpload.value?.uploadedFiles.length > 0) {
    fileUpload.value.uploadedFiles.splice(index, 1);
  }
};

const fileObjectURL = (file: File) => {
  return URL.createObjectURL(file);
};

const formatSize = (bytes: number) => {
  const k = 1024;
  const dm = 2;
  const sizes = ['B', 'KB', 'MB', 'GB'];

  if (bytes === 0) return '0 B';

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${size} ${sizes[i]}`;
};

</script>

<template>
  <ClientOnly>
    <Dialog
      v-model:visible="internalVisible"
      class="w-[320px] sm:w-[800px]"
      :header="`${
        props.book?.id === null || props.book?.id === undefined
          ? 'Thêm mới '
          : 'Cập nhật '
      } thông tin sách`"
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
                >Tên sách</label>
                <InputText
                  id="ten_tiengviet"
                  v-model="title"
                  fluid
                  filter
                  show-clear
                  :invalid="errors.lon != null"
                  placeholder="Nhập tên sách"
                />
                <small class="text-red-500">{{ errors.ten_tiengviet }}</small>
              </div>
              <div class="min-w-40">
                <label class="block font-bold mb-3">Thể loại sách</label>
                <MultiSelect
                  id="ten_tienganh"
                  v-model="genre_ids"
                  :options="theLoaiSach || []"
                  option-label="name"
                  option-value="_id"
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
                <label class="block font-bold mb-3">Tác giả</label>
                <InputText
                  id="author"
                  v-model="author"
                  fluid
                  filter
                  show-clear
                  placeholder="Nhập tên tác giả"
                />
              </div>
              <div class="min-w-40">
                <label class="block font-bold mb-3">Nhà xuất bản</label>
                <InputText
                  id="publisher"
                  v-model="publisher"
                  fluid
                  filter
                  show-clear
                  placeholder="Nhập tên nhà xuất bản"
                />
              </div>
            </div>

            <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
              <div class="min-w-40 flex space-x-4">
                <div class="flex-1">
                  <label
                    for="ngay_phathanh"
                    class="block font-bold mb-3"
                  >Ngày xuất bản</label>
                  <DatePicker
                    id="ngay_batdau"
                    v-model="published_date"
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
              <div class="min-w-40">
                <label class="block font-bold mb-3">Giá tiền (nghìn đồng)</label>
                <InputNumber
                  id="price"
                  v-model="price"
                  fluid
                  filter
                  show-clear
                  placeholder="Nhập giá tiền"
                />
              </div>
            </div>
            <div class="gap-4 grid grid-cols-1 start-0">
        <div class="min-w-40">
          <FileUpload
  ref="fileUpload"
  url="/api/upload"
  :file-limit="1"
  accept="image/jpeg,image/jpg,image/png,image/bmp"
  :auto="true"
  :show-upload-button="false"
  choose-label="Chọn ảnh sách"
  cancel-label="Hủy"
  :max-file-size="10485760"
  invalid-file-size-message="File quá lớn (tối đa 10MB)!"
  invalid-file-type-message="Chỉ chấp nhận jpeg, jpg, png, bmp!"
>
  <template #content="{ files, uploadedFiles, removeFileCallback }">
    <!-- File đang chờ upload -->
    <div
      v-if="files.length > 0"
      class="flex flex-col gap-4 mb-4"
    >
      <div
        v-for="(file, index) in files"
        :key="file.name + index"
        class="flex items-center gap-4 border p-3 rounded"
      >
        <img :src="fileObjectURL(file)" alt="Preview" width="50" height="50" />
        <div class="flex-1">
          <div class="font-semibold truncate w-40">{{ file.name }}</div>
          <div>{{ formatSize(file.size) }}</div>
        </div>
        <Badge value="Chờ duyệt" severity="warn" />
        <Button
          icon="pi pi-times"
          outlined
          rounded
          severity="danger"
          @click="removeFileCallback(index)"
        />
      </div>
    </div>

    <!-- File đã upload thành công -->
    <div
      v-if="uploadedFiles.length > 0"
      class="flex flex-col gap-4"
    >
      <div
        v-for="(file, index) in uploadedFiles"
        :key="file.name + index"
        class="flex items-center gap-4 border p-3 rounded"
      >
        <img :src="fileObjectURL(file)" alt="Ảnh sách" width="50" height="50" />
        <div class="flex-1">
          <div class="font-semibold truncate w-40">{{ file.name }}</div>
          <div>{{ formatSize(file.size) }}</div>
        </div>
        <Badge value="Hoàn tất" severity="success" />
        <Button
          icon="pi pi-times"
          outlined
          rounded
          severity="danger"
          @click="onRemoveBookImage(index)"
        />
      </div>
    </div>
  </template>

  <template #empty>
    <div class="text-center flex flex-col items-center justify-center">
      <i class="pi pi-cloud-upload text-4xl text-gray-400 mb-4" />
      <p>Kéo thả hoặc chọn ảnh sách</p>
    </div>
  </template>
</FileUpload>

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
