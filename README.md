# Venta Garage — Guía completa para Ian

**Tu web en internet:** https://venta-garage-bay.vercel.app

Los compradores entran, ven los artículos con fotos, y te contactan por WhatsApp. Tú marcas los artículos como vendidos desde un panel de admin protegido con contraseña.

---

## 1. Instala esto en tu ordenador

| Herramienta | Dónde descargarlo |
|---|---|
| Node.js | https://nodejs.org (botón "LTS") |
| Git | https://git-scm.com |
| Claude Code | extensión de VS Code o https://claude.ai/code |
| Vercel CLI | Una vez instalado Node, ejecuta en terminal: `npm install -g vercel` |

---

## 2. Descarga el proyecto

Abre una terminal y ejecuta:

```bash
git clone https://github.com/ssaravia25/venta-garage.git
cd venta-garage
npm install
```

---

## 3. Arrancarlo en tu ordenador (para probar cambios)

```bash
npm run dev
```

Abre **http://localhost:5173** en el navegador. Los cambios en el código se ven al instante. Para parar: `Ctrl + C`.

---

## 4. Publicar cambios en internet

Editas el código → guardas en Git → subes a GitHub → Vercel despliega solo en ~1 minuto.

```bash
git add -A
git commit -m "descripción de lo que cambiaste"
git push
```

---

## 5. Usar Claude Code para hacer cambios

Con Claude Code abierto en la carpeta del proyecto, dile en español lo que quieres:

- *"Cambia el número de WhatsApp a +34612345678"*
- *"Cambia el precio del Xiaomi a 120 euros"*
- *"Marca la Parrilla Weber como vendida"*
- *"Añade un artículo llamado Sofá azul, precio 80 euros, categoría Muebles"*

Claude edita el código y te dice qué comandos ejecutar para publicarlo.

---

## 6. Cambios urgentes que hacer ahora

Abre `src/initialData.js` y cambia:

```js
whatsapp: '+34600000000',    // ← tu número real con prefijo, ej: +34612345678
bizum: '+34600000000',       // ← tu número real (suele ser el mismo)
adminPassword: 'garage2026', // ← cambia la contraseña si quieres
```

Para poner precios (ahora todos muestran "A convenir"), cambia `price: 0` por el número, ej: `price: 50`.

Después:
```bash
git add -A && git commit -m "actualizo contacto y precios" && git push
```

---

## 7. Añadir un artículo nuevo

1. Copia la foto a `public/images/` con nombre sin espacios ni tildes, ej: `sofa-01.jpeg`

2. En `src/initialData.js`, añade al array `initialItems`:

```js
{
  id: 'sofa',
  name: 'Sofá azul',
  description: 'Sofá de 3 plazas. Buen estado.',
  price: 80,
  category: 'Muebles',
  sold: false,
  createdAt: Date.now(),
  photos: ['/images/sofa-01.jpeg'],
},
```

3. `git add -A && git commit -m "añado sofá" && git push`

---

## 8. Marcar un artículo como vendido

**Desde la web** (más fácil, pero solo lo ves tú en ese navegador):
1. Ve a la web → haz clic en el candado 🔒 (arriba a la derecha)
2. Contraseña: `garage2026`
3. Pulsa el botón **"Vendido"** en el artículo

**En el código** (lo ven todos los visitantes):
En `src/initialData.js`, cambia `sold: false` → `sold: true` en ese artículo, y haz push.

> ⚠️ Con la configuración actual, cada visitante tiene su propia copia local de los datos. Si marcas algo como vendido desde el panel admin, solo lo ves tú en ese navegador. Para que todos los compradores vean el estado actualizado, hay que activar Supabase (ver sección 10).

---

## 9. Archivos importantes

```
venta-garage/
├── src/
│   ├── App.jsx          ← toda la lógica de la web
│   ├── initialData.js   ← artículos, WhatsApp, Bizum, contraseña
│   └── storage.js       ← capa de datos (localStorage / Supabase)
└── public/
    └── images/          ← fotos de los artículos
```

---

## 10. Activar base de datos compartida (opcional, para más adelante)

Ahora mismo cada visitante tiene su propia copia local. Para que los cambios del panel admin (marcar como vendido, editar precios) se vean para todos en tiempo real:

1. Crea cuenta gratis en https://supabase.com
2. Crea un proyecto nuevo
3. Ve a **SQL Editor** y ejecuta:

```sql
CREATE TABLE kv_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE kv_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_rw" ON kv_store FOR ALL USING (true) WITH CHECK (true);
```

4. En Supabase → Project Settings → API → copia `Project URL` y `anon public key`
5. En https://vercel.com → tu proyecto → Settings → Environment Variables → añade:
   - `VITE_SUPABASE_URL` = la URL copiada
   - `VITE_SUPABASE_ANON_KEY` = la key copiada
6. Vercel → Deployments → Redeploy

---

## 11. Accesos (guárdalos)

| Qué | Dónde | Acceso |
|---|---|---|
| Código fuente | github.com/ssaravia25/venta-garage | cuenta de Sergio (pedir acceso de colaborador) |
| Despliegue | vercel.com | cuenta de Sergio (pedir que te invite) |
| Panel admin web | venta-garage-bay.vercel.app → 🔒 | contraseña: `garage2026` |

Para que Ian pueda hacer push directamente: Sergio entra en GitHub → el repo → Settings → Collaborators → añade el usuario de GitHub de Ian.

---

## Comandos de referencia

```bash
npm run dev          # arrancar en local
npm run build        # compilar y verificar que no hay errores
git add -A           # preparar todos los cambios
git commit -m "..."  # guardar con mensaje
git push             # subir → auto-deploya en Vercel
vercel deploy --prod # forzar deploy manual si hace falta
```
