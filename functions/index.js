/**
 * ogEmpleos — sirve advancegrouppr.com/empleos y /empleos/{slug} con las
 * etiquetas que leen las redes sociales y Google.
 *
 * Por qué existe: la web es una aplicación de una sola página; Facebook,
 * LinkedIn, WhatsApp y Google NO ejecutan JavaScript, así que veían siempre
 * la misma vista previa genérica. Firebase Hosting reescribe /empleos/** a
 * esta función, que toma el index.html de la web (bundled en el deploy),
 * le inyecta título, descripción, imagen y un JSON-LD JobPosting según la
 * vacante, y lo devuelve. Para la persona real la página sigue siendo la
 * misma app: el HTML es el mismo, solo con más etiquetas en el <head>.
 *
 * Los datos salen del endpoint PÚBLICO del SaaS (solo vacantes publicadas):
 *   GET {ERP_API_BASE}/api/public/empleos/{slug}
 */
const { onRequest } = require('firebase-functions/v2/https');
const fs = require('node:fs');
const path = require('node:path');

const SITE = 'https://advancegrouppr.com';
const ERP_API_BASE = process.env.ERP_API_BASE || 'https://app.advancegrouppr.com';
const DEFAULT_IMAGE = `${SITE}/og-empleos.png`;
const TEMPLATE_PATH = path.join(__dirname, 'index.template.html');

let templateCache = null;
function template() {
  if (templateCache) return templateCache;
  templateCache = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  return templateCache;
}

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const JOB_TYPE = { tiempo_completo: 'FULL_TIME', parcial: 'PART_TIME', contrato: 'CONTRACTOR' };
const JOB_TYPE_ES = { tiempo_completo: 'Tiempo completo', parcial: 'Parcial', contrato: 'Contrato' };

async function fetchJob(slug) {
  try {
    const r = await fetch(`${ERP_API_BASE}/api/public/empleos/${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    console.warn('[ogEmpleos] no se pudo leer la vacante:', e && e.message);
    return null;
  }
}

function headFor({ title, description, url, image, jobLd }) {
  const tags = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Advance Group" />`,
    `<meta property="og:locale" content="es_PR" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
  ];
  if (jobLd) tags.push(`<script type="application/ld+json">${JSON.stringify(jobLd).replace(/</g, '\\u003c')}</script>`);
  return tags.join('\n    ');
}

function render(head) {
  let html = template();
  // Quita el <title> y las etiquetas por defecto (la función pone las suyas).
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
  html = html.replace(/<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, '');
  html = html.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '');
  return html.replace('</head>', `    ${head}\n  </head>`);
}

exports.ogEmpleos = onRequest({ region: 'us-central1', memory: '256MiB', maxInstances: 5 }, async (req, res) => {
  const m = req.path.match(/^\/empleos\/?([^/]*)\/?$/);
  const slug = m ? decodeURIComponent(m[1] || '') : '';
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  res.set('Content-Type', 'text/html; charset=utf-8');

  if (!slug) {
    return res.status(200).send(render(headFor({
      title: 'Empleos en Advance Group — Puerto Rico',
      description: 'Vacantes abiertas en Advance Group: logística, almacenaje, ventas y más. Aplica en línea.',
      url: `${SITE}/empleos`,
      image: DEFAULT_IMAGE,
    })));
  }

  const job = await fetchJob(slug);
  if (!job || job.jobStatus === 'cerrada') {
    // Sin vacante publicada: vista previa genérica, y la app decide qué mostrar.
    return res.status(200).send(render(headFor({
      title: 'Empleos en Advance Group — Puerto Rico',
      description: 'Vacantes abiertas en Advance Group. Aplica en línea.',
      url: `${SITE}/empleos`,
      image: DEFAULT_IMAGE,
    })));
  }

  const url = `${SITE}/empleos/${encodeURIComponent(job.slug)}`;
  const where = [job.department, job.location].filter(Boolean).join(' · ');
  const description = job.excerpt || `${job.title}${where ? ` — ${where}` : ''}. Aplica en línea en Advance Group.`;
  const jobLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.excerpt || job.title,
    datePosted: job.publishedAt || undefined,
    employmentType: JOB_TYPE[job.jobType] || undefined,
    hiringOrganization: { '@type': 'Organization', name: 'Advance Group', sameAs: SITE, logo: DEFAULT_IMAGE },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: job.location || 'Puerto Rico', addressRegion: 'PR', addressCountry: 'US' } },
    directApply: true,
    url,
  };
  Object.keys(jobLd).forEach((k) => jobLd[k] === undefined && delete jobLd[k]);

  return res.status(200).send(render(headFor({
    title: `${job.title} — Empleo en Advance Group${job.jobType ? ` (${JOB_TYPE_ES[job.jobType] || ''})` : ''}`,
    description,
    url,
    image: job.image || DEFAULT_IMAGE,
    jobLd,
  })));
});
