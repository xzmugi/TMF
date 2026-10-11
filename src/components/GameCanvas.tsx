import React, { useRef, useEffect, useCallback } from 'react';
import {
  Combatant,
  Bullet,
  LootItem,
  Obstacle,
  Particle,
  FloatingText,
  StormCircle,
  CharacterId,
  WeaponType,
} from '../types/game';
import { MAP_WIDTH, MAP_HEIGHT, MAP_ZONES } from '../utils/gameMap';

interface GameCanvasProps {
  player: Combatant | null;
  combatants: Combatant[];
  spectatingTargetId: string | null;
  bullets: Bullet[];
  loot: LootItem[];
  obstacles: Obstacle[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  storm: StormCircle;
  isMapExpanded: boolean;
  onFireWeapon: () => void;
  onReload: () => void;
  onUseAbility: () => void;
  onPickupLoot: () => void;
  onSelectWeaponSlot: (slot: number) => void;
  onAimAngleChange: (angle: number) => void;
  onMovementInput: (dx: number, dy: number) => void;
  touchControlsActive: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  combatants,
  spectatingTargetId,
  bullets,
  loot,
  obstacles,
  particles,
  floatingTexts,
  storm,
  isMapExpanded,
  onFireWeapon,
  onReload,
  onUseAbility,
  onPickupLoot,
  onSelectWeaponSlot,
  onAimAngleChange,
  onMovementInput,
  touchControlsActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysDown = useRef<Record<string, boolean>>({});
  const isMouseDown = useRef(false);
  const mousePos = useRef({ x: 0, y: 0 });

  // Touch joystick tracking
  const touchJoystick = useRef<{
    active: boolean;
    touchId: number | null;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  }>({
    active: false,
    touchId: null,
    startX: 0,
    startY: 0,
    currX: 0,
    currY: 0,
  });

  // Determine current camera focus target
  const cameraTarget =
    player && player.isAlive
      ? player
      : combatants.find((c) => c.id === spectatingTargetId) || player || combatants[0];

  // Camera viewport offset
  const camera = useRef({ x: 1600, y: 1600 });

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = true;

      if (e.key === '1') onSelectWeaponSlot(0);
      if (e.key === '2') onSelectWeaponSlot(1);
      if (e.key === '3') onSelectWeaponSlot(2);
      if (e.key.toLowerCase() === 'r') onReload();
      if (e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'f') onUseAbility();
      if (e.key.toLowerCase() === 'e') onPickupLoot();
      if (e.code === 'Space') {
        onFireWeapon();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onSelectWeaponSlot, onReload, onUseAbility, onPickupLoot, onFireWeapon]);

  // Handle Mouse Inputs
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      mousePos.current = { x: screenX, y: screenY };

      // Compute world angle from player to mouse
      if (cameraTarget) {
        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2;
        const angle = Math.atan2(screenY - screenCenterY, screenX - screenCenterX);
        onAimAngleChange(angle);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown.current = true;
        onFireWeapon();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown.current = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cameraTarget, onAimAngleChange, onFireWeapon]);

  // Input polling loop
  useEffect(() => {
    const interval = setInterval(() => {
      let dx = 0;
      let dy = 0;
      const keys = keysDown.current;

      if (keys['w'] || keys['arrowup']) dy -= 1;
      if (keys['s'] || keys['arrowdown']) dy += 1;
      if (keys['a'] || keys['arrowleft']) dx -= 1;
      if (keys['d'] || keys['arrowright']) dx += 1;

      // Blend with touch joystick if active
      if (touchJoystick.current.active) {
        const jdx = touchJoystick.current.currX - touchJoystick.current.startX;
        const jdy = touchJoystick.current.currY - touchJoystick.current.startY;
        const dist = Math.hypot(jdx, jdy);
        if (dist > 10) {
          dx = jdx / Math.max(dist, 50);
          dy = jdy / Math.max(dist, 50);
        }
      }

      onMovementInput(dx, dy);

      // Auto-fire while holding mouse down
      if (isMouseDown.current) {
        onFireWeapon();
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [onMovementInput, onFireWeapon]);

  // Render loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Resize canvas to window
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      const cw = canvas.width;
      const ch = canvas.height;

      // Smooth camera interpolation towards target
      if (cameraTarget) {
        camera.current.x += (cameraTarget.x - camera.current.x) * 0.12;
        camera.current.y += (cameraTarget.y - camera.current.y) * 0.12;
      }

      // Clamp camera to map bounds
      const halfW = cw / 2;
      const halfH = ch / 2;
      const camX = Math.max(halfW, Math.min(MAP_WIDTH - halfW, camera.current.x));
      const camY = Math.max(halfH, Math.min(MAP_HEIGHT - halfH, camera.current.y));

      ctx.save();
      ctx.clearRect(0, 0, cw, ch);

      // Apply Camera Transform
      ctx.translate(cw / 2 - camX, ch / 2 - camY);

      // 1. DRAW MAP BACKGROUND & TILES
      drawMapBackground(ctx);

      // 2. DRAW ZONE BORDERS & LABELS
      drawZones(ctx);

      // 3. DRAW LOOT ITEMS
      drawLoot(ctx, loot);

      // 4. DRAW OBSTACLES & COVER
      drawObstacles(ctx, obstacles);

      // 5. DRAW DOWNSIZING STORM CIRCLE
      drawStorm(ctx, storm);

      // 6. DRAW BULLETS
      drawBullets(ctx, bullets);

      // 7. DRAW PARTICLES
      drawParticles(ctx, particles);

      // 8. DRAW COMBATANTS (CHARACTERS & BOTS)
      drawCombatants(ctx, combatants, player?.id);

      // 9. DRAW FLOATING DAMAGE NUMBERS
      drawFloatingTexts(ctx, floatingTexts);

      ctx.restore();

      // 10. SCREEN SHAKE & STORM VIGNETTE (Screen Space)
      drawScreenVignette(ctx, cw, ch, player, storm);

      // 11. FULL MAP OVERLAY (If user toggled M)
      if (isMapExpanded) {
        drawExpandedMap(ctx, cw, ch, storm, combatants, player?.id, loot);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    cameraTarget,
    combatants,
    player,
    bullets,
    loot,
    obstacles,
    particles,
    floatingTexts,
    storm,
    isMapExpanded,
  ]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Left side of screen = movement joystick
      if (touch.clientX < window.innerWidth / 2 && !touchJoystick.current.active) {
        touchJoystick.current = {
          active: true,
          touchId: touch.identifier,
          startX: touch.clientX,
          startY: touch.clientY,
          currX: touch.clientX,
          currY: touch.clientY,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchJoystick.current.touchId) {
        touchJoystick.current.currX = touch.clientX;
        touchJoystick.current.currY = touch.clientY;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchJoystick.current.touchId) {
        touchJoystick.current.active = false;
        touchJoystick.current.touchId = null;
        onMovementInput(0, 0);
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Touch virtual controls for mobile / touch devices */}
      {touchControlsActive && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Virtual Joystick Visual Indicator */}
          {touchJoystick.current.active && (
            <div
              className="absolute pointer-events-none rounded-full border-2 border-amber-400/50 bg-amber-500/10"
              style={{
                width: 100,
                height: 100,
                left: touchJoystick.current.startX - 50,
                top: touchJoystick.current.startY - 50,
              }}
            >
              <div
                className="absolute w-10 h-10 rounded-full bg-amber-400/80 shadow-lg shadow-amber-400/50"
                style={{
                  left: 50 - 20 + Math.max(-40, Math.min(40, touchJoystick.current.currX - touchJoystick.current.startX)),
                  top: 50 - 20 + Math.max(-40, Math.min(40, touchJoystick.current.currY - touchJoystick.current.startY)),
                }}
              />
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="absolute right-6 bottom-10 flex flex-col gap-4 pointer-events-auto items-end">
            <button
              onClick={onUseAbility}
              className="w-16 h-16 rounded-full bg-purple-600/80 border-2 border-purple-400 text-white font-pixel text-xs active:scale-95 shadow-lg flex items-center justify-center backdrop-blur-sm"
            >
              Q
            </button>
            <div className="flex gap-4">
              <button
                onClick={onReload}
                className="w-14 h-14 rounded-full bg-slate-700/80 border-2 border-slate-500 text-amber-300 font-pixel text-xs active:scale-95 shadow-lg flex items-center justify-center backdrop-blur-sm"
              >
                R
              </button>
              <button
                onClick={onFireWeapon}
                className="w-20 h-20 rounded-full bg-red-600/90 border-4 border-amber-400 text-white font-pixel text-sm active:scale-95 shadow-xl shadow-red-600/40 flex items-center justify-center"
              >
                FIRE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// CANVAS DRAWING HELPERS
// ==========================================

function drawMapBackground(ctx: CanvasRenderingContext2D) {
  // Base office concrete / tarmac carpet
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Large floor grid lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  const gridSize = 100;
  for (let x = 0; x <= MAP_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, MAP_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= MAP_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(MAP_WIDTH, y);
    ctx.stroke();
  }

  // Draw corporate asphalt roads connecting zones
  ctx.fillStyle = '#182030';
  ctx.fillRect(1500, 0, 200, MAP_HEIGHT); // Vertical highway
  ctx.fillRect(0, 1500, MAP_WIDTH, 200); // Horizontal boulevard

  // Road dashed yellow lane markings
  ctx.strokeStyle = '#facc15';
  ctx.setLineDash([20, 20]);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(1600, 0);
  ctx.lineTo(1600, MAP_HEIGHT);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 1600);
  ctx.lineTo(MAP_WIDTH, 1600);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawZones(ctx: CanvasRenderingContext2D) {
  MAP_ZONES.forEach((zone) => {
    // Fill zone floor
    ctx.fillStyle = zone.color;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

    // Zone outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

    // Zone Name stamped on floor in pixel typography
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.font = '900 32px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(zone.name, zone.x + zone.w / 2, zone.y + zone.h / 2);
  });
}

function drawLoot(ctx: CanvasRenderingContext2D, loot: LootItem[]) {
  const now = Date.now();
  loot.forEach((item) => {
    const bobY = Math.sin(now * 0.005 + item.bobOffset) * 6;
    const px = item.x;
    const py = item.y + bobY;

    // Rarity Color
    const rarityColors: Record<string, string> = {
      common: '#94a3b8',
      rare: '#38bdf8',
      epic: '#c084fc',
      legendary: '#f59e0b',
    };
    const glowColor = rarityColors[item.rarity] || '#94a3b8';

    // Outer glow aura
    const grad = ctx.createRadialGradient(px, py, 2, px, py, 26);
    grad.addColorStop(0, glowColor);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, 26, 0, Math.PI * 2);
    ctx.fill();

    // Base pedestal shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(item.x, item.y + 12, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Icon container box
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.fillRect(px - 14, py - 14, 28, 28);
    ctx.strokeRect(px - 14, py - 14, 28, 28);

    // Item symbol
    ctx.fillStyle = glowColor;
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (item.type === 'weapon') {
      ctx.fillText('🔫', px, py);
    } else if (item.type === 'medkit') {
      ctx.fillText('💊', px, py);
    } else if (item.type === 'coffee') {
      ctx.fillText('☕', px, py);
    } else if (item.type === 'kevlar') {
      ctx.fillText('🛡️', px, py);
    } else if (item.type === 'ammo') {
      ctx.fillText('📦', px, py);
    } else {
      ctx.fillText('💼', px, py);
    }

    // Floating item name tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(px - 60, py - 30, 120, 14);
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(px - 60, py - 30, 120, 14);

    ctx.fillStyle = glowColor;
    ctx.font = '9px "Outfit", sans-serif';
    ctx.fillText(item.name.slice(0, 18), px, py - 23);
  });
}

function drawObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[]) {
  obstacles.forEach((obs) => {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(obs.x + 4, obs.y + 6, obs.width, obs.height);

    // Main obstacle block
    ctx.fillStyle = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

    // Border bevel
    ctx.strokeStyle = obs.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

    // Specific detailing
    if (obs.type === 'desk') {
      // Laptop monitor on desk
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(obs.x + obs.width / 2 - 12, obs.y + obs.height / 2 - 6, 24, 12);
    } else if (obs.type === 'server') {
      // Blinking server LED rows
      const t = Date.now() * 0.005;
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = Math.sin(t + i) > 0 ? '#22c55e' : '#06b6d4';
        ctx.fillRect(obs.x + 8 + i * 16, obs.y + 6, 6, 4);
      }
    } else if (obs.type === 'potted_plant') {
      // Green foliage circle
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.type === 'boardroom_table') {
      // Mahogany polished center inlay
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(obs.x + 10, obs.y + 10, obs.width - 20, obs.height - 20);
    } else if (obs.type === 'executive_car') {
      // Windshield & headlights
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(obs.x + 20, obs.y + 12, obs.width - 40, 16);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(obs.x + obs.width - 10, obs.y + 8, 8, 8);
      ctx.fillRect(obs.x + obs.width - 10, obs.y + obs.height - 16, 8, 8);
    }

    // Health bar if damaged
    if (obs.destructible && obs.hp < obs.maxHp) {
      const hpPct = obs.hp / obs.maxHp;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(obs.x, obs.y - 8, obs.width, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(obs.x, obs.y - 8, obs.width * hpPct, 4);
    }
  });
}

function drawStorm(ctx: CanvasRenderingContext2D, storm: StormCircle) {
  // 1. Next safe circle (dashed white line)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.arc(storm.targetX, storm.targetY, storm.targetRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 2. Current shrinking downsizing storm barrier
  ctx.save();
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(storm.x, storm.y, storm.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Dark toxic "Pink Slip" fog outside storm
  ctx.beginPath();
  ctx.arc(storm.x, storm.y, storm.radius, 0, Math.PI * 2, true);
  ctx.rect(-500, -500, MAP_WIDTH + 1000, MAP_HEIGHT + 1000);
  ctx.fillStyle = 'rgba(157, 23, 77, 0.42)';
  ctx.fill();

  ctx.restore();
}

function drawBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]) {
  bullets.forEach((b) => {
    ctx.save();
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 8;

    // Bullet trail line
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.size;
    ctx.beginPath();
    ctx.moveTo(b.x - b.vx * 0.02, b.y - b.vy * 0.02);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    // Bullet head
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;

    if (p.type === 'dollar') {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-p.size * 1.5, -p.size, p.size * 3, p.size * 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px sans-serif';
      ctx.fillText('$', -3, 3);
    } else if (p.type === 'paper') {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
    } else if (p.type === 'muzzle') {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

/**
 * Top-Down character sprite rendering matching the 4 executives
 */
function drawCombatants(
  ctx: CanvasRenderingContext2D,
  combatants: Combatant[],
  localPlayerId?: string
) {
  combatants.forEach((c) => {
    if (!c.isAlive) return;

    ctx.save();
    ctx.translate(c.x, c.y);

    // 1. DROP PARACHUTE EFFECT (If dropping from helicopter)
    if (c.isParachuting) {
      const altitude = c.parachuteHeight;
      const canopyScale = 1.0 + altitude * 0.5;

      // Parachute canopy
      ctx.fillStyle = c.isPlayer ? '#facc15' : '#ef4444';
      ctx.beginPath();
      ctx.ellipse(0, -50 * canopyScale, 40 * canopyScale, 20 * canopyScale, 0, Math.PI, 0);
      ctx.fill();

      // Cords
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-35 * canopyScale, -50 * canopyScale);
      ctx.lineTo(0, -10);
      ctx.moveTo(35 * canopyScale, -50 * canopyScale);
      ctx.lineTo(0, -10);
      ctx.stroke();
    }

    // 2. SHADOW UNDER EXECUTIVE
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. ABILITY VISUAL EFFECTS
    if (c.isAbilityActive) {
      if (c.characterId === 'barker') {
        // Golden Zoomies speed shockwave ring
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 32 + Math.sin(Date.now() * 0.02) * 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (c.characterId === 'sterling') {
        // Executive Veto dome shield
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (c.characterId === 'mortimer') {
        // Downsizing stealth cloud
        ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, 28, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ROTATE BODY TO AIM ANGLE
    ctx.rotate(c.angle);

    // 4. WEAPON IN HANDS
    const activeWeapon = c.weapons[c.activeWeaponIndex];
    if (activeWeapon) {
      ctx.fillStyle = activeWeapon.color;
      ctx.fillRect(12, 6, 18, 6); // Weapon barrel pointing forward
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(10, 8, 4, 4); // Grip
    }

    // 5. EXECUTIVE BODY & SUIT (Top-down torso)
    const suitColor =
      c.characterId === 'marcus'
        ? '#090a0f' // Black tuxedo
        : c.characterId === 'mortimer'
        ? '#3f424b' // Dark audit suit
        : '#2e3037'; // Classic executive charcoal

    ctx.fillStyle = suitColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // White shirt lapels & collar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, -3, 8, 6);

    // Tie / Bow-tie color
    const tieColor =
      c.characterId === 'barker'
        ? '#eab308' // Gold tie
        : c.characterId === 'sterling'
        ? '#991b1b' // Burgundy tie
        : c.characterId === 'mortimer'
        ? '#ef4444' // Red tie
        : '#0f172a'; // Black tuxedo bowtie

    ctx.fillStyle = tieColor;
    ctx.fillRect(7, -2, 6, 4);

    // 6. CHARACTER SPECIFIC HEAD & DETAILS
    drawCharacterHead(ctx, c.characterId);

    // 7. HANDS HOLDING WEAPON
    ctx.fillStyle = getSkinTone(c.characterId);
    ctx.beginPath();
    ctx.arc(14, 5, 4, 0, Math.PI * 2); // Right hand
    ctx.arc(10, -8, 4, 0, Math.PI * 2); // Left hand
    ctx.fill();

    // RESET ROTATION FOR UI OVERLAYS (HEALTH / SHIELD / NAME)
    ctx.rotate(-c.angle);

    // 8. OVERHEAD HUD (Name, Health, Shield)
    drawCombatantOverheadHUD(ctx, c, c.id === localPlayerId);

    ctx.restore();
  });
}

function getSkinTone(charId: CharacterId): string {
  if (charId === 'barker') return '#dca963'; // Golden hound fur
  if (charId === 'sterling') return '#dcb192'; // Fair skin
  if (charId === 'mortimer') return '#f3f4f6'; // Bone white
  return '#935832'; // Marcus rich warm skin
}

function drawCharacterHead(ctx: CanvasRenderingContext2D, charId: CharacterId) {
  if (charId === 'barker') {
    // Dog head with snout & floppy ears
    ctx.fillStyle = '#dca963';
    ctx.beginPath();
    ctx.ellipse(2, 0, 11, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Floppy ears on sides
    ctx.fillStyle = '#b8813f';
    ctx.beginPath();
    ctx.ellipse(-2, -10, 4, 7, -0.2, 0, Math.PI * 2);
    ctx.ellipse(-2, 10, 4, 7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Black dog nose at snout
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(12, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (charId === 'sterling') {
    // Grey parted hair & beard
    ctx.fillStyle = '#dcb192';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Grey hair on back/sides
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(-3, 0, 9, Math.PI / 2, (Math.PI * 3) / 2);
    ctx.fill();

    // Grey beard at front
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.arc(5, 0, 6, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
  } else if (charId === 'mortimer') {
    // White skull with hollow eyes
    ctx.fillStyle = '#f3f4f6';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Hollow eye sockets
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(5, -4, 2.5, 0, Math.PI * 2);
    ctx.arc(5, 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Marcus bald executive head with confident shine
    ctx.fillStyle = '#935832';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Subtle head highlight reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(-2, -2, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCombatantOverheadHUD(
  ctx: CanvasRenderingContext2D,
  c: Combatant,
  isLocalPlayer: boolean
) {
  const barW = 38;
  const barH = 4;
  const barY = -30;

  // Name tag
  ctx.fillStyle = isLocalPlayer ? '#facc15' : '#ffffff';
  ctx.font = 'bold 10px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(c.name, 0, barY - 6);

  // Background health bar
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(-barW / 2, barY, barW, barH);

  // HP fill
  const hpPct = Math.max(0, Math.min(1, c.hp / c.maxHp));
  ctx.fillStyle = hpPct > 0.4 ? '#22c55e' : '#ef4444';
  ctx.fillRect(-barW / 2, barY, barW * hpPct, barH);

  // Shield bar above HP
  if (c.shield > 0) {
    const shieldPct = Math.max(0, Math.min(1, c.shield / c.maxShield));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(-barW / 2, barY - 5, barW, 3);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-barW / 2, barY - 5, barW * shieldPct, 3);
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  texts.forEach((ft) => {
    ctx.save();
    const alpha = Math.max(0, ft.life / ft.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.font = ft.isCrit
      ? '900 16px "Press Start 2P", monospace'
      : 'bold 13px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}

function drawScreenVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  player: Combatant | null,
  storm: StormCircle
) {
  if (!player || !player.isAlive) return;

  // Check if player is outside storm
  const dist = Math.hypot(player.x - storm.x, player.y - storm.y);
  if (dist > storm.radius) {
    // Red / purple toxic storm vignette pulsation
    const intensity = Math.min(0.65, 0.3 + Math.sin(Date.now() * 0.008) * 0.15);
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, `rgba(225, 29, 72, ${intensity})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawExpandedMap(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  storm: StormCircle,
  combatants: Combatant[],
  localPlayerId?: string,
  loot?: LootItem[]
) {
  const mapSize = Math.min(cw * 0.85, ch * 0.85, 700);
  const mapX = (cw - mapSize) / 2;
  const mapY = (ch - mapSize) / 2;
  const scale = mapSize / MAP_WIDTH;

  ctx.save();
  // Backdrop overlay
  ctx.fillStyle = 'rgba(2, 6, 23, 0.88)';
  ctx.fillRect(0, 0, cw, ch);

  // Map Frame
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(mapX, mapY, mapSize, mapSize);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(mapX, mapY, mapSize, mapSize);

  // Zones
  MAP_ZONES.forEach((z) => {
    ctx.fillStyle = z.color;
    ctx.fillRect(mapX + z.x * scale, mapY + z.y * scale, z.w * scale, z.h * scale);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(z.name, mapX + (z.x + z.w / 2) * scale, mapY + (z.y + z.h / 2) * scale);
  });

  // Storm Circles on Map
  // Safe zone
  ctx.strokeStyle = '#ffffff';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(
    mapX + storm.targetX * scale,
    mapY + storm.targetY * scale,
    storm.targetRadius * scale,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Current closing circle
  ctx.strokeStyle = '#ec4899';
  ctx.setLineDash([]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(mapX + storm.x * scale, mapY + storm.y * scale, storm.radius * scale, 0, Math.PI * 2);
  ctx.stroke();

  // Combatant dots
  combatants.forEach((c) => {
    if (!c.isAlive) return;
    const isMe = c.id === localPlayerId;
    ctx.fillStyle = isMe ? '#facc15' : '#ef4444';
    ctx.beginPath();
    ctx.arc(mapX + c.x * scale, mapY + c.y * scale, isMe ? 6 : 3, 0, Math.PI * 2);
    ctx.fill();
    if (isMe) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });

  // Map Header
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 16px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CORPORATE CAMPUS RADAR (M)', cw / 2, mapY - 20);

  ctx.restore();
}
