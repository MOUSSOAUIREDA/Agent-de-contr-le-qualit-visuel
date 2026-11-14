import React from "react";

export function InspectionHistory({
  history = [],
  onSelectHistoryItem,
  onClearHistory
}) {
  if (history.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Historique de la Session ({history.length} analyse{history.length > 1 ? "s" : ""})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          Effacer l'historique
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {history.map((item, index) => {
          const isPassed = item.data.status === "no_defect" || item.data.detections.length === 0;
          return (
            <button
              key={`${item.timestamp}-${index}`}
              type="button"
              onClick={() => onSelectHistoryItem(item)}
              className="flex-shrink-0 w-48 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all group flex items-center gap-2.5"
            >
              <div className="w-12 h-14 rounded-lg bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800 flex-shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.data.image}
                  className="h-full object-contain"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                  {item.data.image}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isPassed
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {isPassed ? "PASS" : "REJET"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.timeStr}
                  </span>
                </div>
                {!isPassed && (
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {item.data.detections.map((d) => d.label).join(", ")}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

