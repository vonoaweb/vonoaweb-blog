import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// ── Paths ────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── APIs ──────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

const CONTENT_DIR = path.resolve(__dirname, '..', 'content', 'posts');

// ── Temas (expandidos para +1 año de contenido) ──────
const topics = [
  // --- Chatbots & WhatsApp ---
  { topic: "Chatbot WhatsApp para restaurantes en Zapopan", tags: ["chatbot", "WhatsApp", "restaurantes", "Zapopan"], imgQuery: "restaurant mexico interior" },
  { topic: "Cómo un chatbot con IA puede triplicar tus ventas por WhatsApp", tags: ["chatbot", "IA", "ventas", "WhatsApp"], imgQuery: "artificial intelligence chat" },
  { topic: "WhatsApp Business API vs WhatsApp normal: qué conviene para tu negocio", tags: ["WhatsApp", "PYMES", "automatización", "Guadalajara"], imgQuery: "whatsapp business phone" },
  { topic: "Chatbot para clínicas dentales en Guadalajara: agenda citas 24/7", tags: ["chatbot", "salud", "Guadalajara", "automatización"], imgQuery: "dental clinic modern reception" },
  { topic: "Cómo configurar respuestas automáticas en WhatsApp para tu negocio", tags: ["WhatsApp", "automatización", "PYMES", "tutorial"], imgQuery: "smartphone business messaging" },

  // --- Diseño Web ---
  { topic: "Cuánto cuesta una página web en Guadalajara en 2026", tags: ["diseño web", "precios", "Guadalajara", "PYMES"], imgQuery: "web design laptop office" },
  { topic: "5 errores de diseño web que ahuyentan clientes en Guadalajara", tags: ["diseño web", "UX", "conversiones", "Guadalajara"], imgQuery: "web design mockup modern" },
  { topic: "Landing page vs sitio web completo: qué necesita tu PYME", tags: ["diseño web", "landing page", "PYMES", "conversiones"], imgQuery: "landing page website design" },
  { topic: "Diseño web para doctores y consultorios en Guadalajara", tags: ["diseño web", "salud", "Guadalajara", "consultorios"], imgQuery: "medical office modern clinic" },
  { topic: "Por qué tu negocio en Zapopan necesita una página web en 2026", tags: ["diseño web", "PYMES", "Zapopan", "marketing digital"], imgQuery: "small business storefront modern" },
  { topic: "Diseño web para talleres mecánicos en Guadalajara", tags: ["diseño web", "automotriz", "Guadalajara", "PYMES"], imgQuery: "auto repair shop modern" },
  { topic: "Tienda en línea para PYMES en Guadalajara: guía paso a paso", tags: ["e-commerce", "PYMES", "Guadalajara", "diseño web"], imgQuery: "ecommerce online shopping laptop" },
  { topic: "Diseño web para despachos de abogados en Guadalajara", tags: ["diseño web", "servicios profesionales", "Guadalajara", "PYMES"], imgQuery: "law office modern professional" },
  { topic: "Cómo elegir el mejor hosting para tu página web en México", tags: ["hosting", "diseño web", "tutorial", "México"], imgQuery: "server data center technology" },
  { topic: "Página web para gimnasios y estudios fitness en Zapopan", tags: ["diseño web", "fitness", "Zapopan", "PYMES"], imgQuery: "modern gym fitness studio" },

  // --- SEO & Marketing ---
  { topic: "SEO local para negocios en Guadalajara: guía completa", tags: ["SEO", "Guadalajara", "marketing digital", "Google"], imgQuery: "google search analytics" },
  { topic: "Google Business Profile: la herramienta gratuita que tu negocio en Zapopan necesita", tags: ["SEO", "Google", "Zapopan", "marketing digital"], imgQuery: "google maps local business" },
  { topic: "Cómo aparecer en el mapa de Google si tienes un negocio en Guadalajara", tags: ["SEO", "Google Maps", "Guadalajara", "PYMES"], imgQuery: "google maps pin location" },
  { topic: "Marketing digital para restaurantes en Guadalajara: estrategia completa", tags: ["marketing digital", "restaurantes", "Guadalajara", "redes sociales"], imgQuery: "restaurant social media food" },
  { topic: "Instagram para negocios locales en Guadalajara: guía 2026", tags: ["redes sociales", "Instagram", "Guadalajara", "marketing digital"], imgQuery: "instagram social media business" },
  { topic: "Google Ads vs Meta Ads: cuál funciona mejor para PYMES en Guadalajara", tags: ["marketing digital", "Google Ads", "Meta Ads", "Guadalajara"], imgQuery: "digital advertising analytics" },
  { topic: "Cómo conseguir reseñas en Google para tu negocio en Zapopan", tags: ["SEO", "Google", "Zapopan", "reputación online"], imgQuery: "five star review rating" },

  // --- IA & Automatización ---
  { topic: "Automatización de procesos para PYMES en Jalisco", tags: ["automatización", "PYMES", "Jalisco", "IA"], imgQuery: "automation technology business" },
  { topic: "Inteligencia artificial para PYMES: guía práctica 2026", tags: ["IA", "PYMES", "automatización", "tecnología"], imgQuery: "artificial intelligence business" },
  { topic: "Cómo usar IA para atender clientes en tu negocio de Guadalajara", tags: ["IA", "atención al cliente", "Guadalajara", "chatbot"], imgQuery: "customer service technology" },
  { topic: "Automatizar cotizaciones: ahorra 10 horas a la semana en tu negocio", tags: ["automatización", "PYMES", "productividad", "Guadalajara"], imgQuery: "business quote invoice" },
  { topic: "5 herramientas de IA gratuitas que toda PYME en Guadalajara debería usar", tags: ["IA", "herramientas", "PYMES", "Guadalajara"], imgQuery: "ai tools software laptop" },
  { topic: "CRM con IA para pequeños negocios en Guadalajara", tags: ["CRM", "IA", "PYMES", "Guadalajara"], imgQuery: "crm dashboard business" },
  { topic: "Email marketing automatizado para negocios en Zapopan", tags: ["email marketing", "automatización", "Zapopan", "PYMES"], imgQuery: "email marketing newsletter" },

  // --- Casos y tendencias ---
  { topic: "Tendencias de diseño web 2026 para negocios en México", tags: ["diseño web", "tendencias", "México", "2026"], imgQuery: "modern website design trend" },
  { topic: "Cómo una estética en Guadalajara duplicó sus citas con una página web", tags: ["caso de éxito", "salud y belleza", "Guadalajara", "diseño web"], imgQuery: "beauty salon modern interior" },
  { topic: "E-commerce en Guadalajara: por qué vender en línea ya no es opcional", tags: ["e-commerce", "Guadalajara", "PYMES", "ventas online"], imgQuery: "online store ecommerce packages" },
  { topic: "Qué es el diseño UX y por qué importa para tu negocio en Guadalajara", tags: ["UX", "diseño web", "Guadalajara", "conversiones"], imgQuery: "ux design wireframe user" },
  { topic: "Certificado SSL: qué es y por qué tu página web lo necesita", tags: ["seguridad web", "SSL", "diseño web", "tutorial"], imgQuery: "website security lock https" },
  { topic: "Velocidad web: por qué tu página lenta te está costando clientes", tags: ["rendimiento web", "SEO", "PageSpeed", "PYMES"], imgQuery: "speed performance loading fast" },
  { topic: "Redes sociales vs página web: qué necesita tu negocio primero", tags: ["redes sociales", "diseño web", "PYMES", "Guadalajara"], imgQuery: "social media vs website" },

  // --- Industrias locales (alta intención de compra) ---
  { topic: "Diseño web para inmobiliarias y agentes de bienes raíces en Guadalajara", tags: ["diseño web", "inmobiliarias", "Guadalajara", "PYMES"], imgQuery: "real estate agent modern office" },
  { topic: "Páginas web para contadores y despachos contables en Zapopan", tags: ["diseño web", "contadores", "Zapopan", "servicios profesionales"], imgQuery: "accountant office desk calculator" },
  { topic: "Diseño web para clínicas dentales en Guadalajara", tags: ["diseño web", "salud", "dental", "Guadalajara"], imgQuery: "dental clinic modern interior" },
  { topic: "Diseño web para constructoras y arquitectos en Jalisco", tags: ["diseño web", "construcción", "arquitectura", "Jalisco"], imgQuery: "architecture construction modern building" },
  { topic: "Páginas web para escuelas y colegios privados en Guadalajara", tags: ["diseño web", "educación", "Guadalajara", "PYMES"], imgQuery: "private school classroom modern" },
  { topic: "Diseño web para veterinarias en Zapopan", tags: ["diseño web", "veterinaria", "Zapopan", "PYMES"], imgQuery: "veterinary clinic pet care" },
  { topic: "Diseño web para notarías en Guadalajara", tags: ["diseño web", "notaría", "servicios profesionales", "Guadalajara"], imgQuery: "notary legal documents office" },

  // --- IA & Automatización avanzada ---
  { topic: "Cómo automatizar el agendamiento de citas en tu negocio sin contratar más personal", tags: ["automatización", "citas", "PYMES", "Guadalajara"], imgQuery: "calendar appointment booking app" },
  { topic: "Agentes de IA para PYMES: qué son y cómo te ahorran dinero en 2026", tags: ["IA", "agentes", "PYMES", "automatización"], imgQuery: "ai robot assistant technology" },
  { topic: "Cómo automatizar el seguimiento a clientes con IA y WhatsApp", tags: ["automatización", "WhatsApp", "IA", "ventas"], imgQuery: "whatsapp crm customer service" },
  { topic: "Cómo conectar tu página web con WhatsApp y un CRM automáticamente", tags: ["automatización", "CRM", "WhatsApp", "integración"], imgQuery: "software integration dashboard" },
  { topic: "IA para responder reseñas de Google automáticamente", tags: ["IA", "reseñas", "Google", "reputación online"], imgQuery: "online review rating stars" },

  // --- SEO local de alta intención ---
  { topic: "Cómo aparecer en las búsquedas 'cerca de mí' en Guadalajara", tags: ["SEO", "búsqueda local", "Guadalajara", "Google"], imgQuery: "smartphone map location search" },
  { topic: "Por qué tu competencia aparece en Google y tú no", tags: ["SEO", "Google", "PYMES", "marketing digital"], imgQuery: "google search results ranking" },

  // --- Conversión / decisión de compra ---
  { topic: "Cuánto cuesta una tienda en línea en Guadalajara en 2026", tags: ["e-commerce", "precios", "Guadalajara", "PYMES"], imgQuery: "online store shopping cart" },
  { topic: "Agencia de diseño web vs freelancer vs hacerlo tú mismo: qué te conviene", tags: ["diseño web", "PYMES", "comparativa", "Guadalajara"], imgQuery: "team meeting web design agency" },
  { topic: "Señales de que tu página web ya está obsoleta y te cuesta ventas", tags: ["diseño web", "rediseño", "UX", "PYMES"], imgQuery: "outdated old website laptop" },
  { topic: "Rediseño web: cuándo vale la pena renovar tu sitio", tags: ["diseño web", "rediseño", "PYMES", "Guadalajara"], imgQuery: "website redesign before after" },

  // --- Estacionales (solo se publican en su temporada, ver campo "season") ---
  // season: meses (1-12) en los que el tema es elegible
  { topic: "Cómo preparar tu tienda en línea para El Buen Fin", tags: ["e-commerce", "Buen Fin", "ventas", "México"], imgQuery: "online shopping sale discount", season: [10, 11] },
  { topic: "Marketing digital para negocios en temporada navideña en Guadalajara", tags: ["marketing digital", "navidad", "Guadalajara", "ventas"], imgQuery: "christmas shopping marketing", season: [11, 12] },
];

const brandImages = [
  "images/blog/diseno-web-guadalajara.jpg",
  "images/blog/chatbot-restaurante.jpg",
  "images/blog/seo-guadalajara.jpg",
  "images/blog/ia-operaciones-pymes.jpg",
  "images/blog/ecommerce-alto-desempeno.jpg",
  "images/blog/core-web-vitals-analytics.jpg",
  "images/blog/diseno-producto-wireframe.jpg",
];

// ── Helpers ──────────────────────────────────────────

function getUsedSlugs() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 70);
}

// Un tema es elegible si no tiene "season", o si el mes actual está en su temporada
function isInSeason(topic, month) {
  if (!topic.season) return true;
  return topic.season.includes(month);
}

function pickTopic() {
  const used = getUsedSlugs();
  const month = new Date().getMonth() + 1; // 1-12

  // Preferencia: no usados Y en temporada
  let pool = topics.filter(t => !used.includes(slugify(t.topic)) && isInSeason(t, month));

  if (!pool.length) {
    // Todos los de temporada ya usados: permitir repetir, pero respetando temporada
    console.log('⚠️  Todos los temas en temporada ya fueron usados. Seleccionando aleatorio en temporada.');
    pool = topics.filter(t => isInSeason(t, month));
  }
  if (!pool.length) {
    // Caso extremo: nada en temporada. Aleatorio global (sin estacionales fuera de fecha).
    console.log('⚠️  Sin temas en temporada. Seleccionando aleatorio global.');
    pool = topics.filter(t => !t.season);
  }

  // Aleatorio entre disponibles para variar categorías
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Image APIs (Pexels → Unsplash → Brand fallback) ─

async function getPexelsImage(query) {
  if (!PEXELS_KEY) return null;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    const data = await res.json();
    if (data.photos && data.photos.length > 0) {
      const photo = data.photos[Math.floor(Math.random() * data.photos.length)];
      return {
        url: photo.src.large2x,
        credit: `${photo.photographer} / Pexels`
      };
    }
  } catch (e) {
    console.log('⚠️  Pexels no disponible.');
  }
  return null;
}

async function getUnsplashImage(query) {
  if (!UNSPLASH_KEY) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const photo = data.results[Math.floor(Math.random() * data.results.length)];
      return {
        url: photo.urls.regular,
        credit: `${photo.user.name} / Unsplash`
      };
    }
  } catch (e) {
    console.log('⚠️  Unsplash no disponible.');
  }
  return null;
}

async function getImage(query) {
  // Intentar Pexels primero, luego Unsplash, luego imagen de marca
  let img = await getPexelsImage(query);
  if (!img) img = await getUnsplashImage(query);
  if (!img) {
    img = {
      url: brandImages[Math.floor(Math.random() * brandImages.length)],
      credit: 'Unsplash'
    };
  }
  return img;
}

// ── Gemini AI Generation (with retry + fallback) ─────

const RETRY_DELAYS = [5000, 15000, 30000];

async function geminiGenerate(prompt, maxTokens = 2500) {
  for (const modelName of MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName });
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.75,
            maxOutputTokens: maxTokens,
          },
        });
        return result.response.text().trim();
      } catch (err) {
        const isRetryable = err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('overloaded') || err.message?.includes('high demand');
        if (isRetryable && attempt < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attempt];
          console.log(`⏳ ${modelName} no disponible (intento ${attempt + 1}), reintentando en ${delay / 1000}s...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        console.log(`⚠️  ${modelName} falló: ${err.message}`);
        break;
      }
    }
    console.log(`🔄 Cambiando a siguiente modelo...`);
  }
  throw new Error('Todos los modelos de Gemini fallaron después de múltiples reintentos');
}

async function generateArticle(topic) {
  const prompt = `Eres un experto en diseño web, IA y marketing digital para PYMES en Guadalajara, Jalisco. Trabajas en VonoaWeb, una agencia real de diseño web en Zapopan.

Escribe un artículo de blog de 900-1200 palabras sobre: "${topic}"

REGLAS ESTRICTAS:
- Tono profesional pero cercano, como hablando con el dueño de un negocio local en Guadalajara
- Incluye datos y ejemplos específicos de Guadalajara/Zapopan/Jalisco cuando sea relevante
- Estructura: usa ## para H2 y ### para H3 (NO uses # para H1)
- Párrafos cortos (máximo 3 líneas cada uno)
- Incluye bullet points donde tenga sentido
- Incluye al menos una tabla comparativa si aplica al tema
- NO uses frases genéricas como "en el mundo digital actual", "en la era de la tecnología", "en el competitivo mundo de"
- NO empieces párrafos con "Es importante", "Cabe destacar", "Sin duda alguna"
- Usa datos reales o realistas (precios en MXN, estadísticas de México)
- Termina con una conclusión que invite a contactar a VonoaWeb
- NO incluyas el título principal (H1), empieza directo con el contenido
- Escribe en español de México natural (usa "tú", no "usted")
- NO incluyas "Artículo escrito con IA" ni disclaimers
- Que cada sección aporte valor real, no relleno`;

  return geminiGenerate(prompt, 3000);
}

async function generateAltText(title) {
  const prompt = `Basado en este título de artículo: "${title}"
Genera UN SOLO alt text descriptivo para una imagen de blog.
REGLAS:
- Mínimo 40 caracteres, máximo 125 caracteres
- Debe ser una frase descriptiva completa
- Incluir "Guadalajara" o "Zapopan" si aplica al tema
- NO uses comillas
- Devuelve SOLO el texto, sin explicaciones ni prefijos
Ejemplo: "Consultorio médico moderno con diseño web profesional en Guadalajara"`;

  const result = (await geminiGenerate(prompt, 100)).replace(/"/g, '');
  // Fallback si la respuesta es muy corta
  if (result.length < 30) return `${title} - VonoaWeb Guadalajara`;
  return result;
}

async function generateDescription(title, content) {
  const prompt = `Genera una meta description SEO para este artículo de blog.
Título: "${title}"
Primeras líneas: "${content.substring(0, 500)}"
REGLAS:
- Mínimo 120 caracteres, máximo 155 caracteres
- Incluir la ubicación (Guadalajara/Zapopan) si aplica
- Incluir un call to action sutil al final
- NO uses comillas
- Devuelve SOLO el texto de la meta description, nada más
Ejemplo: "Descubre cómo el SEO local puede ayudar a tu negocio en Guadalajara a aparecer en Google. Guía completa con estrategias probadas."`;

  const result = (await geminiGenerate(prompt, 80)).replace(/"/g, '');
  // Fallback si la respuesta es muy corta
  if (result.length < 50) return `${title}. Guía completa para PYMES en Guadalajara por VonoaWeb.`;
  return result;
}

// ── Main ─────────────────────────────────────────────

async function main() {
  const { topic, tags, imgQuery } = pickTopic();
  const slug = slugify(topic);
  const date = new Date().toISOString().split('T')[0];

  console.log(`\n🚀 Generando artículo: "${topic}"`);
  console.log(`📅 Fecha: ${date}`);
  console.log(`🔗 Slug: ${slug}\n`);

  // Generar contenido e imagen en paralelo
  const [content, altText, img] = await Promise.all([
    generateArticle(topic),
    generateAltText(topic),
    getImage(imgQuery),
  ]);

  // Meta description depende del contenido
  const description = await generateDescription(topic, content);

  const frontmatter = `---
title: "${topic}"
date: ${date}
draft: false
slug: "${slug}"
description: "${description}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
author: "VonoaWeb"
image: "${img.url}"
imageAlt: "${altText}"
imageCredit: "${img.credit}"
---

${content}
`;

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(CONTENT_DIR, `${slug}.md`), frontmatter);

  console.log(`✅ Artículo generado: ${slug}.md`);
  console.log(`📝 Alt text: ${altText}`);
  console.log(`🖼️  Imagen: ${img.url}`);
  console.log(`🔍 Crédito: ${img.credit}`);
  console.log(`📋 Descripción SEO: ${description}`);
  console.log(`📊 Palabras: ~${content.split(/\s+/).length}`);
}

// Exports para pruebas (no se ejecuta main al importar)
export { topics, slugify, isInSeason, pickTopic };

// Solo ejecuta main() cuando se corre el script directamente (node generate-post.js)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}
