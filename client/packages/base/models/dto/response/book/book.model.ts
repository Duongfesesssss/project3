import type { NhaCungCapModel } from "../nha-cung-cap/nha-cungcap.model";
import type { NhaXuatBanModel } from "../nha-xuat-ban/nha-xuatban.model";

class BookModel {
    _id?: string;               
    title?: string;            
    author?: string;       
    description?: string;    
    publisher?: NhaXuatBanModel; 
    supplier?: NhaCungCapModel; 
    published_date?: string;   
    isbn?: string;             
    genre_ids?: string[];         
    price?: number;            
    language?: string;        
    pages?: number;             // Số trang của sách
    image_link?: string;     
    
    // Stock management fields
    stock_quantity?: number;    // Số lượng cuốn trong kho
    sold_quantity?: number;     // Số lượng đã bán
    stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'; // Trạng thái kho
    
    // Thống kê
    rating?: number;
    average_rating?: number;
    total_reviews?: number;
    rating_distribution?: Record<number, number>;
    sales_count?: number;
    is_bestseller?: boolean;
    discount?: number;
    
    // Virtual fields
    stock_info?: {
      available: number;
      sold: number;
      status: string;
      value: number;
    };
  }
  
  export { BookModel };
  