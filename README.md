# VonoaWeb Blog

Blog estático con Hugo + GitHub Pages para `blog.vonoaweb.com`.

## Estructura

```
vonoaweb-blog/
├── content/posts/          ← Artículos en Markdown
├── layouts/                ← Templates HTML
├── static/css/             ← Estilos (brand kit VonoaWeb)
├── static/js/              ← Scripts
├── static/images/          ← Imágenes del blog y marca
├── scripts/                ← Script de generación automática
├── .github/workflows/      ← CI/CD (deploy + auto-generación)
└── hugo.toml               ← Configuración de Hugo
```

## Setup inicial

### 1. Crear repo en GitHub

```bash
cd vonoaweb-blog
git init
git add .
git commit -m "Blog VonoaWeb — setup inicial"
git remote add origin https://github.com/vonoaweb/vonoaweb-blog.git
git push -u origin main
```

### 2. Configurar GitHub Pages

1. Ve a **Settings → Pages** en el repo
2. Source: **GitHub Actions**
3. El workflow `deploy.yml` se encarga del resto

### 3. Configurar subdominio

En tu proveedor de DNS, agrega:

```
CNAME  blog  vonoaweb.github.io
```

Luego en **Settings → Pages → Custom domain**, escribe `blog.vonoaweb.com` y activa **Enforce HTTPS**.

### 4. Secrets para generación automática

En **Settings → Secrets and variables → Actions**, agrega:

- `OPENAI_API_KEY` — tu API key de OpenAI
- `UNSPLASH_ACCESS_KEY` — tu access key de Unsplash (opcional)

## Uso

### Agregar artículo manualmente

Crea un archivo en `content/posts/mi-articulo.md`:

```markdown
---
title: "Título del artículo"
date: 2026-05-12
draft: false
slug: "mi-articulo"
description: "Meta description para SEO (max 155 chars)"
tags: ["diseño web", "Guadalajara"]
author: "VonoaWeb"
image: "/images/blog/mi-imagen.webp"
imageAlt: "Descripción de la imagen para SEO y accesibilidad"
imageCredit: "Fuente"
---

Contenido en Markdown...
```

Haz push a `main` y el blog se actualiza automáticamente.

### Generación automática

El workflow `generate-post.yml` crea un artículo nuevo **cada lunes a las 9am CST**. También puedes ejecutarlo manualmente desde **Actions → Auto-generate Blog Post → Run workflow**.

### Desarrollo local

```bash
hugo server -D
```

Abre `http://localhost:1313`

## Configuración

Edita `hugo.toml` para cambiar:

- `params.whatsapp` — número de WhatsApp
- `params.gtmId` — Google Tag Manager ID
- `params.siteUrl` — URL del sitio principal
