const Joi = require('joi');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    user_name: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().max(100).optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    address: Joi.string().max(255).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  }),

  book: Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    genre_ids: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().optional(),
    price: Joi.number().positive().required(),
    stock_quantity: Joi.number().integer().min(0).required(),
    publisher: Joi.string().optional(),
    published_date: Joi.date().optional(),
    image_link: Joi.string().uri().optional()
  }),

  cart: Joi.object({
    user_id: Joi.string().required(),
    book_id: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required()
  }),

  order: Joi.object({
    user_id: Joi.string().required(),
    items: Joi.array().items(Joi.object({
      book_id: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().positive().required()
    })).required(),
    shipping_address: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      district: Joi.string().required()
    }).required(),
    payment_method: Joi.string().valid('COD', 'BANK_TRANSFER', 'CREDIT_CARD').required(),
    voucher_code: Joi.string().optional()
  }),

  voucher: Joi.object({
    code: Joi.string().required(),
    discount_type: Joi.string().valid('PERCENTAGE', 'FIXED').required(),
    discount_value: Joi.number().positive().required(),
    min_order_amount: Joi.number().min(0).optional(),
    max_discount_amount: Joi.number().positive().optional(),
    usage_limit: Joi.number().integer().min(1).required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().greater(Joi.ref('start_date')).required(),
    description: Joi.string().optional()
  }),

  objectId: Joi.object({
    id: Joi.string().hex().length(24).required()
  })
};

module.exports = { validate, schemas };