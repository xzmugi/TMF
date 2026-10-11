import React from 'react';
import { X, Crosshair, Zap, Shield, Map as MapIcon, Coffee, Briefcase } from 'lucide-react';

interface ControlsHelpModalProps {
  onClose: () => void;
}

export const ControlsHelpModal: React.FC<ControlsHelpModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 z-50 select-none animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900/95 p-6 md:p-8 shadow-2xl flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-black font-pixel text-white uppercase">
              EXECUTIVE BRIEFING & CONTROLS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-sm text-slate-300">Move Executive</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 font-pixel text-xs text-amber-400">
              W, A, S, D / Arrows
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-sm text-slate-300">Aim & Fire</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 font-pixel text-xs text-amber-400">
              Mouse + Left Click / Space
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-sm text-slate-300">Special Ability</span>
            <span className="px-2.5 py-1 rounded bg-purple-900/60 border border-purple-500/40 font-pixel text-xs text-purple-300">
              Q or F Key
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-sm text-slate-300">Reload Weapon</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 font-pixel text-xs text-amber-400">
              R Key
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-sm text-slate-300">Switch Weapons</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 font-pixel text-xs text-amber-400">
              1, 2, 3 Keys
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-sm text-slate-300">Tactical Campus Radar</span>
            <span className="px-2.5 py-1 rounded bg-slate-800 font-pixel text-xs text-amber-400">
              M Key
            </span>
          </div>
        </div>

        {/* GAMEPLAY RULES */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 mb-6">
          <h3 className="font-pixel text-xs text-amber-400 uppercase tracking-wide">
            CORPORATE BATTLE RULES
          </h3>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li>
              <strong className="text-slate-200">The Airlift Drop:</strong> Jump from the corporate helicopter and glide to key office zones (Boardroom Tower, Server Room Bunker, Helipad).
            </li>
            <li>
              <strong className="text-slate-200">Looting Office Supplies:</strong> Walk over crates to collect stapler guns, red-tape assault rifles, laser snipers, espresso shots, and tailored Kevlar vests.
            </li>
            <li>
              <strong className="text-slate-200">The Downsizing Storm:</strong> Stay inside the safe zone! Any executive caught outside the pink slip perimeter suffers rapid severance tick damage.
            </li>
            <li>
              <strong className="text-slate-200">Sole Surviving CEO:</strong> Eliminate or outlast all 19 other corporate competitors to win the match.
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          ACKNOWLEDGE & PROCEED
        </button>
      </div>
    </div>
  );
};
