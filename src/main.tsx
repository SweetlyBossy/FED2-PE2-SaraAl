import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // Import your vault

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Wrap the App in the provider so the Header can access it! */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);