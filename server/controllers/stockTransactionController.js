const { Book } = require('../models/bookModel');
const StockTransaction = require('../models/stockTransactionModel');

// Controller - Nhập hàng
const stockIn = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { quantity, reason, note = '' } = req.body;

        // Validate input
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Số lượng phải là số dương'
            });
        }

        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Vui lòng nhập lý do nhập hàng'
            });
        }

        // Tìm sách
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Không tìm thấy sách'
            });
        }

        const previousStock = book.stock_quantity || 0;
        const newStock = previousStock + parseInt(quantity);

        // Cập nhật stock sách
        book.stock_quantity = newStock;
        await book.save();

        // Tạo transaction log
        const transaction = new StockTransaction({
            book_id: bookId,
            type: 'stock_in',
            quantity: parseInt(quantity),
            reason: reason.trim(),
            note: note.trim(),
            created_by: 'Admin', // Tạm thời hardcode
            before_quantity: previousStock,
            after_quantity: newStock
        });
        await transaction.save();

        res.status(200).json({
            status: 'OK',
            message: 'Nhập hàng thành công',
            data: {
                book_title: book.title,
                previous_stock: previousStock,
                quantity_added: parseInt(quantity),
                new_stock: newStock,
                stock_status: book.stock_status,
                transaction_id: transaction._id
            }
        });

    } catch (error) {
        console.error('Lỗi nhập hàng:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Lỗi server khi nhập hàng'
        });
    }
};

// Controller - Xuất hàng
const stockOut = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { quantity, reason, note = '' } = req.body;

        // Validate input
        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Số lượng phải là số dương'
            });
        }

        if (!reason || reason.trim() === '') {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Vui lòng nhập lý do xuất hàng'
            });
        }

        // Tìm sách
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Không tìm thấy sách'
            });
        }

        const previousStock = book.stock_quantity || 0;
        const quantityToRemove = parseInt(quantity);

        // Kiểm tra đủ hàng
        if (previousStock < quantityToRemove) {
            return res.status(400).json({
                status: 'ERROR',
                message: `Không đủ hàng trong kho. Chỉ còn ${previousStock} cuốn`
            });
        }

        const newStock = previousStock - quantityToRemove;

        // Cập nhật stock sách
        book.stock_quantity = newStock;
        if (reason.toLowerCase().includes('bán') || reason.toLowerCase().includes('sale')) {
            book.sold_quantity = (book.sold_quantity || 0) + quantityToRemove;
            book.sales_count = (book.sales_count || 0) + quantityToRemove;
        }
        await book.save();

        // Tạo transaction log
        const transaction = new StockTransaction({
            book_id: bookId,
            type: 'stock_out',
            quantity: quantityToRemove,
            reason: reason.trim(),
            note: note.trim(),
            created_by: 'Admin', // Tạm thời hardcode
            before_quantity: previousStock,
            after_quantity: newStock
        });
        await transaction.save();

        res.status(200).json({
            status: 'OK',
            message: 'Xuất hàng thành công',
            data: {
                book_title: book.title,
                previous_stock: previousStock,
                quantity_removed: quantityToRemove,
                new_stock: newStock,
                stock_status: book.stock_status,
                transaction_id: transaction._id
            }
        });

    } catch (error) {
        console.error('Lỗi xuất hàng:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Lỗi server khi xuất hàng'
        });
    }
};

// Controller - Lấy lịch sử giao dịch của một cuốn sách
const getBookTransactionHistory = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Tìm sách để lấy thông tin
        const book = await Book.findById(bookId).select('title author');
        if (!book) {
            return res.status(404).json({
                status: 'ERROR',
                message: 'Không tìm thấy sách'
            });
        }

        // Lấy lịch sử giao dịch
        const transactions = await StockTransaction.find({ book_id: bookId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const totalTransactions = await StockTransaction.countDocuments({ book_id: bookId });

        res.status(200).json({
            status: 'OK',
            message: 'Lấy lịch sử giao dịch thành công',
            data: {
                book_info: book,
                transactions,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(totalTransactions / limit),
                    total_records: totalTransactions,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Lỗi lấy lịch sử giao dịch:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Lỗi server khi lấy lịch sử giao dịch'
        });
    }
};

// Controller - Lấy tất cả giao dịch gần đây
const getAllRecentTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 50, type } = req.query;

        // Filter theo type nếu có
        const filter = {};
        if (type && ['stock_in', 'stock_out'].includes(type)) {
            filter.type = type;
        }

        // Lấy giao dịch với populate thông tin sách
        const transactions = await StockTransaction.find(filter)
            .populate('book_id', 'title author image_link')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const totalTransactions = await StockTransaction.countDocuments(filter);

        res.status(200).json({
            status: 'OK',
            message: 'Lấy lịch sử giao dịch thành công',
            data: {
                transactions,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(totalTransactions / limit),
                    total_records: totalTransactions,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Lỗi lấy tất cả giao dịch:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Lỗi server khi lấy lịch sử giao dịch'
        });
    }
};

module.exports = {
    stockIn,
    stockOut,
    getBookTransactionHistory,
    getAllRecentTransactions
};
