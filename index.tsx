import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 將 React 掛載到全域，協助 Babel Standalone 的舊式轉換解析
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

const initApp = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error("找不到 #root 元素，請檢查 HTML 結構。");
  }
};

// 確保 DOM 完全載入後才執行，避免初始化競爭
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}