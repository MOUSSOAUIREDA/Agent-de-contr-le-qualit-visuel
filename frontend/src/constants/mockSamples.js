// SVG generator for realistic glass bottle illustrations with simulated defects
function createBottleSvg({ bubble = false, blackSpot = false, oil = false, thread = false, grain = false }) {
  const width = 400;
  const height = 500;

  let defectsSvg = "";

  if (bubble) {
    // Bubble bbox: [120, 80, 200, 160]
    defectsSvg += `
      <g id="defect-bubble">
        <circle cx="160" cy="120" r="32" fill="url(#bubbleGrad)" stroke="#67e8f9" stroke-width="2.5" opacity="0.9" />
        <ellipse cx="150" cy="108" rx="10" ry="5" fill="#ffffff" opacity="0.8" />
        <circle cx="172" cy="132" r="4" fill="#ffffff" opacity="0.6" />
      </g>
    `;
  }

  if (blackSpot) {
    // Black spot bbox: [140, 180, 175, 215]
    defectsSvg += `
      <g id="defect-black-spot">
        <path d="M148,190 Q158,185 168,193 Q174,204 165,212 Q150,214 145,202 Z" fill="#18181b" stroke="#71717a" stroke-width="1.5" />
        <circle cx="152" cy="196" r="3" fill="#27272a" />
      </g>
    `;
  }

  if (oil) {
    // Oil bbox: [220, 260, 290, 320]
    defectsSvg += `
      <g id="defect-oil">
        <path d="M225,270 C240,260 275,268 285,282 C292,298 278,315 255,318 C235,320 220,305 222,288 Z" fill="url(#oilGrad)" opacity="0.75" />
      </g>
    `;
  }

  if (thread) {
    // Plastering thread bbox: [160, 110, 240, 290]
    defectsSvg += `
      <g id="defect-thread">
        <path d="M185,120 Q170,160 215,205 T195,280" fill="none" stroke="#e9d5ff" stroke-width="4.5" stroke-linecap="round" opacity="0.85" />
        <path d="M187,122 Q172,162 217,207 T197,282" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" opacity="0.9" />
      </g>
    `;
  }

  if (grain) {
    // Quenched grain bbox: [95, 340, 145, 390]
    defectsSvg += `
      <g id="defect-grain">
        <circle cx="115" cy="360" r="14" fill="url(#grainGrad)" stroke="#34d399" stroke-width="2" stroke-dasharray="3,2" />
        <circle cx="125" cy="372" r="8" fill="#34d399" opacity="0.6" />
        <circle cx="108" cy="355" r="4" fill="#6ee7b7" opacity="0.8" />
      </g>
    `;
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="bottleBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#064e3b" stop-opacity="0.85" />
      <stop offset="25%" stop-color="#059669" stop-opacity="0.4" />
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.25" />
      <stop offset="75%" stop-color="#059669" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#022c22" stop-opacity="0.9" />
    </linearGradient>
    <linearGradient id="bottleHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
    </linearGradient>
    <radialGradient id="bubbleGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#67e8f9" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#0891b2" stop-opacity="0.8" />
    </radialGradient>
    <radialGradient id="oilGrad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fb7185" stop-opacity="0.8" />
      <stop offset="60%" stop-color="#e11d48" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#881337" stop-opacity="0.9" />
    </radialGradient>
    <radialGradient id="grainGrad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#a7f3d0" stop-opacity="0.9" />
      <stop offset="70%" stop-color="#10b981" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#047857" stop-opacity="0.8" />
    </radialGradient>
  </defs>

  <!-- Studio backdrop -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
  <circle cx="200" cy="260" r="180" fill="#38bdf8" opacity="0.04" filter="blur(40px)" />

  <!-- Grid lines for industrial inspection feel -->
  <g stroke="#334155" stroke-width="0.5" opacity="0.3">
    <line x1="50" y1="0" x2="50" y2="500" />
    <line x1="100" y1="0" x2="100" y2="500" />
    <line x1="200" y1="0" x2="200" y2="500" stroke="#0ea5e9" stroke-width="0.7" stroke-dasharray="4,4" />
    <line x1="300" y1="0" x2="300" y2="500" />
    <line x1="350" y1="0" x2="350" y2="500" />
    <line x1="0" y1="100" x2="400" y2="100" />
    <line x1="0" y1="200" x2="400" y2="200" />
    <line x1="0" y1="250" x2="400" y2="250" stroke="#0ea5e9" stroke-width="0.7" stroke-dasharray="4,4" />
    <line x1="0" y1="300" x2="400" y2="300" />
    <line x1="0" y1="400" x2="400" y2="400" />
  </g>

  <!-- Bottle Silhouette & Glass Body -->
  <g id="glass-bottle">
    <!-- Outer glass path: Bottle neck, shoulder, body, base -->
    <path d="
      M 172,30
      L 228,30
      C 232,30 234,34 234,40
      L 230,48
      C 228,52 226,60 226,75
      C 226,90 236,115 285,150
      C 305,165 315,190 315,225
      L 315,440
      C 315,455 305,465 285,465
      L 115,465
      C 95,465 85,455 85,440
      L 85,225
      C 85,190 95,165 115,150
      C 164,115 174,90 174,75
      C 174,60 172,52 170,48
      L 166,40
      C 166,34 168,30 172,30 Z
    " fill="url(#bottleBody)" stroke="#34d399" stroke-width="2" stroke-opacity="0.7" />

    <!-- Bottle Lip Ring / Bague -->
    <ellipse cx="200" cy="34" rx="30" ry="6" fill="#047857" stroke="#6ee7b7" stroke-width="1.5" />
    <ellipse cx="200" cy="46" rx="31" ry="5" fill="#065f46" stroke="#34d399" stroke-width="1.2" />

    <!-- Glass Specular Reflection Highlight (Left edge) -->
    <path d="
      M 178,75
      C 178,92 168,118 125,150
      C 107,164 100,185 100,215
      L 100,430
      C 100,438 102,442 105,445
      L 96,445
      C 92,440 90,435 90,425
      L 90,220
      C 90,192 98,168 118,153
      C 160,122 170,96 170,75 Z
    " fill="url(#bottleHighlight)" />

    <!-- Soft Right specular line -->
    <path d="M 300,220 L 300,430" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.3" filter="blur(2px)" />

    <!-- Bottom punt / concave base indication -->
    <path d="M 115,455 Q 200,440 285,455" fill="none" stroke="#047857" stroke-width="3" opacity="0.7" />
  </g>

  <!-- Simulated Physical Defects -->
  ${defectsSvg}
</svg>
`;

  return "data:image/svg+xml;utf8," + encodeURIComponent(svg.trim());
}

export const MOCK_SAMPLES = [
  {
    id: "sample-bubble",
    name: "Bouteille avec Bulle",
    tag: "Bubble (Exemple Officiel)",
    description: "Cas conforme à l'exemple officiel contrat/exemple.json avec bulle d'air sur le col.",
    data: {
      image: "bouteille_avec_defaut.jpg",
      status: "defects_detected",
      detections: [
        {
          label: "Bubble",
          confidence: 0.94,
          bbox: [120, 80, 200, 160]
        }
      ]
    },
    imageUrl: createBottleSvg({ bubble: true })
  },
  {
    id: "sample-clean",
    name: "Bouteille Saine",
    tag: "Sans Défaut (Conforme)",
    description: "Bouteille saine conforme (status: no_defect, 0 détection) selon le contrat.",
    data: {
      image: "bouteille_saine.jpg",
      status: "no_defect",
      detections: []
    },
    imageUrl: createBottleSvg({})
  },
  {
    id: "sample-multi",
    name: "Bouteille Multi-Défauts",
    tag: "3 Défauts Critiques",
    description: "Bouteille présentant une tache noire, de l'huile résiduelle et un grain de trempe.",
    data: {
      image: "bouteille_multi_defauts.jpg",
      status: "defects_detected",
      detections: [
        {
          label: "Black spot",
          confidence: 0.91,
          bbox: [140, 180, 175, 215]
        },
        {
          label: "Oil",
          confidence: 0.87,
          bbox: [220, 260, 290, 320]
        },
        {
          label: "Quenched grain",
          confidence: 0.79,
          bbox: [95, 340, 145, 390]
        }
      ]
    },
    imageUrl: createBottleSvg({ blackSpot: true, oil: true, grain: true })
  },
  {
    id: "sample-thread",
    name: "Bouteille avec Fil de Verre",
    tag: "Plastering thread",
    description: "Filament/cordon de verre le long de l'épaule et du corps de la bouteille.",
    data: {
      image: "bouteille_fil_verre.jpg",
      status: "defects_detected",
      detections: [
        {
          label: "Plastering thread",
          confidence: 0.88,
          bbox: [160, 110, 240, 290]
        }
      ]
    },
    imageUrl: createBottleSvg({ thread: true })
  }
];

