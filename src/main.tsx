import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Importação de estilos
import './assets/styles/global.css';
import './assets/styles/components.css';
import './assets/styles/home.css';
import './assets/styles/dashboard.css';
import './assets/styles/notFound.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
