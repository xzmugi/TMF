import React, { useEffect, useState } from 'react';
import { Plane, ChevronDown } from 'lucide-react';

interface DropPhaseOverlayProps {
  planeProgress: number; // 0.0 to 1.0
  onDrop: () => void;
  hasDropped: boolean;
}

export const DropPhaseOverlay: React.FC<DropPhaseOverlayProps> = ({
  planeProgress,
  onDrop,
  hasDropped,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !hasDropped) {
        onDrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDrop, hasDropped]);

  if (hasDropped) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-8 z-25 select-none">
      {/* Top Banner */}
      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-950/85 border border-amber-500/40 backdrop-blur-md shadow-2xl animate-bounce">
        <Plane className="w-5 h-5 text-amber-400 rotate-45" />
        <span className="font-pixel text-xs text-amber-300">
          EXECUTIVE AIRLIFT OVER CORPORATE CAMPUS
        </span>
      </div>

      {/* Center Eject CTA */}
      <div className="flex flex-col items-center gap-3 pointer-events-auto">
        <button
          onClick={onDrop}
          className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-pixel text-sm font-bold shadow-2xl shadow-red-600/40 active:scale-95 transition flex items-center gap-4 cursor-pointer"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
          <span>EJECT & DEPLOY GOLDEN PARACHUTE</span>
          <span className="text-[10px] text-amber-200 bg-black/30 px-2 py-1 rounded">
            [SPACE]
          </span>
        </button>

        <p className="text-xs text-slate-300 font-medium bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm border border-slate-700">
          Use WASD to steer glide towards your target department building
        </p>
      </div>

      {/* Bottom Progress Bar */}
      <div className="w-full max-w-md bg-slate-900/80 p-2 rounded-xl border border-slate-700/60 backdrop-blur-md">
        <div className="flex justify-between text-[10px] font-pixel text-slate-400 mb-1">
          <span>AIRLIFT TRAJECTORY</span>
          <span>{Math.round(planeProgress * 100)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-100"
            style={{ width: `${planeProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
