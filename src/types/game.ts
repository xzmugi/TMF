export type CharacterId = 'barker' | 'sterling' | 'mortimer' | 'marcus';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  department: string;
  quote: string;
  bio: string;
  primaryColor: string;
  accentColor: string;
  badgeBg: string;
  speedMultiplier: number;
  maxHpBonus: number;
  critChanceBonus: number;
  armorBonus: number;
  abilityName: string;
  abilityDesc: string;
  abilityCooldown: number; // in seconds
  abilityDuration?: number; // in seconds
  signatureWeaponName: string;
}

export type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'sniper' | 'cash_cannon' | 'briefcase_launcher';
export type WeaponRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface WeaponDef {
  id: string;
  name: string;
  type: WeaponType;
  rarity: WeaponRarity;
  damage: number;
  bulletsPerShot: number;
  spread: number; // in radians
  fireRate: number; // shots per second
  bulletSpeed: number;
  range: number;
  maxAmmo: number;
  reloadTime: number; // in seconds
  color: string;
  bulletColor: string;
  bulletSize: number;
  iconName: string;
  isAutomatic: boolean;
}

export interface WeaponInstance extends WeaponDef {
  currentAmmo: number;
  lastShotTime: number;
  isReloading: boolean;
  reloadStartTime: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  distanceTraveled: number;
  maxDistance: number;
  ownerId: string;
  isPlayer: boolean;
  color: string;
  size: number;
  isCrit: boolean;
  isExplosive?: boolean;
  splashRadius?: number;
}

export type LootType = 'weapon' | 'medkit' | 'coffee' | 'kevlar' | 'ammo' | 'golden_briefcase';

export interface LootItem {
  id: string;
  x: number;
  y: number;
  type: LootType;
  rarity: WeaponRarity;
  name: string;
  weaponDef?: WeaponDef;
  healAmount?: number;
  shieldAmount?: number;
  ammoAmount?: number;
  ammoType?: WeaponType;
  bobOffset: number;
  createdTime: number;
}

export type ObstacleType = 
  | 'desk' 
  | 'server' 
  | 'cubicle_wall' 
  | 'concrete_wall' 
  | 'glass_wall' 
  | 'water_cooler' 
  | 'potted_plant' 
  | 'boardroom_table' 
  | 'executive_car' 
  | 'vending_machine';

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  destructible: boolean;
  hp: number;
  maxHp: number;
  color: string;
  accentColor: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'paper' | 'smoke' | 'dollar' | 'blood' | 'ring' | 'casing' | 'muzzle' | 'shield_break';
  rotation: number;
  vRot: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  isCrit?: boolean;
}

export interface KillFeedEntry {
  id: string;
  killerName: string;
  killerCharId: CharacterId;
  victimName: string;
  victimCharId: CharacterId;
  weaponName: string;
  timestamp: number;
  isPlayerKill: boolean;
}

export interface Combatant {
  id: string;
  name: string;
  characterId: CharacterId;
  isPlayer: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // facing angle in radians
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  speed: number;
  isAlive: boolean;
  
  // Parachute / Drop phase
  isParachuting: boolean;
  parachuteHeight: number; // 1.0 (sky) down to 0.0 (ground)
  targetDropX: number;
  targetDropY: number;

  // Inventory
  weapons: (WeaponInstance | null)[];
  activeWeaponIndex: number;
  ammoReserve: Record<WeaponType, number>;
  consumables: {
    medkits: number;
    coffee: number;
  };

  // Ability state
  abilityCooldownRemaining: number;
  abilityActiveDuration: number;
  isAbilityActive: boolean;

  // Stats
  kills: number;
  damageDealt: number;
  survivalRank: number;

  // Bot AI specific state
  aiState?: 'patrol' | 'loot' | 'combat' | 'flee' | 'heal';
  aiTargetX?: number;
  aiTargetY?: number;
  aiTargetCombatantId?: string | null;
  aiTargetLootId?: string | null;
  aiNextActionTime?: number;
  aiStuckTimer?: number;
}

export interface StormCircle {
  phase: number;
  maxPhases: number;
  x: number;
  y: number;
  radius: number;
  targetX: number;
  targetY: number;
  targetRadius: number;
  shrinkSpeed: number; // pixels per second
  isShrinking: boolean;
  phaseTimeLeft: number;
  phaseDuration: number;
  damagePerTick: number; // HP/sec
}

export type GamePhase = 
  | 'select_character' 
  | 'plane_drop' 
  | 'in_game' 
  | 'game_over';

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  screenShake: boolean;
  showDamageNumbers: boolean;
  autoReload: boolean;
}
