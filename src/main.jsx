import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n.js';
import App from './App.jsx';
import LegalPage from './pages/LegalPage.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/terminos" element={<LegalPage slug="terminos" titleEs="Términos y Condiciones" titleEn="Terms & Conditions" />} />
        <Route path="/privacidad" element={<LegalPage slug="privacidad" titleEs="Política de Privacidad" titleEn="Privacy Policy" />} />
        <Route path="/cookies" element={<LegalPage slug="cookies" titleEs="Política de Cookies" titleEn="Cookie Policy" />} />
        <Route path="/politica-sms" element={<LegalPage slug="politica-sms" titleEs="Política de SMS" titleEn="SMS Policy" />} />
        <Route path="/email-marketing" element={<LegalPage slug="email-marketing" titleEs="Política de Email Marketing" titleEn="Email Marketing Policy" />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
