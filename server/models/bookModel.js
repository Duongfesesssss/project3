const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    image_link: String,
    title: String,
    author: String,
    slug: { type: String, unique: true },
    description: String,
    publisher: String,
    published_date: Date,
    isbn: { type: String, unique: true },
    genre_ids: [{ type: Number }],
    price: Number,
    language: String,
    pages: Number,
  }, { timestamps: true });

// Tự động tạo slug từ title trước khi lưu
bookSchema.pre('save', function (next) {
  if (this.isModified('title')) {
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
    // Tự động tạo isbn nếu không được cung cấp
    if (!this.isbn) {
      this.isbn = Math.floor(1000000000000 + Math.random() * 9000000000000).toString(); // Tạo dãy số ngẫu nhiên 13 chữ số
    }

  next();
});


  const bookGenresSchema = new mongoose.Schema({
    _id:Number,
    name: String,
    description: String,
  }, { collection: 'genres' },
  { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
const BookGenres = mongoose.model('BookGenres', bookGenresSchema);


// **Hàm lấy tất cả sách**
const getAllBooks = async () => {
  try {
    const books = await Book.find();

    // Lấy thông tin thể loại từ bảng genres
    const genres = await BookGenres.find();

    // Gắn thông tin thể loại vào từng sách
    const booksWithGenres = books.map((book) => {
      const bookGenres = genres.filter((genre) => book.genre_ids.includes(genre._id));
      return {
        ...book.toObject(),
        genres: bookGenres, // Gắn thông tin thể loại vào sách
      };
    });

    return booksWithGenres;
  } catch (error) {
    throw error;
  }
};

// **Hàm thêm sách mới**
const addBook = async (bookData) => {
  try {
    const book = new Book(bookData);
    await book.save();
    return book;
  } catch (error) {
    throw error;
  }
};


// Xuất model và các hàm
module.exports = { Book, BookGenres, getAllBooks, addBook };
