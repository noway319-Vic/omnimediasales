import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { RequestStatus, RequestType, UserRole } from '../types';

const AdminPanel: React.FC = () => {
  const { users, requests, addUser, deleteUser, updatePassword, processRequest, currentUser } = useData();
  const [view, setView] = useState<'users' | 'requests'>('requests');

  // User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);

  if (currentUser?.role !== UserRole.ADMIN) return <div>權限不足</div>;

  const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if(newUsername && newPassword) {
        addUser({ username: newUsername, password: newPassword, role: newRole });
        setNewUsername('');
        setNewPassword('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setView('requests')}
          className={`px-4 py-2 rounded-lg font-medium transition ${view === 'requests' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          待審核申請 ({pendingRequests.length})
        </button>
        <button
          onClick={() => setView('users')}
          className={`px-4 py-2 rounded-lg font-medium transition ${view === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          帳號管理
        </button>
      </div>

      {view === 'requests' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             {pendingRequests.length === 0 ? (
                 <div className="p-8 text-center text-slate-500">目前沒有待審核的申請。</div>
             ) : (
                 <div className="divide-y divide-slate-100">
                     {pendingRequests.map(req => (
                         <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 hover:bg-slate-50">
                             <div>
                                 <div className="flex items-center space-x-2">
                                     <span className="font-bold text-slate-800">{req.username}</span>
                                     <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.type === RequestType.OVERTIME ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                         {req.type === RequestType.OVERTIME ? '加班' : '補休'}
                                     </span>
                                 </div>
                                 <p className="text-sm text-slate-600 mt-1">
                                     {req.date} @ {req.startTime} • 申請 {req.hours}小時
                                     {req.type === RequestType.OVERTIME && req.calculatedHours !== req.hours && (
                                         <span className="text-blue-600 font-bold ml-1">→ 實際核發 {req.calculatedHours}小時 (假日規則)</span>
                                     )}
                                 </p>
                                 <p className="text-sm text-slate-500 italic mt-1">"{req.reason}"</p>
                             </div>
                             <div className="flex space-x-3">
                                 <button
                                     onClick={() => processRequest(req.id, RequestStatus.APPROVED)}
                                     className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                 >
                                     核准
                                 </button>
                                 <button
                                     onClick={() => processRequest(req.id, RequestStatus.REJECTED)}
                                     className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                                 >
                                     拒絕
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
      )}

      {view === 'users' && (
        <div className="space-y-8">
            {/* Create User */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">建立新帳號</h3>
                <form onSubmit={handleCreateUser} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">帳號名稱</label>
                        <input value={newUsername} onChange={e => setNewUsername(e.target.value)} required className="w-full border p-2 rounded" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">密碼</label>
                        <input value={newPassword} onChange={e => setNewPassword(e.target.value)} required type="password" className="w-full border p-2 rounded" />
                    </div>
                    <div className="w-full md:w-40">
                         <label className="block text-xs font-medium text-slate-500 mb-1">權限角色</label>
                         <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} className="w-full border p-2 rounded bg-white">
                             <option value={UserRole.USER}>一般用戶</option>
                             <option value={UserRole.ADMIN}>管理員</option>
                         </select>
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">新增</button>
                </form>
            </div>

            {/* List Users */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3">帳號</th>
                            <th className="px-6 py-3">角色</th>
                            <th className="px-6 py-3">補休餘額</th>
                            <th className="px-6 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 font-medium">{u.username}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-xs px-2 py-1 rounded ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                        {u.role === UserRole.ADMIN ? '管理員' : '一般用戶'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{u.compTimeBalance}小時</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button 
                                        onClick={() => {
                                            const newP = prompt('請輸入新密碼:');
                                            if(newP) updatePassword(u.id, newP);
                                        }}
                                        className="text-blue-600 hover:underline"
                                    >
                                        重設密碼
                                    </button>
                                    {u.id !== currentUser.id && (
                                        <button 
                                            onClick={() => {
                                                if(confirm('確定要刪除此帳號嗎?')) deleteUser(u.id);
                                            }}
                                            className="text-red-600 hover:underline"
                                        >
                                            刪除
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;