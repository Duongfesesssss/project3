const { Book, BookGenres } = require('../models/bookModel');  

// Controller - Lấy tất cả cuốn sách
const getAllBooks = async (req, res) => {
    try {
        // Lấy tất cả sách từ database và populate thông tin publisher
        const books = await Book.find().populate('publisher', 'name description');

        // Lấy thông tin thể loại từ bảng genres
        const genres = await BookGenres.find();

        // Gắn thông tin thể loại vào từng sách
        const booksWithGenres = books.map((book) => {
            const bookGenres = genres.filter((genre) => book.genre_ids.includes(genre._id));
            return {
                ...book.toObject(),
                genres: bookGenres, // Gắn thông tin thể loại vào sách
                stock_info: {
                    available: book.stock_quantity || 0,
                    sold: book.sold_quantity || 0,
                    status: book.stock_status || 'out_of_stock',
                    pages: book.pages || 0
                }
            };
        });

        return res.status(200).json({
            status: 'OK',
            message: 'Lấy danh sách sách thành công',
            data: booksWithGenres
        });
    } catch (error) {
        console.error('Lỗi trong quá trình lấy sách:', error);
        return res.status(500).json({ 
            status: 'ERROR',
            message: 'Lỗi server, không thể lấy danh sách sách.' 
        });
    }
};

const getAllGenres = async(req, res) => {
    try {
        const book_genres = await BookGenres.find();
        
        // Nếu không có thể loại nào
        if (book_genres.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thể loại nào.' });
        }
        
        // Trả về danh sách thể loại
        return res.status(200).json({
            status: 'OK',
            message: 'Lấy danh sách thể loại thành công',
            data: book_genres
        });
    } catch (error) {
        console.error('Lỗi trong quá trình lấy thể loại:', error);
        return res.status(500).json({ message: 'Lỗi server, không thể lấy danh sách thể loại.' });
    }
};

// Controller - Thêm sách mới với stock
const createBook = async (req, res) => {
    try {
        const bookData = {
            ...req.body,
            stock_quantity: req.body.stock_quantity || 0,
            sold_quantity: 0
        };

        const newBook = new Book(bookData);
        await newBook.save();
        
        res.status(201).json({
            status: 'OK',
            message: 'Thêm sách thành công',
            data: newBook
        });
    } catch (error) {
        console.error('Lỗi khi thêm sách:', error);
        res.status(500).json({
            status: 'ERROR', 
            message: 'Lỗi server khi thêm sách'
        });
    }
};

// Controller - Cập nhật stock
const updateStock = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { quantity, action = 'add' } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Số lượng phải là số dương'
            });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Không tìm thấy sách'
            });
        }

        if (action === 'add') {
            book.stock_quantity += quantity;
        } else if (action === 'reduce') {
            if (book.stock_quantity < quantity) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: `Không đủ hàng trong kho. Chỉ còn ${book.stock_quantity} cuốn`
                });
            }
            book.stock_quantity -= quantity;
            book.sold_quantity += quantity;
            book.sales_count += quantity;
        }

        await book.save();
        
        res.status(200).json({
            status: 'OK',
            message: `${action === 'add' ? 'Nhập hàng' : 'Bán hàng'} thành công`,
            data: {
                book: book.title,
                stock_quantity: book.stock_quantity,
                sold_quantity: book.sold_quantity,
                stock_status: book.stock_status
            }
        });
    } catch (error) {
        console.error('Lỗi cập nhật stock:', error);
        res.status(400).json({
            status: 'ERROR',
            message: error.message
        });
    }
};

// Controller - Lấy sách hết hàng
const getOutOfStockBooks = async (req, res) => {
    try {
        const outOfStockBooks = await Book.find({ 
            $or: [
                { stock_status: 'out_of_stock' },
                { stock_quantity: 0 }
            ]
        });
        
        res.status(200).json({
            status: 'OK',
            message: 'Danh sách sách hết hàng',
            data: outOfStockBooks
        });
    } catch (error) {
        console.error('Lỗi lấy sách hết hàng:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Lỗi server'
        });
    }
};

// Controller - Lấy sách sắp hết hàng  
const getLowStockBooks = async (req, res) => {
    try {
        const lowStockBooks = await Book.find({ 
            stock_status: 'low_stock',
            stock_quantity: { $gt: 0, $lte: 5 }
        });
        
        res.status(200).json({
            status: 'OK',
            message: 'Danh sách sách sắp hết hàng',
            data: lowStockBooks
        });
    } catch (error) {
        console.error('Lỗi lấy sách sắp hết hàng:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Lỗi server'
        });
    }
};

// Controller - Thống kê kho
const getStockStats = async (req, res) => {
    try {
        const [allBooks, outOfStock, lowStock] = await Promise.all([
            Book.find(),
            Book.find({ 
                $or: [
                    { stock_status: 'out_of_stock' },
                    { stock_quantity: 0 }
                ]
            }),
            Book.find({ 
                stock_status: 'low_stock',
                stock_quantity: { $gt: 0, $lte: 5 }
            })
        ]);

        const totalValue = allBooks.reduce((sum, book) => 
            sum + ((book.stock_quantity || 0) * (book.price || 0)), 0
        );

        const stats = {
            total_books: allBooks.length,
            out_of_stock_count: outOfStock.length,
            low_stock_count: lowStock.length,
            total_stock_value: totalValue,
            in_stock_count: allBooks.length - outOfStock.length
        };
        
        res.status(200).json({
            status: 'OK',
            message: 'Thống kê kho hàng',
            data: stats
        });
    } catch (error) {
        console.error('Lỗi thống kê kho:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Lỗi server'
        });
    }
};

module.exports = { getAllBooks, getAllGenres, createBook, updateStock, getOutOfStockBooks, getLowStockBooks, getStockStats };
