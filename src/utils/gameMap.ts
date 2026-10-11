import { Obstacle, LootItem, ObstacleType } from '../types/game';
import { spawnLootItem } from './weapons';

export const MAP_WIDTH = 3200;
export const MAP_HEIGHT = 3200;

export interface MapZone {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export const MAP_ZONES: MapZone[] = [
  { name: 'BOARDROOM TOWER', x: 1300, y: 1300, w: 600, h: 600, color: '#2a1a1f' },
  { name: 'CUBICLE MAZE', x: 400, y: 400, w: 700, h: 650, color: '#16202c' },
  { name: 'SERVER ROOM BUNKER', x: 2100, y: 400, w: 700, h: 600, color: '#0f2425' },
  { name: 'EXECUTIVE HELIPAD', x: 400, y: 2100, w: 650, h: 650, color: '#252119' },
  { name: 'FINANCIAL AUDIT VAULT', x: 2100, y: 2100, w: 700, h: 700, color: '#1c1829' },
  { name: 'CAFETERIA COMMONS', x: 1350, y: 400, w: 500, h: 500, color: '#29211a' },
  { name: 'HR GRIEVANCE GARDEN', x: 1350, y: 2300, w: 500, h: 500, color: '#14291f' },
];

export function generateObstacles(): Obstacle[] {
  const obstacles: Obstacle[] = [];
  let idCount = 0;

  function addObs(x: number, y: number, w: number, h: number, type: ObstacleType, color: string, accent: string, destructible = true, hp = 100) {
    obstacles.push({
      id: `obs_${idCount++}`,
      x,
      y,
      width: w,
      height: h,
      type,
      destructible,
      hp,
      maxHp: hp,
      color,
      accentColor: accent,
    });
  }

  // 1. OUTER MAP BORDER PERIMETER WALLS (Indestructible)
  addObs(0, 0, MAP_WIDTH, 40, 'concrete_wall', '#1e293b', '#0f172a', false, 9999);
  addObs(0, MAP_HEIGHT - 40, MAP_WIDTH, 40, 'concrete_wall', '#1e293b', '#0f172a', false, 9999);
  addObs(0, 0, 40, MAP_HEIGHT, 'concrete_wall', '#1e293b', '#0f172a', false, 9999);
  addObs(MAP_WIDTH - 40, 0, 40, MAP_HEIGHT, 'concrete_wall', '#1e293b', '#0f172a', false, 9999);

  // 2. BOARDROOM TOWER (Center Hot-Drop)
  // Conference room center table & chairs
  addObs(1500, 1530, 200, 120, 'boardroom_table', '#522915', '#854d0e', false, 400);
  // Executive desks
  addObs(1360, 1360, 100, 50, 'desk', '#334155', '#475569');
  addObs(1740, 1360, 100, 50, 'desk', '#334155', '#475569');
  addObs(1360, 1780, 100, 50, 'desk', '#334155', '#475569');
  addObs(1740, 1780, 100, 50, 'desk', '#334155', '#475569');
  // Decorative plants
  addObs(1320, 1320, 35, 35, 'potted_plant', '#15803d', '#22c55e', true, 50);
  addObs(1840, 1320, 35, 35, 'potted_plant', '#15803d', '#22c55e', true, 50);
  addObs(1320, 1840, 35, 35, 'potted_plant', '#15803d', '#22c55e', true, 50);
  addObs(1840, 1840, 35, 35, 'potted_plant', '#15803d', '#22c55e', true, 50);
  // Glass partition walls
  addObs(1420, 1300, 12, 160, 'glass_wall', '#0284c7', '#38bdf8', true, 80);
  addObs(1760, 1300, 12, 160, 'glass_wall', '#0284c7', '#38bdf8', true, 80);

  // 3. CUBICLE MAZE (Top-Left)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = 460 + col * 150;
      const cy = 460 + row * 140;
      // L-shaped cubicle dividers
      addObs(cx, cy, 90, 14, 'cubicle_wall', '#475569', '#64748b', true, 120);
      addObs(cx, cy, 14, 80, 'cubicle_wall', '#475569', '#64748b', true, 120);
      // Desk with monitor inside
      addObs(cx + 20, cy + 20, 55, 35, 'desk', '#334155', '#60a5fa', true, 90);
      // Water cooler in some cubicles
      if ((row + col) % 3 === 0) {
        addObs(cx + 80, cy + 50, 25, 25, 'water_cooler', '#0284c7', '#bae6fd', true, 60);
      }
    }
  }

  // 4. SERVER ROOM BUNKER (Top-Right)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const sx = 2180 + c * 200;
      const sy = 480 + r * 130;
      // Server racks (glowing green/blue leds)
      addObs(sx, sy, 140, 45, 'server', '#0f172a', '#10b981', true, 200);
    }
  }

  // 5. HELIPAD & VIP CAR PARK (Bottom-Left)
  // Executive limos and luxury sedans
  addObs(500, 2200, 130, 65, 'executive_car', '#111827', '#e2e8f0', true, 250);
  addObs(700, 2200, 130, 65, 'executive_car', '#991b1b', '#fca5a5', true, 250);
  addObs(500, 2450, 130, 65, 'executive_car', '#1e3a8a', '#93c5fd', true, 250);
  addObs(700, 2450, 130, 65, 'executive_car', '#065f46', '#6ee7b7', true, 250);
  // Helipad crates / barriers
  addObs(880, 2300, 80, 40, 'concrete_wall', '#64748b', '#94a3b8', false, 500);
  addObs(880, 2400, 80, 40, 'concrete_wall', '#64748b', '#94a3b8', false, 500);

  // 6. FINANCIAL AUDIT VAULT (Bottom-Right)
  // Safe deposit walls & security partitions
  addObs(2200, 2200, 18, 300, 'concrete_wall', '#334155', '#475569', false, 800);
  addObs(2600, 2200, 18, 300, 'concrete_wall', '#334155', '#475569', false, 800);
  addObs(2200, 2200, 418, 18, 'concrete_wall', '#334155', '#475569', false, 800);
  // Inside vault counters & filing cabinets
  addObs(2280, 2280, 80, 50, 'desk', '#1e293b', '#d97706', true, 160);
  addObs(2440, 2280, 80, 50, 'desk', '#1e293b', '#d97706', true, 160);
  addObs(2280, 2400, 80, 50, 'desk', '#1e293b', '#d97706', true, 160);
  addObs(2440, 2400, 80, 50, 'desk', '#1e293b', '#d97706', true, 160);

  // 7. CAFETERIA & VENDING MACHINES (Top-Center)
  for (let i = 0; i < 3; i++) {
    addObs(1420 + i * 80, 440, 40, 40, 'vending_machine', '#b91c1c', '#facc15', true, 140);
  }
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      addObs(1400 + c * 90, 560 + r * 120, 60, 60, 'desk', '#78350f', '#b45309', true, 100);
    }
  }

  // 8. RANDOM SCATTERED OFFICE PARTITIONS & TREES / HEDGES
  for (let i = 0; i < 28; i++) {
    const rx = 200 + Math.random() * (MAP_WIDTH - 400);
    const ry = 200 + Math.random() * (MAP_HEIGHT - 400);
    // Keep central area open for combat flow
    const distToCenter = Math.hypot(rx - 1600, ry - 1600);
    if (distToCenter > 350 && distToCenter < 1200) {
      if (Math.random() > 0.5) {
        addObs(rx, ry, 60, 60, 'potted_plant', '#166534', '#4ade80', true, 60);
      } else {
        addObs(rx, ry, 90, 20, 'cubicle_wall', '#334155', '#64748b', true, 120);
      }
    }
  }

  return obstacles;
}

export function generateInitialLoot(): LootItem[] {
  const loot: LootItem[] = [];

  // Spawn concentrated loot in each major zone
  MAP_ZONES.forEach((zone) => {
    const count = zone.name.includes('BOARDROOM') ? 14 : 9;
    for (let i = 0; i < count; i++) {
      const lx = zone.x + 40 + Math.random() * (zone.w - 80);
      const ly = zone.y + 40 + Math.random() * (zone.h - 80);
      loot.push(spawnLootItem(lx, ly));
    }
  });

  // Spawn scattered field loot across campus
  for (let i = 0; i < 45; i++) {
    const lx = 200 + Math.random() * (MAP_WIDTH - 400);
    const ly = 200 + Math.random() * (MAP_HEIGHT - 400);
    loot.push(spawnLootItem(lx, ly));
  }

  return loot;
}

/**
 * Circle-to-rectangle collision detection & response
 */
export function circleCollidesWithRect(
  cx: number,
  cy: number,
  cr: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): { collides: boolean; resolveX: number; resolveY: number } {
  // Find closest point on rectangle to circle
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  const dx = cx - closestX;
  const dy = cy - closestY;
  const distSq = dx * dx + dy * dy;

  if (distSq < cr * cr) {
    const dist = Math.sqrt(distSq) || 0.001;
    const overlap = cr - dist;
    return {
      collides: true,
      resolveX: (dx / dist) * overlap,
      resolveY: (dy / dist) * overlap,
    };
  }

  return { collides: false, resolveX: 0, resolveY: 0 };
}
