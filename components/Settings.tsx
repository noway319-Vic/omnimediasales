import React, { useState } from 'react';
import { useData } from '../contexts/DataContext.tsx';

const Settings: React.FC = () => {
  const { currentUser, updatePassword, showNotification } = useData();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  if (!currentUser) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      showNotification("兩次輸入的密碼不符", 'error');
      return;
    }
    if (password.length < 4) {
      showNotification("密碼長度過短", 'error');
      return;
    }
    updatePassword(currentUser.id, password);
    setPassword('');
    setConfirm('');
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">帳號安全設定</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">新密碼</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg outline-none focus:border-blue-500"
              placeholder="請輸入新密碼"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">確認新密碼</label>
            <input 
              type="password" 
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full border p-3 rounded-lg outline-none focus:border-blue-500"
              placeholder="再次輸入新密碼"
            />
          </div>
          <button className="w-full bg-slate-800 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition">
            更新密碼
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;