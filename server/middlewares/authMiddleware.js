const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Lưu thông tin người dùng vào request
        next();
    } catch (error) {
        res.status(400).send('Invalid token.');
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (roles.length && !roles.includes(req.user.roles[0]?.name)) {
            return res.status(403).send('Access denied. Insufficient permissions.');
        }
        next();
    };
};

module.exports = { authMiddleware, authorize };
