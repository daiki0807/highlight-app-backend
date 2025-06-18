const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// -------------------------------------------------------------
// 1. CORS設定（本番環境とローカル開発の両方を許可）
// -------------------------------------------------------------
const allowedOrigins = [
  'http://localhost:3000', // ローカルのReact開発サーバー
  'https://highlight-app-frontend.vercel.app' // Vercelの本番URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // オリジンがないリクエスト（Postmanなど）も許可するか、本番では '!' を外す
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));


// -------------------------------------------------------------
// 2. 基本的なミドルウェア設定
// -------------------------------------------------------------
app.use(express.json()); // JSON形式のリクエストボディを解析


// -------------------------------------------------------------
// 3. データベース接続
// -------------------------------------------------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ データベースに接続しました'))
  .catch(err => {
    console.error('❌ データベース接続エラー:', err);
    process.exit(1); // 接続に失敗したらサーバーを停止
  });


// -------------------------------------------------------------
// 4. APIルートの設定
// -------------------------------------------------------------
console.log('🔧 APIルートを設定中...');
app.use('/api/auth', require('./routes/auth'));
console.log('✅ Auth routes loaded');

app.use('/api/documents', require('./routes/documents'));
console.log('✅ Documents routes loaded');


// -------------------------------------------------------------
// 5. ルートパスへの生存確認用エンドポイント
// -------------------------------------------------------------
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Highlight App Backend is running!',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});


// -------------------------------------------------------------
// 6. サーバー起動
// -------------------------------------------------------------
const PORT = process.env.PORT || 10000; // Renderは通常10000番ポートを使う
app.listen(PORT, () => {
  console.log(`🚀 サーバーがポート ${PORT} で起動しました！`);
});