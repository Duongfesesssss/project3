const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'Duong0948173074',
    server: 'MSI', 
    database: 'BookShop',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    }
};

async function connectToDB() {
    try {
        await sql.connect(config);
        console.log('Connected to SQL Server successfully!');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

module.exports = { connectToDB };
