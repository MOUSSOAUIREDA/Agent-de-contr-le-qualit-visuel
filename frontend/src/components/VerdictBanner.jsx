import React from "react";

export function VerdictBanner({ status, detectionsCount = 0, imageName = "" }) {
  const isHealthy = status === "no_defect" || detectionsCount === 0;

  if (isHealthy) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-xl shadow-emerald-950/40">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-emerald-300 tracking-tight">
                CONFORME — Aucun défaut détecté
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-slate-950">
                QC PASS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              La bouteille en verre respecte les critères de qualité visuelle (EF-10).
            </p>
            {imageName && (
              <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
                Fichier analysé : {imageName}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-500/40 shadow-xl shadow-rose-950/40">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0 text-rose-400 animate-pulse">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-rose-300 tracking-tight">
              NON CONFORME — {detectionsCount} Défaut{detectionsCount > 1 ? "s" : ""} Détecté{detectionsCount > 1 ? "s" : ""}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white">
              REJET QUALITÉ
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Anomalie(s) détectée(s) sur le verre : inspection manuelle ou éjection recommandée.
          </p>
          {imageName && (
            <p className="text-[11px] font-mono text-slate-400 mt-1 truncate">
              Fichier analysé : {imageName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

