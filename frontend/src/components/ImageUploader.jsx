import React, { useRef, useState } from "react";
import { MOCK_SAMPLES } from "../constants/mockSamples";

export function ImageUploader({
  onImageSelected,
  onSampleSelected,
  isLoading,
  error,
  clearError
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    clearError?.();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    clearError?.();
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Zone de Drag & Drop principale */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 backdrop-blur-sm group ${
          isDragging
            ? "border-cyan-400 bg-cyan-950/20 scale-[1.01] shadow-xl shadow-cyan-500/10"
            : "border-slate-700 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/70"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.bmp,image/jpeg,image/png,image/webp,image/bmp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-transform duration-200 border border-slate-600/50 shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Glissez-déposez l'image de la bouteille ici
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              ou <span className="text-cyan-400 underline font-medium">parcourez vos fichiers</span> depuis votre ordinateur
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-400 font-mono">
            <span>JPG</span>
            <span className="text-slate-600">•</span>
            <span>PNG</span>
            <span className="text-slate-600">•</span>
            <span>WEBP</span>
            <span className="text-slate-600">•</span>
            <span>BMP (Max 20 Mo)</span>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-sm font-medium text-cyan-300">Analyse de l'image en cours...</p>
          </div>
        )}
      </div>

      {/* Message d'erreur de format (EF-03) */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-start gap-3 animate-shake">
          <svg className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-rose-200">Erreur lors de l'importation de l'image (EF-03)</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-rose-400 hover:text-rose-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Galerie d'échantillons de test rapide */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Échantillons de Démonstration (Prêts pour le test immédiat)
            </h4>
          </div>
          <span className="text-xs text-slate-500">
            Conforme au contrat V1
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOCK_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSampleSelected(sample)}
              className="flex flex-col text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 group relative overflow-hidden"
            >
              <div className="w-full h-24 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden mb-2.5 border border-slate-800">
                <img
                  src={sample.imageUrl}
                  alt={sample.name}
                  className="h-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {sample.name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  sample.data.status === "no_defect"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                }`}>
                  {sample.data.status === "no_defect" ? "Conforme" : `${sample.data.detections.length} déf.`}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

