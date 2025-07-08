const mongoose = require('mongoose');

// Function to create database indexes for performance optimization
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ user_name: 1 }, { unique: true });
    await db.collection('users').createIndex({ resetPasswordToken: 1 });
    await db.collection('users').createIndex({ role: 1 });
    
    // Book indexes
    await db.collection('books').createIndex({ title: 1 });
    await db.collection('books').createIndex({ author: 1 });
    await db.collection('books').createIndex({ genre_ids: 1 });
    await db.collection('books').createIndex({ publisher: 1 });
    await db.collection('books').createIndex({ supplier: 1 });
    await db.collection('books').createIndex({ price: 1 });
    await db.collection('books').createIndex({ stock_quantity: 1 });
    await db.collection('books').createIndex({ slug: 1 }, { unique: true, sparse: true });
    await db.collection('books').createIndex({ created_at: -1 });
    
    // Cart indexes
    await db.collection('carts').createIndex({ user_id: 1 }, { unique: true });
    await db.collection('carts').createIndex({ 'items.book_id': 1 });
    
    // Order indexes
    await db.collection('orders').createIndex({ user_id: 1 });
    await db.collection('orders').createIndex({ order_date: -1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ 'items.book_id': 1 });
    
    // Voucher indexes
    await db.collection('vouchers').createIndex({ code: 1 }, { unique: true });
    await db.collection('vouchers').createIndex({ start_date: 1, end_date: 1 });
    await db.collection('vouchers').createIndex({ is_active: 1 });
    
    // Voucher usage indexes
    await db.collection('voucherusages').createIndex({ voucher_id: 1, user_id: 1 }, { unique: true });
    await db.collection('voucherusages').createIndex({ used_at: -1 });
    
    // Genre indexes
    await db.collection('genres').createIndex({ name: 1 }, { unique: true });
    
    // Publisher indexes
    await db.collection('publishers').createIndex({ name: 1 }, { unique: true });
    
    // Supplier indexes
    await db.collection('suppliers').createIndex({ name: 1 }, { unique: true });
    
    console.log('Database indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = { createIndexes };