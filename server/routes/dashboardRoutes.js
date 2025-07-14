const express = require('express');
const router = express.Router();
const { 
  getStaffDashboard, 
  getAdminDashboard 
} = require('../controllers/dashboardController');
const { authenticateToken, staffAndAdmin, adminOnly } = require('../middlewares/roleMiddleware');

// ========== DASHBOARD ROUTES ==========
router.use(authenticateToken);

// ✅ STAFF VÀ ADMIN: Dashboard cơ bản (Staff chỉ thấy thông tin cơ bản)
router.get('/staff', staffAndAdmin, getStaffDashboard);

// ❌ CHỈ ADMIN: Dashboard đầy đủ (bao gồm thống kê kho, doanh thu, quản lý user)
router.get('/admin', adminOnly, getAdminDashboard);

module.exports = router;
