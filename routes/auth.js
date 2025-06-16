const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// 新規ユーザー登録
router.post('/register', async (req, res) => {
  console.log('Registration attempt:', req.body);
  
  try {
    const { username, email, password } = req.body;
    
    // 入力値チェック
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'ユーザー名、メールアドレス、パスワードは必須です'
      });
    }
    
    // 既存ユーザーをチェック
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'このメールアドレスまたはユーザー名は既に使用されています' 
      });
    }
    
    // パスワードを暗号化
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 新しいユーザーを作成
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    console.log('User registered successfully:', user.username);
    
    // ログイン用のトークンを作成
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    res.json({ 
      token, 
      user: { id: user._id, username, email },
      message: 'ユーザー登録が完了しました！'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: 'ユーザー登録に失敗しました: ' + error.message });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body);
  
  try {
    const { email, password } = req.body;
    
    // 入力値チェック
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'メールアドレスとパスワードは必須です'
      });
    }
    
    console.log('Searching for user with email:', email);
    
    // ユーザーを探す
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ error: 'メールアドレスが見つかりません' });
    }
    
    console.log('User found:', user.username);
    
    // パスワードをチェック
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ error: 'パスワードが間違っています' });
    }
    
    console.log('Password verified, creating token');
    
    // ログイン用のトークンを作成
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    console.log('Login successful for:', user.username);
    
    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email },
      message: 'ログインしました！'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'ログインに失敗しました: ' + error.message });
  }
});

// トークン検証
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'ユーザー情報の取得に失敗しました' });
  }
});

module.exports = router;