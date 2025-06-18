import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // ログイン後のページ遷移で使います（後で有効化）

const Login = () => {
  // ユーザーの入力を保存するための「state」を定義
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // エラーメッセージ用のstate
  // const navigate = useNavigate(); // ページ遷移用のフック（後で有効化）

  // フォームが送信されたときに実行される関数
  const handleLogin = async (event) => {
    event.preventDefault(); // フォームのデフォルトの送信動作を防ぐ
    setError(''); // 古いエラーメッセージをクリア

    // 環境変数からAPIのベースURLを取得
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // ログイン成功！
        localStorage.setItem('token', data.token); // トークンをブラウザに保存
        alert('ログインに成功しました！'); // とりあえずアラートでお知らせ
        // navigate('/'); // ホームページにリダイレクト（後で有効化）
        window.location.reload(); // ページをリロードしてヘッダーなどを更新
      } else {
        // ログイン失敗
        setError(data.message || data.error || 'メールアドレスまたはパスワードが間違っています。');
      }
    } catch (err) {
      setError('サーバーに接続できませんでした。後ほどもう一度お試しください。');
    }
  };

  return (
    <div>
      <h2>ログインページ</h2>
      {/* フォームに `onSubmit` イベントハンドラを追加 */}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="loginEmail">Email:</label>
          <input
            type="email"
            id="loginEmail"
            value={email} // stateと入力欄を連携
            onChange={(e) => setEmail(e.target.value)} // 入力されるたびにstateを更新
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="loginPassword">Password:</label>
          <input
            type="password"
            id="loginPassword"
            value={password} // stateと入力欄を連携
            onChange={(e) => setPassword(e.target.value)} // 入力されるたびにstateを更新
            required
          />
        </div>
        
        {/* エラーメッセージを表示する部分 */}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
};

export default Login;