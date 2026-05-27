import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, MessageCircle, Lock, Edit2, Trash2, X, Check,
  Settings, LogOut, Search, Eye, EyeOff, Copy,
  Package, Sparkles, AlertCircle, ChevronLeft, ChevronRight,
  Star, ArrowUp, ArrowDown, Image as ImageIcon, Images
} from 'lucide-react';
import { storageGet, storageSet, isConfigured } from './storage.js';

/* ============================================================
   STORAGE HELPERS
   ============================================================ */
const CONFIG_KEY = 'garage_config_v1';
const ITEMS_KEY = 'garage_items_v1';

async function loadConfig() {
  try {
    const r = await storageGet(CONFIG_KEY);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function saveConfig(cfg) {
  try { await storageSet(CONFIG_KEY, JSON.stringify(cfg)); return true; }
  catch (e) { console.error(e); return false; }
}
async function loadItems() {
  try {
    const r = await storageGet(ITEMS_KEY);
    if (!r) return [];
    const items = JSON.parse(r.value);
    return items.map(it => {
      if (Array.isArray(it.photos)) return it;
      if (it.photo) return { ...it, photos: [it.photo], photo: undefined };
      return { ...it, photos: [] };
    });
  } catch { return []; }
}
async function saveItems(items) {
  try { await storageSet(ITEMS_KEY, JSON.stringify(items)); return true; }
  catch (e) { console.error(e); return false; }
}

const DEFAULT_CATEGORIES = ['Muebles', 'Electrónica', 'Cocina', 'Ropa', 'Libros', 'Decoración', 'Deporte', 'Otros'];
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,400;1,9..144,600&family=DM+Sans:wght@400;500;600;700&display=swap');`;

/* ============================================================
   BANNER: BACKEND PENDIENTE DE CONFIGURAR
   ============================================================ */
function PendingSetupBanner() {
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', backgroundColor: '#F5EFE4' }} className="min-h-screen flex items-center justify-center p-6">
      <style>{`${FONT_IMPORT} .serif{font-family:'Fraunces',serif;}`}</style>
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-6">
          <Settings className="w-8 h-8 text-orange-700" />
        </div>
        <h1 className="serif text-3xl text-stone-900 mb-3">Backend pendiente</h1>
        <p className="text-stone-600 mb-6 leading-relaxed">
          La app está desplegada pero necesita conectarse a Supabase para guardar datos.
          Añade las variables de entorno en Vercel y haz un redeploy.
        </p>
        <div className="bg-stone-900 text-stone-100 rounded-xl p-5 text-left text-sm font-mono space-y-1.5 mb-6">
          <p className="text-stone-400 text-xs uppercase tracking-wider mb-3">Vercel → Settings → Environment Variables</p>
          <p><span className="text-orange-400">VITE_SUPABASE_URL</span>=https://xxxx.supabase.co</p>
          <p><span className="text-orange-400">VITE_SUPABASE_ANON_KEY</span>=eyJ...</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 text-left text-sm space-y-2">
          <p className="font-semibold text-stone-800 mb-3">SQL a ejecutar en Supabase → SQL Editor:</p>
          <pre className="text-stone-600 text-xs overflow-x-auto">{`CREATE TABLE kv_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_rw" ON kv_store
  FOR ALL USING (true) WITH CHECK (true);`}</pre>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   APP RAÍZ
   ============================================================ */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [items, setItems] = useState([]);
  const [view, setView] = useState('public');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isConfigured()) { setLoading(false); return; }
    (async () => {
      const c = await loadConfig();
      const i = await loadItems();
      setConfig(c); setItems(i); setLoading(false);
    })();
  }, []);

  const refreshItems = async () => setItems(await loadItems());
  const refreshConfig = async () => setConfig(await loadConfig());

  if (!isConfigured()) return <PendingSetupBanner />;

  if (loading) {
    return (
      <div style={{ fontFamily: 'DM Sans, sans-serif' }} className="min-h-screen flex items-center justify-center bg-stone-100">
        <style>{FONT_IMPORT}</style>
        <div className="text-stone-600 text-sm tracking-widest uppercase">Cargando…</div>
      </div>
    );
  }

  if (!config) return <SetupWizard onComplete={async (c) => { await saveConfig(c); setConfig(c); }} />;

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', backgroundColor: '#F5EFE4' }} className="min-h-screen text-stone-900">
      <style>{`
        ${FONT_IMPORT}
        .serif { font-family: 'Fraunces', serif; }
        .fade-in { animation: fadeIn 0.5s ease both; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        .stagger > * { animation: fadeIn 0.6s ease both; }
        .stagger > *:nth-child(1) { animation-delay: 0.05s; }
        .stagger > *:nth-child(2) { animation-delay: 0.1s; }
        .stagger > *:nth-child(3) { animation-delay: 0.15s; }
        .stagger > *:nth-child(4) { animation-delay: 0.2s; }
        .stagger > *:nth-child(5) { animation-delay: 0.25s; }
        .stagger > *:nth-child(6) { animation-delay: 0.3s; }
        .stagger > *:nth-child(7) { animation-delay: 0.35s; }
        .stagger > *:nth-child(8) { animation-delay: 0.4s; }
        .stagger > *:nth-child(n+9) { animation-delay: 0.45s; }
        .grain { background-image: radial-gradient(circle at 1px 1px, rgba(28,25,23,0.04) 1px, transparent 0); background-size: 14px 14px; }
        .ticker-stamp { transform: rotate(-12deg); }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {view === 'public' && (
        <PublicView items={items} config={config} onAdminClick={() => setShowLogin(true)} />
      )}
      {view === 'admin' && (
        <AdminPanel
          items={items} config={config}
          onItemsChange={refreshItems}
          onConfigChange={refreshConfig}
          onLogout={() => setView('public')}
        />
      )}

      {showLogin && (
        <AdminLogin
          password={config.adminPassword}
          onSuccess={() => { setShowLogin(false); setView('admin'); }}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}

/* ============================================================
   SETUP WIZARD
   ============================================================ */
function SetupWizard({ onComplete }) {
  const [whatsapp, setWhatsapp] = useState('+34');
  const [bizum, setBizum] = useState('+34');
  const [title, setTitle] = useState('Venta Garage');
  const [subtitle, setSubtitle] = useState('Nos mudamos. Todo tiene que volar.');
  const [sellerName, setSellerName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const submit = () => {
    if (!whatsapp.match(/^\+?\d{8,}$/)) return setError('Introduce un número de WhatsApp válido con prefijo (ej: +34600123456)');
    if (!bizum.match(/^\+?\d{8,}$/)) return setError('Introduce un número de Bizum válido');
    if (password.length < 4) return setError('La contraseña de admin debe tener al menos 4 caracteres');
    onComplete({
      whatsapp: whatsapp.replace(/\s/g, ''),
      bizum: bizum.replace(/\s/g, ''),
      title, subtitle, sellerName,
      adminPassword: password,
      currency: '€',
      categories: DEFAULT_CATEGORIES,
    });
  };

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', backgroundColor: '#F5EFE4' }} className="min-h-screen flex items-center justify-center p-6">
      <style>{`${FONT_IMPORT} .serif{font-family:'Fraunces',serif;}`}</style>
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <Sparkles className="w-8 h-8 mx-auto text-orange-700 mb-3" />
          <h1 className="serif text-4xl text-stone-900 mb-2">Configuración inicial</h1>
          <p className="text-stone-600 text-sm">Rellena estos datos una sola vez. Podrás cambiarlos después.</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-7 space-y-5 shadow-sm">
          <Field label="Título de la venta">
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
          </Field>
          <Field label="Subtítulo / mensaje" hint="Aparece en grande en la cabecera">
            <input value={subtitle} onChange={e=>setSubtitle(e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
          </Field>
          <Field label="Tu nombre (opcional)">
            <input value={sellerName} onChange={e=>setSellerName(e.target.value)} placeholder="María y Pablo" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
          </Field>
          <Field label="WhatsApp" hint="Con prefijo internacional, sin espacios. Ej: +34600123456">
            <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
          </Field>
          <Field label="Número de Bizum" hint="Suele ser tu móvil.">
            <input value={bizum} onChange={e=>setBizum(e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
          </Field>
          <Field label="Contraseña de administrador" hint="Necesaria para añadir, editar o marcar artículos como vendidos">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e=>setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700 pr-10"
              />
              <button onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900">
                {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </Field>
          {error && (
            <div className="flex items-start gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0"/>{error}
            </div>
          )}
          <button onClick={submit} className="w-full bg-stone-900 hover:bg-orange-800 text-stone-50 py-3 rounded-lg font-medium transition-colors">
            Crear mi venta
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-stone-500 mt-1.5">{hint}</p>}
    </div>
  );
}

/* ============================================================
   VISTA PÚBLICA
   ============================================================ */
function PublicView({ items, config, onAdminClick }) {
  const [activeCat, setActiveCat] = useState('Todo');
  const [showSold, setShowSold] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = useMemo(() => items.filter(it => {
    if (activeCat !== 'Todo' && it.category !== activeCat) return false;
    if (!showSold && it.sold) return false;
    if (search && !`${it.name} ${it.description}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, activeCat, showSold, search]);

  const total = items.length;
  const available = items.filter(i => !i.sold).length;

  return (
    <div>
      <header className="border-b border-stone-300 bg-[#F5EFE4]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-stone-50" />
            </div>
            <span className="serif text-lg font-semibold">{config.title}</span>
          </div>
          <button onClick={onAdminClick} className="text-stone-500 hover:text-stone-900 transition-colors" title="Admin">
            <Lock size={16} />
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-5 pt-12 pb-10 grain">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <p className="text-orange-800 font-medium uppercase tracking-[0.2em] text-xs mb-4">
              {config.sellerName ? `Por ${config.sellerName} —` : ''} {available} de {total} disponibles
            </p>
            <h1 className="serif text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight max-w-3xl">
              {config.subtitle.split(' ').map((w, i) => (
                <span key={i} className={i % 3 === 2 ? 'italic font-normal text-orange-800' : ''}>{w} </span>
              ))}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-stone-600 text-sm max-w-xs">
              Contacto directo por WhatsApp · Pago vía <span className="font-semibold text-stone-900">Bizum</span> · Recogida en persona
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 mb-8">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto scroll-hide -mx-1 px-1">
            {['Todo', ...config.categories].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCat === cat
                    ? 'bg-stone-900 text-stone-50 border-stone-900'
                    : 'bg-transparent text-stone-700 border-stone-300 hover:border-stone-900'
                }`}
              >{cat}</button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                value={search}
                onChange={e=>setSearch(e.target.value)}
                placeholder="Buscar…"
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-full text-sm focus:outline-none focus:border-orange-700"
              />
            </div>
            <button
              onClick={() => setShowSold(!showSold)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                showSold ? 'bg-transparent text-stone-700 border-stone-300' : 'bg-orange-800 text-stone-50 border-orange-800'
              }`}
            >{showSold ? 'Ocultar vendidos' : 'Solo disponibles'}</button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-stone-300 rounded-2xl">
            <Package className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <p className="text-stone-600">
              {items.length === 0
                ? 'Aún no hay artículos publicados. Entra como admin para añadir el primero.'
                : 'No hay artículos que coincidan con esta búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} currency={config.currency} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-stone-300 bg-[#EFE7D6]">
        <div className="max-w-6xl mx-auto px-5 py-8 text-sm text-stone-600 flex flex-wrap gap-4 justify-between">
          <p>Hecho con cariño antes de la mudanza · {new Date().getFullYear()}</p>
          <p>Pago Bizum · Recogida en persona</p>
        </div>
      </footer>

      {selectedItem && (
        <ItemDetailModal item={selectedItem} config={config} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

/* ============================================================
   TARJETA DE ARTÍCULO
   ============================================================ */
function ItemCard({ item, currency, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-900 hover:shadow-lg transition-all group relative"
    >
      <div className="aspect-square bg-stone-100 relative overflow-hidden">
        {item.photos?.[0] ? (
          <img src={item.photos[0]} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <ImageIcon size={40} />
          </div>
        )}
        {item.photos?.length > 1 && !item.sold && (
          <div className="absolute top-2 right-2 bg-stone-900/80 text-stone-50 text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <Images size={11}/> {item.photos.length}
          </div>
        )}
        {item.sold && (
          <>
            <div className="absolute inset-0 bg-stone-900/40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="ticker-stamp border-4 border-red-700 text-red-700 serif italic font-bold text-2xl px-4 py-1 bg-stone-50/90">
                Vendido
              </div>
            </div>
          </>
        )}
        <div className="absolute top-2 left-2 bg-stone-900/80 text-stone-50 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
          {item.category}
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="serif text-lg leading-tight mb-1">{item.name}</h3>
        <p className="text-stone-500 text-xs line-clamp-1">{item.description}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="serif text-xl font-semibold text-orange-800">{item.price}</span>
          <span className="text-stone-500 text-sm">{currency}</span>
        </div>
      </div>
    </button>
  );
}

/* ============================================================
   MODAL DE DETALLE
   ============================================================ */
function ItemDetailModal({ item, config, onClose }) {
  const [copied, setCopied] = useState('');
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = item.photos || [];
  const hasPhotos = photos.length > 0;
  const multiplePhotos = photos.length > 1;

  const waMsg = encodeURIComponent(
    `¡Hola! Te escribo por el artículo "${item.name}" (${item.price}${config.currency}) de tu venta garage. ¿Sigue disponible?`
  );
  const waLink = `https://wa.me/${config.whatsapp.replace(/\D/g, '')}?text=${waMsg}`;

  const copy = (text, kind) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(''), 1800);
    });
  };

  const goPrev = () => setPhotoIdx(prev => (prev - 1 + photos.length) % photos.length);
  const goNext = () => setPhotoIdx(prev => (prev + 1) % photos.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (multiplePhotos && e.key === 'ArrowLeft') goPrev();
      if (multiplePhotos && e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [multiplePhotos, onClose]);

  return (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-6 fade-in" onClick={onClose}>
      <div className="bg-[#F5EFE4] w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-t-3xl md:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <div className="aspect-[4/3] md:aspect-[16/9] bg-stone-200 relative">
            {hasPhotos ? (
              <img src={photos[photoIdx]} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                <ImageIcon size={60} />
              </div>
            )}
            {multiplePhotos && (
              <>
                <button onClick={goPrev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-50/90 hover:bg-stone-50 flex items-center justify-center shadow-md transition-all" aria-label="Foto anterior">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={goNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-50/90 hover:bg-stone-50 flex items-center justify-center shadow-md transition-all" aria-label="Foto siguiente">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-900/80 text-stone-50 text-xs px-3 py-1 rounded-full font-medium">
                  {photoIdx + 1} / {photos.length}
                </div>
              </>
            )}
            {item.sold && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40 pointer-events-none">
                <div className="ticker-stamp border-4 border-red-700 text-red-700 serif italic font-bold text-5xl px-8 py-2 bg-stone-50/90">Vendido</div>
              </div>
            )}
          </div>

          {multiplePhotos && (
            <div className="flex gap-2 px-4 md:px-6 py-3 overflow-x-auto scroll-hide border-b border-stone-200">
              {photos.map((p, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === photoIdx ? 'border-orange-700 scale-105' : 'border-stone-200 opacity-70 hover:opacity-100'}`}>
                  <img src={p} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-50 hover:bg-stone-200 flex items-center justify-center transition-colors z-10">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-orange-800 font-semibold">{item.category}</span>
          <h2 className="serif text-3xl md:text-4xl mt-2 mb-3">{item.name}</h2>
          <p className="text-stone-700 leading-relaxed mb-6 whitespace-pre-wrap">{item.description || 'Sin descripción.'}</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="serif text-5xl font-semibold text-orange-800">{item.price}</span>
            <span className="serif text-2xl text-stone-600">{config.currency}</span>
          </div>

          {!item.sold ? (
            <>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-orange-800 text-stone-50 py-3.5 rounded-xl font-medium transition-colors mb-6">
                <MessageCircle size={18} /> Reservar por WhatsApp
              </a>
              <div className="bg-white border border-stone-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-teal-700 flex items-center justify-center text-stone-50 text-xs font-bold">B</div>
                  <h3 className="serif text-lg">Pago con Bizum</h3>
                </div>
                <p className="text-stone-600 text-sm mb-4">Acuerda primero la compra por WhatsApp. Después envía el pago con estos datos:</p>
                <div className="space-y-2.5">
                  <BizumRow label="Número de teléfono" value={config.bizum} onCopy={() => copy(config.bizum, 'phone')} copied={copied === 'phone'} />
                  <BizumRow label="Importe" value={`${item.price} ${config.currency}`} onCopy={() => copy(String(item.price), 'amount')} copied={copied === 'amount'} />
                  <BizumRow label="Concepto sugerido" value={item.name} onCopy={() => copy(item.name, 'concept')} copied={copied === 'concept'} />
                </div>
                <p className="text-xs text-stone-500 mt-4">ⓘ Bizum se envía desde la app de tu banco, no desde esta web. Tras el pago, avísanos por WhatsApp.</p>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 text-center">
              <p className="serif text-xl mb-1">Este artículo ya está vendido</p>
              <p className="text-sm">Mira los otros artículos disponibles en la página principal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BizumRow({ label, value, onCopy, copied }) {
  return (
    <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">{label}</p>
        <p className="text-stone-900 font-medium truncate">{value}</p>
      </div>
      <button onClick={onCopy} className={`shrink-0 ml-3 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${copied ? 'bg-green-700 text-stone-50' : 'bg-stone-900 text-stone-50 hover:bg-orange-800'}`}>
        {copied
          ? <span className="flex items-center gap-1"><Check size={12}/>Copiado</span>
          : <span className="flex items-center gap-1"><Copy size={12}/>Copiar</span>}
      </button>
    </div>
  );
}

/* ============================================================
   LOGIN ADMIN
   ============================================================ */
function AdminLogin({ password, onSuccess, onCancel }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => {
    if (val === password) onSuccess();
    else { setErr(true); setTimeout(() => setErr(false), 600); }
  };
  return (
    <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in" onClick={onCancel}>
      <div className="bg-[#F5EFE4] rounded-2xl p-7 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} />
          <h3 className="serif text-xl">Acceso administrador</h3>
        </div>
        <input
          type="password" autoFocus value={val}
          onChange={e=>setVal(e.target.value)}
          onKeyDown={e=>e.key==='Enter' && submit()}
          placeholder="Contraseña"
          className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:outline-none ${err ? 'border-red-500 animate-pulse' : 'border-stone-300 focus:border-orange-700'}`}
        />
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-sm">Cancelar</button>
          <button onClick={submit} className="flex-1 py-2.5 rounded-lg bg-stone-900 hover:bg-orange-800 text-stone-50 text-sm font-medium">Entrar</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PANEL ADMIN
   ============================================================ */
function AdminPanel({ items, config, onItemsChange, onConfigChange, onLogout }) {
  const [tab, setTab] = useState('items');
  const [editingItem, setEditingItem] = useState(null);

  return (
    <div>
      <header className="border-b border-stone-300 bg-stone-900 text-stone-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-orange-400" />
            <span className="serif text-lg font-semibold">Panel de administración</span>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-stone-300 hover:text-stone-50">
            <LogOut size={14}/> Salir
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 pt-6">
        <div className="flex gap-2 border-b border-stone-300">
          <TabButton active={tab==='items'} onClick={()=>{setTab('items'); setEditingItem(null);}}>Artículos ({items.length})</TabButton>
          <TabButton active={tab==='add'} onClick={()=>{setTab('add'); setEditingItem(null);}}>{editingItem ? 'Editar' : 'Añadir nuevo'}</TabButton>
          <TabButton active={tab==='settings'} onClick={()=>setTab('settings')}>Ajustes</TabButton>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-6">
        {tab === 'items' && (
          <ItemsList items={items} config={config} onChange={onItemsChange} onEdit={(it)=>{ setEditingItem(it); setTab('add'); }} />
        )}
        {tab === 'add' && (
          <ItemForm
            initial={editingItem} config={config}
            onSubmit={async (data) => {
              const all = await loadItems();
              const next = editingItem
                ? all.map(i => i.id === editingItem.id ? { ...i, ...data } : i)
                : [...all, { ...data, id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), sold: false, createdAt: Date.now() }];
              await saveItems(next);
              await onItemsChange();
              setEditingItem(null);
              setTab('items');
            }}
            onCancel={()=>{ setEditingItem(null); setTab('items'); }}
          />
        )}
        {tab === 'settings' && (
          <SettingsForm config={config} onSave={async (c)=>{ await saveConfig(c); await onConfigChange(); }} />
        )}
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${active ? 'border-orange-700 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-900'}`}>
      {children}
    </button>
  );
}

/* ============================================================
   LISTA DE ARTÍCULOS (ADMIN)
   ============================================================ */
function ItemsList({ items, config, onChange, onEdit }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toggleSold = async (id) => {
    const all = await loadItems();
    await saveItems(all.map(i => i.id === id ? { ...i, sold: !i.sold } : i));
    await onChange();
  };
  const remove = async (id) => {
    const all = await loadItems();
    await saveItems(all.filter(i => i.id !== id));
    await onChange();
    setConfirmDelete(null);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 border border-dashed border-stone-300 rounded-2xl">
        <Package className="w-10 h-10 text-stone-400 mx-auto mb-3" />
        <p className="text-stone-600 mb-1">Aún no has añadido ningún artículo.</p>
        <p className="text-stone-500 text-sm">Pulsa "Añadir nuevo" para empezar.</p>
      </div>
    );
  }

  const itemToDelete = confirmDelete ? items.find(i => i.id === confirmDelete) : null;

  return (
    <>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className={`bg-white rounded-xl border p-3 flex items-center gap-4 ${item.sold ? 'border-stone-200 opacity-60' : 'border-stone-300'}`}>
            <div className="w-16 h-16 bg-stone-100 rounded-lg shrink-0 overflow-hidden relative">
              {item.photos?.[0]
                ? <img src={item.photos[0]} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-stone-400"><ImageIcon size={20}/></div>}
              {item.photos?.length > 1 && (
                <div className="absolute bottom-0.5 right-0.5 bg-stone-900/80 text-stone-50 text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                  +{item.photos.length - 1}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="serif text-lg truncate">{item.name}</h4>
                {item.sold && <span className="text-[10px] uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Vendido</span>}
              </div>
              <p className="text-xs text-stone-500 truncate">{item.category} · {item.price}{config.currency}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => toggleSold(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${item.sold ? 'bg-stone-200 hover:bg-stone-300' : 'bg-green-700 text-stone-50 hover:bg-green-800'}`}>
                {item.sold ? 'Disponible' : 'Vendido'}
              </button>
              <button onClick={()=>onEdit(item)} className="p-2 hover:bg-stone-200 rounded-lg" title="Editar"><Edit2 size={14}/></button>
              <button onClick={()=>setConfirmDelete(item.id)} className="p-2 hover:bg-red-100 text-red-700 rounded-lg" title="Borrar"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>

      {confirmDelete && itemToDelete && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#F5EFE4] rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-700" />
              </div>
              <div>
                <h3 className="serif text-lg">¿Borrar artículo?</h3>
                <p className="text-stone-600 text-sm">"{itemToDelete.name}"</p>
              </div>
            </div>
            <p className="text-stone-600 text-sm mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-sm">Cancelar</button>
              <button onClick={() => remove(confirmDelete)} className="flex-1 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-stone-50 text-sm font-medium">Borrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   FORMULARIO ARTÍCULO
   ============================================================ */
const MAX_PHOTOS = 8;

function ItemForm({ initial, config, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [category, setCategory] = useState(initial?.category || config.categories[0]);
  const [photos, setPhotos] = useState(initial?.photos || (initial?.photo ? [initial.photo] : []));
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [uploadInfo, setUploadInfo] = useState('');

  const estimatedKB = useMemo(() =>
    photos.reduce((acc, p) => acc + (p.startsWith('data:') ? Math.round(p.length * 0.75 / 1024) : 0), 0)
  , [photos]);

  const compressImage = (file) => new Promise((resolve, reject) => {
    if (file.size > 8_000_000) return reject(new Error('Imagen demasiado grande (>8MB)'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
      img.onload = () => {
        const maxDim = 1100;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { setError(`Máximo ${MAX_PHOTOS} fotos por artículo.`); return; }
    const files = Array.from(fileList).slice(0, remaining);
    setError('');
    setUploadInfo(`Procesando ${files.length} imagen${files.length > 1 ? 'es' : ''}…`);
    const newPhotos = [];
    let totalKB = 0;
    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        newPhotos.push(compressed);
        totalKB += Math.round(compressed.length / 1024);
      } catch (e) { setError(`Error con "${file.name}": ${e.message}`); }
    }
    setPhotos(prev => [...prev, ...newPhotos]);
    setUploadInfo(`${newPhotos.length} foto${newPhotos.length > 1 ? 's' : ''} añadida${newPhotos.length > 1 ? 's' : ''} (${totalKB}KB)`);
    setTimeout(() => setUploadInfo(''), 3000);
  };

  const addUrl = () => {
    const v = urlInput.trim();
    if (!v) return;
    if (!v.match(/^https?:\/\//)) { setError('La URL debe empezar por http:// o https://'); return; }
    if (photos.length >= MAX_PHOTOS) { setError(`Máximo ${MAX_PHOTOS} fotos por artículo.`); return; }
    setPhotos(prev => [...prev, v]);
    setUrlInput(''); setError('');
  };

  const removePhoto = (idx) => setPhotos(prev => prev.filter((_, i) => i !== idx));
  const movePhoto = (idx, dir) => {
    setPhotos(prev => {
      const next = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= next.length) return prev;
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };
  const setAsMain = (idx) => {
    setPhotos(prev => {
      if (idx === 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  };

  const submit = () => {
    setError('');
    if (!name.trim()) return setError('Falta el nombre del artículo');
    const priceNum = parseFloat(String(price).replace(',', '.'));
    if (isNaN(priceNum) || priceNum < 0) return setError('Introduce un precio válido');
    onSubmit({ name: name.trim(), description: description.trim(), price: priceNum, category, photos });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-2xl space-y-5">
      <h2 className="serif text-2xl">{initial ? 'Editar artículo' : 'Nuevo artículo'}</h2>
      <Field label="Nombre">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Lámpara de pie vintage" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={`Precio (${config.currency})`}>
          <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="25" type="text" inputMode="decimal" className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
        </Field>
        <Field label="Categoría">
          <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700">
            {config.categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Descripción" hint="Estado, medidas, marca, etc.">
        <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700 resize-none" />
      </Field>

      <Field label={`Fotos (${photos.length}/${MAX_PHOTOS})`} hint="La primera foto se muestra en la tarjeta. Reordénalas con las flechas o pulsa la estrella para hacerla principal.">
        <div className="space-y-3">
          <label className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-stone-50 border border-dashed rounded-lg transition-colors ${photos.length >= MAX_PHOTOS ? 'border-stone-200 text-stone-400 cursor-not-allowed' : 'border-stone-300 cursor-pointer hover:border-orange-700 hover:bg-orange-50'}`}>
            <ImageIcon size={16}/>
            <span className="text-sm">Subir fotos del dispositivo</span>
            <input type="file" accept="image/*" multiple disabled={photos.length >= MAX_PHOTOS} onChange={e=>handleFiles(e.target.files)} className="hidden" />
          </label>
          <div className="flex gap-2">
            <input value={urlInput} onChange={e=>setUrlInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && (e.preventDefault(), addUrl())}
              placeholder="…o pega una URL: https://…" disabled={photos.length >= MAX_PHOTOS}
              className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700 text-sm disabled:opacity-50" />
            <button onClick={addUrl} disabled={photos.length >= MAX_PHOTOS} className="px-4 py-2 bg-stone-900 text-stone-50 rounded-lg text-sm hover:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed">Añadir URL</button>
          </div>
          {uploadInfo && <p className="text-xs text-green-700">{uploadInfo}</p>}
          {estimatedKB > 3000 && (
            <p className="text-xs text-amber-700 flex items-center gap-1.5">
              <AlertCircle size={13}/> Las fotos ocupan ~{Math.round(estimatedKB / 1024 * 10) / 10}MB. Considera reducir imágenes si hay errores al guardar.
            </p>
          )}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {photos.map((p, idx) => (
                <div key={idx} className="relative group">
                  <div className={`aspect-square rounded-lg overflow-hidden border-2 ${idx === 0 ? 'border-orange-700' : 'border-stone-200'}`}>
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                  {idx === 0 && <div className="absolute top-1.5 left-1.5 bg-orange-700 text-stone-50 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Principal</div>}
                  <button onClick={()=>removePhoto(idx)} className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-700 hover:bg-red-800 text-stone-50 rounded-full flex items-center justify-center shadow" title="Eliminar"><X size={13}/></button>
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx !== 0 && (
                      <button onClick={()=>setAsMain(idx)} className="flex-1 bg-stone-900/85 hover:bg-orange-800 text-stone-50 rounded px-1.5 py-1 text-[10px] font-medium flex items-center justify-center gap-1" title="Marcar como principal"><Star size={11}/></button>
                    )}
                    <button onClick={()=>movePhoto(idx, -1)} disabled={idx === 0} className="flex-1 bg-stone-900/85 hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed text-stone-50 rounded px-1.5 py-1 flex items-center justify-center"><ArrowUp size={11}/></button>
                    <button onClick={()=>movePhoto(idx, 1)} disabled={idx === photos.length - 1} className="flex-1 bg-stone-900/85 hover:bg-stone-900 disabled:opacity-30 disabled:cursor-not-allowed text-stone-50 rounded px-1.5 py-1 flex items-center justify-center"><ArrowDown size={11}/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Field>

      {error && (
        <div className="flex items-start gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0"/>{error}
        </div>
      )}
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-sm">Cancelar</button>
        <button onClick={submit} className="flex-1 py-2.5 rounded-lg bg-stone-900 hover:bg-orange-800 text-stone-50 text-sm font-medium">{initial ? 'Guardar cambios' : 'Publicar artículo'}</button>
      </div>
    </div>
  );
}

/* ============================================================
   AJUSTES
   ============================================================ */
function SettingsForm({ config, onSave }) {
  const [draft, setDraft] = useState(config);
  const [newCat, setNewCat] = useState('');
  const [saved, setSaved] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const upd = (k, v) => setDraft({ ...draft, [k]: v });

  const save = async () => {
    setError('');
    if (!draft.whatsapp.match(/^\+?\d{8,}$/)) return setError('Introduce un número de WhatsApp válido con prefijo (ej: +34600123456)');
    if (!draft.bizum.match(/^\+?\d{8,}$/)) return setError('Introduce un número de Bizum válido');
    if (draft.adminPassword.length < 4) return setError('La contraseña debe tener al menos 4 caracteres');
    await onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCat = () => {
    const v = newCat.trim();
    if (!v || draft.categories.includes(v)) return;
    upd('categories', [...draft.categories, v]);
    setNewCat('');
  };
  const removeCat = (c) => upd('categories', draft.categories.filter(x => x !== c));

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-2xl space-y-5">
      <h2 className="serif text-2xl">Ajustes</h2>
      <Field label="Título de la venta">
        <input value={draft.title} onChange={e=>upd('title', e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
      </Field>
      <Field label="Subtítulo">
        <input value={draft.subtitle} onChange={e=>upd('subtitle', e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
      </Field>
      <Field label="Nombre del vendedor (opcional)">
        <input value={draft.sellerName || ''} onChange={e=>upd('sellerName', e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
      </Field>
      <Field label="WhatsApp" hint="Con prefijo internacional, sin espacios. Ej: +34600123456">
        <input value={draft.whatsapp} onChange={e=>upd('whatsapp', e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
      </Field>
      <Field label="Número Bizum">
        <input value={draft.bizum} onChange={e=>upd('bizum', e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700" />
      </Field>
      <Field label="Moneda">
        <select value={draft.currency} onChange={e=>upd('currency', e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700">
          <option>€</option><option>$</option><option>£</option>
        </select>
      </Field>
      <Field label="Contraseña de administrador">
        <div className="relative">
          <input type={showPw ? 'text' : 'password'} value={draft.adminPassword} onChange={e=>upd('adminPassword', e.target.value)} className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700 pr-10" />
          <button onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900">
            {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>
      </Field>
      <Field label="Categorías">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {draft.categories.map(c => (
            <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 rounded-full text-xs">
              {c}
              <button onClick={()=>removeCat(c)} className="text-stone-500 hover:text-red-700"><X size={11}/></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==='Enter' && addCat()} placeholder="Nueva categoría" className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-orange-700 text-sm" />
          <button onClick={addCat} className="px-4 py-2 bg-stone-900 text-stone-50 rounded-lg text-sm hover:bg-orange-800">Añadir</button>
        </div>
      </Field>
      {error && (
        <div className="flex items-start gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0"/>{error}
        </div>
      )}
      <button onClick={save} className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-700 text-stone-50' : 'bg-stone-900 hover:bg-orange-800 text-stone-50'}`}>
        {saved ? '✓ Cambios guardados' : 'Guardar ajustes'}
      </button>
    </div>
  );
}
