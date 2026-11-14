import React from "react";
import { DEFECT_CLASSES } from "../constants/defectClasses";

export function DefectList({
  detections = [],
  hoveredDefect,
  selectedDefect,
  onHoverDefect,
  onSelectDefect,
  minConfidence,
  setMinConfidence,
  showBoxes,
  setShowBoxes,
  showLabels,
  setShowLabels,
  showConf,
  setShowConf,
  activeClasses,
  toggleActiveClass,
  onExportJson,
  onPrintReport
}) {
  const visibleDetections = detections.filter(
    (d) => d.confidence >= minConfidence && (!activeClasses || activeClasses.includes(d.label))
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Panneau de configuration des filtres */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Filtres de Détection</span>
          <span className="text-cyan-400 font-mono font-medium">
            Seuil min : {(minConfidence * 100).toFixed(0)}%
          </span>
        </div>

        {/* Curseur de seuil de confiance */}
        <input
          type="range"
          min="0.4"
          max="0.99"
          step="0.01"
          value={minConfidence}
          onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />

        {/* Toggles d'affichage */}
        <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showBoxes}
              onChange={(e) => setShowBoxes(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Boîtes (BBox)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Étiquettes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showConf}
              onChange={(e) => setShowConf(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Scores %</span>
          </label>
        </div>

        {/* Filtres par classe */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Filtrer par type de défaut
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(DEFECT_CLASSES).map((className) => {
              const meta = DEFECT_CLASSES[className];
              const isChecked = !activeClasses || activeClasses.includes(className);
              return (
                <button
                  key={className}
                  type="button"
                  onClick={() => toggleActiveClass(className)}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all flex items-center gap-1 border ${
                    isChecked
                      ? "bg-slate-800 text-white border-slate-700"
                      : "bg-slate-950/40 text-slate-500 border-slate-800/60 line-through"
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  {className}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Liste des défauts détectés */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-semibold text-slate-300">
            Détail des Détections ({visibleDetections.length})
          </span>
          <span className="text-slate-500 text-[11px]">
            Conforme EF-06 & EF-14
          </span>
        </div>

        {visibleDetections.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-300">
              Aucun défaut ne correspond aux filtres
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ajustez le curseur de seuil ou cochez d'autres catégories.
            </p>
          </div>
        ) : (
          visibleDetections.map((det, index) => {
            const meta = DEFECT_CLASSES[det.label] || {
              color: "#38bdf8",
              fr: det.label,
              description: ""
            };
            const isHovered = hoveredDefect === index;
            const isSelected = selectedDefect === index;
            const [xMin, yMin, xMax, yMax] = det.bbox;
            const width = xMax - xMin;
            const height = yMax - yMin;

            return (
              <div
                key={`${det.label}-${index}`}
                onMouseEnter={() => onHoverDefect(index)}
                onMouseLeave={() => onHoverDefect(null)}
                onClick={() => onSelectDefect(isSelected ? null : index)}
                className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-slate-800/90 border-cyan-400 shadow-md shadow-cyan-500/10"
                    : isHovered
                    ? "bg-slate-800/70 border-slate-600"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* En-tête du défaut */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-xs font-bold text-white tracking-tight">
                      {det.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({meta.fr})
                    </span>
                  </div>

                  {/* Badge de confiance */}
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-mono font-bold"
                    style={{
                      backgroundColor: `${meta.color}20`,
                      color: meta.color,
                      border: `1px solid ${meta.color}50`
                    }}
                  >
                    {(det.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Barre de confiance */}
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${det.confidence * 100}%`,
                      backgroundColor: meta.color
                    }}
                  />
                </div>

                {/* Coordonnées Bounding Box (EF-14) */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center justify-between bg-slate-950/60 px-2 py-1 rounded">
                    <span>BBox :</span>
                    <span className="text-slate-200">
                      [{xMin}, {yMin}, {xMax}, {yMax}]
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-950/60 px-2 py-1 rounded">
                    <span>Taille :</span>
                    <span className="text-slate-200">
                      {width} × {height} px
                    </span>
                  </div>
                </div>

                {/* Description brève */}
                {meta.description && (
                  <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-1 italic">
                    {meta.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Actions d'export & rapport */}
      <div className="pt-2 border-t border-slate-800 flex gap-2">
        <button
          type="button"
          onClick={onExportJson}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          title="Exporter les résultats sous le format JSON du contrat d'équipe"
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exporter JSON (Contrat)
        </button>

        <button
          type="button"
          onClick={onPrintReport}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center"
          title="Imprimer la fiche de contrôle"
        >
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

