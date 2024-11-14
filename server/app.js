const express = require('express');
const { connectToDB } = require('./db');
const sql = require('mssql');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const port = process.env.PORT || 8888;
const authRoutes = require("./routes/auth");
const bookRouter = require("./routes/book");
// Sử dụng middleware để xử lý dữ liệu JSON
app.use(express.json());

// Kết nối đến DB
connectToDB();

// Route cho đường dẫn gốc
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/book', bookRouter);


const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'API documentation for your project',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./routes/*.js'], // Chỉ đường dẫn tới các file chứa API routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Khởi động server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
