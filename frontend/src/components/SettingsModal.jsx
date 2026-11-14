import React, { useState } from "react";
import { checkBackendHealth, DEFAULT_API_URL } from "../services/api";

export function SettingsModal({
  isOpen,
  onClose,
  apiUrl,
  setApiUrl,
  isBackendOnline,
  setIsBackendOnline
}) {
  const [tempUrl, setTempUrl] = useState(apiUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const online = await checkBackendHealth(tempUrl);
      setIsBackendOnline(online);
      setTestResult({
        success: online,
        message: online
          ? "Connexion réussie au backend FastAPI !"
          : "Backend inaccessible (port 8000 non démarré). Le mode simulation reste actif."
      });
    } catch {
      setIsBackendOnline(false);
      setTestResult({
        success: false,
        message: "Erreur lors de la tentative de connexion."
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setApiUrl(tempUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-scaleUp">
        {/* En-tête du Modal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Configuration API</h3>
              <p className="text-xs text-slate-400">Intégration Backend FastAPI (Membre B)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Note sur l'équipe */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">ℹ️ Organisation du projet :</p>
          <p>
            • <strong className="text-cyan-400">Membre A</strong> entraîne le modèle YOLO.<br />
            • <strong className="text-emerald-400">Membre B</strong> développe l'API FastAPI.<br />
            • <strong className="text-indigo-400">Membre C</strong> (vous) pilote l'interface.
          </p>
        </div>

        {/* Champ URL */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Adresse de l'API Backend (FastAPI)
          </label>
          <input
            type="text"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTempUrl("http://localhost:8000")}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              Défaut (localhost:8000)
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => setTempUrl("http://127.0.0.1:8000")}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              127.0.0.1:8000
            </button>
          </div>
        </div>

        {/* Bouton Tester la connexion */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isTesting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                Test de connexion en cours...
              </>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full ${isBackendOnline ? "bg-emerald-400" : "bg-amber-400"}`} />
                Tester la connexion FastAPI
              </>
            )}
          </button>

          {testResult && (
            <div
              className={`p-2.5 rounded-lg text-xs border ${
                testResult.success
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-amber-950/40 border-amber-500/40 text-amber-300"
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>

        {/* Pied de modal */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

