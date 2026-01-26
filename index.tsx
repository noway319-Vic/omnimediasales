import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * 解決 Minified React error #31 與 GitHub Pages 部署問題：
 * 1. 確保 React 與 ReactDOM 來自同一個來源 (透過 index.html 的 importmap 中的 ?external=react)。
 * 2. 加入 mountApp 防護邏輯，確保 DOM 完全載入後才執行渲染。
 */

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('React 渲染失敗:', error);
    rootElement.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif; background: white; border-radius: 12px; margin: 20px; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <h2 style="color: #e11d48; margin-bottom: 16px;">系統載入失敗</h2>
        <p style="color: #475569; margin-bottom: 24px;">這通常是因為瀏覽器緩存或版本衝突。請嘗試「強力重新整理」(Ctrl+F5)。</p>
        <div style="text-align: left; background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 13px;">
          <strong>錯誤細節:</strong>
          <pre style="margin-top: 10px; white-space: pre-wrap;">${error.message}</pre>
        </div>
      </div>
    `;
  }
};

// 根據 document 狀態執行掛載
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}