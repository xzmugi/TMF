import { Combatant, LootItem, Obstacle, StormCircle, CharacterId } from '../types/game';
import { circleCollidesWithRect, MAP_WIDTH, MAP_HEIGHT } from './gameMap';
import { createWeaponInstance } from './weapons';
import { CHARACTERS } from './characterPortraits';

export const BOT_NAMES = [
  'Gordon Gekko Jr.',
  'Warren Buffet-Line',
  'Chad from HR',
  'Karen Vice President',
  'Synergy Steve',
  'Ghost Accountant',
  'Elon Bark',
  'Crypto Caleb',
  'Middle Management Mike',
  'Senior Partner Stone',
  'Associate Ashley',
  'Intern Isaac',
  'Equity Ethan',
  'Boardroom Brittany',
  'Compliance Officer Cole',
  'Audit King Arthur',
  'Venture Vance',
  'Merger Melissa',
  'Liquidator Lucas',
  'Chief Legal Chloe',
];

export function createBot(index: number, startX: number, startY: number): Combatant {
  const charIds: CharacterId[] = ['barker', 'sterling', 'mortimer', 'marcus'];
  const charId = charIds[index % charIds.length];
  const charDef = CHARACTERS.find((c) => c.id === charId) || CHARACTERS[0];
  const name = BOT_NAMES[index % BOT_NAMES.length];

  // Base bot stats based on character
  const maxHp = 100 + charDef.maxHpBonus;
  const initialShield = charDef.armorBonus;

  // Bots spawn with a basic stapler pistol
  const initialWeapon = createWeaponInstance('stapler_pistol');

  return {
    id: `bot_${index}_${Math.random().toString(36).substr(2, 6)}`,
    name,
    characterId: charId,
    isPlayer: false,
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    angle: Math.random() * Math.PI * 2,
    hp: maxHp,
    maxHp,
    shield: initialShield,
    maxShield: 100,
    speed: 210 * charDef.speedMultiplier,
    isAlive: true,
    isParachuting: false,
    parachuteHeight: 0,
    targetDropX: startX,
    targetDropY: startY,
    weapons: [initialWeapon, null, null],
    activeWeaponIndex: 0,
    ammoReserve: {
      pistol: 60,
      rifle: 90,
      shotgun: 24,
      sniper: 12,
      cash_cannon: 100,
      briefcase_launcher: 6,
    },
    consumables: {
      medkits: 1,
      coffee: 1,
    },
    abilityCooldownRemaining: Math.random() * 5,
    abilityActiveDuration: 0,
    isAbilityActive: false,
    kills: 0,
    damageDealt: 0,
    survivalRank: 0,
    aiState: 'patrol',
    aiTargetX: startX + (Math.random() - 0.5) * 400,
    aiTargetY: startY + (Math.random() - 0.5) * 400,
    aiTargetCombatantId: null,
    aiTargetLootId: null,
    aiNextActionTime: 0,
    aiStuckTimer: 0,
  };
}

/**
 * Updates bot AI logic per frame:
 * Returns an intent object: { moveX, moveY, aimAngle, shouldShoot, useAbility }
 */
export function updateBotAI(
  bot: Combatant,
  allCombatants: Combatant[],
  lootItems: LootItem[],
  obstacles: Obstacle[],
  storm: StormCircle,
  deltaTime: number
): {
  moveDirX: number;
  moveDirY: number;
  aimAngle: number;
  shouldShoot: boolean;
  useAbility: boolean;
  healConsumable?: 'medkit' | 'coffee';
} {
  if (!bot.isAlive || bot.isParachuting) {
    return { moveDirX: 0, moveDirY: 0, aimAngle: bot.angle, shouldShoot: false, useAbility: false };
  }

  const now = Date.now();
  let moveDirX = 0;
  let moveDirY = 0;
  let aimAngle = bot.angle;
  let shouldShoot = false;
  let useAbility = false;
  let healConsumable: 'medkit' | 'coffee' | undefined = undefined;

  // 1. CHECK HEALTH & HEAL INTENT
  if (bot.hp < bot.maxHp * 0.45) {
    if (bot.consumables.medkits > 0) {
      healConsumable = 'medkit';
    } else if (bot.consumables.coffee > 0) {
      healConsumable = 'coffee';
    }
  }

  // 2. CHECK STORM AVOIDANCE (Top priority)
  const distToStormCenter = Math.hypot(bot.x - storm.x, bot.y - storm.y);
  const isOutsideStorm = distToStormCenter > storm.radius * 0.85;

  if (isOutsideStorm) {
    // Run directly towards storm center
    const toStormAngle = Math.atan2(storm.y - bot.y, storm.x - bot.x);
    moveDirX = Math.cos(toStormAngle);
    moveDirY = Math.sin(toStormAngle);
    aimAngle = toStormAngle;
    bot.aiState = 'flee';
  } else {
    // 3. SCAN FOR ENEMIES
    let closestEnemy: Combatant | null = null;
    let minEnemyDist = 580; // Bot vision range

    for (const other of allCombatants) {
      if (other.id === bot.id || !other.isAlive || other.isParachuting) continue;
      // If enemy is Mortimer and using Downsizing Shroud invisibility, bots can't easily see them
      if (other.characterId === 'mortimer' && other.isAbilityActive && Math.random() > 0.15) {
        continue;
      }

      const dist = Math.hypot(other.x - bot.x, other.y - bot.y);
      if (dist < minEnemyDist) {
        minEnemyDist = dist;
        closestEnemy = other;
      }
    }

    if (closestEnemy) {
      bot.aiState = 'combat';
      bot.aiTargetCombatantId = closestEnemy.id;

      // Aim at enemy with slight imperfect accuracy
      const toEnemyAngle = Math.atan2(closestEnemy.y - bot.y, closestEnemy.x - bot.x);
      aimAngle = toEnemyAngle + (Math.random() - 0.5) * 0.12;

      // Combat movement: strafe and maintain distance (250-400px)
      if (minEnemyDist < 220) {
        // Back away
        moveDirX = -Math.cos(toEnemyAngle);
        moveDirY = -Math.sin(toEnemyAngle);
      } else if (minEnemyDist > 450) {
        // Advance
        moveDirX = Math.cos(toEnemyAngle);
        moveDirY = Math.sin(toEnemyAngle);
      } else {
        // Circle strafe
        const strafeAngle = toEnemyAngle + Math.PI / 2 * (Math.sin(now * 0.003) > 0 ? 1 : -1);
        moveDirX = Math.cos(strafeAngle);
        moveDirY = Math.sin(strafeAngle);
      }

      // Shoot if active weapon has ammo
      const currentWeapon = bot.weapons[bot.activeWeaponIndex];
      if (currentWeapon && currentWeapon.currentAmmo > 0 && !currentWeapon.isReloading) {
        shouldShoot = true;
      }

      // Use ability if available and in combat
      if (bot.abilityCooldownRemaining <= 0 && Math.random() < 0.08) {
        useAbility = true;
      }
    } else {
      // 4. SCAN FOR LOOT
      let closestLoot: LootItem | null = null;
      let minLootDist = 450;

      for (const item of lootItems) {
        const dist = Math.hypot(item.x - bot.x, item.y - bot.y);
        if (dist < minLootDist) {
          minLootDist = dist;
          closestLoot = item;
        }
      }

      if (closestLoot) {
        bot.aiState = 'loot';
        const toLootAngle = Math.atan2(closestLoot.y - bot.y, closestLoot.x - bot.x);
        moveDirX = Math.cos(toLootAngle);
        moveDirY = Math.sin(toLootAngle);
        aimAngle = toLootAngle;
      } else {
        // 5. PATROL / WANDER
        bot.aiState = 'patrol';
        if (!bot.aiTargetX || !bot.aiTargetY || Math.hypot(bot.aiTargetX - bot.x, bot.aiTargetY - bot.y) < 60) {
          // Pick new patrol point inside storm safe zone
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (storm.radius * 0.65);
          bot.aiTargetX = Math.max(100, Math.min(MAP_WIDTH - 100, storm.x + Math.cos(angle) * dist));
          bot.aiTargetY = Math.max(100, Math.min(MAP_HEIGHT - 100, storm.y + Math.sin(angle) * dist));
        }

        const toTargetAngle = Math.atan2(bot.aiTargetY - bot.y, bot.aiTargetX - bot.x);
        moveDirX = Math.cos(toTargetAngle);
        moveDirY = Math.sin(toTargetAngle);
        aimAngle = toTargetAngle;
      }
    }
  }

  // Check obstacle collision ahead to steer around walls
  const lookAheadDist = 35;
  const aheadX = bot.x + moveDirX * lookAheadDist;
  const aheadY = bot.y + moveDirY * lookAheadDist;

  for (const obs of obstacles) {
    const col = circleCollidesWithRect(aheadX, aheadY, 20, obs.x, obs.y, obs.width, obs.height);
    if (col.collides) {
      // Deflect movement vector
      moveDirX += col.resolveX * 0.2;
      moveDirY += col.resolveY * 0.2;
      break;
    }
  }

  // Normalize movement vector
  const mag = Math.hypot(moveDirX, moveDirY);
  if (mag > 0.001) {
    moveDirX /= mag;
    moveDirY /= mag;
  }

  return {
    moveDirX,
    moveDirY,
    aimAngle,
    shouldShoot,
    useAbility,
    healConsumable,
  };
}
