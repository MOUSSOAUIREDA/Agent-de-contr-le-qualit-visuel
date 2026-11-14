/**
 * Service API pour la communication avec le backend FastAPI (Membre B)
 * et gestion du mode simulation / mock lorsque le modèle (Membre A) ou le backend sont en cours de dev.
 */

export const DEFAULT_API_URL = "http://localhost:8000";

const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Valide le fichier d'image selon les exigences EF-02 et EF-03
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: "Aucun fichier sélectionné." };
  }

  const isTypeValid = VALID_MIME_TYPES.includes(file.type) ||
    /\.(jpe?g|png|webp|bmp)$/i.test(file.name);

  if (!isTypeValid) {
    return {
      valid: false,
      error: `Format non supporté (${file.type || "inconnu"}). Formats acceptés : JPG, PNG, WEBP, BMP.`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Fichier trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} Mo). Limite : 20 Mo.`
    };
  }

  return { valid: true, error: null };
}

/**
 * Vérifie si le backend FastAPI est accessible
 */
export async function checkBackendHealth(apiUrl = DEFAULT_API_URL) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    // Tentative sur /health ou /docs ou /
    const response = await fetch(`${apiUrl}/health`, {
      method: "GET",
      signal: controller.signal
    }).catch(() => fetch(`${apiUrl}/docs`, { method: "HEAD", signal: controller.signal }));

    clearTimeout(timeoutId);
    return response && (response.ok || response.status === 200 || response.status === 404);
  } catch {
    return false;
  }
}

/**
 * Génère une réponse de simulation pour une image utilisateur aléatoire
 */
export function generateMockDetection(fileName, imgWidth = 400, imgHeight = 500) {
  // Simule des défauts plausibles sur l'image envoyée
  const classes = ["Bubble", "Plastering thread", "Black spot", "Oil", "Quenched grain"];
  // Déterminisme léger basé sur le nom du fichier
  let hash = 0;
  for (let i = 0; i < fileName.length; i++) {
    hash = (hash << 5) - hash + fileName.charCodeAt(i);
    hash |= 0;
  }
  const hasDefect = Math.abs(hash) % 5 !== 0; // 80% de chance d'avoir au moins 1 défaut

  if (!hasDefect) {
    return {
      image: fileName,
      status: "no_defect",
      detections: []
    };
  }

  const defectCount = (Math.abs(hash) % 3) + 1;
  const detections = [];

  for (let i = 0; i < defectCount; i++) {
    const label = classes[(Math.abs(hash) + i) % classes.length];
    const confidence = parseFloat((0.72 + (Math.abs(hash * (i + 1)) % 25) / 100).toFixed(2));

    // Bounding box proportionnelle à l'image
    const boxW = Math.max(30, Math.floor(imgWidth * (0.12 + 0.05 * i)));
    const boxH = Math.max(30, Math.floor(imgHeight * (0.10 + 0.04 * i)));
    const xMin = Math.floor(imgWidth * 0.25 + (Math.abs(hash + i * 37) % Math.floor(imgWidth * 0.4)));
    const yMin = Math.floor(imgHeight * 0.15 + (Math.abs(hash + i * 73) % Math.floor(imgHeight * 0.6)));

    detections.push({
      label,
      confidence: Math.min(0.99, confidence),
      bbox: [xMin, yMin, Math.min(imgWidth - 5, xMin + boxW), Math.min(imgHeight - 5, yMin + boxH)]
    });
  }

  return {
    image: fileName,
    status: "defects_detected",
    detections
  };
}

/**
 * Envoi de l'image pour analyse (FastAPI ou Mock)
 */
export async function analyzeImage({
  file,
  apiUrl = DEFAULT_API_URL,
  forceMock = false,
  imageDimensions = { width: 400, height: 500 }
}) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (forceMock) {
    // Simulation avec latence réseau réaliste (450ms)
    await new Promise((resolve) => setTimeout(resolve, 450));
    return generateMockDetection(file.name, imageDimensions.width, imageDimensions.height);
  }

  // Tentative vers le backend FastAPI de Membre B
  const formData = new FormData();
  formData.append("file", file);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${apiUrl}/predict`, {
      method: "POST",
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur du serveur (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();

    // Validation du schéma conforme au contrat
    if (!data.status || !Array.isArray(data.detections)) {
      throw new Error("La réponse du serveur ne respecte pas le contrat attendu (champs requis: status, detections).");
    }

    return data;
  } catch (err) {
    // Si backend hors-ligne, fallback transparent avec avertissement
    console.warn("Backend FastAPI inaccessible, bascule sur simulation locale:", err.message);
    const mockData = generateMockDetection(file.name, imageDimensions.width, imageDimensions.height);
    mockData._fallbackFromError = err.message;
    return mockData;
  }
}

