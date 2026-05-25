#!/bin/bash

echo "🚀 Iniciando reorganización corregida v3..."

# Volver siempre a la raíz del proyecto
ROOT=$(pwd)
echo "📍 Directorio raíz: $ROOT"

# === 1. Crear estructura en [locale] ===
echo "📁 Creando carpetas..."
cd "$ROOT/app/[locale]"

mkdir -p auth/login auth/register
mkdir -p public/news public/blog public/games public/team public/events public/contact public/multimedia
mkdir -p dashboard/profile dashboard/my-news dashboard/write/news dashboard/edit/news/[id]
mkdir -p dashboard/drafts dashboard/favorites dashboard/history dashboard/stats dashboard/comments dashboard/schedule
mkdir -p admin/news admin/users/[id]/role admin/settings

echo "📦 Moviendo páginas..."

# Auth
mv -n login/* auth/login/ 2>/dev/null || echo "→ Auth ya movido"
mv -n register/* auth/register/ 2>/dev/null || echo "→ Register ya movido"

# Public
mv -n news/* public/news/ 2>/dev/null || echo "→ News ya movido"
mv -n blog/* public/blog/ 2>/dev/null || echo "→ Blog ya movido"
mv -n games/* public/games/ 2>/dev/null || echo "→ Games ya movido"
mv -n team/* public/team/ 2>/dev/null || echo "→ Team ya movido"
mv -n events/* public/events/ 2>/dev/null || echo "→ Events ya movido"
mv -n contact/* public/contact/ 2>/dev/null || echo "→ Contact ya movido"
mv -n multimedia/* public/multimedia/ 2>/dev/null || echo "→ Multimedia ya movido"
mv -n page.tsx public/ 2>/dev/null || echo "→ Home (page.tsx) ya movido"
mv -n TopGamesClient.tsx public/ 2>/dev/null || echo "→ TopGamesClient ya movido"

# Dashboard
mv -n dashboard/* dashboard/ 2>/dev/null || echo "→ Dashboard ya movido"

# Mover API
echo "🔄 Moviendo carpeta api..."
cd "$ROOT"
mv -n app/api app/[locale]/api 2>/dev/null || echo "→ API ya estaba dentro de [locale]"

# === Components ===
echo "🎨 Reorganizando components..."
cd "$ROOT/components"

mkdir -p ui common layout features/home features/auth features/games features/news

mv -n ui/* ui/ 2>/dev/null || true
mv -n Navbar.tsx common/ 2>/dev/null || true
mv -n Footer.tsx common/ 2>/dev/null || true
mv -n LanguageSwitcher.tsx common/ 2>/dev/null || true
mv -n dashboard/DashboardSidebar.tsx layout/ 2>/dev/null || true
mv -n home/* features/home/ 2>/dev/null || true
mv -n auth/* features/auth/ 2>/dev/null || true
mv -n GameModal.tsx features/games/ 2>/dev/null || true

echo "🧹 Limpiando carpetas vacías..."
cd "$ROOT"
find app -type d -empty -delete 2>/dev/null || true
find components -type d -empty -delete 2>/dev/null || true

echo ""
echo "✅ ¡Reorganización terminada!"
echo ""
echo "Verifica con:"
echo "tree app/[locale] -L 3"
echo "tree components -L 2"
