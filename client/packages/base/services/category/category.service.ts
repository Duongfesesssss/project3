import { BaseService } from '../base.service';
import type { BaseCategoryModel } from '../../models/dto/response/categories/category.model';
import type { RestData } from '../../models/base-response.model';
import type { TaiLieuTapHuan } from '../../models/dto/request/hoatdong-daotao/tai-lieu-tap-huan.model';
import type { HocVien } from '../../models/dto/request/hoatdong-daotao/hoc-vien.model';
import type { ThongTinDaoTaoModel } from '../../models/dto/request/hoatdong-daotao/thong-tin-dao-tao.model';
import type { NhomTaiLieuModel } from '../../models/dto/response/categories/nhom-tai-lieu.model';
import type { ChuyenDeModel } from '../../models/dto/response/categories/chuyen-de.model';
import type { NoiDungModel } from '../../models/dto/response/categories/noi-dung.model';
import type { HoatDongDaoTaoModel } from '~/packages/main/models/dto/request/thong-ke-hoat-dong-dao-tao/hoat-dong-dao-tao.model';
import type { ProvinceModel } from '~/packages/cms/models/region.model';
import type { CategoryModel } from '~/packages/cms/models/category.model';

const TONG_KINHPHI_URL: string = '/api/dm-tong-kinhphi';
const NGUON_KINHPHI_URL: string = '/api/dm-nguon-kinhphi';
const DONVI_TOCHUC_TAICHO_THUCHIEN_URL: string = '/api/dm-donvi-tochuc-taitro-thuchien';
const HOATDONG_TAPHUAN_URL: string = '/api/dm-hoatdong-taphuan';
const CAP_GIANGVIEN_URL: string = '/api/dm-capgiangvien';
const GIAIDOAN_URL: string = '/api/dm-giaidoan';
const DONVI_PHATHANH_URL: string = '/api/dm-donvi-phathanh';
const PHANLOAI_TAILIEU_URL: string = '/api/phanloai-tailieu/list';
const CAPTINH_URL: string = '/api/region/provinces';
const CAPHUYEN_URL: string = '/api/region/districts';
const CAPXA_URL: string = '/api/region/communes';
const MULTI_CAPTINH_URL: string = '/api/region/multi-provinces';
const MULTI_CAPHUYEN_URL: string = '/api/region/multi-districts';
const MULTI_CAPXA_URL: string = '/api/region/multi-communes';
const TAILIEU_TAPHUAN_URL: string = '/api/tailieu-taphuan';
const HOATDONG_DAOTAO_URL: string = '/api/hoatdong-daotao';
const HOCVIEN_URL: string = '/api/hoc-vien';
const DOItUONG_TAPHUAN: string = '/api/dm-doituong-taphuan';
const NOIDUNG_TAPHUAN: string = '/api/dm-noidung-taphuan';
const HOATDONG_DAOTAO_HOATDONG_URL: string = '/api/hoatdong-daotao/public';
const PHUONGTHUC_TAPHUAN_URL: string = '/api/dm-phuongthuc-taphuan';
const DOITUONG_DEBI_TONTHUONG_URL: string = '/api/dm-doituong-dbtt';
const NHOM_TAILIEU_URL: string = '/api/dm-nhom-tailieu';
const LOAIHINH_DAOTAO_URL: string = '/api/dm-loaihinh-daotao';
const LOAI_CONGCU_URL: string = '/api/dm-loai-congcu';
const CHUYENDE_URL: string = '/api/dm-chuyende';
const NOIDUNG_URL: string = '/api/dm-noidung';
const DOITUONG_TRUYENTHONG_URL: string = '/api/dm-doituong-truyenthong';
const LINHVUC_DAOTAO_URL: string = '/api/dm-linhvuc';
const CAP_DONVI: string = '/api/dm-cap-donvi';
const NAM_TAILIEU: string = '/api/dm-nam';

class _CategoryService extends BaseService {
  // lấy ra data danh mục tổng kinh phí
  async ListDonViToChucTaiTroThucHien() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${DONVI_TOCHUC_TAICHO_THUCHIEN_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );

    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấy ra data danh mục nguồn kinh phí
  async ListNguonKinhPhi() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${NGUON_KINHPHI_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );

    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }

    return [];
  }

  // lấy ra data danh mục hoạt động tập huấn
  async ListHoatDongTapHuan() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${HOATDONG_TAPHUAN_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );

    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }

    return [];
  }

  // lấy ra data danh mục phương thức tập huấn
  async ListPhuongThucTapHuan() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${PHUONGTHUC_TAPHUAN_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );

    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }

    return [];
  }

  // lấy ra data danh mục loại hình đào tạo
  async ListLoaiHinhDaotao() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${LOAIHINH_DAOTAO_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );

    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }

    return [];
  }

  // lấy ra data danh mục tổng kinh phí
  async ListTongKinhPhi() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${TONG_KINHPHI_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );

    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấy ra data danh mục cấp giáo viên
  async ListCapGiangVien() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${CAP_GIANGVIEN_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );

    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấy ra data danh mục giai đoạn
  async ListGiaiDoanId(p: string = '') {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${GIAIDOAN_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
        params: {
          p: p,
        },
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấY ra data danh mục đơn vị phát hành
  async ListDonViPhatHanhId() {
    const res = await $fetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${DONVI_PHATHANH_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // Lấy ra data danh mục phân loại tài liệu
  async ListPhanLoaiTaiLieuId(nhomTaiLieu: number) {
    const res = await $fetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${PHANLOAI_TAILIEU_URL}?nhomTaiLieuId=${nhomTaiLieu}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );

    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }

    return [];
  }

  // Lấy ra data danh mục phân loại công cụ
  async ListLoaiCongCu() {
    const res = await $fetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${LOAI_CONGCU_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );

    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }

    return [];
  }

  // lấy ra data các tỉnh
  async ListCapTinh() {
    const res = await $fetch<RestData<ProvinceModel[]>>(
      `${this.baseApiUrl}${CAPTINH_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // list các huyện
  async ListCapHuyen(parent_id: string) {
    const res = await $fetch<RestData<ProvinceModel[]>>(
      `${this.baseApiUrl}${CAPHUYEN_URL}?parent_id=${parent_id}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // list cấp xã
  async ListCapXa(parent_id: string) {
    const res = await $fetch<RestData<ProvinceModel[]>>(
      `${this.baseApiUrl}${CAPXA_URL}?parent_id=${parent_id}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // lấy data tinh với nhiều vùng
  async ListCapTinhMulti(formData: FormData) {
    const res = await $fetch<RestData<ProvinceModel[]>>(
      `${this.baseApiUrl}${MULTI_CAPTINH_URL}`,
      {
        method: 'POST',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
        body: formData,
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // lấy data danh sách huyện với nhiều tỉnh
  async ListCapHuyenMulti(formData: FormData) {
    const res = await $fetch<RestData<ProvinceModel[]>>(
      `${this.baseApiUrl}${MULTI_CAPHUYEN_URL}`,
      {
        method: 'POST',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
        body: formData,
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // lấy data danh sách xã với nhiều huyện
  async ListCapXaMulti(formData: FormData) {
    const res = await $fetch<RestData<ProvinceModel[]>>(
      `${this.baseApiUrl}${MULTI_CAPXA_URL}`,
      {
        method: 'POST',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
        body: formData,
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // lấy ra data tài liệu tập huấn
  async ListTaiLieuTapHuan() {
    console.log('ListTaiLieuTapHuan function called');
    try {
      const res = await useFetch<RestData<TaiLieuTapHuan[]>>(`${this.baseApiUrl}${TAILIEU_TAPHUAN_URL}`,
        {
          method: 'GET',
          headers: new Headers({
            Authorization: this.getAccessToken(),
          }),
        },
      );
      console.log('API Response:', res);
      if (res != null && res.data.value?.status === EnumStatus.OK) {
        return res.data.value?.data;
      }
      else {
        console.error('Failed to fetch data or status not OK:', res);
      }
    }
    catch (error) {
      console.error('Error fetching data:', error);
    }
    return [];
  }

  // lấy ra data thống kê hoạt động đào tạo
  async ListHoatDongDaoTao() {
    const res = await useFetch<RestData<HoatDongDaoTaoModel[]>>(
      `${this.baseApiUrl}${HOATDONG_DAOTAO_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấy ra data list học viên
  async ListHocVien() {
    const res = await useFetch<RestData<HocVien[]>>(
      `${this.baseApiUrl}${HOCVIEN_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấy ra data list học viên
  async ListDoiTuongTapHuan() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${DOItUONG_TAPHUAN}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấy ra data list học viên
  async ListNoiDungTapHuan() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${NOIDUNG_TAPHUAN}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấy ra data list học viên
  async ListThongTinDaoTao(id: number) {
    const res = await useFetch<RestData<ThongTinDaoTaoModel[]>>(
      `${this.baseApiUrl}${HOATDONG_DAOTAO_HOATDONG_URL}/${id}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấy ra data list đối tượng dễ bị tổn thương
  async ListDoiTuongDeBiTonThuong() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${DOITUONG_DEBI_TONTHUONG_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // Lấy ra giá trị nhóm tài liệu
  async ListNhomTaiLieu() {
    const res = await useFetch<RestData<NhomTaiLieuModel[]>>(
      `${this.baseApiUrl}${NHOM_TAILIEU_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  async ListLoaiHinhDaoTao() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${LOAIHINH_DAOTAO_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  };

  // lấy danh sách lĩnh vực
  async ListLinhVucDaoTao() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${LINHVUC_DAOTAO_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      if (res.data.value?.data && res.data.value?.data.length > 0) {
        res.data.value.data = res.data.value.data.filter(item => item.id !== 0);
      }
      return res.data.value?.data;
    }
    return [];
  }

  // Lấy danh sách chuyên đề
  async ListChuyenDe() {
    const res = await useFetch<RestData<ChuyenDeModel[]>>(
      `${this.baseApiUrl}${CHUYENDE_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  async ListDoiTuongTuyenTruyen() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${DOITUONG_TRUYENTHONG_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấy dữ liệu nội dung
  async ListNoiDung() {
    const res = await useFetch<RestData<ChuyenDeModel[]>>(
      `${this.baseApiUrl}${NOIDUNG_URL}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
        params: {
          page: 1,
          pageSize: 1000,
        },
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  async GetNoiDung(id: number) {
    const res = await $api<RestData<NoiDungModel>>(`${this.baseApiUrl}${NOIDUNG_URL}/${id}`, {
      method: 'GET',
      headers: new Headers({
        Authorization: this.getAccessToken(),
      }),
    });
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return null;
  }

  // lấy dữ liệu nội dung theo chuyên đề
  async ListNoiDunByChuyenDe(listChuyenDeId: Array<number>) {
    const res = await $fetch<RestData<ChuyenDeModel[]>>(
      `${this.baseApiUrl}${NOIDUNG_URL}/chuyen-de`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
        params: {
          chuyendeIds: listChuyenDeId,
        },
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  // Lấy dữ liệu cấp đơn vị
  async ListCapDonVi() {
    const res = await useFetch<RestData<CategoryModel[]>>(
      `${this.baseApiUrl}${CAP_DONVI}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  async ListNamTaiLieu() {
    const res = await useFetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${NAM_TAILIEU}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.data.value?.status === EnumStatus.OK) {
      return res.data.value?.data;
    }
    return [];
  }

  // lấY ra data danh mục đơn vị phát hành
  async ListDonViPhatHanhByCapDonVi(capDonViId: number) {
    const res = await $fetch<RestData<BaseCategoryModel[]>>(
      `${this.baseApiUrl}${DONVI_PHATHANH_URL}/cap-donvi/${capDonViId}`,
      {
        method: 'GET',
        headers: new Headers({
          Authorization: this.getAccessToken(),
        }),
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return [];
  }

  async getGiaiDoan(id: number) {
    const res = await $api<RestData<BaseCategoryModel>>(
      `${this.baseApiUrl}${GIAIDOAN_URL}/${id}`,
      {
        method: 'GET',
      },
    );
    if (res != null && res.status === EnumStatus.OK) {
      return res.data;
    }
    return null;
  }
}

const CategoryService = new _CategoryService();

export { CategoryService };
