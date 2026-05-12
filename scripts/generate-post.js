import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

const CONTENT_DIR = path.resolve('content/posts');

const topics = [
  { topic: "Chatbot WhatsApp para restaurantes en Zapopan", tags: ["chatbot", "WhatsApp", "restaurantes", "Zapopan"], unsplash: "restaurant mexico interior" },
  { topic: "Cuánto cuesta una página web en Guadalajara en 2026", tags: ["diseño web", "precios", "Guadalajara", "PYMES"], unsplash: "web design laptop office" },
  { topic: "Automatización de procesos para PYMES en Jalisco", tags: ["automatización", "PYMES", "Jalisco", "IA"], unsplash: "automation technology business" },
  { topic: "SEO local para negocios en Guadalajara: guía completa", tags: ["SEO", "Guadalajara", "marketing digital", "Google"], unsplash: "google search analytics" },
  { topic: "5 errores de diseño web que ahuyentan clientes en Guadalajara", tags: ["diseño web", "UX", "conversiones", "Guadalajara"], unsplash: "web design mockup modern" },
  { topic: "Cómo un chatbot con IA puede triplicar tus ventas por WhatsApp", tags: ["chatbot", "IA", "ventas", "WhatsApp"], unsplash: "artificial intelligence chat" },
  { topic: "Google Business Profile: la herramienta gratuita que tu negocio en Zapopan necesita", tags: ["SEO", "Google", "Zapopan", "marketing digital"], unsplash: "google maps local business" },
  { topic: "Landing page vs sitio web completo: qué necesita tu PYME", tags: ["diseño web", "landing page", "PYMES", "conversiones"], unsplash: "landing page website design" },
  { topic: "Inteligencia artificial para PYMES: guía práctica 2026", tags: ["IA", "PYMES", "automatización", "tecnología"], unsplash: "artificial intelligence business" },
  { topic: "Diseño web para doctores y consultorios en Guadalajara", tags: ["diseño web", "salud", "Guadalajara", "consultorios"], unsplash: "medical office modern clinic" },
];

const brandImages = [
  "/images/brand/robot-hero-1.webp",
  "/images/brand/robot-hero-2.webp",
  "/images/brand/robot-laptop.webp",
  "/images/brand/robot-phone.webp",
  "/images/brand/robot-soporte.webp",
];

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
    console.log('Todos los temas ya fueron usados. Seleccionando aleatorio.');
    return topics[Math.floor(Math.random() * topics.length)];
  }
  return available[0];
}

async function getUnsplashImage(query) {
  if (!UNSPLASH_KEY) return null;
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    const data = await res.json();
    if (data.results && data.results[0]) {
      return {
        url: data.results[0].urls.regular,
        credit: `${data.results[0].user.name} / Unsplash`
      };
    }
  } catch (e) {
    console.log('Unsplash no disponible, usando imagen de marca.');
  }
  return null;
}

async function generateAltText(title) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `Basado en este título de artículo: "${title}"
Genera UN SOLO alt text de máximo 125 caracteres para una imagen de blog.
Debe ser descriptivo, incluir "Guadalajara" o "Zapopan" si aplica, y ser natural.
NO incluyas comillas. Solo devuelve el texto, nada más.`
    }],
    temperature: 0.3,
    max_tokens: 80
  });
  return res.choices[0].message.content.trim().replace(/"/g, '');
}

async function generateArticle(topic) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `Eres un experto en diseño web, IA y marketing digital para PYMES en Guadalajara, Jalisco.
Escribe un artículo de blog de 900-1100 palabras sobre: "${topic}"

REGLAS:
- Tono profesional pero cercano, como hablando con el dueño de un negocio local
- Incluye datos y ejemplos específicos de Guadalajara/Zapopan/Jalisco cuando sea relevante
- Estructura: usa ## para H2 y ### para H3
- Párrafos cortos (máx 3 líneas)
- Incluye bullet points donde tenga sentido
- Incluye al menos una tabla comparativa si aplica
- NO uses frases genéricas de IA como "en el mundo digital actual" o "en la era de la tecnología"
- Termina con una conclusión que invite a la acción
- NO incluyas el título principal (H1), solo empieza con el contenido
- Escribe en español de México`
    }],
    temperature: 0.7,
    max_tokens: 2500
  });
  return res.choices[0].message.content;
}

async function generateDescription(title, content) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `Genera una meta description SEO de máximo 155 caracteres para este artículo.
Título: "${title}"
Primeras líneas: "${content.substring(0, 300)}"
Debe incluir la ubicación (Guadalajara/Zapopan) si aplica y un call to action sutil.
Solo devuelve el texto, sin comillas.`
    }],
    temperature: 0.3,
    max_tokens: 60
  });
  return res.choices[0].message.content.trim().replace(/"/g, '');
}

async function main() {
  const { topic, tags, unsplash } = pickTopic();
  const slug = slugify(topic);
  const date = new Date().toISOString().split('T')[0];

  console.log(`Generando artículo: "${topic}"`);

  const [content, altText, unsplashImg] = await Promise.all([
    generateArticle(topic),
    generateAltText(topic),
    getUnsplashImage(unsplash)
  ]);

  const description = await generateDescription(topic, content);

  let image, imageCredit;
  if (unsplashImg) {
    image = unsplashImg.url;
    imageCredit = unsplashImg.credit;
  } else {
    image = brandImages[Math.floor(Math.random() * brandImages.length)];
    imageCredit = "VonoaWeb";
  }

  const frontmatter = `---
title: "${topic}"
date: ${date}
draft: false
slug: "${slug}"
description: "${description}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
author: "VonoaWeb"
image: "${image}"
imageAlt: "${altText}"
imageCredit: "${imageCredit}"
---

${content}
`;

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(CONTENT_DIR, `${slug}.md`), frontmatter);
  console.log(`\nArticulo generado: ${slug}.md`);
  console.log(`Alt text: ${altText}`);
  console.log(`Imagen: ${image}`);
  console.log(`Descripción SEO: ${description}`);
}

main().catch(console.error);
