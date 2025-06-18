import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    // Vercelで最も確実に機能する環境変数を呼び出す
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    // もし環境変数が設定されていなかったら、エラーを出して処理を止める
    if (!API_URL) {
      setError('APIのURLが設定されていません。管理者に連絡してください。');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, { // ここが重要！
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('ログイン成功！');
        window.location.reload();
      } else {
        setError(data.message || 'ログインに失敗しました。');
      }
    } catch (err) {
      setError('サーバーに接続できませんでした。');
      console.error('Login error:', err); // コンソールに詳細なエラーを出力
    }
  };

  return (
    <div>
      <h2>ログインページ</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
};

export default Login;