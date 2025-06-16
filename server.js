const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 基本設定 - Vercel フロントエンドURLを追加
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://127.0.0.1:3001',
    'https://highlight-app-frontend.vercel.app'  // 追加
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// データベース接続
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ データベースに接続しました'))
.catch(err => console.error('❌ データベース接続エラー:', err));

// デバッグ用：全てのリクエストをログ
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API設定（順序が重要）
console.log('🔧 APIルートを設定中...');

// 認証ルート
app.use('/api/auth', require('./routes/auth'));
console.log('✅ Auth routes loaded');

// 文書ルート（重要：これを確実に追加）
app.use('/api/documents', require('./routes/documents'));
console.log('✅ Documents routes loaded');

// 基本ルート
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html><head><title>ハイライトアプリ</title></head>
    <body style="font-family: Arial; text-align: center; padding: 50px;">
      <h1>🎉 ハイライトアプリ</h1>
      <p>サーバーが正常に動作中</p>
      <p><a href="/index.html">アプリを開く</a></p>
    </body></html>
  `);
});

// API接続テスト用ルート
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API接続成功',
    timestamp: new Date().toISOString(),
    routes: [
      'POST /api/auth/register',
      'POST /api/auth/login', 
      'GET /api/auth/verify',
      'POST /api/documents/upload',
      'GET /api/documents',
      'GET /api/documents/:id',
      'PUT /api/documents/:id/highlights',
      'DELETE /api/documents/:id'
    ]
  });
});

// 404エラーハンドリング
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    error: 'ルートが見つかりません',
    path: req.originalUrl,
    method: req.method 
  });
});

// サーバー開始
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました！`);
  console.log(`🌐 http://localhost:${PORT} でアクセスできます`);
});