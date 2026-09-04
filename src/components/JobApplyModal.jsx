import React from 'react';
import { useTranslation } from 'react-i18next';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase.js';

// Detalle de una vacante + formulario de aplicación, TODO dentro de la web
// pública (el aplicante nunca entra al ERP). Escribe a orgs/org1/job_applicants
// con el mismo shape que lee /recruiting del ERP, y sube el CV a
// applicants/{id}/ (la regla de Storage permite subida pública ≤8MB).

const ORG_ID = 'org1';
const MAX_CV_MB = 8;
const CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const JOB_TYPE_KEYS = {
  tiempo_completo: 'jobs.typeFullTime',
  parcial: 'jobs.typePartTime',
  contrato: 'jobs.typeContract',
};

const cmsText = (item, base, lang) => {
  const v = item[`${base}_${lang}`];
  if (typeof v === 'string' && v.trim()) return v;
  const other = item[`${base}_${lang === 'en' ? 'es' : 'en'}`];
  return typeof other === 'string' && other.trim() ? other : '';
};

/** Nombre de archivo seguro para Storage (misma regla que el ERP). */
function safeFileName(name) {
  const dot = name.lastIndexOf('.');
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : '';
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'cv'}${ext}`;
}

/** Negrita **texto** sobre texto plano. */
function inline(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} className="font-bold text-slate-900">{p.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{p}</React.Fragment>
    ),
  );
}

/** Render mínimo del Markdown del CMS: ## títulos, - listas, párrafos. */
function Body({ text }) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let para = [];
  let list = [];
  const flushPara = () => {
    if (para.length) {
      blocks.push(<p key={blocks.length} className="my-3 leading-relaxed text-slate-600">{inline(para.join(' '))}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={blocks.length} className="my-3 list-disc pl-6 space-y-1 text-slate-600">
          {list.map((li, i) => <li key={i}>{inline(li)}</li>)}
        </ul>,
      );
      list = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); continue; }
    if (/^#{1,3}\s/.test(line)) {
      flushPara(); flushList();
      blocks.push(<h3 key={blocks.length} className="mt-6 mb-2 text-lg font-black text-slate-900">{line.replace(/^#{1,3}\s/, '')}</h3>);
      continue;
    }
    if (/^[-*]\s/.test(line)) { flushPara(); list.push(line.replace(/^[-*]\s/, '')); continue; }
    flushList(); para.push(line);
  }
  flushPara(); flushList();
  return <div>{blocks}</div>;
}

const EMPTY = { firstName: '', lastName: '', email: '', phone: '', linkedin: '', coverLetter: '' };
const NOT_SAY = 'prefer_not_to_say';
const EMPTY_EEO = { gender: NOT_SAY, ethnicity: NOT_SAY, veteranStatus: NOT_SAY, disabilityStatus: NOT_SAY };

export default function JobApplyModal({ job, lang, onClose }) {
  const { t } = useTranslation();
  const [form, setForm] = React.useState(EMPTY);
  const [eeo, setEeo] = React.useState(EMPTY_EEO);
  const [file, setFile] = React.useState(null);
  const [error, setError] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  if (!job) return null;

  const title = cmsText(job, 'title', lang);
  const body = cmsText(job, 'body', lang);
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setE = (k) => (e) => setEeo((p) => ({ ...p, [k]: e.target.value }));

  const pickFile = (e) => {
    const f = e.target.files && e.target.files[0];
    setError('');
    if (!f) { setFile(null); return; }
    if (!CV_TYPES.includes(f.type)) { setError(t('jobs.errFileType')); e.target.value = ''; return; }
    if (f.size > MAX_CV_MB * 1024 * 1024) { setError(t('jobs.errFileSize', { mb: MAX_CV_MB })); e.target.value = ''; return; }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError(t('jobs.errRequired'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError(t('jobs.errEmail'));
      return;
    }
    setSending(true);
    try {
      // El id se genera ANTES: es el path del CV y el id del documento.
      const applicantId = doc(collection(db, 'orgs', ORG_ID, 'job_applicants')).id;

      let resumeUrl, resumePath;
      if (file) {
        const path = `applicants/${applicantId}/${safeFileName(file.name)}`;
        const snap = await uploadBytes(ref(storage, path), file, { contentType: file.type });
        resumeUrl = await getDownloadURL(snap.ref);
        resumePath = path;
      }

      // Mismo shape que el formulario del ERP; SIN undefined (Firestore lo rechaza).
      const payload = {
        orgId: ORG_ID,
        jobPostingId: job.id,
        jobTitle: title,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        stage: 'applied',
        source: 'web',
        appliedAt: serverTimestamp(),
      };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      if (form.linkedin.trim()) payload.linkedin = form.linkedin.trim();
      if (form.coverLetter.trim()) payload.coverLetter = form.coverLetter.trim();
      if (resumeUrl) payload.resumeUrl = resumeUrl;
      if (resumePath) payload.resumePath = resumePath;
      const eeoClean = {};
      for (const k of Object.keys(eeo)) if (eeo[k] !== NOT_SAY) eeoClean[k] = eeo[k];
      if (Object.keys(eeoClean).length) payload.eeo = eeoClean;

      await setDoc(doc(db, 'orgs', ORG_ID, 'job_applicants', applicantId), payload);
      setDone(true);
    } catch (err) {
      console.warn('[jobs] no se pudo enviar la aplicación:', err && err.message ? err.message : err);
      setError(t('jobs.errSend'));
    } finally {
      setSending(false);
    }
  };

  const input = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F37021]/40 focus:border-[#F37021]';
  const label = 'block text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5';

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 md:p-8" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="relative w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl my-4" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t('jobs.close')} className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>

        <div className="p-6 md:p-10">
          {/* Encabezado */}
          <div className="w-12 h-1.5 bg-[#F37021] rounded-full" />
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 pr-10">{title}</h2>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-slate-500">
            {job.department && <span className="rounded-full bg-slate-100 px-3 py-1">{job.department}</span>}
            {job.location && <span className="rounded-full bg-slate-100 px-3 py-1">{job.location}</span>}
            {job.jobType && <span className="rounded-full bg-orange-50 px-3 py-1 text-[#F37021]">{t(JOB_TYPE_KEYS[job.jobType] || 'jobs.typeFullTime')}</span>}
          </div>

          {/* Descripción y requisitos */}
          {body && <div className="mt-6"><Body text={body} /></div>}
          {job.requirements && (
            <div className="mt-6">
              <h3 className="text-lg font-black text-slate-900">{t('jobs.requirements')}</h3>
              <div className="mt-2 whitespace-pre-wrap leading-relaxed text-slate-600">{job.requirements}</div>
            </div>
          )}

          {/* Formulario / confirmación */}
          <div className="mt-10 rounded-[1.5rem] border border-slate-100 bg-slate-50 p-6 md:p-8">
            {done ? (
              <div className="text-center py-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <p className="mt-4 text-2xl font-black text-slate-900">{t('jobs.doneTitle')}</p>
                <p className="mt-2 text-slate-600">{t('jobs.doneBody', { title })}</p>
                <button type="button" onClick={onClose} className="mt-6 rounded-full bg-[#F37021] px-6 py-3 font-black text-white hover:opacity-90 transition-opacity">{t('jobs.close')}</button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h3 className="text-xl font-black text-slate-900">{t('jobs.applyTitle')}</h3>
                <p className="mt-1 text-sm text-slate-500">{t('jobs.applyHint')}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div><label className={label}>{t('jobs.firstName')} *</label><input className={input} value={form.firstName} onChange={set('firstName')} autoComplete="given-name" /></div>
                  <div><label className={label}>{t('jobs.lastName')} *</label><input className={input} value={form.lastName} onChange={set('lastName')} autoComplete="family-name" /></div>
                  <div><label className={label}>{t('jobs.email')} *</label><input className={input} type="email" value={form.email} onChange={set('email')} autoComplete="email" /></div>
                  <div><label className={label}>{t('jobs.phone')}</label><input className={input} type="tel" value={form.phone} onChange={set('phone')} placeholder="787-000-0000" autoComplete="tel" /></div>
                  <div className="sm:col-span-2"><label className={label}>{t('jobs.linkedin')}</label><input className={input} value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/..." /></div>
                  <div className="sm:col-span-2"><label className={label}>{t('jobs.coverLetter')}</label><textarea className={input} rows={4} value={form.coverLetter} onChange={set('coverLetter')} placeholder={t('jobs.coverLetterHint')} /></div>
                  <div className="sm:col-span-2">
                    <label className={label}>{t('jobs.cv')}</label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 hover:border-[#F37021]/60 transition-colors">
                      <span className="text-sm font-semibold text-slate-600">{file ? file.name : t('jobs.cvHint', { mb: MAX_CV_MB })}</span>
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={pickFile} />
                    </label>
                  </div>
                </div>

                {/* EEO voluntario */}
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-black text-slate-800">{t('jobs.eeoTitle')}</p>
                  <p className="mt-1 text-xs text-slate-500">{t('jobs.eeoHint')}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div><label className={label}>{t('jobs.eeoGender')}</label>
                      <select className={input} value={eeo.gender} onChange={setE('gender')}>
                        <option value={NOT_SAY}>{t('jobs.eeoNotSay')}</option><option value="female">{t('jobs.eeoFemale')}</option><option value="male">{t('jobs.eeoMale')}</option><option value="non_binary">{t('jobs.eeoNonBinary')}</option>
                      </select></div>
                    <div><label className={label}>{t('jobs.eeoEthnicity')}</label>
                      <select className={input} value={eeo.ethnicity} onChange={setE('ethnicity')}>
                        <option value={NOT_SAY}>{t('jobs.eeoNotSay')}</option><option value="hispanic_latino">{t('jobs.eeoHispanic')}</option><option value="not_hispanic_latino">{t('jobs.eeoNotHispanic')}</option>
                      </select></div>
                    <div><label className={label}>{t('jobs.eeoVeteran')}</label>
                      <select className={input} value={eeo.veteranStatus} onChange={setE('veteranStatus')}>
                        <option value={NOT_SAY}>{t('jobs.eeoNotSay')}</option><option value="veteran">{t('jobs.eeoIsVeteran')}</option><option value="not_veteran">{t('jobs.eeoNotVeteran')}</option>
                      </select></div>
                    <div><label className={label}>{t('jobs.eeoDisability')}</label>
                      <select className={input} value={eeo.disabilityStatus} onChange={setE('disabilityStatus')}>
                        <option value={NOT_SAY}>{t('jobs.eeoNotSay')}</option><option value="yes">{t('jobs.yes')}</option><option value="no">{t('jobs.no')}</option>
                      </select></div>
                  </div>
                </div>

                {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

                <div className="mt-6 flex justify-end">
                  <button type="submit" disabled={sending} className="rounded-full bg-[#F37021] px-8 py-3 font-black text-white hover:opacity-90 transition-opacity disabled:opacity-60">
                    {sending ? t('jobs.sending') : t('jobs.submit')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
