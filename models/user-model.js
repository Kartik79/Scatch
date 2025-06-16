const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  totalAmount: Number,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "product"
  }],
  orders: [orderSchema],
  contact: Number,
  picture: Buffer
});

module.exports = mongoose.model('user', userSchema);
