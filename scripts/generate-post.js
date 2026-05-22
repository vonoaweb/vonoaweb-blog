import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// ── APIs ──────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;

const CONTENT_DIR = path.resolve('content/posts');

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
];

const brandImages = [
  "images/brand/robot-hero-1.webp",
  "images/brand/robot-hero-2.webp",
  "images/brand/robot-laptop.webp",
  "images/brand/robot-phone.webp",
  "images/brand/robot-soporte.webp",
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

function pickTopic() {
  const used = getUsedSlugs();
  const available = topics.filter(t => !used.includes(slugify(t.topic)));
  if (!available.length) {
    console.log('⚠️  Todos los temas ya fueron usados. Seleccionando aleatorio.');
    return topics[Math.floor(Math.random() * topics.length)];
  }
  // Aleatorio entre disponibles para variar categorías
  return available[Math.floor(Math.random() * available.length)];
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
      credit: 'VonoaWeb'
    };
  }
  return img;
}

// ── Gemini AI Generation ─────────────────────────────

async function geminiGenerate(prompt, maxTokens = 2500) {
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: maxTokens,
    },
  });
  return result.response.text().trim();
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
Genera UN SOLO alt text de máximo 125 caracteres para una imagen de blog.
Debe ser descriptivo, incluir "Guadalajara" o "Zapopan" si aplica, y ser natural.
NO incluyas comillas. Solo devuelve el texto, nada más.`;

  return (await geminiGenerate(prompt, 80)).replace(/"/g, '');
}

async function generateDescription(title, content) {
  const prompt = `Genera una meta description SEO de máximo 155 caracteres para este artículo.
Título: "${title}"
Primeras líneas: "${content.substring(0, 300)}"
Debe incluir la ubicación (Guadalajara/Zapopan) si aplica y un call to action sutil.
Solo devuelve el texto, sin comillas.`;

  return (await geminiGenerate(prompt, 60)).replace(/"/g, '');
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

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
