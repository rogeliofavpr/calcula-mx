# CalculaMX — www.calculamx.net

Calculadoras fiscales y financieras para México: **ISR**, **Aguinaldo** y **Préstamos**.
Sitio 100 % estático (HTML + CSS + JS, sin build). Desplegado en **Vercel** desde este repo.

---

## Estructura

```
/
├── index.html                     Portada
├── isr.html · aguinaldo.html · prestamos.html   Calculadoras (URLs limpias: /isr, /aguinaldo, /prestamos)
├── acerca.html · privacidad.html · terminos.html · 404.html
├── guias/
│   ├── index.html
│   ├── como-se-calcula-el-isr.html
│   ├── como-se-calcula-el-aguinaldo.html
│   ├── tabla-isr-2026.html
│   └── que-es-el-cat.html
├── styles.css · ads.css
├── js/
│   ├── tax-data.js     ← DATOS FISCALES (actualizar cada año)
│   ├── site.js         ← nav, formato, consentimiento, carga de AdSense + GA4
│   ├── hero.js         ← mini calculadora de la portada
│   └── calc-isr.js · calc-aguinaldo.js · calc-prestamos.js
├── robots.txt · sitemap.xml · ads.txt
└── vercel.json         ← cleanUrls, headers de seguridad y caché
```

## Previsualizar en local

Con URLs limpias (como en Vercel):

```bash
python3 scripts/serve.py 8777    # si guardas el script; si no, usa:
python3 -m http.server 8000      # y abre las páginas con .html
```

## Publicar

Vercel despliega automáticamente cada push a `main`.
Las ramas generan un **deployment de preview** con su propia URL para revisar antes del merge.

DNS (Hostinger): `www` y apex apuntando a Vercel; `www.calculamx.net` como dominio principal
(Vercel redirige el apex).

## IDs configurados / pendientes

| Dónde | Valor | Estado |
|---|---|---|
| `<head>` de cada página + `data-ad-client` + `ads.txt` | `ca-pub-6755325201030636` | ✅ configurado |
| `js/site.js` → `GA4_ID` | `G-HQWK5N6623` | ✅ configurado |
| Todos los `.html` → `data-ad-slot` | `0000000000` … `0000000007` | ⬜ pendiente — reemplazar solo si creas **anuncios manuales** en AdSense (ver abajo) |

### Cómo funcionan los anuncios

El script base de AdSense (`pagead2.googlesyndication.com/...`) se carga **sin condición** en
el `<head>` de cada página — así lo pide Google para verificar el sitio y para que **Auto
ads** funcione. Google Analytics, en cambio, solo se carga si la persona acepta el aviso de
cookies (`js/site.js`).

Dos formas de mostrar anuncios, no son excluyentes:

- **Auto ads** (recomendado para empezar): actívalo en el dashboard de AdSense → "Anuncios"
  → "Auto ads". Google decide solo dónde poner los anuncios, sin tocar código.
- **Anuncios manuales**: si en AdSense creas un bloque de anuncio específico, te dará un
  `data-ad-slot`. Reemplaza el marcador correspondiente (`0000000000`, etc.) en el `.html`
  de esa página — `js/site.js` ya detecta y activa cualquier bloque con un slot real.

### Estado de la solicitud

1. ✅ Cuenta creada, ID de editor obtenido.
2. ⬜ Esperando aprobación de Google (de unos días a ~2 semanas).
3. Mientras revisan, el sitio se ve normal; los anuncios (o los recuadros "Espacio
   reservado" de los bloques manuales) empiezan a mostrarse al aprobar.
4. No hagas clic en tus propios anuncios.

## Actualizar las tablas fiscales (cada enero–febrero)

Edita **`js/tax-data.js`** y verifica contra el DOF:

- `anioVigente` y `revisado`
- `tarifaMensual`, `tarifaQuincenal` (Anexo 8 RMF / art. 96 LISR). La anual se calcula sola (× 12).
- `umaDiaria`, `umaMensual`, `umaAnual` (INEGI, vigente 1 de febrero)
- `salarioMinimoDiario`, `salarioMinimoZLFN` (CONASAMI, vigente 1 de enero)
- `subsidioEmpleo` (decreto vigente)

Renombra `guias/tabla-isr-2026.html` al año en curso, actualiza sus enlaces y `sitemap.xml`.

## Datos vigentes (ejercicio 2026)

- Tarifa ISR 2026: Anexo 8 RMF, DOF 28/12/2025 (actualización por inflación; % sin cambio).
- UMA 2026: $117.31 diaria · $3,566.22 mensual (INEGI, DOF 08/01/2026).
- Salario mínimo 2026: $315.04 general · $440.87 ZLFN (CONASAMI, DOF 09/12/2025).
- Subsidio al empleo 2026: $535.65/mes (feb–dic), tope $11,492.66.

## Roadmap

Ver `SEO.md` para la estrategia de posicionamiento. Calculadoras pendientes:
finiquito/liquidación, sueldo neto↔bruto, declaración anual con deducciones,
RESICO/honorarios, crédito Infonavit, comparador de créditos. Falta `og-image.png` (1200×630).
