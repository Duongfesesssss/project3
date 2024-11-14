const sql = require('mssql');
const bcrypt = require('bcryptjs');

const User = {
    // Hàm tạo người dùng mới
    async create(userData) {
        const { user_name, password, email, phone_number, full_name } = userData;

        // Băm mật khẩu bằng bcrypt
        const hashedPassword = await bcrypt.hash(password, 10); // 10 là số vòng salt rounds
        console.log('Password ban đầu:', password);
        console.log('Password mã hóa bằng bcrypt:', hashedPassword);

        // Thực thi truy vấn SQL để chèn người dùng vào cơ sở dữ liệu
        return sql.query`INSERT INTO auth.users (user_name, password, email, phone_number, full_name) 
                         VALUES (${user_name}, ${hashedPassword}, ${email}, ${phone_number}, ${full_name})`;
    },

    // Tìm người dùng qua email
    async findByEmail(email) {
        const result = await sql.query`SELECT * FROM auth.users WHERE email = ${email}`;
        return result.recordset[0]; // Trả về đối tượng người dùng đầu tiên
    },

    // Tìm người dùng qua username
    async findByUsername(username) {
        const result = await sql.query`SELECT * FROM auth.users WHERE user_name = ${username}`;
        return result.recordset[0]; // Trả về đối tượng người dùng đầu tiên
    },

    // Lấy các quyền của người dùng
    async getUserRoles(userId) {
        const result = await sql.query`
            SELECT r.name 
            FROM auth.user_roles ur
            JOIN auth.roles r ON ur.role_id = r.id
            WHERE ur.user_id = ${userId}
        `;
        return result.recordset; // Trả về danh sách các vai trò
    },

    // Lấy các nhóm của người dùng
    async getUserGroups(userId) {
        const result = await sql.query`
            SELECT g.name 
            FROM auth.user_groups ug
            JOIN auth.groups g ON ug.group_id = g.id
            WHERE ug.user_id = ${userId}
        `;
        return result.recordset; // Trả về danh sách các nhóm
    },
};

module.exports = User;
