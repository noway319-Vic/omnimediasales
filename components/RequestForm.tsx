import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { RequestType } from '../types';
import { polishReason } from '../services/geminiService';

const RequestForm: React.FC = () => {
  const { submitRequest, showNotification } = useData();
  const [type, setType] = useState<RequestType>(RequestType.OVERTIME);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [hours, setHours] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);

  // Auto-set start time based on date (Weekend vs Weekday)
  useEffect(() => {
    if (date && type === RequestType.OVERTIME) {
      const day = new Date(date).getDay();
      // 0 is Sunday, 6 is Saturday
      if (day === 0 || day === 6) {
        setStartTime('08:00'); // Weekend default 8 AM
      } else {
        setStartTime('20:00'); // Weekday default 8 PM
      }
    }
  }, [date, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours <= 0) {
        showNotification('時數必須大於 0', 'error');
        return;
    }
    submitRequest({ type, date, startTime, hours, reason });
    // Reset form
    setDate('');
    setStartTime('');
    setHours(0);
    setReason('');
  };

  const handleAiPolish = async () => {
    if (!reason || reason.length < 2) {
      showNotification('請先輸入草稿原因', 'error');
      return;
    }
    if (!process.env.API_KEY) {
        showNotification('未設定 Gemini API Key', 'error');
        return;
    }
    setIsPolishing(true);
    try {
      const polished = await polishReason(reason, type);
      setReason(polished);
      showNotification('AI 潤飾完成！', 'success');
    } catch (e) {
      showNotification('潤飾失敗', 'error');
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">新增申請單</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType(RequestType.OVERTIME)}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                type === RequestType.OVERTIME
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              申請加班
            </button>
            <button
              type="button"
              onClick={() => setType(RequestType.LEAVE)}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                type === RequestType.LEAVE
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              申請補休
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">開始時間</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {type === RequestType.OVERTIME && date && (
                 <p className="text-xs text-slate-400 mt-1">
                   { (new Date(date).getDay() % 6 === 0) ? "假日預設：上午 8:00" : "平日預設：下午 8:00"}
                 </p>
              )}
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">時數 (小時)</label>
             <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={hours || ''}
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {type === RequestType.OVERTIME && date && (
                 <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                    {new Date(date).getDay() % 6 === 0 
                       ? `假日規則：無論申請時數為何，系統將自動核發 8 小時補休。`
                       : `平日規則：依據實際加班時數核發 ${hours || 0} 小時補休。`
                    }
                 </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">申請原因</label>
            <div className="relative">
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="例如：協助處理緊急上線問題..."
                  className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-12"
                />
                <button
                    type="button"
                    onClick={handleAiPolish}
                    disabled={isPolishing}
                    title="使用 AI 潤飾"
                    className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full hover:shadow-lg transition disabled:opacity-50"
                >
                    {isPolishing ? (
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    )}
                </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">小撇步：點擊閃電圖示，讓 AI 幫您把原因寫得更專業。</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition duration-200"
          >
            送出申請
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;