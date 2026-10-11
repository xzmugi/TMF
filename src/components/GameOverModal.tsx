import React from 'react';
import { Combatant } from '../types/game';
import { getCharacter, getCharacterPortraitDataUrl } from '../utils/characterPortraits';
import { Trophy, Skull, RotateCcw, Eye, ArrowLeft, Award, DollarSign } from 'lucide-react';

interface GameOverModalProps {
  player: Combatant;
  rank: number;
  totalCombatants: number;
  matchDurationSec: number;
  onPlayAgain: () => void;
  onSpectate: () => void;
  onBackToMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  player,
  rank,
  totalCombatants,
  matchDurationSec,
  onPlayAgain,
  onSpectate,
  onBackToMenu,
}) => {
  const isVictory = rank === 1;
  const charDef = getCharacter(player.characterId);
  const portraitUrl = getCharacterPortraitDataUrl(player.characterId);

  const mins = Math.floor(matchDurationSec / 60);
  const secs = Math.floor(matchDurationSec % 60);
  const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const estimatedNetWorth = (player.kills * 250000) + (Math.round(player.damageDealt) * 500) + (isVictory ? 5000000 : 50000);

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-6 z-40 select-none animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-slate-700/80 bg-slate-900/95 p-6 md:p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden">
        {/* Glow backdrop aura */}
        <div
          className={`absolute -top-32 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none ${
            isVictory ? 'bg-amber-400' : 'bg-red-600'
          }`}
        />

        {/* Victory or Defeat Icon */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border-2 shadow-2xl ${
            isVictory
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/30'
              : 'bg-red-500/20 border-red-500 text-red-400 shadow-red-500/30'
          }`}
        >
          {isVictory ? (
            <Trophy className="w-10 h-10 animate-pulse text-amber-400" />
          ) : (
            <Skull className="w-10 h-10 text-red-400" />
          )}
        </div>

        {/* Title Heading */}
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase font-pixel tracking-wide mb-1">
          {isVictory ? 'VICTORY ROYALE!' : 'YOU WERE DOWNSIZED!'}
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mb-6 font-medium">
          {isVictory
            ? 'Sole surviving executive! You have been appointed Chairman & CEO of the Board.'
            : 'Your corporate tenure has ended. HR has issued your severance package.'}
        </p>

        {/* Rank Banner */}
        <div
          className={`inline-flex items-center gap-3 px-6 py-2 rounded-2xl border-2 font-pixel text-sm font-bold mb-6 ${
            isVictory
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`}
        >
          <span>RANK: #{rank}</span>
          <span className="text-slate-500 text-xs">/ {totalCombatants} EXECUTIVES</span>
        </div>

        {/* Character Portrait & Match Breakdown Cards */}
        <div className="flex items-center gap-4 w-full bg-slate-950/70 p-4 rounded-2xl border border-slate-800 mb-6">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-700/80 flex-shrink-0 bg-slate-900">
            {portraitUrl && (
              <img
                src={portraitUrl}
                alt={player.name}
                className="w-full h-full object-cover pixelated"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1 text-left">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-pixel">TAKEOVERS</span>
              <span className="font-bold text-base text-amber-400">{player.kills} KILLS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-pixel">DAMAGE DEALT</span>
              <span className="font-bold text-base text-cyan-400">{Math.round(player.damageDealt)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-pixel">TIME SURVIVED</span>
              <span className="font-bold text-base text-slate-200">{formattedTime}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-pixel">NET WORTH</span>
              <span className="font-bold text-base text-emerald-400">${estimatedNetWorth.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-pixel text-xs font-bold shadow-xl shadow-amber-500/20 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          {!isVictory && (
            <button
              onClick={onSpectate}
              className="w-full sm:w-auto px-5 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>SPECTATE</span>
            </button>
          )}

          <button
            onClick={onBackToMenu}
            className="w-full sm:w-auto px-5 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
