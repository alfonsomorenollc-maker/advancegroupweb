import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Contenidos V1 hardcodeados como fallback (copias en español)
const LEGAL_FALLBACK = {
  'terminos': `# Términos y Condiciones de Uso\n\n**Vigente desde el 1 de enero de 2026 · Versión V1**\n\n**Contacto:** Advance Group LLC · Puerto Rico #1, Bo. Km 29.4, Caguas, PR 00725 · 787-653-9000 · legal@advancegrouppr.com\n\n---\n\n## 1.1 Aceptación de los términos\nAl acceder y utilizar el sitio web advancegrouppr.com (el "Sitio") y los servicios ofrecidos por Advance Group LLC y sus compañías afiliadas (Advance Logistics LLC, Advance Depot LLC, Advance Solutions LLC y Advance Support Center LLC), usted ("el Usuario") acepta quedar obligado por estos Términos y Condiciones, así como por la Política de Privacidad, la Política de Cookies y las políticas de comunicación incorporadas por referencia.\n\n## 1.2 Quiénes somos\nEl Sitio es operado por Advance Group LLC en conjunto con su familia de compañías:\n- **Advance Logistics LLC:** logística, transporte y distribución.\n- **Advance Depot LLC:** almacenaje y manejo de inventario.\n- **Advance Solutions LLC:** fuerza de ventas, inteligencia comercial y servicios de empaque.\n- **Advance Support Center LLC:** servicios de apoyo y soporte al cliente.\n\n## 1.3 Descripción de los servicios\nAdvance Group opera un ecosistema unificado de servicios en Puerto Rico incluyendo logística, distribución, almacenaje, fulfillment, empaque, venta de cajas, personalización de empaques y fuerza de ventas.\n\n## 1.4 Las cotizaciones no son ofertas vinculantes\nToda cotización es de carácter informativo. No constituye una oferta vinculante. Los precios se confirman únicamente mediante contrato firmado.\n\n## 1.5 Elegibilidad\nUsted declara que es mayor de edad y tiene capacidad legal para aceptar estos términos.\n\n## 1.6 Uso aceptable\nUsted se compromete a no usar el Sitio para fines ilícitos, interferir con su seguridad, introducir código malicioso, ni extraer datos sin autorización.\n\n## 1.7 Propiedad intelectual\nTodo el contenido del Sitio es propiedad de Advance Group o sus licenciantes. Queda prohibida su reproducción sin autorización escrita.\n\n## 1.8 Limitación de responsabilidad\nAdvance Group no será responsable por daños indirectos, incidentales o consecuentes en la medida máxima permitida por la ley.\n\n## 1.9 Ley aplicable\nEstos términos se rigen por las leyes del Estado Libre Asociado de Puerto Rico.\n\n## 1.10 Contacto\nlegal@advancegrouppr.com · 787-653-9000`,

  'privacidad': `# Política de Privacidad\n\n**Vigente desde el 1 de enero de 2026 · Versión V1**\n\n**Responsable:** Advance Group LLC · legal@advancegrouppr.com · 787-653-9000\n\n---\n\n## Información que recopilamos\n- Datos que usted provee: nombre, empresa, correo, teléfono, municipio, servicios de interés.\n- Datos de consentimiento: aceptación de términos y opt-in de SMS con timestamp, versión del texto e IP.\n- Datos automáticos: IP, navegador, páginas visitadas, cookies.\n\n## Cómo usamos la información\nPara responder solicitudes, prestar servicios, comunicarnos con usted y mejorar el Sitio.\n\n## Cómo compartimos la información\nNo vendemos su información. Podemos compartirla entre entidades de Advance Group y con proveedores bajo obligaciones de confidencialidad.\n\n## Sus derechos\nPuede solicitar acceso, corrección o eliminación de su información. Escriba a legal@advancegrouppr.com.\n\n## Contacto\nlegal@advancegrouppr.com · 787-653-9000 · Puerto Rico #1, Bo. Km 29.4, Caguas, PR 00725`,

  'cookies': `# Política de Cookies\n\n**Vigente desde el 1 de enero de 2026 · Versión V1**\n\n---\n\n## ¿Qué son las cookies?\nPequeños archivos en su dispositivo para el funcionamiento del Sitio y análisis de uso.\n\n## Tipos que utilizamos\n- **Esenciales:** necesarias para el funcionamiento. No pueden desactivarse.\n- **De preferencias:** recuerdan ajustes como el idioma.\n- **Analíticas:** ayudan a entender cómo se usa el Sitio.\n- **De mercadeo:** con su consentimiento para medir campañas.\n\n## Gestión\nPuede aceptar o rechazar cookies no esenciales mediante el aviso del Sitio.\n\n## Contacto\nlegal@advancegrouppr.com`,

  'politica-sms': `# Política de Mensajes de Texto (SMS)\n\n**Vigente desde el 1 de enero de 2026 · Versión V1**\n\n---\n\n## Consentimiento\nAl marcar la casilla de opt-in, autoriza a Advance Group a enviarle SMS relacionados con su solicitud. El consentimiento es independiente y no es condición para adquirir servicios.\n\n## Texto de consentimiento (V1)\n> "Autorizo a Advance Group a contactarme por SMS sobre mi solicitud. Pueden aplicar tarifas de mensajes y datos. Puedo darme de baja respondiendo STOP en cualquier momento."\n\n## Tipo de mensajes\nEstado de solicitud, cotizaciones e información de servicios (hasta 100 SMS/mes).\n\n## Darse de baja\nResponda STOP para cancelar. Responda HELP para ayuda.\n\n## Privacidad\nSu número y consentimiento no se venden ni comparten para mercadeo.\n\n## Contacto\nlegal@advancegrouppr.com · 787-653-9000`,

  'email-marketing': `# Política de Email Marketing\n\n**Vigente desde el 1 de enero de 2026 · Versión V1**\n\n---\n\n## Propósito\nLe enviaremos correos relacionados con su solicitud y, con su consentimiento, comunicaciones de mercadeo.\n\n## Identificación\nTodo correo identificará a Advance Group con información de contacto válida.\n\n## Darse de baja\nCada correo de mercadeo incluye enlace para cancelar la suscripción. También escriba a legal@advancegrouppr.com.\n\n## Contacto\nlegal@advancegrouppr.com · 787-653-9000`
};

export default function LegalPage({ slug, titleEs, titleEn }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'es';
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'orgs', 'org1', 'legal_documents', slug))
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data();
          setContent(lang === 'en' && d.body_en ? d.body_en : d.body_es);
        } else {
          setContent(LEGAL_FALLBACK[slug] || '');
        }
      })
      .catch(() => setContent(LEGAL_FALLBACK[slug] || ''))
      .finally(() => setLoading(false));
  }, [slug, lang]);

  const title = lang === 'en' ? titleEn : titleEs;
  const html = content ? DOMPurify.sanitize(marked(content)) : '';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar minimal */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#F37021] transition-colors">
            ← Volver
          </button>
          <a href="/" className="font-black text-lg text-slate-900 tracking-tight">ADVANCE GROUP</a>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-24">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        ) : (
          <article
            className="prose prose-slate prose-headings:font-black prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:border-t prose-h2:border-slate-100 prose-h2:pt-8 max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}
