const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const bookSchema = new Schema({
  image_link: String,
  title: String,
  author: String,
  slug: { type: String, unique: true },
  description: String,
  publisher: { type: Types.ObjectId, ref: 'Publisher' },
  published_date: Date,
  isbn: { type: String, unique: true },
  genre_ids: [{ type: Number }],
  price: Number,
  language: String,
  pages: Number, // Số trang của sách
  
  // Quản lý kho
  stock_quantity: { type: Number, default: 0, min: 0 }, // Số lượng cuốn sách trong kho
  sold_quantity: { type: Number, default: 0, min: 0 }, // Số lượng đã bán

  // Đánh giá
  rating: { type: Number, default: 0, min: 0, max: 5 },
  total_reviews: { type: Number, default: 0 },
  reviews: [{
    user_id: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }],

  // Bán chạy
  sales_count: { type: Number, default: 0 },
  is_bestseller: { type: Boolean, default: false },
  stock_status: { 
    type: String, 
    enum: ['in_stock', 'low_stock', 'out_of_stock'], 
    default: function() {
      if (this.stock_quantity === 0) return 'out_of_stock';
      if (this.stock_quantity <= 5) return 'low_stock';
      return 'in_stock';
    }
  },
  discount: { type: Number, default: 0, min: 0, max: 100 },

  // Nhà cung cấp
  supplier: { type: Types.ObjectId, ref: 'Supplier' },

}, { timestamps: true });

// Tự động tạo slug từ title trước khi lưu
bookSchema.pre('save', function (next) {
  // Tự động cập nhật stock_status dựa trên stock_quantity
  if (this.isModified('stock_quantity')) {
    if (this.stock_quantity === 0) {
      this.stock_status = 'out_of_stock';
    } else if (this.stock_quantity <= 5) {
      this.stock_status = 'low_stock';
    } else {
      this.stock_status = 'in_stock';
    }
  }

  // Tự động tạo isbn nếu không được cung cấp
  if (!this.isbn) {
    this.isbn = Math.floor(1000000000000 + Math.random() * 9000000000000).toString(); // Tạo dãy số ngẫu nhiên 13 chữ số
  }

  // Chỉ tạo slug nếu có title và title đã thay đổi
  if (this.title && this.isModified('title')) {
    const vietnameseMap = {
      à: 'a', á: 'a', ạ: 'a', ả: 'a', ã: 'a', â: 'a', ầ: 'a', ấ: 'a', ậ: 'a', ẩ: 'a', ẫ: 'a', ă: 'a', ằ: 'a', ắ: 'a', ặ: 'a', ẳ: 'a', ẵ: 'a',
      è: 'e', é: 'e', ẹ: 'e', ẻ: 'e', ẽ: 'e', ê: 'e', ề: 'e', ế: 'e', ệ: 'e', ể: 'e', ễ: 'e',
      ì: 'i', í: 'i', ị: 'i', ỉ: 'i', ĩ: 'i',
      ò: 'o', ó: 'o', ọ: 'o', ỏ: 'o', õ: 'o', ô: 'o', ồ: 'o', ố: 'o', ộ: 'o', ổ: 'o', ỗ: 'o', ơ: 'o', ờ: 'o', ớ: 'o', ợ: 'o', ở: 'o', ỡ: 'o',
      ù: 'u', ú: 'u', ụ: 'u', ủ: 'u', ũ: 'u', ư: 'u', ừ: 'u', ứ: 'u', ự: 'u', ử: 'u', ữ: 'u',
      ỳ: 'y', ý: 'y', ỵ: 'y', ỷ: 'y', ỹ: 'y',
      đ: 'd',
      À: 'A', Á: 'A', Ạ: 'A', Ả: 'A', Ã: 'A', Â: 'A', Ầ: 'A', Ấ: 'A', Ậ: 'A', Ẩ: 'A', Ẫ: 'A', Ă: 'A', Ằ: 'A', Ắ: 'A', Ặ: 'A', Ẳ: 'A', Ẵ: 'A',
      È: 'E', É: 'E', Ẹ: 'E', Ẻ: 'E', Ẽ: 'E', Ê: 'E', Ề: 'E', Ế: 'E', Ệ: 'E', Ể: 'E', Ễ: 'E',
      Ì: 'I', Í: 'I', Ị: 'I', Ỉ: 'I', Ĩ: 'I',
      Ò: 'O', Ó: 'O', Ọ: 'O', Ỏ: 'O', Õ: 'O', Ô: 'O', Ồ: 'O', Ố: 'O', Ộ: 'O', Ổ: 'O', Ỗ: 'O', Ơ: 'O', Ờ: 'O', Ớ: 'O', Ợ: 'O', Ở: 'O', Ỡ: 'O',
      Ù: 'U', Ú: 'U', Ụ: 'U', Ủ: 'U', Ũ: 'U', Ư: 'U', Ừ: 'U', Ứ: 'U', Ự: 'U', Ử: 'U', Ữ: 'U',
      Ỳ: 'Y', Ý: 'Y', Ỵ: 'Y', Ỷ: 'Y', Ỹ: 'Y',
      Đ: 'D',
    };

    // Tạo slug từ title
    this.slug = this.title
      .split('')
      .map((char) => vietnameseMap[char] || char) // Thay thế ký tự tiếng Việt
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/-+/g, '-'); // Loại bỏ dấu gạch ngang thừa
  }

  next();
});

const bookGenresSchema = new Schema({
  _id: Number,
  name: String,
  description: String,
}, { collection: 'genres' },
{ timestamps: true });

const Book = mongoose.model('Book', bookSchema);
const BookGenres = mongoose.model('BookGenres', bookGenresSchema);

// **Methods để quản lý stock**
bookSchema.methods.addStock = function(quantity) {
  this.stock_quantity += quantity;
  // Đánh dấu field đã thay đổi để trigger pre-save middleware
  this.markModified('stock_quantity');
  return this.save();
};

bookSchema.methods.reduceStock = function(quantity) {
  if (this.stock_quantity >= quantity) {
    this.stock_quantity -= quantity;
    this.sold_quantity += quantity;
    this.sales_count += quantity;
    // Đánh dấu field đã thay đổi để trigger pre-save middleware
    this.markModified('stock_quantity');
    return this.save();
  } else {
    throw new Error(`Không đủ hàng trong kho. Chỉ còn ${this.stock_quantity} cuốn`);
  }
};

bookSchema.methods.checkAvailability = function(requestedQuantity) {
  return this.stock_quantity >= requestedQuantity;
};

// **Virtual fields**
bookSchema.virtual('total_stock_value').get(function() {
  return this.stock_quantity * this.price;
});

bookSchema.virtual('stock_info').get(function() {
  return {
    available: this.stock_quantity,
    sold: this.sold_quantity,
    status: this.stock_status,
    value: this.total_stock_value
  };
});

// Đảm bảo virtuals được include khi convert sang JSON
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

// Xuất chỉ model như pattern chuẩn
module.exports = { Book, BookGenres };
