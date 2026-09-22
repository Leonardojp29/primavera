# Una flor para Brissa 🌻

Experiencia web 3D, corta y cinematográfica, para el 21 de septiembre: una flor amarilla que crece y florece con cada toque.
Pensada para abrirse desde un teléfono mediante un link.

## Correr en local

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (con `--host` también funciona desde el teléfono en la misma red).

## Build y despliegue

```bash
npm run build      # genera dist/
npm run preview    # sirve dist/ localmente
```

`dist/` es un sitio estático: se puede subir tal cual a Vercel, Netlify, Cloudflare Pages o GitHub Pages.
No hay backend ni variables de entorno.

## Cómo está construida

Todo es procedural: no se descargan modelos ni texturas.

- `src/experience/flower/` — la flor. `Stem` es un tubo que redistribuye sus anillos cada frame a lo largo de una curva, así crece de verdad. `Leaf` usa un vertex shader que desenrolla la hoja. `Petals` fusiona todos los pétalos y sépalos en una sola geometría; el shader los coloca y los abre con `uOpen`. `Disc` es el centro con flósculos en espiral de Vogel.
- `src/experience/state/` — `store` (zustand: etapa, captions), `anim` (valores continuos) y `director` (secuencias GSAP que avanzan la historia con cada toque).
- `src/experience/camera/` — la cámara sigue poses por etapa con amortiguación; órbita durante el florecimiento y primer plano al final. Parallax sutil con mouse y órbita limitada al arrastrar.
- `src/experience/lighting/` — uniforms compartidos que llevan la escena de azul tenue a dorado, cielo y suelo con el mismo color de niebla.
- `src/experience/particles/` — polvo dorado y polen en `Points` con shader; pétalos sueltos instanciados.
- `src/experience/postfx/` — bloom sutil, viñeta y tone mapping neutro.
- `src/experience/letter/` — el epílogo: un sobre de papel 3D colocado relativo a la cámara (texturas de papel generadas en canvas, solapa con bisagra, sello dorado). Al tocarlo hace el relevo a la carta HTML.
- `src/ui/Letter.tsx` — la carta: papel cálido con grano sutil, párrafos que entran en cascada, scroll interno en móvil, parallax leve en desktop y un detalle discreto al llegar a la firma. Se puede cerrar (× o tocando fuera) para ver la flor y volver a abrir con "Volver a la carta".
- `src/ui/TapCue.tsx` y `src/ui/useIdleHints.ts` — un anillo de luz proyectado desde el punto 3D a tocar y frases breves que aparecen solo cuando la historia espera un toque.
- `src/audio/` — reproduce `public/audio/ambient.mp3` en loop a través de Web Audio (fade in/out, filtro que se abre con el florecimiento, volumen más bajo mientras se lee la carta). La música está activa por defecto, pero el navegador solo permite sonar tras el primer toque, así que arranca con la primera interacción.
- `src/utils/quality.ts` — tiers de calidad por dispositivo (partículas, segmentos, MSAA, DPR máximo). El DPR además baja solo si caen los FPS.

## Personalizar

Los textos viven en `src/experience/state/director.ts`, `src/ui/Title.tsx` y la carta en `src/ui/Letter.tsx`.
Los tiempos de cada etapa están en las timelines del mismo `director.ts`.
