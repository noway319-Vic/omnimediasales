import React, { useState } from 'react';
import { useData } from '../contexts/DataContext.tsx';

const Login: React.FC = () => {
  const { login, showNotification } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      showNotification('帳號或密碼錯誤', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">專案行銷加班補休系統</h1>
          <p className="text-slate-500 mt-2">請輸入您的帳號密碼</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">帳號</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50 focus:bg-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="輸入帳號"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">密碼</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50 focus:bg-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition duration-200"
          >
            登入系統
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;