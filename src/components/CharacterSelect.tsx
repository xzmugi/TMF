import React, { useState } from 'react';
import { CharacterId, CharacterDef } from '../types/game';
import { CHARACTERS, getCharacterPortraitDataUrl } from '../utils/characterPortraits';
import { Shield, Zap, Sparkles, Play, Award, Crosshair } from 'lucide-react';

interface CharacterSelectProps {
  onSelectAndStart: (characterId: CharacterId) => void;
  onOpenHelp: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onSelectAndStart,
  onOpenHelp,
}) => {
  const [selectedId, setSelectedId] = useState<CharacterId>('barker');

  const selectedChar = CHARACTERS.find((c) => c.id === selectedId) || CHARACTERS[0];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 md:p-10 bg-slate-950 overflow-y-auto z-30 select-none">
      {/* Background Corporate Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* HEADER */}
      <div className="relative flex flex-col items-center text-center mt-2 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-pixel mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CORPORATE TAKEOVER TOURNAMENT</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
          BOARDROOM <span className="text-amber-400">ROYALE</span>
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-xl mt-2 font-medium">
          Twenty corporate titans enter the campus. As the downsizing storm closes in, only one sole surviving executive will claim the CEO throne.
        </p>
      </div>

      {/* 4 CHARACTER CARDS (Matching the 4 uploaded portraits) */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl my-6 z-10">
        {CHARACTERS.map((char) => {
          const isSelected = char.id === selectedId;
          const portraitUrl = getCharacterPortraitDataUrl(char.id);

          return (
            <div
              key={char.id}
              onClick={() => setSelectedId(char.id)}
              className={`relative flex flex-col rounded-2xl p-4 cursor-pointer transition-all duration-300 border-2 backdrop-blur-md group ${
                isSelected
                  ? 'border-amber-400 bg-slate-900/90 shadow-2xl shadow-amber-500/20 scale-[1.02]'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/70'
              }`}
            >
              {/* Selected Checkmark Ribbon */}
              {isSelected && (
                <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-pixel text-[9px] font-bold shadow-md">
                  SELECTED
                </div>
              )}

              {/* Framed Pixel Art Portrait */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 border-4 border-amber-900/80 bg-slate-950 shadow-inner">
                {portraitUrl && (
                  <img
                    src={portraitUrl}
                    alt={char.name}
                    className="w-full h-full object-cover pixelated transform group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                {/* Department Badge */}
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-[10px] text-center font-bold text-slate-300 truncate">
                  {char.department}
                </div>
              </div>

              {/* Character Info */}
              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg text-white group-hover:text-amber-300 transition">
                    {char.name}
                  </h3>
                </div>
                <div className="text-xs font-pixel text-amber-400/90 mb-2">
                  {char.title}
                </div>
                <p className="text-xs italic text-slate-400 mb-3 border-l-2 border-slate-700 pl-2">
                  {char.quote}
                </p>

                {/* Passive Perk */}
                <div className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mb-2">
                  <span className="font-bold text-amber-300 text-[11px] block mb-0.5">
                    PASSIVE TRAIT
                  </span>
                  {char.bio}
                </div>

                {/* Active Ability */}
                <div className="text-xs text-slate-300 bg-purple-950/30 p-2 rounded-lg border border-purple-800/40 mt-auto">
                  <span className="font-bold text-purple-300 text-[11px] flex items-center gap-1 mb-0.5">
                    <Zap className="w-3 h-3 text-purple-400" />
                    ABILITY: {char.abilityName}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight block">
                    {char.abilityDesc}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="relative flex flex-col sm:flex-row items-center gap-4 z-10 w-full max-w-xl justify-center mb-4">
        <button
          onClick={onOpenHelp}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm transition active:scale-95"
        >
          HOW TO PLAY & CONTROLS
        </button>

        <button
          onClick={() => onSelectAndStart(selectedId)}
          className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-pixel text-sm font-bold shadow-2xl shadow-amber-500/30 active:scale-95 transition flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>DEPLOY EXECUTIVE</span>
        </button>
      </div>
    </div>
  );
};
