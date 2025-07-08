const express = require('express');
const { connectToDB } = require('./db');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

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
const { authenticate, authorize } = require('./middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
app.use('/api/', apiLimiter);

// Middleware untuk xử lý dữ liệu JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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
      // Sanitize filename
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${Date.now()}-${sanitizedName}`);
    },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  // Allowed video types  
  const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
  
  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only 1 file per upload
  }
});

// API tải ảnh lên (admin only)
app.post('/api/upload/images', authenticate, authorize(['admin']), upload.single('file'), (req, res) => {
  console.log('Yêu cầu tải ảnh:', req.file); // Log thông tin file
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

// API tải video (admin only)
app.post('/api/upload/videos', authenticate, authorize(['admin']), upload.single('file'), (req, res) => {
  console.log('Yêu cầu tải ảnh:', req.file); // Log thông tin file

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
app.use('/api/order', orderRouter);
app.use('/api/voucher', voucherRouter);

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

// Global error handler - must be last
app.use(globalErrorHandler);

// Khởi động server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
