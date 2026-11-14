import React from "react";

export function Header({
  mode,
  setMode,
  isBackendOnline,
  onOpenSettings,
  stats
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 3h6v3a4 4 0 0 1 1 2.8V19a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8.8A4 4 0 0 1 9 6V3z" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <circle cx="12" cy="15" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  QualiGlass AI
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                  Contrôle Qualité
                </span>
                <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono">
                  Membre C : Frontend
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Inspection visuelle automatisée & détection des défauts de bouteilles en verre
              </p>
            </div>
          </div>

          {/* Metrics, Mode switch & Settings */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick stats */}
            <div className="hidden md:flex items-center gap-4 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Total :</span>
                <span className="font-semibold text-white">{stats.total}</span>
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400">Conformes :</span>
                <span className="font-semibold text-emerald-300">{stats.passed}</span>
              </div>
              <div className="w-px h-3 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="text-rose-400">Rejets :</span>
                <span className="font-semibold text-rose-300">{stats.failed}</span>
              </div>
            </div>

            {/* Mode selector (Mock vs Live) */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setMode("mock")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  mode === "mock"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Mode Démo & Simulation (Actif pendant l'entraînement du modèle par Membre A)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Mode Démo / Mock
              </button>
              <button
                type="button"
                onClick={() => setMode("live")}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                  mode === "live"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Mode Live API (FastAPI Membre B)"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isBackendOnline ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                Live API FastAPI
              </button>
            </div>

            {/* Settings button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Paramètres de connexion API"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

