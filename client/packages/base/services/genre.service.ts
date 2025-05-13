import {
    type RestData,
    type RestPagedDataTable,
  } from '../models/base-response.model';
import type { BookGenresModel } from '../models/dto/response/book/book-genres.model';
  import { BaseService } from './base.service';
  
  class _GenreService extends BaseService {
    async getGenreDataTable(filterProject: any) {
      try {
        const res = await $api<RestPagedDataTable<BookGenresModel[]>>(
          '/api/genre/datatable',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filterProject),
          }
        );
  
        if (res) {
          return res;
        }
  
        console.error('Không nhận được phản hồi từ server:', res);
        return null;
      } catch (error) {
        console.error('Lỗi khi gọi API getVoucherDataTable:', error);
        throw error;
      }
    }
  
    async getAllGenres() {
      const res = await $api<RestData<BookGenresModel[]>>('/api/genre', {
        method: 'GET',
      });
  
      if (res && res.status === EnumStatus.OK) {
        return res;
      }
      return null;
    }
  
    async getGenreById(id: string) {
      const res = await $api<RestData<BookGenresModel>>(`/api/genre/${id}`, {
        method: 'GET',
      });
  
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
  
      console.error('Không tìm thấy thể loại với ID:', id);
      return null;
    }
  
    async validateGenre(code: string) {
      const res = await $api<RestData<BookGenresModel>>(`/api/genre/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
  
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
  
      console.error('Voucher không hợp lệ hoặc đã hết hạn:', code);
      return null;
    }
  
    async insert(entity: BookGenresModel) {
      const response = await $api<RestData<BookGenresModel>>(`/api/genre`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      });
  
      return response ?? null;
    }
  
    async update(entity: BookGenresModel) {
      const response = await $api<RestData<BookGenresModel>>(`/api/genre`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      });
  
      return response ?? null;
    }
  
    async delete(entity: BookGenresModel) {
      const response = await $api<RestData<null>>(`/api/genre`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entity),
      });
  
      return response ?? null;
    }
  }
  
  const GenreService = new _GenreService();
  export { GenreService };
  