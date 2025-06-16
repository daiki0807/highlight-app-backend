const mongoose = require('mongoose');

// 文書データの形を定義
const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  highlights: [{
    startIndex: Number,
    endIndex: Number,
    color: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  writingMode: { type: String, enum: ['horizontal', 'vertical'], default: 'horizontal' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);