require('dotenv').config();
const express = require('express');
const { connectToDB } = require('./db');
const cors = require('cors');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
const port = process.env.PORT || 8888;
const authRoutes = require("./routes/auth");
const bookRouter = require("./routes/book");
const publisherRouter = require("./routes/publisherRoutes");
const supplierRouter = require('./routes/supplierRoutes');
const genreRouter = require("./routes/genre-book");
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const voucherRouter = require('./routes/voucherRoutes');
const stockTransactionRouter = require('./routes/stockTransactionRoutes');
const userManagementRouter = require('./routes/userManagementRoutes');
const dashboardRouter = require('./routes/dashboardRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const textToSpeechRouter = require('./routes/textToSpeechRoutes');
const reviewRouter = require('./routes/reviewRoutes');


require('./models/stockTransactionModel');

const multer = require('multer');
const path = require('path');
// Sử dụng middleware để xử lý dữ liệu JSON
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Cho phép mọi origin trong quá trình dev (mobile WebView, IP nội bộ)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
}));
// Kết nối đến DB
connectToDB();




// Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Kiểm tra loại file để lưu vào thư mục tương ứng
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images/'); // Lưu ảnh vào thư mục 'uploads/images'
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, 'uploads/videos/'); // Lưu video vào thư mục 'uploads/videos'
    } else {
      cb(new Error('File không hợp lệ! Chỉ chấp nhận ảnh và video.'));
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// API tải ảnh lên
app.post('/api/upload/images', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file ảnh nào được tải lên' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Lỗi khi tải ảnh:', error);
    res.status(500).json({ error: 'Lỗi khi tải ảnh lên' });
  }
});

// API tải video
app.post('/api/upload/videos', upload.single('file'), (req, res) => {

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file video nào được tải lên' });
    }

    if (!req.file.mimetype.startsWith('video/')) {
      return res.status(400).json({ error: 'File không hợp lệ! Chỉ chấp nhận file video.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/videos/${req.file.filename}`;
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Lỗi khi tải video:', error);
    res.status(500).json({ error: 'Lỗi khi tải video lên' });
  }
});

// Cung cấp thư mục tĩnh để truy cập ảnh và video đã tải lên
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads/images')));
app.use('/uploads/videos', express.static(path.join(__dirname, 'uploads/videos')));

// Route cho đường dẫn gốc
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/book', bookRouter);
app.use('/api/publisher', publisherRouter);
app.use('/api/supplier', supplierRouter);
app.use('/api/genre', genreRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter); // ✅ Đổi từ orders thành order
app.use('/api/voucher', voucherRouter);
app.use('/api/stock-transactions', stockTransactionRouter);
app.use('/api/admin/users', userManagementRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/text-to-speech', textToSpeechRouter);
app.use('/api/review', reviewRouter);


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
