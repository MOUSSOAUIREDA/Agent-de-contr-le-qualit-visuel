import React, { useEffect, useRef, useState } from "react";
import { DEFECT_CLASSES } from "../constants/defectClasses";

export function CanvasViewer({
  imageUrl,
  imageDimensions,
  detections = [],
  hoveredDefect,
  selectedDefect,
  onSelectDefect,
  minConfidence = 0.5,
  showBoxes = true,
  showLabels = true,
  showConf = true,
  activeClasses = null,
  onResetImage
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageElementRef = useRef(null);

  // Charger l'image
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageElementRef.current = img;
      setImageLoaded(true);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
  }, [imageUrl]);

  // Dessin sur Canvas
  useEffect(() => {
    if (!imageLoaded || !imageElementRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageElementRef.current;

    // Définir la résolution native du canvas sur la taille de l'image originale
    canvas.width = img.naturalWidth || 400;
    canvas.height = img.naturalHeight || 500;

    // Effacer
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner l'image originale
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Dessiner les boîtes englobantes si activées
    if (showBoxes && detections.length > 0) {
      detections.forEach((det, index) => {
        // Filtre de confiance
        if (det.confidence < minConfidence) return;
        // Filtre de classe
        if (activeClasses && !activeClasses.includes(det.label)) return;

        const [xMin, yMin, xMax, yMax] = det.bbox;
        const width = xMax - xMin;
        const height = yMax - yMin;

        const defectMeta = DEFECT_CLASSES[det.label] || { color: "#38bdf8", fr: det.label };
        const color = defectMeta.color;
        const isHovered = hoveredDefect === index;
        const isSelected = selectedDefect === index;

        ctx.save();

        // Style du tracé
        if (isHovered || isSelected) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 16;
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          // Fond légèrement teinté au survol
          ctx.fillStyle = `${color}25`;
          ctx.fillRect(xMin, yMin, width, height);
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.fillStyle = `${color}12`;
          ctx.fillRect(xMin, yMin, width, height);
        }

        // Dessiner le rectangle
        ctx.strokeRect(xMin, yMin, width, height);

        // Coins HUD industriels
        const cornerLen = Math.min(12, Math.min(width, height) / 3);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;

        // Coin haut gauche
        ctx.beginPath();
        ctx.moveTo(xMin, yMin + cornerLen);
        ctx.lineTo(xMin, yMin);
        ctx.lineTo(xMin + cornerLen, yMin);
        ctx.stroke();

        // Coin haut droit
        ctx.beginPath();
        ctx.moveTo(xMax - cornerLen, yMin);
        ctx.lineTo(xMax, yMin);
        ctx.lineTo(xMax, yMin + cornerLen);
        ctx.stroke();

        // Coin bas gauche
        ctx.beginPath();
        ctx.moveTo(xMin, yMax - cornerLen);
        ctx.lineTo(xMin, yMax);
        ctx.lineTo(xMin + cornerLen, yMax);
        ctx.stroke();

        // Coin bas droit
        ctx.beginPath();
        ctx.moveTo(xMax - cornerLen, yMax);
        ctx.lineTo(xMax, yMax);
        ctx.lineTo(xMax, yMax - cornerLen);
        ctx.stroke();

        // Étiquette (Label + Score de confiance)
        if (showLabels) {
          const labelText = showConf
            ? `${det.label} ${(det.confidence * 100).toFixed(0)}%`
            : det.label;

          ctx.font = "bold 13px 'Inter', sans-serif";
          const textMetrics = ctx.measureText(labelText);
          const tagPaddingX = 8;
          const tagHeight = 22;
          const tagWidth = textMetrics.width + tagPaddingX * 2;

          let tagX = xMin;
          let tagY = yMin - tagHeight;
          if (tagY < 0) {
            tagY = yMin + 2; // replacer à l'intérieur si en haut de l'image
          }

          // Fond de l'étiquette
          ctx.fillStyle = isHovered || isSelected ? color : "rgba(15, 23, 42, 0.92)";
          ctx.beginPath();
          ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 4);
          ctx.fill();

          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Texte
          ctx.fillStyle = isHovered || isSelected ? "#000000" : "#f8fafc";
          ctx.textBaseline = "middle";
          ctx.fillText(labelText, tagX + tagPaddingX, tagY + tagHeight / 2);
        }

        ctx.restore();
      });
    }
  }, [
    imageLoaded,
    detections,
    hoveredDefect,
    selectedDefect,
    minConfidence,
    showBoxes,
    showLabels,
    showConf,
    activeClasses
  ]);

  // Gestion du Pan / Drag
  const handleMouseDown = (e) => {
    if (e.button === 0 && zoom > 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }

    // Coordonnées relatives sur l'image
    if (canvasRef.current && imageElementRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
      const curX = Math.round((e.clientX - rect.left) * scaleX);
      const curY = Math.round((e.clientY - rect.top) * scaleY);
      setMousePos({
        x: Math.max(0, Math.min(canvasRef.current.width, curX)),
        y: Math.max(0, Math.min(canvasRef.current.height, curY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Clic pour sélectionner un défaut
  const handleCanvasClick = (e) => {
    if (!canvasRef.current || isPanning) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Trouver le défaut cliqué
    for (let i = detections.length - 1; i >= 0; i--) {
      const [xMin, yMin, xMax, yMax] = detections[i].bbox;
      if (clickX >= xMin && clickX <= xMax && clickY >= yMin && clickY <= yMax) {
        onSelectDefect?.(i === selectedDefect ? null : i);
        return;
      }
    }
    onSelectDefect?.(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Barre d'outils du visualiseur */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Inspecteur Optique</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono">
            {canvasRef.current ? `${canvasRef.current.width} × ${canvasRef.current.height} px` : "Chargement..."}
          </span>
        </div>

        {/* Contrôles de Zoom et Outils */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="px-2 py-1 hover:bg-slate-800 text-slate-300 rounded font-bold"
              title="Zoom arrière (-)"
            >
              −
            </button>
            <span className="px-2 py-1 font-mono text-[11px] text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="px-2 py-1 hover:bg-slate-800 text-slate-300 rounded font-bold"
              title="Zoom avant (+)"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="px-2 py-1 hover:bg-slate-800 text-cyan-400 text-[11px] font-medium border-l border-slate-800"
              title="Réinitialiser zoom"
            >
              100%
            </button>
          </div>

          <button
            type="button"
            onClick={onResetImage}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Changer d'image
          </button>
        </div>
      </div>

      {/* Surface d'affichage Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 relative overflow-hidden flex items-center justify-center p-4 min-h-[460px] bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 select-none cursor-crosshair"
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isPanning ? "none" : "transform 0.15s ease-out"
          }}
          className="relative max-h-full max-w-full flex items-center justify-center shadow-2xl rounded-lg overflow-hidden ring-1 ring-slate-800"
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="max-h-[580px] max-w-full object-contain block"
          />
        </div>
      </div>

      {/* Barre d'état inférieure (Coordonnées du curseur & Légende) */}
      <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-mono">
            Curseur : X: <span className="text-slate-200">{mousePos.x}</span>, Y: <span className="text-slate-200">{mousePos.y}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span>
            {detections.length === 0
              ? "Aucun défaut détecté"
              : `${detections.length} boîte(s) englobante(s)`}
          </span>
        </div>
        <div className="text-slate-500 hidden sm:block">
          Cliquez sur un défaut pour le sélectionner • Molette ou +/- pour zoomer
        </div>
      </div>
    </div>
  );
}

