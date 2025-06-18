import React, { useState } from 'react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!API_URL) {
      setError('APIのURLが設定されていません。');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, { // ここが重要！
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert('新規登録成功！');
        window.location.reload();
      } else {
        setError(data.message || '新規登録に失敗しました。');
      }
    } catch (err) {
      setError('サーバーに接続できませんでした。');
      console.error('Register error:', err);
    }
  };

  return (
    <div>
      <h2>新規登録ページ</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">登録</button>
      </form>
    </div>
  );
};

export default Register;