const Cart = require('../models/cartModel');
const mongoose = require('mongoose');
const Book = mongoose.model('Book', require('../models/bookModel').bookSchema);

// Lấy giỏ hàng của user
const getCartByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log('Đang tìm giỏ hàng của user:', user_id);
    
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ'
      });
    }

    const cart = await Cart.findOne({ user_id })
      .populate({
        path: 'items.book_id',
        select: 'title image_link price author publisher description'
      })
      .lean();

    console.log('Giỏ hàng tìm được:', cart);

    // Trả về giỏ hàng trống nếu không tìm thấy
    if (!cart) {
      return res.json({
        status: 'success',
        data: {
          items: [],
          total_amount: 0
        }
      });
    }

    res.json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi lấy giỏ hàng'
    });
  }
};

// Thêm sách vào giỏ hàng
const addToCart = async (req, res) => {
  try {
    const { user_id, book_id, quantity } = req.body;
    console.log('Request body từ client:', req.body);
    console.log('Kiểu dữ liệu user_id:', typeof user_id, user_id);
    console.log('Kiểu dữ liệu book_id:', typeof book_id, book_id);
    console.log('Kiểu dữ liệu quantity:', typeof quantity, quantity);

    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(book_id)) {
      console.log('ID không hợp lệ:', { user_id, book_id });
      return res.status(400).json({
        status: 'error',
        message: 'ID không hợp lệ'
      });
    }

    // Kiểm tra sách tồn tại
    console.log('Đang tìm sách với ID:', book_id);
    const book = await Book.findById(book_id);
    console.log('Kết quả tìm sách:', book);
    
    if (!book) {
      console.log('Không tìm thấy sách với ID:', book_id);
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sách'
      });
    }

    // Kiểm tra giá sách
    console.log('Giá sách:', book.price);
    if (!book.price) {
      console.log('Sách không có giá:', book);
      return res.status(400).json({
        status: 'error',
        message: 'Sách không có giá'
      });
    }

    let cart = await Cart.findOne({ user_id });
    console.log('Giỏ hàng tìm được:', cart);
    
    if (!cart) {
      // Tạo giỏ hàng mới nếu chưa có
      cart = new Cart({
        user_id,
        items: [{
          book_id,
          quantity,
          price: book.price
        }],
        total_amount: book.price * quantity
      });
      console.log('Tạo giỏ hàng mới:', cart);
    } else {
      // Kiểm tra sách đã có trong giỏ hàng chưa
      const existingItem = cart.items.find(item => item.book_id.toString() === book_id);
      console.log('Item đã tồn tại:', existingItem);
      
      if (existingItem) {
        // Cập nhật số lượng nếu đã có
        existingItem.quantity += quantity;
        existingItem.price = book.price;
      } else {
        // Thêm mới nếu chưa có
        cart.items.push({
          book_id,
          quantity,
          price: book.price
        });
      }

      // Cập nhật tổng tiền
      cart.total_amount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      console.log('Cập nhật giỏ hàng:', cart);
    }

    try {
      await cart.save();
      console.log('Lưu giỏ hàng thành công');
    } catch (saveError) {
      console.error('Lỗi khi lưu giỏ hàng:', saveError);
      throw saveError;
    }

    res.json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    console.error('Chi tiết lỗi khi thêm vào giỏ hàng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi thêm vào giỏ hàng'
    });
  }
};

// Cập nhật số lượng sách trong giỏ hàng
const updateCartItem = async (req, res) => {
  try {
    const { user_id, book_id, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(book_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID không hợp lệ'
      });
    }

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    const item = cart.items.find(item => item.book_id.toString() === book_id);
    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sách trong giỏ hàng'
      });
    }

    // Cập nhật số lượng
    item.quantity = quantity;
    
    // Cập nhật tổng tiền
    cart.total_amount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    await cart.save();

    res.json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật giỏ hàng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi cập nhật giỏ hàng'
    });
  }
};

// Xóa sách khỏi giỏ hàng
const removeFromCart = async (req, res) => {
  try {
    const { user_id, book_id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(book_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID không hợp lệ'
      });
    }

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Lọc bỏ sách khỏi giỏ hàng
    cart.items = cart.items.filter(item => item.book_id.toString() !== book_id);
    
    // Cập nhật tổng tiền
    cart.total_amount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    await cart.save();

    res.json({
      status: 'success',
      data: cart
    });
  } catch (error) {
    console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi xóa khỏi giỏ hàng'
    });
  }
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID người dùng không hợp lệ'
      });
    }

    const cart = await Cart.findOne({ user_id });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy giỏ hàng'
      });
    }

    // Xóa toàn bộ items và reset tổng tiền
    cart.items = [];
    cart.total_amount = 0;
    
    await cart.save();

    res.json({
      status: 'success',
      message: 'Đã xóa toàn bộ giỏ hàng'
    });
  } catch (error) {
    console.error('Lỗi khi xóa giỏ hàng:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi xóa giỏ hàng'
    });
  }
};

module.exports = {
  getCartByUserId,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
}; 