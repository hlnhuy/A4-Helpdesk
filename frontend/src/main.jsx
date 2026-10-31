import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/reset.css';
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/public.css';
import './styles/app-shell.css';
import './styles/shared.css';
import './styles/tickets.css';
import './styles/dashboard.css';
import './styles/components.css';
import './styles/user.css';
import './styles/technician.css';
import './styles/admin.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
