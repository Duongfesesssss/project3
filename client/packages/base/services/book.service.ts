import {
    type RestData,
    type RestPagedDataTable,
  } from '../models/base-response.model';
import type { BookGenresModel } from '../models/dto/response/book/book-genres.model';
  import type { BookModel } from '../models/dto/response/book/book.model';
import type { NhaCungCapModel } from '../models/dto/response/nha-cung-cap/nha-cungcap.model';
  import { BaseService } from './base.service';
  
  class _BookService extends BaseService {
    async BookDataTable(filterProject) {
      try {
        // Gửi các tham số phân trang và sắp xếp qua body
        const res = await $api<RestPagedDataTable<BookModel[]>>('/api/book/datatable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filterProject)
        });
  
        // Kiểm tra và trả về dữ liệu
        if (res) {
          return res;
        }
        console.error('Không nhận được phản hồi từ server:', res);
        return null;
      } catch (error) {
        console.error('Lỗi khi gọi API HoKhauDataTable:', error);
        throw error;
      }
    }
  
    async getHoKhauID(id?: string) {
      const res = await $api<RestPagedDataTable<BookModel[]>>(
        `/api/book/${id}`,
        {
          method: 'GET',
        },
      );
  
      if (res && res.status === EnumStatus.OK) {
        return res;
      }
      return null;
    }

    async getAllBook() {
      const res = await $api<RestPagedDataTable<BookModel[]>>(
        `/api/book`,
        {
          method: 'GET',
        },
      );
      if (res && res.status === EnumStatus.OK) {
        return res;
      }
      return null;
    }
    async getBookById(id: string) {
      const res = await $api<RestPagedDataTable<BookModel>>(
        `/api/book/${id}`,
        {
          method: 'GET',
        },
      );
    
      if (res && res.status === EnumStatus.OK) {
        return res.data; // Trả về dữ liệu từ `res.data`
      }
    
      console.error('Không tìm thấy sách với ID:', id);
      return null;
    }

    async getBookBySlug(slug: string) {
      const res = await $api<RestPagedDataTable<BookModel>>(
        `/api/book/${slug}`,
        {
          method: 'GET',
        },
      );
    
      if (res && res.status === EnumStatus.OK) {
        return res.data;
      }
    
      console.error('Không tìm thấy sách với slug:', slug);
      return null;
    }
    
    async getTheLoaiSach() {
        const res = await $api<RestData<BookGenresModel[]>>(
          `/api/book/genres`,
          {
            method: 'GET',
          },
        );
    
        if (res && res.status === EnumStatus.OK) {
          return res;
        }
        return null;
      }

      async getNhaCungCap() {
        const res = await $api<RestData<NhaCungCapModel[]>>(
          `/api/book/supplier`,
          {
            method: 'GET',
          },
        );
    
        if (res && res.status === EnumStatus.OK) {
          return res;
        }
        return null;
      }

      async getNhaXuatBan() {
        const res = await $api<RestData<NhaCungCapModel[]>>(
          `/api/book/publisher`,
          {
            method: 'GET',
          },
        );
    
        if (res && res.status === EnumStatus.OK) {
          return res;
        }
        return null;
      }
  
    async insert(entity: BookModel) {
      const response = await $api<RestPagedDataTable<BookModel[]>>(
        `/api/book`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entity),
        },
      );
  
      if (response) {
        return response;
      }
  
      return null;
    }
  
    async update(entity: BookModel) {
      const response = await $api<RestPagedDataTable<BookModel[]>>(
        `/api/book`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entity),
        },
      );
  
      if (response) {
        return response;
      }
  
      return null;
    }
  
    async delete(entity: BookModel) {
      const response = await $api<RestPagedDataTable<BookModel[]>>(
        `/api/book`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entity),
        },
      );
  
      if (response) {
        return response;
      }
  
      return null;
    }

    async updateStock(bookId: string, quantity: number, action: 'add' | 'reduce') {
      const response = await $api<RestData<any>>(
        `/api/book/${bookId}/stock`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity, action }),
        },
      );
  
      if (response) {
        return response;
      }
  
      return null;
    }
  
    async getStockStats() {
      const response = await $api<RestData<any>>(
        `/api/book/stock/stats`,
        {
          method: 'GET',
        },
      );
  
      if (response) {
        return response;
      }
  
      return null;
    }
    async getOutOfStockBooks() {
      const response = await $api<RestData<BookModel[]>>(
        `/api/book/stock/out-of-stock`,
        {
          method: 'GET',
        },
      );

      if (response) {
        return response;
      }

      return null;
    }

    async getLowStockBooks() {
      const response = await $api<RestData<BookModel[]>>(
        `/api/book/stock/low-stock`,
        {
          method: 'GET',
        },
      );
  
      if (response) {
        return response;
      }
  
      return null;
    }
  }
  
  const BookService = new _BookService();
  export { BookService };

