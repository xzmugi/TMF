import React from 'react';
import {
  Combatant,
  KillFeedEntry,
  StormCircle,
  CharacterDef,
} from '../types/game';
import { MAP_WIDTH, MAP_HEIGHT } from '../utils/gameMap';
import { getCharacter, getCharacterPortraitDataUrl } from '../utils/characterPortraits';
import {
  Shield,
  Heart,
  Crosshair,
  Volume2,
  VolumeX,
  Map as MapIcon,
  HelpCircle,
  Zap,
  Coffee,
  Package,
} from 'lucide-react';

interface HUDProps {
  player: Combatant | null;
  spectatingCombatant: Combatant | null;
  aliveCount: number;
  totalCombatants: number;
  killFeed: KillFeedEntry[];
  storm: StormCircle;
  isMapExpanded: boolean;
  onToggleMap: () => void;
  onSelectWeaponSlot: (slot: number) => void;
  onReload: () => void;
  onUseAbility: () => void;
  onUseConsumable: (type: 'medkit' | 'coffee') => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  onOpenHelp: () => void;
  onNextSpectator?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  spectatingCombatant,
  aliveCount,
  totalCombatants,
  killFeed,
  storm,
  isMapExpanded,
  onToggleMap,
  onSelectWeaponSlot,
  onReload,
  onUseAbility,
  onUseConsumable,
  soundMuted,
  onToggleSound,
  onOpenHelp,
  onNextSpectator,
}) => {
  const displayTarget = (player && player.isAlive) ? player : spectatingCombatant;
  if (!displayTarget) return null;

  const charDef: CharacterDef = getCharacter(displayTarget.characterId);
  const activeWeapon = displayTarget.weapons[displayTarget.activeWeaponIndex];
  const isSpectating = !player?.isAlive && !!spectatingCombatant;

  const hpPercent = Math.max(0, Math.min(100, (displayTarget.hp / displayTarget.maxHp) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (displayTarget.shield / displayTarget.maxShield) * 100));
  const portraitUrl = getCharacterPortraitDataUrl(displayTarget.characterId);

  // Storm time format mm:ss
  const stormMins = Math.floor(storm.phaseTimeLeft / 60);
  const stormSecs = Math.floor(storm.phaseTimeLeft % 60);
  const formattedStormTime = `${stormMins}:${stormSecs < 10 ? '0' : ''}${stormSecs}`;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-20">
      {/* ================= TOP BAR ================= */}
      <div className="flex items-start justify-between w-full">
        {/* TOP LEFT: Minimap Radar & Storm Timer */}
        <div className="flex items-start gap-3 pointer-events-auto">
          {/* Circular Minimap */}
          <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-xl overflow-hidden border-2 border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-md">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Map background */}
              <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#0f172a" />
              
              {/* Storm Safe Target */}
              <circle
                cx={storm.targetX}
                cy={storm.targetY}
                r={storm.targetRadius}
                fill="none"
                stroke="#ffffff"
                strokeWidth="40"
                strokeDasharray="80 80"
                opacity="0.6"
              />

              {/* Storm Current Boundary */}
              <circle
                cx={storm.x}
                cy={storm.y}
                r={storm.radius}
                fill="none"
                stroke="#ec4899"
                strokeWidth="70"
                opacity="0.85"
              />

              {/* Target / Player Position Blip */}
              <circle
                cx={displayTarget.x}
                cy={displayTarget.y}
                r="65"
                fill="#facc15"
                stroke="#ffffff"
                strokeWidth="20"
              />
            </svg>

            {/* Map Expand button */}
            <button
              onClick={onToggleMap}
              title="Toggle Full Map (M)"
              className="absolute bottom-1 right-1 p-1 rounded bg-slate-800/80 text-amber-300 hover:text-white border border-slate-600/60 active:scale-95 transition"
            >
              <MapIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Storm Phase & Match Status Pill */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  storm.isShrinking ? 'bg-pink-500 animate-ping' : 'bg-emerald-400'
                }`}
              />
              <span className="font-pixel text-[10px] text-slate-300 tracking-wider">
                {storm.isShrinking ? 'STORM SHRINKING' : `SAFE ZONE ${storm.phase}/${storm.maxPhases}`}
              </span>
              <span className="font-pixel text-[11px] text-pink-400 font-bold ml-1">
                {formattedStormTime}
              </span>
            </div>

            {/* Alive Executives Counter */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
              <span className="text-xs text-slate-400 font-bold">EXECUTIVES:</span>
              <span className="font-pixel text-xs text-amber-300">
                {aliveCount} <span className="text-slate-500">/ {totalCombatants}</span>
              </span>
            </div>

            {/* Player Kills / Net Worth */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
              <span className="text-xs text-slate-400 font-bold">TAKEOVERS:</span>
              <span className="font-pixel text-xs text-emerald-400">
                {displayTarget.kills} ELIM
              </span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT: Kill Feed & Quick Settings */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Quick Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white active:scale-95 transition shadow-lg"
              title="Toggle Audio"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onOpenHelp}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white active:scale-95 transition shadow-lg"
              title="Controls & Instructions"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
            </button>
          </div>

          {/* Dynamic Kill Feed */}
          <div className="flex flex-col gap-1.5 max-w-xs pointer-events-none mt-1">
            {killFeed.slice(-4).map((entry) => (
              <div
                key={entry.id}
                className={`px-3 py-1 rounded text-xs backdrop-blur-md border shadow-md flex items-center gap-2 animate-fade-in ${
                  entry.isPlayerKill
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300'
                }`}
              >
                <span className="font-bold truncate max-w-[100px]">{entry.killerName}</span>
                <span className="text-[10px] text-pink-400 font-pixel">fired</span>
                <span className="truncate max-w-[100px] text-slate-400">{entry.victimName}</span>
                <span className="text-[9px] text-slate-500 ml-auto">[{entry.weaponName}]</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= SPECTATOR NOTICE (If player eliminated) ================= */}
      {isSpectating && (
        <div className="self-center px-4 py-2 rounded-xl bg-red-950/80 border border-red-500/60 backdrop-blur-md shadow-2xl flex items-center gap-4 pointer-events-auto">
          <div className="flex flex-col">
            <span className="font-pixel text-xs text-red-400">SPECTATING EXECUTIVE</span>
            <span className="font-bold text-sm text-white">{spectatingCombatant?.name}</span>
          </div>
          {onNextSpectator && (
            <button
              onClick={onNextSpectator}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-amber-300 active:scale-95 transition"
            >
              NEXT (TAB)
            </button>
          )}
        </div>
      )}

      {/* ================= BOTTOM BAR: VITAL METRICS & LOADOUT ================= */}
      <div className="flex flex-col md:flex-row items-end md:items-end justify-between gap-4 w-full">
        {/* BOTTOM LEFT: Character Portrait, Name, HP & Shield */}
        <div className="flex items-center gap-3 pointer-events-auto bg-slate-950/90 p-3 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md max-w-md w-full">
          {/* Framed Pixel Art Portrait */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-amber-700/80 shadow-inner flex-shrink-0 bg-slate-900">
            {portraitUrl && (
              <img
                src={portraitUrl}
                alt={charDef.name}
                className="w-full h-full object-cover pixelated"
              />
            )}
          </div>

          {/* Identity & Vitals */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm text-white truncate">{displayTarget.name}</span>
              <span className="text-[10px] font-pixel text-amber-400">{charDef.title}</span>
            </div>

            {/* Shield Bar */}
            <div className="relative w-full h-3 rounded-full bg-slate-800/80 overflow-hidden mb-1.5 border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-200"
                style={{ width: `${shieldPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-pixel text-cyan-200 font-bold">
                <span className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" /> SHIELD
                </span>
                <span>{Math.round(displayTarget.shield)} / {displayTarget.maxShield}</span>
              </div>
            </div>

            {/* Health Bar */}
            <div className="relative w-full h-4 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50">
              <div
                className={`h-full transition-all duration-200 ${
                  hpPercent > 30 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-pixel text-white font-bold drop-shadow">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" /> HP
                </span>
                <span>{Math.round(displayTarget.hp)} / {displayTarget.maxHp}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CENTER/RIGHT: Ability, Weapon Slots & Ammo */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Active Ability Card */}
          <button
            onClick={onUseAbility}
            disabled={displayTarget.abilityCooldownRemaining > 0}
            className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 transition shadow-2xl backdrop-blur-md active:scale-95 ${
              displayTarget.abilityCooldownRemaining <= 0
                ? 'bg-purple-900/60 border-purple-400 text-purple-200 hover:bg-purple-800/70'
                : 'bg-slate-900/70 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
            title={`${charDef.abilityName} (Q)`}
          >
            <Zap className={`w-6 h-6 mb-1 ${displayTarget.isAbilityActive ? 'text-amber-400 animate-spin' : ''}`} />
            <span className="text-[9px] font-pixel text-center leading-tight">
              {displayTarget.abilityCooldownRemaining <= 0 ? (
                <>
                  <span className="text-amber-300">[Q]</span> READY
                </>
              ) : (
                `${Math.ceil(displayTarget.abilityCooldownRemaining)}s`
              )}
            </span>

            {/* Cooldown radial dark overlay */}
            {displayTarget.abilityCooldownRemaining > 0 && (
              <div
                className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center font-pixel text-xs text-white"
              >
                {Math.ceil(displayTarget.abilityCooldownRemaining)}
              </div>
            )}
          </button>

          {/* Consumable Quick Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onUseConsumable('medkit')}
              disabled={displayTarget.consumables.medkits <= 0}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition shadow-lg ${
                displayTarget.consumables.medkits > 0
                  ? 'bg-slate-900/90 border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/60'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600'
              }`}
              title="First-Aid Medkit (+50 HP)"
            >
              <Package className="w-3.5 h-3.5" />
              <span>x{displayTarget.consumables.medkits}</span>
            </button>
            <button
              onClick={() => onUseConsumable('coffee')}
              disabled={displayTarget.consumables.coffee <= 0}
              className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition shadow-lg ${
                displayTarget.consumables.coffee > 0
                  ? 'bg-slate-900/90 border-amber-500/50 text-amber-300 hover:bg-amber-950/60'
                  : 'bg-slate-900/50 border-slate-800 text-slate-600'
              }`}
              title="Espresso Shot (+25 HP & Speed)"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>x{displayTarget.consumables.coffee}</span>
            </button>
          </div>

          {/* Weapon Slots (1, 2, 3) */}
          <div className="flex items-center gap-2 bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md">
            {[0, 1, 2].map((slotIdx) => {
              const weapon = displayTarget.weapons[slotIdx];
              const isSelected = displayTarget.activeWeaponIndex === slotIdx;

              return (
                <button
                  key={slotIdx}
                  onClick={() => onSelectWeaponSlot(slotIdx)}
                  className={`relative w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-between p-1.5 transition active:scale-95 ${
                    isSelected
                      ? 'border-amber-400 bg-slate-800 shadow-lg shadow-amber-400/20'
                      : 'border-slate-700/60 bg-slate-900/80 hover:border-slate-500'
                  }`}
                >
                  <div className="w-full flex items-center justify-between text-[9px] font-pixel text-slate-400">
                    <span>{slotIdx + 1}</span>
                    {weapon && <span className="uppercase text-[8px] text-amber-300">{weapon.rarity}</span>}
                  </div>

                  {weapon ? (
                    <>
                      <Crosshair
                        className="w-5 h-5 my-auto"
                        style={{ color: weapon.bulletColor || weapon.color }}
                      />
                      <div className="w-full text-center truncate text-[10px] font-bold text-white">
                        {weapon.name.split(' ')[0]}
                      </div>
                      <div className="text-[9px] font-pixel text-amber-300">
                        {weapon.currentAmmo}/{weapon.maxAmmo}
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-600 font-pixel">
                      EMPTY
                    </div>
                  )}
                </button>
              );
            })}

            {/* Reload Button & Active Ammo Display */}
            {activeWeapon && (
              <div className="flex flex-col items-center justify-center pl-2 pr-1 border-l border-slate-800">
                <div className="font-pixel text-xl text-amber-400 tracking-wider">
                  {activeWeapon.currentAmmo}
                </div>
                <div className="text-[10px] font-pixel text-slate-500">
                  / {activeWeapon.maxAmmo}
                </div>
                <button
                  onClick={onReload}
                  className="mt-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[9px] font-pixel text-slate-300 active:scale-95 transition"
                >
                  {activeWeapon.isReloading ? 'RELOAD...' : 'RELOAD [R]'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
