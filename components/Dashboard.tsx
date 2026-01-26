import React from 'react';
import { useData } from '../contexts/DataContext.tsx';
import { RequestStatus, RequestType } from '../types.ts';

const Dashboard: React.FC = () => {
  const { currentUser, requests } = useData();

  if (!currentUser) return null;

  const myRequests = requests.filter(r => r.userId === currentUser.id);
  const pendingCount = myRequests.filter(r => r.status === RequestStatus.PENDING).length;
  const approvedCount = myRequests.filter(r => r.status === RequestStatus.APPROVED).length;

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED: return 'bg-green-100 text-green-800';
      case RequestStatus.REJECTED: return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const translateType = (type: RequestType) => type === RequestType.OVERTIME ? '加班' : '補休';
  const translateStatus = (status: RequestStatus) => {
      switch(status) {
          case RequestStatus.APPROVED: return '已核准';
          case RequestStatus.REJECTED: return '已拒絕';
          default: return '待審核';
      }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">我的儀表板</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">目前補休餘額</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{currentUser.compTimeBalance} <span className="text-sm font-normal text-slate-400">小時</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">待審核申請</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">總核准次數</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{approvedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">近期活動紀錄</h3>
        </div>
        
        {myRequests.length === 0 ? (
          <div className="p-8 text-center text-slate-500">目前沒有紀錄。開始申請你的第一次加班或補休吧！</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">類型</th>
                  <th className="px-6 py-3">日期</th>
                  <th className="px-6 py-3">申請時數</th>
                  <th className="px-6 py-3">計算後時數</th>
                  <th className="px-6 py-3">狀態</th>
                  <th className="px-6 py-3">原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${req.type === RequestType.OVERTIME ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                        {translateType(req.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">{req.date} <span className="text-xs text-slate-400 ml-1">({new Date(req.date).toLocaleDateString('zh-TW', { weekday: 'short' })})</span></td>
                    <td className="px-6 py-4">{req.hours}小時</td>
                    <td className="px-6 py-4 font-medium">
                      {req.type === RequestType.OVERTIME ? `+${req.calculatedHours}小時` : `-${req.hours}小時`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                        {translateStatus(req.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;