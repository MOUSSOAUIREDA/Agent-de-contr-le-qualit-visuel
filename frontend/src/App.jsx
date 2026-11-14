import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ImageUploader } from "./components/ImageUploader";
import { CanvasViewer } from "./components/CanvasViewer";
import { VerdictBanner } from "./components/VerdictBanner";
import { DefectList } from "./components/DefectList";
import { InspectionHistory } from "./components/InspectionHistory";
import { SettingsModal } from "./components/SettingsModal";
import {
  analyzeImage,
  checkBackendHealth,
  DEFAULT_API_URL,
  validateImageFile
} from "./services/api";

export function App() {
  const [mode, setMode] = useState("mock"); // "mock" ou "live"
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Analyse en cours
  const [currentImage, setCurrentImage] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: 400, height: 500 });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtres & Visualisation
  const [hoveredDefect, setHoveredDefect] = useState(null);
  const [selectedDefect, setSelectedDefect] = useState(null);
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showConf, setShowConf] = useState(true);
  const [activeClasses, setActiveClasses] = useState(null); // null = toutes les classes

  // Historique et Statistiques
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total: 0, passed: 0, failed: 0 });

  // Vérifier la disponibilité du backend au démarrage
  useEffect(() => {
    checkBackendHealth(apiUrl).then((online) => {
      setIsBackendOnline(online);
      if (online) {
        setMode("live");
      }
    });
  }, [apiUrl]);

  // Basculer un filtre de classe
  const toggleActiveClass = (className) => {
    setActiveClasses((prev) => {
      if (!prev) {
        // Désactiver cette classe
        const allClasses = ["Bubble", "Plastering thread", "Black spot", "Oil", "Quenched grain"];
        return allClasses.filter((c) => c !== className);
      }
      if (prev.includes(className)) {
        const next = prev.filter((c) => c !== className);
        return next.length === 0 ? null : next;
      }
      return [...prev, className];
    });
  };

  // Traiter un échantillon prédéfini (Démonstration immédiate)
  const handleSampleSelected = (sample) => {
    setError(null);
    setCurrentImage(sample.imageUrl);
    setCurrentFileName(sample.data.image);
    setAnalysisResult(sample.data);
    setSelectedDefect(null);
    setHoveredDefect(null);

    // Mettre à jour historique & stats
    const isPassed = sample.data.status === "no_defect" || sample.data.detections.length === 0;
    setHistory((prev) => [
      {
        timestamp: Date.now(),
        timeStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        imageUrl: sample.imageUrl,
        data: sample.data
      },
      ...prev
    ]);
    setStats((prev) => ({
      total: prev.total + 1,
      passed: prev.passed + (isPassed ? 1 : 0),
      failed: prev.failed + (isPassed ? 0 : 1)
    }));
  };

  // Traiter un fichier utilisateur (Upload)
  const handleImageSelected = async (file) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    setCurrentFileName(file.name);

    // Prévisualisation locale
    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target.result;
      setCurrentImage(url);

      // Calculer les dimensions de l'image
      const img = new Image();
      img.src = url;
      img.onload = async () => {
        const dims = { width: img.naturalWidth || 400, height: img.naturalHeight || 500 };
        setImageDimensions(dims);

        try {
          const result = await analyzeImage({
            file,
            apiUrl,
            forceMock: mode === "mock",
            imageDimensions: dims
          });

          setAnalysisResult(result);
          setSelectedDefect(null);
          setHoveredDefect(null);

          // Si un avertissement de fallback existe
          if (result._fallbackFromError) {
            console.info("Info:", result._fallbackFromError);
          }

          // Historique & Stats
          const isPassed = result.status === "no_defect" || result.detections.length === 0;
          setHistory((prev) => [
            {
              timestamp: Date.now(),
              timeStr: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              imageUrl: url,
              data: result
            },
            ...prev
          ]);
          setStats((prev) => ({
            total: prev.total + 1,
            passed: prev.passed + (isPassed ? 1 : 0),
            failed: prev.failed + (isPassed ? 0 : 1)
          }));
        } catch (err) {
          setError(err.message || "Erreur lors de l'analyse.");
        } finally {
          setIsLoading(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Recharger un élément de l'historique
  const handleSelectHistoryItem = (item) => {
    setCurrentImage(item.imageUrl);
    setCurrentFileName(item.data.image);
    setAnalysisResult(item.data);
    setSelectedDefect(null);
    setHoveredDefect(null);
  };

  // Réinitialiser pour une nouvelle image
  const handleResetImage = () => {
    setCurrentImage(null);
    setAnalysisResult(null);
    setSelectedDefect(null);
    setHoveredDefect(null);
    setError(null);
  };

  // Exporter le contrat JSON conforme
  const handleExportJson = () => {
    if (!analysisResult) return;
    const cleanData = {
      image: analysisResult.image || currentFileName,
      status: analysisResult.status,
      detections: analysisResult.detections.map((d) => ({
        label: d.label,
        confidence: d.confidence,
        bbox: d.bbox
      }))
    };

    const blob = new Blob([JSON.stringify(cleanData, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rapport_inspection_${(analysisResult.image || "bouteille").replace(/\.[^/.]+$/, "")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Imprimer la fiche d'inspection
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Barre de navigation supérieure */}
      <Header
        mode={mode}
        setMode={setMode}
        isBackendOnline={isBackendOnline}
        onOpenSettings={() => setIsSettingsOpen(true)}
        stats={stats}
      />

      {/* Bannière informative si mode simulation */}
      {mode === "mock" && (
        <div className="bg-cyan-950/40 border-b border-cyan-800/40 px-4 py-2 text-center text-xs text-cyan-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>
            <strong>Mode Simulation Actif :</strong> Le modèle YOLO est en cours d'entraînement par le membre A. L'interface utilise les données de test conformes au contrat d'équipe (contrat/schema.py).
          </span>
        </div>
      )}

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-6">
        {!currentImage ? (
          /* Écran d'accueil & Upload */
          <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full py-8">
            <div className="text-center mb-8 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400 font-mono">
                Poste de Contrôle Qualité — Étape TP5
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Contrôle Visuel des Bouteilles en Verre
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                Importez une image pour détecter automatiquement les défauts (bulles, fils de verre, taches noires, traces d'huile et grains de trempe).
              </p>
            </div>

            <ImageUploader
              onImageSelected={handleImageSelected}
              onSampleSelected={handleSampleSelected}
              isLoading={isLoading}
              error={error}
              clearError={() => setError(null)}
            />
          </div>
        ) : (
          /* Écran d'analyse et inspection interactif */
          <div className="flex-1 flex flex-col space-y-6">
            {/* Verdict global de conformité */}
            {analysisResult && (
              <VerdictBanner
                status={analysisResult.status}
                detectionsCount={analysisResult.detections?.length || 0}
                imageName={currentFileName}
              />
            )}

            {/* Grille principale : Inspecteur à gauche, Détails à droite */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
              {/* Colonne Gauche : Visualiseur Canvas Interactif (7 col) */}
              <div className="lg:col-span-7 h-full">
                <CanvasViewer
                  imageUrl={currentImage}
                  imageDimensions={imageDimensions}
                  detections={analysisResult?.detections || []}
                  hoveredDefect={hoveredDefect}
                  selectedDefect={selectedDefect}
                  onSelectDefect={setSelectedDefect}
                  minConfidence={minConfidence}
                  showBoxes={showBoxes}
                  showLabels={showLabels}
                  showConf={showConf}
                  activeClasses={activeClasses}
                  onResetImage={handleResetImage}
                />
              </div>

              {/* Colonne Droite : Filtres et Liste des défauts (5 col) */}
              <div className="lg:col-span-5 h-full">
                <DefectList
                  detections={analysisResult?.detections || []}
                  hoveredDefect={hoveredDefect}
                  selectedDefect={selectedDefect}
                  onHoverDefect={setHoveredDefect}
                  onSelectDefect={setSelectedDefect}
                  minConfidence={minConfidence}
                  setMinConfidence={setMinConfidence}
                  showBoxes={showBoxes}
                  setShowBoxes={setShowBoxes}
                  showLabels={showLabels}
                  setShowLabels={setShowLabels}
                  showConf={showConf}
                  setShowConf={setShowConf}
                  activeClasses={activeClasses}
                  toggleActiveClass={toggleActiveClass}
                  onExportJson={handleExportJson}
                  onPrintReport={handlePrintReport}
                />
              </div>
            </div>

            {/* Historique de la session */}
            <InspectionHistory
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
              onClearHistory={() => setHistory([])}
            />
          </div>
        )}
      </main>

      {/* Modal de paramètres API */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
        isBackendOnline={isBackendOnline}
        setIsBackendOnline={setIsBackendOnline}
      />
    </div>
  );
}

