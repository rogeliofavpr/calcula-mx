# Estrategia SEO — CalculaMX

Objetivo: aparecer en Google para *"calculadora isr"*, *"cuánto me toca de aguinaldo"*,
*"simulador de préstamo"*, *"tabla isr 2026"*, *"de sueldo bruto a neto"*, y que la gente
empiece a usar el sitio. Mercado competido: se ataca primero la **cola larga** y luego se escala.

---

## Fase 0 — Fundamentos técnicos

- [x] Dominio canónico `https://www.calculamx.net`, HTTPS, apex → www.
- [x] Multipágina: una URL por calculadora y por guía (`cleanUrls` en `vercel.json`).
- [x] `<title>` + `meta description` + `canonical` únicos por página; `lang="es-MX"`; Open Graph.
- [x] Datos estructurados: `WebSite`, `Organization`, `WebApplication`, `FAQPage`, `Article`, `BreadcrumbList`.
- [x] `robots.txt` + `sitemap.xml`.
- [x] Contenido explicativo real + "Cómo calculamos esto" + FAQ en cada calculadora.
- [x] Rápido y ligero: sin frameworks, CSS/JS mínimos, fuentes con `display=swap`.
- [ ] **Google Search Console**: alta de la propiedad de dominio, enviar `sitemap.xml`.
- [ ] **Google Analytics 4**: ya integrado en `js/site.js` (falta poner el ID). Vincular con Search Console.
- [ ] **Bing Webmaster Tools**: importar desde Search Console.
- [ ] Crear `og-image.png` (1200×630).
- [ ] PageSpeed Insights: Core Web Vitals en verde.

## Fase 1 — Páginas de cola larga (mes 1–2)

Cada calculadora ataca su término principal. Añade páginas para las variantes:

| Página nueva | Búsquedas objetivo |
|---|---|
| `sueldo-neto.html` (`/sueldo-neto`) | "de bruto a neto", "cuánto me queda de sueldo", "calculadora sueldo neto méxico" |
| `finiquito.html` (`/finiquito`) | "calculadora finiquito", "cuánto me toca de finiquito", "liquidación 90 días" |
| `guias/que-es-la-uma.html` | "qué es la uma", "valor uma 2026", "uma mensual" |
| `guias/prima-vacacional.html` | "cómo se calcula la prima vacacional", "prima vacacional 25%" |
| `guias/isr-honorarios-resico.html` | "isr honorarios", "calcular resico", "impuestos por honorarios" |
| `guias/declaracion-anual.html` | "declaración anual personas físicas", "saldo a favor", "deducciones personales" |

Reglas por página: URL corta con guiones, un solo `<h1>` con la keyword, 600–1200 palabras
útiles + herramienta + FAQ (`FAQPage`), ejemplos numéricos, enlaces internos.

## Fase 2 — Contenido de temporada (todo el año)

El tráfico es **estacional**. Publicar con 3–4 semanas de anticipación:

| Época | Empujar |
|---|---|
| Nov–dic | Aguinaldo, "cuándo pagan el aguinaldo", finiquito de fin de año. |
| Ene–feb | Nuevas tablas ISR/UMA/salario mínimo. Actualizar `tax-data.js` y publicar "Tabla ISR {año}". |
| Mar–abr | Declaración anual, saldo a favor, deducciones personales. |
| Jun–jul | PTU (reparto de utilidades), prima vacacional. |

Actualizar el año en títulos y contenido cada enero es de las acciones de mayor impacto.

## Fase 3 — Autoridad y enlaces

- **Directorios** de herramientas mexicanas y de finanzas personales.
- **Comunidades**: responder dudas reales en Reddit (r/MexicoFinanciero), grupos de Facebook
  de RH/nómina, Quora en español, enlazando la calculadora cuando de verdad resuelve. Sin spam.
- **Despachos contables / blogs fiscales**: ofrecer la calculadora como recurso gratuito para enlazar.
- **Widget embebible**: `<iframe>` de una calculadora para blogs de finanzas, con enlace de crédito.
- **Redes**: @calculamx en X, Instagram, TikTok. Reels/TikToks de "cuánto te descuentan de ISR"
  con captura de la herramienta: mucho alcance en México.

## Fase 4 — Optimización continua

- Search Console: consultas con impresiones y pocos clics → mejorar `title`/`description`.
- Consultas en posición 5–15 → ampliar el contenido de esa página.
- Nueva pregunta frecuente cada vez que se repita una duda.
- Mantener las tablas al día: un dato viejo mata la confianza y el ranking.
- Fecha visible de "última actualización" en guías (ya la hay en la tabla ISR).

## Expectativas

- Mes 1–2: indexación completa, primeras visitas de cola larga (decenas/día).
- Mes 3–6: con publicación constante, cientos de visitas/día.
- Temporadas fuertes (dic, abril): picos de 3–10× el tráfico base.
- AdSense en finanzas para tráfico de México: ~USD 1–5 por cada 1000 visitas.

## Checklist de lanzamiento

- [ ] Merge de esta rama a `main` y verificación en producción.
- [ ] Search Console + `sitemap.xml` enviado.
- [ ] GA4 con ID real y vinculado a Search Console.
- [ ] `og-image.png`.
- [ ] Perfiles sociales creados.
- [ ] 2–3 páginas de cola larga publicadas.
- [ ] AdSense solicitado.
- [ ] Recordatorio en calendario: actualizar `tax-data.js` cada enero.
