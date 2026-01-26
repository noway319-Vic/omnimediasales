import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 強制將 React 掛載到全域，這對於 Babel Standalone 在某些環境下執行 JSX 轉換至關重要
(window as any).React = React;

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("React 渲染失敗:", error);
    container.innerHTML = `<div style="padding: 20px; color: red;">系統載入失敗，請重新整理頁面。錯誤訊息: ${error.message}</div>`;
  }
} else {
  console.error("找不到渲染容器 #root");
}