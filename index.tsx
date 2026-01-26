import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 將 React 掛載到全域，協助某些編譯器解析 JSX
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React 應用程式啟動成功");
  } catch (error) {
    console.error("React 初始化渲染失敗:", error);
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: sans-serif;">
        <h2 style="color: #e11d48;">系統載入失敗</h2>
        <p style="color: #4b5563;">請嘗試重新整理頁面。若持續出現此問題，請檢查網路連線。</p>
        <code style="display: block; margin-top: 20px; padding: 10px; background: #f3f4f6; border-radius: 4px; font-size: 12px; color: #374151;">
          ${error instanceof Error ? error.message : String(error)}
        </code>
      </div>
    `;
  }
} else {
  console.error("找不到 HTML 容器節點 #root");
}