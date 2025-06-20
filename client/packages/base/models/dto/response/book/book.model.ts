import type { NhaCungCapModel } from "../nha-cung-cap/nha-cungcap.model";
import type { NhaXuatBanModel } from "../nha-xuat-ban/nha-xuatban.model";

class BookModel {
    id?: string;               
    title?: string;            
    author?: string;       
    description?: string;    
    publisher?: NhaXuatBanModel; 
    supplier?: NhaCungCapModel; 
    published_date?: string;   
    isbn?: string;             
    genre_id?: string[];         
    price?: number;            
    language?: string;        
    pages?: number;          
    image_link?: string;     
  }
  
  export { BookModel };
  