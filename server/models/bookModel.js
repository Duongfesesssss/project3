const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    image_link: String,
    title: String,
    author: String,
    publisher: String,
    published_date: Date,
    isbn: { type: String, unique: true },
    genre_ids: [{ type: Number }],
    price: Number,
    language: String,
    pages: Number,
  }, { timestamps: true });

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
