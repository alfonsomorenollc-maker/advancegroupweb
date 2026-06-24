import React from 'react';
import { useTranslation } from 'react-i18next';
import CookieBanner from './components/CookieBanner.jsx';
import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Truck,
  Search,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Phone,
  Zap,
  Box,
  X,
  TrendingUp,
  Handshake,
  BarChart3,
  Users,
  Store
} from 'lucide-react';

// ─── CONSENTIMIENTO SMS — TCPA ────────────────────────────────────────────
// Versionar este texto: cada cambio = nuevo identificador.
// El backend almacena la versión para auditoría.
// Mantenido para compatibilidad con versiones previas; el render usa t('contact.smsConsent')
const SMS_CONSENT_TEXT_V1 = "Autorizo a Advance Group a contactarme por SMS sobre mi solicitud. Pueden aplicar tarifas de mensajes y datos. Puedo darme de baja respondiendo STOP en cualquier momento.";

const BRAND_COLORS = {
  ORANGE: '#F37021',
  LOGISTICS_GREY: '#939598',
  DEPOT_NAVY: '#1A237E',
  SOLUTIONS_TEAL: '#4DB6AC'
};

const BUSINESS_LINES = {
  LOGISTICS: {
    id: 'logistics',
    color: 'text-[#939598]',
    accent: '#939598',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: Truck,
  },
  DEPOT: {
    id: 'depot',
    color: 'text-[#1A237E]',
    accent: '#1A237E',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    icon: Box,
  },
  SOLUTIONS: {
    id: 'solutions',
    color: 'text-[#4DB6AC]',
    accent: '#4DB6AC',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    icon: TrendingUp,
  }
};

const SERVICES = [
  { id: 's1', line: 'logistics', titleKey: 'Entrega Especializada 24h', title: 'Entrega Especializada 24h', description: 'Distribución en tiempo récord a cualquier punto de la isla, garantizando Vieques y Culebra.', tags: ['entrega rápida', 'isla completa', '24 horas'], related: ['s4', 's7', 's10'] },
  { id: 's2', line: 'logistics', title: 'Logística de Última Milla', description: 'Conectamos su producto con el cliente final con la mayor eficiencia del mercado local.', tags: ['última milla', 'distribución', 'B2B'], related: ['s6', 's8'] },
  { id: 's4', line: 'depot', title: 'Almacenaje Estratégico', description: 'Espacios seguros y optimizados para el resguardo y manejo de su inventario.', tags: ['almacenaje', 'inventario', 'seguridad'], related: ['s1', 's7', 's9'] },
  { id: 's5', line: 'depot', title: 'Fulfillment & Picking', description: 'Gestión integral de órdenes desde la recepción hasta el empaque final.', tags: ['fulfillment', 'e-commerce', 'órdenes'], related: ['s1', 's7', 's8'] },
  { id: 's6', line: 'depot', title: 'Empaque Personalizado', description: 'Diseño y provisión de materiales de protección para carga crítica e industrial.', tags: ['empaque', 'protección', 'materiales'], related: ['s2', 's10'] },
  { id: 's7', line: 'solutions', title: 'Venta y Distribución Integral', description: 'Representación comercial y distribución de productos en canales B2B y B2C.', tags: ['ventas', 'distribución', 'comercialización'], related: ['s1', 's4', 's10'] },
  { id: 's8', line: 'solutions', title: 'Estrategia de Lanzamiento', description: 'Análisis de mercado y planes de introducción para nuevas marcas y productos.', tags: ['estrategia', 'mercado', 'crecimiento'], related: ['s9', 's2'] },
  { id: 's9', line: 'solutions', title: 'Marketing y Posicionamiento', description: 'Diseño de campañas y activaciones comerciales para impulsar la demanda.', tags: ['marketing', 'branding', 'posicionamiento'], related: ['s8', 's10'] },
  { id: 's10', line: 'solutions', title: 'Fuerza de Ventas & Merchandising', description: 'Equipos especializados en punto de venta para maximizar la visibilidad y rotación.', tags: ['ventas', 'Punto de Venta', 'ejecución'], related: ['s7', 's1'] }
];

const HERO_SLIDES = [
  {
    fileName: 'advance-group-distribucion-logistica-entregas-puntuales-puerto-rico.jpg',
    photo: 'https://firebasestorage.googleapis.com/v0/b/advancegroup-web-4391643-961a3.firebasestorage.app/o/landing%2Fadvance-group-distribucion-logistica-entregas-puntuales-puerto-rico.jpg?alt=media&token=f47404af-8051-4a42-b4d8-b51e262b2413',
    titleEs: 'Advance Group | Distribución que llega a tiempo todos los días',
    altEs: 'Operación de distribución de Advance Group realizando entregas puntuales para negocios en Puerto Rico',
    titleEn: 'Advance Group | On-time distribution across Puerto Rico',
    altEn: 'Advance Group distribution operation handling on-time deliveries for businesses across Puerto Rico',
    keywordsEs: 'Advance Group, distribución, logística, entregas puntuales, entregas a tiempo, entregas diarias, transporte, fulfillment, almacen, almacén, bodega, despacho, reparto, operaciones, cadena de suministro, Puerto Rico, entrega same-day, entrega el mismo día',
    keywordsEn: 'Advance Group, distribution, logistics, on-time delivery, daily delivery, fulfillment, warehousing, warehouse, storage, dispatch, route delivery, supply chain, last mile, same-day delivery, Puerto Rico logistics',
    slideIndex: 0,
  },
  {
    fileName: 'advance-group-crecimiento-de-marcas-estrategia-datos-puerto-rico.jpg',
    photo: 'https://firebasestorage.googleapis.com/v0/b/advancegroup-web-4391643-961a3.firebasestorage.app/o/landing%2Fadvance-group-crecimiento-de-marcas-estrategia-datos-puerto-rico.jpg?alt=media&token=ad9b415a-d6a9-4a38-8d7a-f9c6f3fa2bc4',
    titleEs: 'Advance Group | Marcas que crecen con estrategia y datos',
    altEs: 'Equipo de Advance Group analizando datos y estrategia comercial para impulsar el crecimiento de marcas en Puerto Rico',
    titleEn: 'Advance Group | Brand growth powered by strategy and data',
    altEn: 'Advance Group team using commercial strategy and data insights to drive brand growth in Puerto Rico',
    keywordsEs: 'Advance Group, crecimiento de marcas, estrategia comercial, estrategia de ventas, análisis de datos, inteligencia comercial, expansion comercial, expansión comercial, desarrollo de mercado, posicionamiento de marca, mercadeo, ventas, marcas, Puerto Rico, business intelligence',
    keywordsEn: 'Advance Group, brand growth, commercial strategy, sales strategy, data insights, analytics, market development, go-to-market, brand positioning, business intelligence, growth strategy, Puerto Rico market expansion',
    slideIndex: 1,
  },
  {
    fileName: 'advance-group-estrategia-comercial-logistica-operacional-puerto-rico.jpg',
    photo: 'https://firebasestorage.googleapis.com/v0/b/advancegroup-web-4391643-961a3.firebasestorage.app/o/landing%2Fadvance-group-estrategia-comercial-logistica-operacional-puerto-rico.jpg?alt=media&token=0dbf7ae3-aab1-4ea1-a5f6-1dfd41efd2e6',
    titleEs: 'Advance Group | Estrategia que vende y logística que cumple',
    altEs: 'Servicios integrados de estrategia comercial y logística operacional de Advance Group para empresas en Puerto Rico',
    titleEn: 'Advance Group | Commercial strategy that sells, logistics that deliver',
    altEn: 'Integrated commercial strategy and logistics services from Advance Group for companies operating in Puerto Rico',
    keywordsEs: 'Advance Group, estrategia comercial, logística operacional, ventas, distribución, fulfillment, ejecución operacional, manejo de órdenes, ordenes, servicio, operaciones, expansión comercial, almacén, despacho, Puerto Rico',
    keywordsEn: 'Advance Group, commercial strategy, logistics execution, sales enablement, fulfillment, distribution, order management, operations, execution, business growth, go-to-market support, Puerto Rico',
    slideIndex: 2,
  },
  {
    fileName: 'advance-group-depot-almacenaje-fulfillment-bodega-puerto-rico.jpg',
    photo: 'https://firebasestorage.googleapis.com/v0/b/advancegroup-web-4391643-961a3.firebasestorage.app/o/landing%2Fadvance-group-distribucion-logistica-entregas-puntuales-puerto-rico.jpg?alt=media&token=f47404af-8051-4a42-b4d8-b51e262b2413',
    titleEs: 'Advance Group | Advance Depot — Almacenaje y fulfillment en Puerto Rico',
    altEs: 'Advance Depot: centro de almacenaje, pick & pack y fulfillment de Advance Group en Caguas, Puerto Rico',
    titleEn: 'Advance Group | Advance Depot — Warehousing and fulfillment in Puerto Rico',
    altEn: 'Advance Depot: Advance Group warehousing, pick & pack and fulfillment center in Caguas, Puerto Rico',
    keywordsEs: 'Advance Depot, almacenaje, bodega, fulfillment, picking, packing, inventario, almacén refrigerado, 3PL, gestión de inventario, Caguas, Puerto Rico, distribución, despacho',
    keywordsEn: 'Advance Depot, warehousing, warehouse, fulfillment, picking, packing, inventory management, refrigerated storage, 3PL, Caguas, Puerto Rico, distribution',
    slideIndex: 3,
  },
];

const LogoSVG = ({ accentColor = BRAND_COLORS.LOGISTICS_GREY, size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 309.66 242.51" xmlns="http://www.w3.org/2000/svg">
    <polygon fill={accentColor} points="307.37,0 256.44,0 155.35,159.23 131.84,121.26 103.82,163.83 155.45,242.51" />
    <polygon fill="#F47525" points="217.6,182.48 256.23,242.51 309.66,242.51 244.36,140.04" />
    <polygon fill="#F47525" points="179.46,121.26 206.05,79.38 155.57,0 0,242.51 52.9,242.51 155.57,85.38" />
  </svg>
);

const VideoPlayer = () => {
  const { t } = useTranslation();
  const videoRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const videoMeta = {
    fileName: 'advance-group-logistica-distribucion-estrategia-comercial-puerto-rico.mp4',
    titleEs: 'Advance Group | Estrategia comercial, distribución y logística en Puerto Rico',
    titleEn: 'Advance Group | Commercial strategy, distribution and logistics in Puerto Rico',
    descriptionEs: 'Video institucional de Advance Group mostrando su ecosistema de servicios en Puerto Rico, incluyendo distribución, logística, almacén, fulfillment, estrategia comercial, crecimiento de marcas, manejo de órdenes y soporte operacional para empresas.',
    descriptionEn: 'Corporate brand video for Advance Group showcasing its service ecosystem in Puerto Rico, including distribution, logistics, warehousing, fulfillment, commercial strategy, brand growth, order management and operational support for businesses.',
    keywordsEs: 'Advance Group, logística, distribución, almacén, almacen, bodega, fulfillment, estrategia comercial, crecimiento de marcas, manejo de órdenes, soporte operacional, entregas, despacho, reparto, Puerto Rico, supply chain, ventas, operaciones',
    keywordsEn: 'Advance Group, logistics, distribution, warehousing, warehouse, storage, fulfillment, commercial strategy, brand growth, order management, operational support, delivery, dispatch, route delivery, supply chain, Puerto Rico logistics, sales enablement',
    captionEs: 'Estrategia que vende. Logística que cumple.',
    captionEn: 'Strategy that sells. Logistics that deliver.',
  };

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play().catch(() => {});
        } else if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
        }
      },
      { threshold: 0.5 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  const [isMuted, setIsMuted] = React.useState(true);

  return (
    <div ref={containerRef} className="w-full bg-[#0F172A] py-16 px-4">
      <div className="sr-only" aria-hidden="true">
        <span data-video-title-es={videoMeta.titleEs} />
        <span data-video-title-en={videoMeta.titleEn} />
        <span data-video-description-es={videoMeta.descriptionEs} />
        <span data-video-description-en={videoMeta.descriptionEn} />
        <span data-video-keywords-es={videoMeta.keywordsEs} />
        <span data-video-keywords-en={videoMeta.keywordsEn} />
        <span data-video-caption-es={videoMeta.captionEs} />
        <span data-video-caption-en={videoMeta.captionEn} />
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            src="https://firebasestorage.googleapis.com/v0/b/advancegroup-web-4391643-961a3.firebasestorage.app/o/landing%2Fadvance-group-logistica-distribucion-estrategia-comercial-puerto-rico.m4v?alt=media&token=f23f18c7-1f11-43e7-9103-fe46bc232d4a"
            title={videoMeta.titleEs}
            className="w-full h-full object-cover" muted={isMuted}
            loop playsInline preload="metadata" aria-label={videoMeta.titleEs}
          />
          <button
            onClick={() => { setIsMuted(m => !m); if(videoRef.current) videoRef.current.muted = !isMuted; }}
            className="absolute bottom-4 right-4 bg-black/60 hover:bg-[#F37021] text-white rounded-full p-2 transition-all duration-200 z-10"
            title={isMuted ? t('video.unmuteLabel') : t('video.muteLabel')}
          >
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PR Municipios (78) para el selector del formulario ──────────────────
const PR_MUNICIPIOS = [
  'Adjuntas','Aguada','Aguadilla','Aguas Buenas','Aibonito','Añasco','Arecibo','Arroyo',
  'Barceloneta','Barranquitas','Bayamón','Cabo Rojo','Caguas','Camuy','Canóvanas',
  'Carolina','Cataño','Cayey','Ceiba','Ciales','Cidra','Coamo','Comerío','Corozal',
  'Culebra','Dorado','Fajardo','Florida','Guánica','Guayama','Guayanilla','Guaynabo',
  'Gurabo','Hatillo','Hormigueros','Humacao','Isabela','Jayuya','Juana Díaz','Juncos',
  'Lajas','Lares','Las Marías','Las Piedras','Loíza','Luquillo','Manatí','Maricao',
  'Maunabo','Mayagüez','Moca','Morovis','Naguabo','Naranjito','Orocovis','Patillas',
  'Peñuelas','Ponce','Quebradillas','Rincón','Río Grande','Sabana Grande','Salinas',
  'San Germán','San Juan','San Lorenzo','San Sebastián','Santa Isabel','Toa Alta',
  'Toa Baja','Trujillo Alto','Utuado','Vega Alta','Vega Baja','Vieques','Villalba',
  'Yabucoa','Yauco'
];

const VOLUME_OPTIONS = [
  'Más de 500 unidades/semana',
  '201-500 unidades/semana',
  '51-200 unidades/semana',
  '1-50 unidades/semana',
  'No sé aún',
];

const FREQUENCY_OPTIONS = ['Recurrente', 'Mensual', 'Puntual'];

// Service option keys for i18n (value stored in Firestore is the EN key)
const SERVICE_OPTION_KEYS = [
  'distribucion',
  'logistica',
  'fulfillment',
  'estrategia',
  'crecimiento',
  'manejo',
  'soporte',
];

const App = () => {
  const { t, i18n } = useTranslation();

  const [activeSection, setActiveSection] = React.useState('home');
  const [filter, setFilter] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedService, setSelectedService] = React.useState(null);
  const [formStatus, setFormStatus] = React.useState('idle'); // idle|submitting|success|error
  const [selectedServiceKeys, setSelectedServiceKeys] = React.useState([]);
  const [heroSlide, setHeroSlide] = React.useState(0);

  // Consentimiento
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [smsConsent, setSmsConsent] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setHeroSlide(p => (p + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const filteredServices = React.useMemo(() => {
    return SERVICES.filter(s => {
      const matchesFilter = filter === 'all' || s.line === filter;
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  const toggleServiceKey = (key) => {
    setSelectedServiceKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const currentSlide = HERO_SLIDES[heroSlide];
  const slideData = t(`hero.slides.${heroSlide}`, { returnObjects: true });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) return;
    setFormStatus('submitting');

    const fd = new FormData(e.target);
    const now = new Date();

    // IP best-effort — para auditoría TCPA
    let consentIp = null;
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipJson = await ipRes.json();
      consentIp = ipJson.ip || null;
    } catch (_) { /* no-op */ }

    try {
      await addDoc(collection(db, 'orgs', 'org1', 'leads'), {
        // Datos de contacto
        name:      (fd.get('nombre') || '').trim() || (fd.get('empresa') || '').trim(),
        email:     (fd.get('email')  || '').trim() || null,
        phone:     (fd.get('telefono') || '').trim() || null,
        company:   (fd.get('empresa') || '').trim() || null,
        municipio: (fd.get('municipio') || '').trim() || null,

        // Datos de negocio (alimentan el scoring)
        services:  selectedServiceKeys,
        volume:    (fd.get('volumen') || '').trim() || null,
        frequency: (fd.get('frecuencia') || '').trim() || null,
        message:   (fd.get('mensaje') || '').trim() || null,

        // Consentimiento T&C
        termsAccepted:   true,
        termsAcceptedAt: serverTimestamp(),

        // Consentimiento SMS (TCPA)
        smsConsent:           smsConsent,
        smsConsentAt:         smsConsent ? serverTimestamp() : null,
        smsConsentSource:     'web_contact_form',
        smsConsentTextVersion: i18n.language === 'es' ? 'V1_ES' : 'V1_EN',
        smsConsentLanguage:   i18n.language,
        consentIp,

        // Metadata del lead
        source:   'WEB',
        status:   'NUEVO',
        priority: 'Medium',
        optedOut: false,
        formLanguage: i18n.language,

        createdAt:  serverTimestamp(),
        updatedAt:  serverTimestamp(),
      });

      setFormStatus('success');
      e.target.reset();
      setSelectedServiceKeys([]);
      setTermsAccepted(false);
      setSmsConsent(false);
      setTimeout(() => setFormStatus('idle'), 4000);
    } catch (err) {
      console.error('Error submitting lead:', err);
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 3000);
    }
  };

  const getServiceById = (id) => SERVICES.find(s => s.id === id);

  // Helper: get localized image alt/title for current slide
  const slideAlt = i18n.language === 'en' ? currentSlide.altEn : currentSlide.altEs;
  const slideTitle = i18n.language === 'en' ? currentSlide.titleEn : currentSlide.titleEs;

  // Business line display names from i18n
  const getLineName = (lineId) => t(`businessLines.${lineId}.name`);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-700">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveSection('home')}>
            <LogoSVG accentColor={BRAND_COLORS.ORANGE} size={36} />
            <div className="flex flex-col">
              <span className="font-black text-xl leading-none text-slate-900 tracking-tight">ADVANCE</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#F37021]">GROUP</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm uppercase tracking-widest text-slate-500">
            <button onClick={() => setActiveSection('home')} className={`hover:text-[#F37021] transition-colors ${activeSection === 'home' ? 'text-[#F37021]' : ''}`}>{t('nav.home')}</button>
            <button onClick={() => setActiveSection('services')} className={`hover:text-[#F37021] transition-colors ${activeSection === 'services' ? 'text-[#F37021]' : ''}`}>{t('nav.solutions')}</button>
            <button onClick={() => setActiveSection('contact')} className={`hover:text-[#F37021] transition-colors ${activeSection === 'contact' ? 'text-[#F37021]' : ''}`}>{t('nav.contact')}</button>

            {/* Language toggle */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-black tracking-widest text-slate-500 hover:border-[#F37021] hover:text-[#F37021] transition-all"
            >
              <span className={i18n.language === 'en' ? 'text-[#F37021]' : 'text-slate-300'}>EN</span>
              <span className="text-slate-200">|</span>
              <span className={i18n.language === 'es' ? 'text-[#F37021]' : 'text-slate-300'}>ES</span>
            </button>
          </div>
          <button onClick={() => setActiveSection('contact')} className="bg-[#F37021] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#d65d18] transition-all shadow-lg shadow-orange-200">
            {t('nav.quote')}
          </button>
        </div>
      </nav>

      {/* HOME */}
      {activeSection === 'home' && (
        <>
          <section className="pt-44 pb-24 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-[#F37021] text-xs font-black tracking-widest uppercase">
                  <TrendingUp size={14} /> {slideData.tag}
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[0.95]">
                  {slideData.h1} <br />
                  <span className="text-[#F37021]">{slideData.accent}</span> {slideData.h2} <br />
                  <span className="text-slate-400">{slideData.muted}</span>
                </h1>
                <div className="flex items-center gap-2">
                  {HERO_SLIDES.map((_, i) => (
                    <button key={i} onClick={() => setHeroSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === heroSlide ? 'w-6 bg-[#F37021]' : 'w-2 bg-slate-300'}`}
                    />
                  ))}
                </div>
                <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
                  {t('hero.description')}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={() => setActiveSection('services')} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-[#F37021] transition-all transform hover:-translate-y-1 shadow-xl">
                    {t('hero.exploreCta')} <ArrowRight size={20} />
                  </button>
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="flex -space-x-3">
                      {[
                        { name: 'AxCare', favicon: 'https://www.axcare.com/favicon.ico', desc: 'Axis provee servicios de salud y equipos médicos directamente al hogar.' },
                        { name: 'TRUST Beauty', favicon: 'https://static.cdninstagram.com/rsrc.php/v3/yI/r/VsNE-OHk_8a.png', desc: 'Trust Beauty, marca líder en los salones de belleza con en productos especializados para el cuidado del cabello.' },
                        { name: 'Prodigy', favicon: 'https://www.prodigymeter.com/favicon.ico', desc: 'Compañía especializada en el desarrollo de sistemas de monitoreo de glucosa en sangre diseñados para ser accesibles, especialmente para personas con discapacidades visuales.' },
                      ].map((client) => (
                        <div key={client.name} className="relative group">
                          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden cursor-pointer hover:scale-110 transition-transform flex items-center justify-center">
                            <img src={client.favicon} alt={client.name} className="w-8 h-8 object-contain rounded-full"
                              onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.innerHTML='<span style="font-size:14px;font-weight:700;color:#F37021">'+client.name[0]+'</span>'; }}
                            />
                          </div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                            <div className="flex items-center gap-2 mb-1">
                              <img src={client.favicon} alt={client.name} className="w-5 h-5 rounded" />
                              <span className="font-bold text-slate-900 text-sm">{client.name}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-snug">{client.desc}</p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-slate-400">{t('hero.partnersLabel')}</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-100 aspect-[4/5] md:aspect-square">
                  <img src={currentSlide.photo} alt={slideAlt} title={slideTitle} className="w-full h-full object-cover transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-10 left-10 right-10 text-white">
                    <div className="flex items-center gap-4 mb-2">
                      <Handshake size={32} className="text-[#4DB6AC]" />
                      <h3 className="text-2xl font-black">{t('hero.strategicPartnersTitle')}</h3>
                    </div>
                    <p className="text-slate-200 font-medium">{t('hero.strategicPartnersDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* VIDEO SECTION */}
          <section className="py-0 bg-black flex items-center justify-center">
            <VideoPlayer />
          </section>

          <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl font-black text-slate-900">{t('businessLines.sectionTitle')}</h2>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium">{t('businessLines.sectionSubtitle')}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {Object.values(BUSINESS_LINES).map((line) => (
                  <div key={line.id} className="p-10 rounded-[2.5rem] bg-white border border-slate-100 group hover:shadow-2xl hover:shadow-orange-500/10 transition-all cursor-pointer flex flex-col" onClick={() => { setActiveSection('services'); setFilter(line.id); }}>
                    <div className="mb-8 flex justify-between items-start">
                      <LogoSVG accentColor={line.accent} size={50} />
                      <div className={`p-3 rounded-2xl ${line.bg} ${line.color}`}><line.icon size={24} /></div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4">{t(`businessLines.${line.id}.name`)}</h3>
                    <p className="text-slate-500 mb-8 leading-relaxed font-medium flex-grow">{t(`businessLines.${line.id}.description`)}</p>
                    <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-[#F37021] group-hover:gap-4 transition-all">
                      {t('businessLines.knowServices')} <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-[#4DB6AC]/10 blur-[100px]" />
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h2 className="text-4xl font-black text-white">{t('industries.title')}</h2>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed">{t('industries.subtitle')}</p>
                    <div className="grid grid-cols-2 gap-4 items-stretch">
                      {t('industries.list', { returnObjects: true }).map((industry) => (
                        <div key={industry} className="flex items-center gap-2 text-white/80 font-bold h-full">
                          <div className="w-2 h-2 rounded-full bg-[#4DB6AC]" /> {industry}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4 pt-8">
                      <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center group hover:bg-[#F37021] transition-all">
                        <Store className="text-[#4DB6AC] mb-4 group-hover:text-white" size={32} />
                        <p className="text-xs font-black uppercase tracking-widest text-white">{t('industries.retailChannel')}</p>
                      </div>
                      <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center group hover:bg-[#4DB6AC] transition-all">
                        <Users className="text-[#F37021] mb-4 group-hover:text-white" size={32} />
                        <p className="text-xs font-black uppercase tracking-widest text-white">{t('industries.b2bSales')}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center group hover:bg-white/20 transition-all">
                        <BarChart3 className="text-white mb-4" size={32} />
                        <p className="text-xs font-black uppercase tracking-widest text-white">{t('industries.analytics')}</p>
                      </div>
                      <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center p-6 text-center group hover:bg-[#1A237E] transition-all">
                        <Box className="text-[#F37021] mb-4 group-hover:text-white" size={32} />
                        <p className="text-xs font-black uppercase tracking-widest text-white">{t('industries.distribution')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </>
      )}

      {/* SERVICES */}
      {activeSection === 'services' && (
        <section className="pt-32 pb-24 px-4 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-slate-100 pb-12">
              <div className="space-y-4">
                <div className="w-12 h-1.5 bg-[#F37021] rounded-full" />
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">{t('services.heading')}</h2>
                <p className="text-slate-500 text-lg font-medium">{t('services.subtitle')}</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder={t('services.searchPlaceholder')} className="w-full md:w-80 pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500 transition-all font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  {['all', 'logistics', 'depot', 'solutions'].map((l) => (
                    <button key={l} onClick={() => setFilter(l)} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      {l === 'all' ? t('services.filterAll') : l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <div key={service.id} onClick={() => setSelectedService(service)} className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-500/5 transition-all cursor-pointer group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${BUSINESS_LINES[service.line.toUpperCase()].bg}`}>
                      {React.createElement(BUSINESS_LINES[service.line.toUpperCase()].icon, { className: `w-6 h-6 ${BUSINESS_LINES[service.line.toUpperCase()].color}` })}
                    </div>
                  </div>
                  <h4 className="text-xl font-black mb-3 text-slate-900 leading-tight group-hover:text-[#F37021] transition-colors">{service.title}</h4>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium line-clamp-3">{service.description}</p>
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex gap-1">
                      {service.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 bg-slate-50 rounded">#{tag}</span>
                      ))}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-[#F37021] transition-all">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      {activeSection === 'contact' && (
        <section className="pt-32 pb-24 px-4 bg-slate-900 text-white min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-24 items-start">
              <div className="space-y-12">
                <div className="space-y-6">
                  <h2 className="text-6xl font-black leading-none tracking-tight">{t('contact.heading1')} <br/><span className="text-[#F37021]">{t('contact.headingAccent')}</span></h2>
                  <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-md">{t('contact.description')}</p>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="w-14 h-14 bg-[#F37021] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/40">
                      <Phone className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{t('contact.commercialContact')}</p>
                      <a href="tel:7876539000" className="text-2xl font-bold hover:text-[#F37021] transition-colors">787-653-9000</a>
                    </div>
                  </div>
                  <div className="rounded-3xl overflow-hidden border border-white/10" style={{height: '220px'}}>
                    <iframe
                      title="Advance Group PR"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d941.9258085!2d-66.044476!3d18.285087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c03687b9b9b9b9b%3A0x1234567890abcdef!2sAdvance+Group!5e0!3m2!1ses!2spr!4v1709999999999!5m2!1ses!2spr"
                      width="100%" height="100%" style={{border: 0}}
                      allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>

              {/* FORMULARIO EXTENDIDO */}
              <div className="bg-white rounded-[3rem] p-10 text-slate-900 shadow-2xl">
                <form className="space-y-5" onSubmit={handleContactSubmit}>
                  <h3 className="text-2xl font-black mb-1">{t('contact.formTitle')}</h3>
                  <p className="text-xs text-slate-400 mb-4">{t('contact.formRequired')} <span className="text-orange-500">*</span> {t('contact.formRequiredSuffix')}</p>

                  {/* Nombre */}
                  <input required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-medium text-sm" name="nombre" placeholder={t('contact.namePlaceholder')} />

                  {/* Empresa */}
                  <input required className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-medium text-sm" name="empresa" placeholder={t('contact.companyPlaceholder')} />

                  {/* Email + Teléfono */}
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="email" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-medium text-sm" name="email" placeholder={t('contact.emailPlaceholder')} />
                    <input required type="tel" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-medium text-sm" name="telefono" placeholder={t('contact.phonePlaceholder')} />
                  </div>

                  {/* Municipio */}
                  <select name="municipio" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-medium text-sm text-slate-600">
                    <option value="">{t('contact.municipioPlaceholder')}</option>
                    {PR_MUNICIPIOS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>

                  {/* Servicio de interés */}
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-3">{t('contact.serviceInterest')} <span className="text-orange-500">*</span></p>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICE_OPTION_KEYS.map(key => (
                        <button
                          key={key} type="button" onClick={() => toggleServiceKey(key)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm text-left ${
                            selectedServiceKeys.includes(key)
                              ? 'border-[#F37021] bg-orange-50 text-[#F37021] font-semibold'
                              : 'border-gray-200 bg-white text-slate-600 hover:border-orange-300'
                          }`}
                        >
                          <span className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedServiceKeys.includes(key) ? 'border-[#F37021] bg-[#F37021]' : 'border-gray-300 bg-white'}`}>
                            {selectedServiceKeys.includes(key) && (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            )}
                          </span>
                          <span>{t(`serviceOptions.${key}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volumen + Frecuencia */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('contact.volumeLabel')}</label>
                      <select name="volumen" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-sm text-slate-600">
                        <option value="">{t('contact.selectPlaceholder')}</option>
                        {VOLUME_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('contact.frequencyLabel')}</label>
                      <select name="frecuencia" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-sm text-slate-600">
                        <option value="">{t('contact.selectPlaceholder')}</option>
                        {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <textarea rows="3" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all font-medium text-sm resize-none" name="mensaje" placeholder={t('contact.messagePlaceholder')}></textarea>

                  {/* ── CONSENTIMIENTOS (TCPA) ─────────────────────────── */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    {/* T&C — OBLIGATORIO */}
                    <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${termsAccepted ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-200'}`}>
                      <span
                        onClick={() => setTermsAccepted(v => !v)}
                        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${termsAccepted ? 'border-[#F37021] bg-[#F37021]' : 'border-gray-300 bg-white'}`}
                      >
                        {termsAccepted && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </span>
                      <span className="text-xs text-slate-600 leading-relaxed">
                        {t('contact.termsText')}{' '}
                        <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-[#F37021] font-bold underline" onClick={e => e.stopPropagation()}>
                          {t('contact.termsLink')}
                        </a>{' '}
                        {t('contact.andThe')}{' '}
                        <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-[#F37021] font-bold underline" onClick={e => e.stopPropagation()}>
                          {t('contact.privacyLink')}
                        </a>
                        . <span className="text-orange-500 font-bold">*</span>
                      </span>
                    </label>

                    {/* SMS — OPCIONAL / SIN PREMARCAR */}
                    <label className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all ${smsConsent ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50 hover:border-green-200'}`}>
                      <span
                        onClick={() => setSmsConsent(v => !v)}
                        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${smsConsent ? 'border-green-600 bg-green-600' : 'border-gray-300 bg-white'}`}
                      >
                        {smsConsent && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </span>
                      <span className="text-xs text-slate-500 leading-relaxed">
                        {t('contact.smsConsent')}{' '}
                        <span className="text-slate-400 italic">{t('contact.smsOptional')}</span>
                      </span>
                    </label>
                  </div>

                  {/* Botón de envío */}
                  <button
                    type="submit"
                    disabled={formStatus === 'submitting' || !termsAccepted || selectedServiceKeys.length === 0}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                      formStatus === 'success' ? 'bg-emerald-500 text-white' :
                      formStatus === 'error'   ? 'bg-red-500 text-white' :
                      'bg-slate-900 text-white hover:bg-[#F37021]'
                    }`}
                  >
                    {formStatus === 'idle'       && t('contact.submitIdle')}
                    {formStatus === 'submitting' && t('contact.submitLoading')}
                    {formStatus === 'success'    && t('contact.submitSuccess')}
                    {formStatus === 'error'      && t('contact.submitError')}
                  </button>

                  {!termsAccepted && (
                    <p className="text-center text-xs text-red-500 font-medium">
                      {t('contact.termsRequired')}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

            {/* Col 1: Brand */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex items-center gap-3">
                <LogoSVG accentColor={BRAND_COLORS.ORANGE} size={36} />
                <span className="font-black text-xl tracking-tighter">ADVANCE GROUP</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{t('footer.description')}</p>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t('footer.contact')}</p>
                <a href="tel:7876539000" className="text-sm text-slate-300 hover:text-[#F37021] transition-colors block">787-653-9000</a>
                <a href="mailto:legal@advancegrouppr.com" className="text-sm text-slate-300 hover:text-[#F37021] transition-colors block">legal@advancegrouppr.com</a>
                <p className="text-xs text-slate-500">Puerto Rico #1, Bo. Km 29.4, Caguas, PR 00725</p>
              </div>
            </div>

            {/* Col 2: Company */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t('footer.company')}</p>
              <ul className="space-y-3">
                <li><button onClick={() => setActiveSection('home')} className="text-sm text-slate-400 hover:text-white transition-colors">{t('footer.whoWeAre')}</button></li>
                <li><button onClick={() => setActiveSection('services')} className="text-sm text-slate-400 hover:text-white transition-colors">{t('nav.solutions')}</button></li>
                <li><button onClick={() => setActiveSection('contact')} className="text-sm text-slate-400 hover:text-white transition-colors">{t('footer.careers')}</button></li>
              </ul>
              <div className="pt-4 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t('footer.social')}</p>
                <a href="https://www.linkedin.com/company/advance-group-pr" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors block">LinkedIn</a>
                <a href="https://www.instagram.com/advancegrouppr" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-white transition-colors block">Instagram</a>
              </div>
            </div>

            {/* Col 3: Legal */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t('footer.legalTitle')}</p>
              <ul className="space-y-3">
                <li><a href="/terminos" className="text-sm text-slate-400 hover:text-white transition-colors">{t('footer.terms')}</a></li>
                <li><a href="/privacidad" className="text-sm text-slate-400 hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="/cookies" className="text-sm text-slate-400 hover:text-white transition-colors">{t('footer.cookies')}</a></li>
                <li><a href="/politica-sms" className="text-sm text-slate-400 hover:text-white transition-colors">{t('footer.smsPolicy')}</a></li>
                <li><a href="/email-marketing" className="text-sm text-slate-400 hover:text-white transition-colors">{t('footer.emailPolicy')}</a></li>
              </ul>
            </div>

            {/* Col 4: Puerto Rico + Licenses */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t('footer.puertoRico')}</p>
              <p className="text-sm text-slate-400">{t('footer.serviceGuarantee')}</p>
              <div className="pt-4 space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">{t('footer.licensesTitle')}</p>
                <p className="text-xs text-slate-500 italic">{t('footer.licensesPlaceholder')}</p>
              </div>
            </div>
          </div>

          {/* EEO Statement */}
          <div className="border-t border-slate-800 pt-8 mb-6">
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
              <span className="font-bold text-slate-400">{t('footer.eeoTitle')}:</span>{' '}{t('footer.eeoText')}
            </p>
          </div>

          {/* Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-slate-800 pt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('footer.copyright')}</p>
            <p className="text-xs text-slate-600">{t('footer.poweredBy')} <span className="text-slate-500">{t('footer.poweredByCompany')}</span></p>
          </div>
        </div>
      </footer>

      <CookieBanner />

      {/* SERVICE MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden relative flex flex-col">
            <button onClick={() => setSelectedService(null)} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all z-10">
              <X size={24} />
            </button>
            <div className="overflow-y-auto p-12">
              <div className="grid md:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div className="space-y-6">
                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-[0.15em] ${BUSINESS_LINES[selectedService.line.toUpperCase()].bg} ${BUSINESS_LINES[selectedService.line.toUpperCase()].color}`}>
                      <LogoSVG accentColor={BUSINESS_LINES[selectedService.line.toUpperCase()].accent} size={24} />
                      {t(`businessLines.${selectedService.line}.name`)}
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black leading-none tracking-tight text-slate-900">{selectedService.title}</h3>
                    <p className="text-slate-500 text-xl font-medium leading-relaxed">{selectedService.description}</p>
                  </div>
                  <div className="space-y-6">
                    <p className="font-black text-xs text-slate-400 uppercase tracking-[0.2em]">{t('services.valueTitle')}</p>
                    <ul className="space-y-4">
                      {(t(`serviceBenefits.${selectedService.id}`, { returnObjects: true, defaultValue: t('services.defaultBenefits', { returnObjects: true }) }) || []).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-4 text-slate-700 font-bold">
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                            <CheckCircle2 className="text-[#F37021]" size={14} />
                          </div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => { setSelectedService(null); setActiveSection('contact'); }} className="w-full py-5 bg-[#F37021] text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-900 transition-all shadow-2xl shadow-orange-500/20">
                    {t('services.speakSpecialistCta')}
                  </button>
                </div>
                <div className="bg-slate-50 rounded-[2.5rem] p-10 space-y-8 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Zap className="text-[#F37021] fill-[#F37021]" size={24} />
                    <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">{t('services.solution360Title')}</h4>
                  </div>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed italic">"{t('services.solution360Quote')}"</p>
                  <div className="space-y-4">
                    {selectedService.related.map(id => {
                      const rel = getServiceById(id);
                      if (!rel) return null;
                      const line = BUSINESS_LINES[rel.line.toUpperCase()];
                      return (
                        <div key={id} onClick={() => setSelectedService(rel)} className="bg-white p-5 rounded-3xl border border-transparent hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer group flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${line.bg}`}>
                            {React.createElement(line.icon, { className: `w-6 h-6 ${line.color}` })}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] leading-none mb-1.5">{t(`businessLines.${rel.line}.name`)}</p>
                            <p className="font-black text-slate-900 truncate group-hover:text-[#F37021] transition-colors">{rel.title}</p>
                          </div>
                          <ChevronRight className="ml-auto text-slate-300 group-hover:text-[#F37021] group-hover:translate-x-1 transition-all" size={20} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
