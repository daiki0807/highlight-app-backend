const express = require('express');
const Document = require('../models/Document');
const auth = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

console.log('📄 Documents routes loading...');

// ファイルアップロード設定
const upload = multer({
 storage: multer.memoryStorage(),
 limits: { fileSize: 5 * 1024 * 1024 },
 fileFilter: (req, file, cb) => {
   if (file.mimetype === 'text/plain' || file.originalname.endsWith('.md') || file.originalname.endsWith('.txt')) {
     cb(null, true);
   } else {
     cb(new Error('サポートされていないファイル形式です'));
   }
 }
});

// テスト用ルート
router.get('/test', (req, res) => {
 res.json({ message: 'Documents routes working!' });
});

// 文書アップロード
router.post('/upload', auth, upload.single('file'), async (req, res) => {
 try {
   const content = req.file.buffer.toString('utf8');
   const title = req.file.originalname;
   
   const document = new Document({
     userId: req.userId,
     title,
     content,
     highlights: []
   });
   
   await document.save();
   console.log('✅ Document uploaded successfully:', document._id);
   res.json(document);
 } catch (error) {
   console.error('❌ Document upload error:', error);
   res.status(400).json({ error: error.message });
 }
});

// ユーザーの文書一覧取得
router.get('/', auth, async (req, res) => {
 try {
   const documents = await Document.find({ userId: req.userId })
     .sort({ updatedAt: -1 });
   console.log(`📋 Found ${documents.length} documents for user ${req.userId}`);
   res.json(documents);
 } catch (error) {
   console.error('❌ Documents list error:', error);
   res.status(500).json({ error: error.message });
 }
});

// 特定の文書取得
router.get('/:id', auth, async (req, res) => {
 try {
   const document = await Document.findOne({ 
     _id: req.params.id, 
     userId: req.userId 
   });
   
   if (!document) {
     console.log('❌ Document not found:', req.params.id);
     return res.status(404).json({ error: '文書が見つかりません' });
   }
   
   console.log('✅ Document found:', document._id);
   res.json(document);
 } catch (error) {
   console.error('❌ Document fetch error:', error);
   res.status(500).json({ error: error.message });
 }
});

// 文書全体の更新（新しく追加）
router.put('/:id', auth, async (req, res) => {
 console.log('📝 Document update request:', req.params.id);
 console.log('📝 Update data:', req.body);
 
 try {
   const updateData = { ...req.body, updatedAt: new Date() };
   
   const document = await Document.findOneAndUpdate(
     { _id: req.params.id, userId: req.userId },
     updateData,
     { new: true }
   );
   
   if (!document) {
     console.log('❌ Document not found for update:', req.params.id);
     return res.status(404).json({ error: '文書が見つかりません' });
   }
   
   console.log('✅ Document updated successfully:', document._id);
   res.json(document);
 } catch (error) {
   console.error('❌ Document update error:', error);
   res.status(500).json({ error: error.message });
 }
});

// ハイライト保存/更新
router.put('/:id/highlights', auth, async (req, res) => {
 console.log('🎨 Highlights save request:', req.params.id);
 console.log('🎨 Highlights data:', req.body);
 
 try {
   const { highlights, writingMode } = req.body;
   
   const document = await Document.findOneAndUpdate(
     { _id: req.params.id, userId: req.userId },
     { 
       highlights,
       writingMode,
       updatedAt: new Date()
     },
     { new: true }
   );
   
   if (!document) {
     console.log('❌ Document not found for highlights update:', req.params.id);
     return res.status(404).json({ error: '文書が見つかりません' });
   }
   
   console.log('✅ Highlights saved successfully:', document._id);
   res.json(document);
 } catch (error) {
   console.error('❌ Highlights save error:', error);
   res.status(500).json({ error: error.message });
 }
});

// 文書削除
router.delete('/:id', auth, async (req, res) => {
 console.log('🗑️ Document delete request:', req.params.id);
 
 try {
   const document = await Document.findOneAndDelete({
     _id: req.params.id,
     userId: req.userId
   });
   
   if (!document) {
     console.log('❌ Document not found for deletion:', req.params.id);
     return res.status(404).json({ error: '文書が見つかりません' });
   }
   
   console.log('✅ Document deleted successfully:', req.params.id);
   res.json({ message: '文書が削除されました', id: req.params.id });
 } catch (error) {
   console.error('❌ Document delete error:', error);
   res.status(500).json({ error: error.message });
 }
});

// 文書のタイトル更新
router.patch('/:id/title', auth, async (req, res) => {
 console.log('📝 Document title update request:', req.params.id);
 
 try {
   const { title } = req.body;
   
   if (!title || title.trim() === '') {
     return res.status(400).json({ error: 'タイトルは必須です' });
   }
   
   const document = await Document.findOneAndUpdate(
     { _id: req.params.id, userId: req.userId },
     { title: title.trim(), updatedAt: new Date() },
     { new: true }
   );
   
   if (!document) {
     console.log('❌ Document not found for title update:', req.params.id);
     return res.status(404).json({ error: '文書が見つかりません' });
   }
   
   console.log('✅ Document title updated successfully:', document._id);
   res.json(document);
 } catch (error) {
   console.error('❌ Document title update error:', error);
   res.status(500).json({ error: error.message });
 }
});

// 文書の内容更新
router.patch('/:id/content', auth, async (req, res) => {
 console.log('📝 Document content update request:', req.params.id);
 
 try {
   const { content } = req.body;
   
   if (content === undefined) {
     return res.status(400).json({ error: 'コンテンツが指定されていません' });
   }
   
   const document = await Document.findOneAndUpdate(
     { _id: req.params.id, userId: req.userId },
     { content, updatedAt: new Date() },
     { new: true }
   );
   
   if (!document) {
     console.log('❌ Document not found for content update:', req.params.id);
     return res.status(404).json({ error: '文書が見つかりません' });
   }
   
   console.log('✅ Document content updated successfully:', document._id);
   res.json(document);
 } catch (error) {
   console.error('❌ Document content update error:', error);
   res.status(500).json({ error: error.message });
 }
});

// エラーハンドリングミドルウェア
router.use((error, req, res, next) => {
 console.error('❌ Documents route error:', error);
 
 if (error instanceof multer.MulterError) {
   if (error.code === 'LIMIT_FILE_SIZE') {
     return res.status(400).json({ error: 'ファイルサイズが大きすぎます（最大5MB）' });
   }
 }
 
 res.status(500).json({ error: error.message || 'サーバーエラーが発生しました' });
});

console.log('📄 Documents routes loaded successfully');
module.exports = router;