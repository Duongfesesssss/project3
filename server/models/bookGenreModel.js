const sql = require('mssql');

const BookGenre = {
    async getAll() {
        try {
            const result = await sql.query`SELECT * FROM book_genres`;
            console.log(result.recordset); // In ra dữ liệu
            return result.recordset;
        } catch (error) {
            console.error('Error fetching book genres:', error);
            throw error; // Ném lỗi để xử lý trong controller
        }
    },
};

module.exports = BookGenre;
