// Mapa URL ⇄ vista de la web pública. La URL es la fuente de verdad: cada
// sección y sub-pestaña tiene su propia ruta (compartible y medible), y cada
// vacante su enlace directo /empleos/{slug}.
//
//   /                     → home
//   /soluciones           → services
//   /contacto             → contact
//   /nosotros             → about · pestaña "about"
//   /nosotros/equipo      → about · team
//   /nosotros/blog        → about · blog
//   /nosotros/noticias    → about · news
//   /nosotros/eventos     → about · events
//   /empleos              → about · jobs
//   /empleos/{slug}       → about · jobs + vacante abierta
//
// Funciones puras (sin React) para poder probarlas en Node.

const SECTION_PATHS = { home: '/', services: '/soluciones', contact: '/contacto', about: '/nosotros' };
const TAB_SEGMENTS = { team: 'equipo', blog: 'blog', news: 'noticias', events: 'eventos' };

const strip = (p) => String(p || '/').replace(/\/+$/, '') || '/';

/** De un pathname a { section, tab, jobSlug }. Rutas desconocidas → home. */
export function pathToView(pathname) {
  const path = strip(decodeURIComponent(pathname));
  if (path === '/') return { section: 'home', tab: 'about', jobSlug: null };
  if (path === '/soluciones') return { section: 'services', tab: 'about', jobSlug: null };
  if (path === '/contacto') return { section: 'contact', tab: 'about', jobSlug: null };
  if (path === '/nosotros') return { section: 'about', tab: 'about', jobSlug: null };
  const tabMatch = path.match(/^\/nosotros\/([a-z]+)$/);
  if (tabMatch) {
    const tab = Object.keys(TAB_SEGMENTS).find((k) => TAB_SEGMENTS[k] === tabMatch[1]);
    if (tab) return { section: 'about', tab, jobSlug: null };
  }
  if (path === '/empleos') return { section: 'about', tab: 'jobs', jobSlug: null };
  const jobMatch = path.match(/^\/empleos\/([^/]+)$/);
  if (jobMatch) return { section: 'about', tab: 'jobs', jobSlug: jobMatch[1] };
  return { section: 'home', tab: 'about', jobSlug: null };
}

/** De una vista a su pathname. */
export function viewToPath({ section, tab = 'about', jobSlug = null }) {
  if (section !== 'about') return SECTION_PATHS[section] || '/';
  if (tab === 'jobs') return jobSlug ? `/empleos/${encodeURIComponent(jobSlug)}` : '/empleos';
  if (tab === 'about') return '/nosotros';
  return TAB_SEGMENTS[tab] ? `/nosotros/${TAB_SEGMENTS[tab]}` : '/nosotros';
}

/** Identificador de una vacante en la URL: su slug, o su id si no tiene. */
export const jobSlugOf = (job) => (job && (job.slug || job.id)) || null;
