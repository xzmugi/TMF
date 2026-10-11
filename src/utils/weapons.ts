import { WeaponDef, WeaponInstance, LootItem, LootType, WeaponRarity } from '../types/game';

export const WEAPON_DEFINITIONS: Record<string, WeaponDef> = {
  stapler_pistol: {
    id: 'stapler_pistol',
    name: 'Executive Stapler',
    type: 'pistol',
    rarity: 'common',
    damage: 18,
    bulletsPerShot: 1,
    spread: 0.05,
    fireRate: 4.5,
    bulletSpeed: 780,
    range: 650,
    maxAmmo: 14,
    reloadTime: 1.2,
    color: '#94a3b8',
    bulletColor: '#e2e8f0',
    bulletSize: 4,
    iconName: 'Paperclip',
    isAutomatic: false,
  },
  dual_staplers: {
    id: 'dual_staplers',
    name: 'Akimbo High-Speed Staplers',
    type: 'pistol',
    rarity: 'rare',
    damage: 16,
    bulletsPerShot: 2,
    spread: 0.12,
    fireRate: 6.0,
    bulletSpeed: 820,
    range: 600,
    maxAmmo: 28,
    reloadTime: 1.4,
    color: '#38bdf8',
    bulletColor: '#bae6fd',
    bulletSize: 4,
    iconName: 'Zap',
    isAutomatic: true,
  },
  tape_rifle: {
    id: 'tape_rifle',
    name: 'Red-Tape Assault Rifle',
    type: 'rifle',
    rarity: 'rare',
    damage: 22,
    bulletsPerShot: 1,
    spread: 0.07,
    fireRate: 8.5,
    bulletSpeed: 880,
    range: 800,
    maxAmmo: 30,
    reloadTime: 1.8,
    color: '#ef4444',
    bulletColor: '#fca5a5',
    bulletSize: 5,
    iconName: 'Layers',
    isAutomatic: true,
  },
  boardroom_gavel: {
    id: 'boardroom_gavel',
    name: 'Boardroom Gavel Shotgun',
    type: 'shotgun',
    rarity: 'epic',
    damage: 14, // 6 pellets * 14 = 84 max close dmg
    bulletsPerShot: 6,
    spread: 0.28,
    fireRate: 1.3,
    bulletSpeed: 700,
    range: 480,
    maxAmmo: 6,
    reloadTime: 2.2,
    color: '#d97706',
    bulletColor: '#fde68a',
    bulletSize: 5,
    iconName: 'Hammer',
    isAutomatic: false,
  },
  laser_pointer: {
    id: 'laser_pointer',
    name: 'Keynote Laser Sniper',
    type: 'sniper',
    rarity: 'epic',
    damage: 85,
    bulletsPerShot: 1,
    spread: 0.01,
    fireRate: 0.9,
    bulletSpeed: 1400,
    range: 1200,
    maxAmmo: 4,
    reloadTime: 2.5,
    color: '#ec4899',
    bulletColor: '#f43f5e',
    bulletSize: 6,
    iconName: 'Crosshair',
    isAutomatic: false,
  },
  cash_cannon: {
    id: 'cash_cannon',
    name: 'Golden Cash Cannon',
    type: 'cash_cannon',
    rarity: 'legendary',
    damage: 28,
    bulletsPerShot: 1,
    spread: 0.09,
    fireRate: 9.0,
    bulletSpeed: 950,
    range: 850,
    maxAmmo: 45,
    reloadTime: 1.6,
    color: '#10b981',
    bulletColor: '#34d399',
    bulletSize: 6,
    iconName: 'Coins',
    isAutomatic: true,
  },
  briefcase_launcher: {
    id: 'briefcase_launcher',
    name: 'Hostile Takeover Rocket Briefcase',
    type: 'briefcase_launcher',
    rarity: 'legendary',
    damage: 110,
    bulletsPerShot: 1,
    spread: 0.04,
    fireRate: 0.75,
    bulletSpeed: 620,
    range: 900,
    maxAmmo: 3,
    reloadTime: 2.8,
    color: '#8b5cf6',
    bulletColor: '#c084fc',
    bulletSize: 8,
    iconName: 'Briefcase',
    isAutomatic: false,
  },
};

export function createWeaponInstance(weaponKey: string): WeaponInstance {
  const def = WEAPON_DEFINITIONS[weaponKey] || WEAPON_DEFINITIONS.stapler_pistol;
  return {
    ...def,
    currentAmmo: def.maxAmmo,
    lastShotTime: 0,
    isReloading: false,
    reloadStartTime: 0,
  };
}

export function spawnLootItem(x: number, y: number, type?: LootType, rarity?: WeaponRarity): LootItem {
  const lootTypes: LootType[] = ['weapon', 'weapon', 'medkit', 'coffee', 'kevlar', 'ammo', 'golden_briefcase'];
  const chosenType = type || lootTypes[Math.floor(Math.random() * lootTypes.length)];
  const rarities: WeaponRarity[] = ['common', 'rare', 'epic', 'legendary'];
  const chosenRarity = rarity || (Math.random() > 0.85 ? 'legendary' : Math.random() > 0.6 ? 'epic' : Math.random() > 0.3 ? 'rare' : 'common');

  let name = 'Supplies';
  let weaponDef: WeaponDef | undefined;
  let healAmount: number | undefined;
  let shieldAmount: number | undefined;
  let ammoAmount: number | undefined;

  if (chosenType === 'weapon') {
    const keys = Object.keys(WEAPON_DEFINITIONS);
    const key = keys[Math.floor(Math.random() * keys.length)];
    weaponDef = WEAPON_DEFINITIONS[key];
    name = weaponDef.name;
  } else if (chosenType === 'medkit') {
    name = 'Promotion First-Aid Kit (+50 HP)';
    healAmount = 50;
  } else if (chosenType === 'coffee') {
    name = 'Triple Espresso Shot (+25 HP & Sprint)';
    healAmount = 25;
  } else if (chosenType === 'kevlar') {
    name = 'Tailored Kevlar Suit (+50 Shield)';
    shieldAmount = 50;
  } else if (chosenType === 'ammo') {
    name = 'Quarterly Ammo Resupply (+40 Rounds)';
    ammoAmount = 40;
  } else if (chosenType === 'golden_briefcase') {
    name = 'Golden Executive Briefcase (Full Shield & Cash)';
    shieldAmount = 100;
    healAmount = 50;
  }

  return {
    id: `loot_${Math.random().toString(36).substr(2, 9)}`,
    x,
    y,
    type: chosenType,
    rarity: weaponDef ? weaponDef.rarity : chosenRarity,
    name,
    weaponDef,
    healAmount,
    shieldAmount,
    ammoAmount,
    bobOffset: Math.random() * Math.PI * 2,
    createdTime: Date.now(),
  };
}
