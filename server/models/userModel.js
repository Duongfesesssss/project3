const sql = require('mssql');
const bcrypt = require('bcryptjs');
const argon2 = require('argon2');

const User = {
    async create(userData) {
        const { user_name, password, email, phone_number, full_name } = userData;
        const hashedPassword = await argon2.hash(password);
        console.log('password ban đầu', password);
        console.log('password mã hoá', hashedPassword);
        return sql.query`INSERT INTO auth.users (user_name, password, email, phone_number, full_name) 
                         VALUES (${user_name}, ${hashedPassword}, ${email}, ${phone_number}, ${full_name})`;
    },

    async findByEmail(email) {
        const result = await sql.query`SELECT * FROM auth.users WHERE email = ${email}`;
        return result.recordset[0];
    },
    async findByUsername(username) {
        const result = await sql.query`SELECT * FROM auth.users WHERE user_name = ${username}`;
        return result.recordset[0];
    },
    // async findById(userId) {
    //     const result = await sql.query`SELECT * FROM auth.users WHERE `
    // }
    
    async getUserRoles(userId) {
        const result = await sql.query`
            SELECT r.name 
            FROM auth.user_roles ur
            JOIN auth.roles r ON ur.role_id = r.id
            WHERE ur.user_id = ${userId}
        `;
        return result.recordset;
    },

    async getUserGroups(userId) {
        const result = await sql.query`
            SELECT g.name 
            FROM auth.user_groups ug
            JOIN auth.groups g ON ug.group_id = g.id
            WHERE ug.user_id = ${userId}
        `;
        return result.recordset;
    },
};

module.exports = User;
