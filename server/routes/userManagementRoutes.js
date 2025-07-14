const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  resetUserPassword
} = require('../controllers/userManagementController');
const { authenticateToken, adminOnly } = require('../middlewares/roleMiddleware');

// ========== USER MANAGEMENT ROUTES (ADMIN ONLY) ==========

// Tất cả routes dưới đây yêu cầu authentication và quyền admin
router.use(authenticateToken);
router.use(adminOnly);

// Lấy danh sách tất cả users
router.get('/', getAllUsers);

// Tạo tài khoản user mới (có thể chọn role)
router.post('/', createUser);

// Tạo tài khoản staff (wrapper - role mặc định là staff)
router.post('/staff', (req, res, next) => {
  req.body.role = 'staff';
  createUser(req, res, next);
});

// Cập nhật thông tin user
router.put('/:userId', updateUser);

// Khóa/mở khóa tài khoản user
router.patch('/:userId/toggle-status', toggleUserStatus);

// Reset mật khẩu cho user
router.patch('/:userId/reset-password', resetUserPassword);

// Xóa user (chỉ customer)
router.delete('/:userId', deleteUser);

module.exports = router;
