import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const COOKIE_KEY = 'ag_cookie_consent';

export default function CookieBanner() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(COOKIE_KEY)) setVisible(true);
  }, []);

  const accept = () => { localStorage.setItem(COOKIE_KEY, 'all'); setVisible(false); };
  const essential = () => { localStorage.setItem(COOKIE_KEY, 'essential'); setVisible(false); };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] bg-slate-900 border-t border-slate-700 px-4 py-5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          {lang === 'en'
            ? 'We use cookies to improve your experience. Essential cookies are always active. You may accept optional cookies (analytics and preferences) or use only essential ones. '
            : 'Usamos cookies para mejorar su experiencia. Las cookies esenciales siempre están activas. Puede aceptar cookies opcionales (analítica y preferencias) o usar solo las esenciales. '}
          <a href="/cookies" className="underline text-[#F37021] hover:text-orange-400 transition-colors">
            {lang === 'en' ? 'Cookie Policy' : 'Política de Cookies'}
          </a>
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={essential}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm font-bold hover:border-slate-400 transition-colors"
          >
            {lang === 'en' ? 'Essential only' : 'Solo esenciales'}
          </button>
          <button
            onClick={accept}
            className="px-6 py-2 rounded-lg bg-[#F37021] text-white text-sm font-black hover:bg-orange-500 transition-colors"
          >
            {lang === 'en' ? 'Accept all' : 'Aceptar todas'}
          </button>
        </div>
      </div>
    </div>
  );
}
