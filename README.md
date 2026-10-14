# Insect Vault

Micro-Entomological Anatomy Vector Synthesis Engine built on the Swiss-Archival design system.

## Overview

Insect Vault is an archival procedural entomology synthesis engine and vector anatomical repository modeled after 19th-century cabinet-of-curiosities pin-mounted field studies. Grounded in the taxonomic traditions of Carl Linnaeus's *Systema Naturae* (1758) and Dru Drury's *Illustrations of Natural History* (1770), the engine procedurally synthesizes three foundational insect orders:

- **Coleoptera**: Hardened elytra, dorsal suture, 12 parallel longitudinal puncture striae, pronotal disc, mandibles, lamellate/serrate antennae, cursorial/fossorial legs.
- **Lepidoptera**: Bilateral broad forewings and hindwings with radial veins (R1-R5, M1-M3, CuA), discal cells, submarginal lunules, bipectinate plumose or clavate antennae, coiled proboscis.
- **Odonata**: 4 vitreous elongated horizontal wings with Costa, nodus notch, pterostigma cells, dense Voronoi-like reticulation crossveins, large hemispherical compound eyes, and 10-segment abdomen.

## Architectural Features

- **Archival Vermilion Seal Chop**: 朱砂印章 · 虫豸典藏 (*Chóng Zhì Diǎn Cáng* · Insect Archival Collection).
- **Scale Bar**: 5mm Micro-Metric Caliper Rule (SCALE 10:1) with vernier caliper divisions.
- **Pin-Mounting Aesthetic**: Authentic enameled brass entomological mounting pin placed at the mesothoracic disc.
- **Engraved Vector Typography**: Single-stroke Hershey cursive Latin binomen lettering.
- **Five Archival Palettes**:
  - `curio`: Archival Curio (Aged Vellum, Iron Gall Ink, Cinnabar Red)
  - `scarab`: Scarab Melanic (Dark Chitin Carbon, Iridescent Bronze Gold)
  - `cyanotype`: Prussian Cyanotype (Prussian Blue, Chalk White, Copper Pin)
  - `amber`: Baltic Amber (Honey Amber Resin, Fossil Cuticle Ink)
  - `malachite`: Verdigris Herbarium (Sage Herbarium Paper, Forest Verdigris Ink)
- **Zero-Dependency UMD Engine**: `window.InsectDraw` runs seamlessly in both Node.js and browser environments.

## Quickstart

### Docker Deployment

```bash
docker compose up -d --build
```

Access the application at `http://localhost:8090`.

### Programmatic Usage

```javascript
const InsectDraw = require('./js/insectdraw.js');

// Synthesize an entomological specimen
const specimen = InsectDraw.synthesize("Dynastes hercules Cabinet Holotype", {
  palette: "curio"
});

console.log(specimen.accessionId); // e.g. "INV-CO-0048A2"
console.log(specimen.binomen);     // e.g. "Dynastes hercules"

// Generate standalone SVG plate
const svg = InsectDraw.generateSvgPlate(specimen, {
  width: 1200,
  height: 800,
  palette: "curio"
});
```

### Iframe Embed Protocol

```html
<iframe 
  src="https://insect-vault.glassgallery.my.id/?id=INV-CO-0048A2&palette=curio&w=1&h=1&mode=embed" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border:1px solid #DDD5C5; background:#EFE9DC;">
</iframe>
```

## License

MIT License. Designed and authored by Azzar Budiyanto.
