const sql = require('mssql');

const Books = {
    async getAllBooks() {
        try {
            const result = await sql.query`SELECT * FROM bookschema.books`;
            return result.recordset;
        } catch (error) {
            console.error('Lỗi:', error);
            throw error;
        }
    },

    async getAllGenres(){
        try {
            const result = await sql.query`SELECT * FROM bookschema.book_genres`;
            return result.recordset;
        }
        catch (error) {
            console.error('Lỗi:', error);
            throw error;
        }
    },
};

module.exports = Books;
