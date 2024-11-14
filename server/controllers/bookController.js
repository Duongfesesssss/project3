const Books = require('../models/bookModel');  

// Controller - Lấy tất cả cuốn sách
const getAllBooks = async (req, res) => {
    try {
        // Gọi model Books để lấy tất cả sách
        const books = await Books.getAllBooks();

        // Nếu không có sách nào
        if (books.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sách nào.' });
        }

        // Trả về danh sách sách
        return res.status(200).json(books);
    } catch (error) {
        console.error('Lỗi trong quá trình lấy sách:', error);
        return res.status(500).json({ message: 'Lỗi server, không thể lấy danh sách sách.' });
    }
};

const getAllGenres = async(req, res ) => {
    try {
    const book_genres = await Books.getAllGenres();
            // Nếu không có sách nào
            if (book_genres.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy sách nào.' });
            }
            // Trả về danh sách sách
            return res.status(200).json(book_genres);
        } catch (error) {
            console.error('Lỗi trong quá trình lấy sách:', error);
            return res.status(500).json({ message: 'Lỗi server, không thể lấy danh sách sách.' });
        }
};

module.exports = { getAllBooks, getAllGenres };
