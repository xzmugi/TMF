import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GamePhase,
  CharacterId,
  Combatant,
  Bullet,
  LootItem,
  Obstacle,
  Particle,
  FloatingText,
  KillFeedEntry,
  StormCircle,
  WeaponType,
} from './types/game';
import { CHARACTERS, getCharacter } from './utils/characterPortraits';
import { createWeaponInstance, spawnLootItem } from './utils/weapons';
import {
  generateObstacles,
  generateInitialLoot,
  circleCollidesWithRect,
  MAP_WIDTH,
  MAP_HEIGHT,
} from './utils/gameMap';
import { createBot, updateBotAI } from './utils/botAI';
import { sound } from './utils/audio';

import { CharacterSelect } from './components/CharacterSelect';
import { DropPhaseOverlay } from './components/DropPhaseOverlay';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { GameOverModal } from './components/GameOverModal';
import { ControlsHelpModal } from './components/ControlsHelpModal';

export default function App() {
  // Phase state
  const [gamePhase, setGamePhase] = useState<GamePhase>('select_character');
  const [selectedCharId, setSelectedCharId] = useState<CharacterId>('barker');

  // Match Entities State
  const [player, setPlayer] = useState<Combatant | null>(null);
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [spectatingTargetId, setSpectatingTargetId] = useState<string | null>(null);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [loot, setLoot] = useState<LootItem[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);

  // Airlift Drop Phase State
  const [planeProgress, setPlaneProgress] = useState(0);
  const [playerHasDropped, setPlayerHasDropped] = useState(false);

  // Storm Circle
  const [storm, setStorm] = useState<StormCircle>({
    phase: 1,
    maxPhases: 5,
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT / 2,
    radius: 1500,
    targetX: MAP_WIDTH / 2,
    targetY: MAP_HEIGHT / 2,
    targetRadius: 1000,
    shrinkSpeed: 25,
    isShrinking: false,
    phaseTimeLeft: 45,
    phaseDuration: 45,
    damagePerTick: 3,
  });

  // UI Modals & Settings
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [matchStartTime, setMatchStartTime] = useState(0);
  const [matchDurationSec, setMatchDurationSec] = useState(0);
  const [playerRank, setPlayerRank] = useState(20);

  // Input states refs for smooth 60fps loop
  const inputMove = useRef({ dx: 0, dy: 0 });
  const aimAngleRef = useRef(0);
  const lastLoopTime = useRef(performance.now());
  const touchControlsActive = useRef(
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );

  // References to mutable entity state for the simulation loop
  const entitiesRef = useRef({
    combatants: [] as Combatant[],
    bullets: [] as Bullet[],
    loot: [] as LootItem[],
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    killFeed: [] as KillFeedEntry[],
    storm: storm,
    player: null as Combatant | null,
    planeProgress: 0,
    playerHasDropped: false,
    isGameOver: false,
  });

  // Sync ref with state when starting
  useEffect(() => {
    entitiesRef.current.storm = storm;
  }, [storm]);

  // Toggle audio
  const handleToggleSound = useCallback(() => {
    sound.isMuted = !soundMuted;
    setSoundMuted(!soundMuted);
  }, [soundMuted]);

  // Start new match
  const handleStartGame = (chosenCharId: CharacterId) => {
    setSelectedCharId(chosenCharId);
    const charDef = getCharacter(chosenCharId);

    // Generate Map & Loot
    const generatedObs = generateObstacles();
    const generatedLoot = generateInitialLoot();

    // Create 19 Bot Executives
    const totalExecs = 20;
    const initialBots: Combatant[] = [];

    for (let i = 0; i < totalExecs - 1; i++) {
      // Bots scatter along the map
      const bx = 300 + Math.random() * (MAP_WIDTH - 600);
      const by = 300 + Math.random() * (MAP_HEIGHT - 600);
      const bot = createBot(i, bx, by);
      // Bots are airborne at start
      bot.isParachuting = true;
      bot.parachuteHeight = 1.0;
      bot.targetDropX = bx;
      bot.targetDropY = by;
      initialBots.push(bot);
    }

    // Create Human Player
    const playerMaxHp = 100 + charDef.maxHpBonus;
    const playerShield = charDef.armorBonus;
    const startingPistol = createWeaponInstance('stapler_pistol');

    const newPlayer: Combatant = {
      id: 'player_user',
      name: `CEO ${charDef.name.split(' ')[0]} (You)`,
      characterId: chosenCharId,
      isPlayer: true,
      x: 300,
      y: 300,
      vx: 0,
      vy: 0,
      angle: 0,
      hp: playerMaxHp,
      maxHp: playerMaxHp,
      shield: playerShield,
      maxShield: 100,
      speed: 240 * charDef.speedMultiplier,
      isAlive: true,
      isParachuting: false,
      parachuteHeight: 1.0,
      targetDropX: 1600,
      targetDropY: 1600,
      weapons: [startingPistol, null, null],
      activeWeaponIndex: 0,
      ammoReserve: {
        pistol: 80,
        rifle: 90,
        shotgun: 24,
        sniper: 12,
        cash_cannon: 100,
        briefcase_launcher: 6,
      },
      consumables: {
        medkits: 1,
        coffee: 2,
      },
      abilityCooldownRemaining: 0,
      abilityActiveDuration: 0,
      isAbilityActive: false,
      kills: 0,
      damageDealt: 0,
      survivalRank: 20,
    };

    const allCombatants = [newPlayer, ...initialBots];

    // Initial Storm State
    const initialStorm: StormCircle = {
      phase: 1,
      maxPhases: 5,
      x: MAP_WIDTH / 2,
      y: MAP_HEIGHT / 2,
      radius: 1450,
      targetX: MAP_WIDTH / 2 + (Math.random() - 0.5) * 300,
      targetY: MAP_HEIGHT / 2 + (Math.random() - 0.5) * 300,
      targetRadius: 950,
      shrinkSpeed: 24,
      isShrinking: false,
      phaseTimeLeft: 35,
      phaseDuration: 35,
      damagePerTick: 3,
    };

    setPlayer(newPlayer);
    setCombatants(allCombatants);
    setObstacles(generatedObs);
    setLoot(generatedLoot);
    setBullets([]);
    setParticles([]);
    setFloatingTexts([]);
    setKillFeed([]);
    setStorm(initialStorm);
    setPlaneProgress(0);
    setPlayerHasDropped(false);
    setSpectatingTargetId(null);
    setMatchStartTime(Date.now());
    setPlayerRank(20);

    entitiesRef.current = {
      combatants: allCombatants,
      bullets: [],
      loot: generatedLoot,
      obstacles: generatedObs,
      particles: [],
      floatingTexts: [],
      killFeed: [],
      storm: initialStorm,
      player: newPlayer,
      planeProgress: 0,
      playerHasDropped: false,
      isGameOver: false,
    };

    setGamePhase('plane_drop');
  };

  // Human Player Eject / Drop
  const handleDrop = useCallback(() => {
    if (entitiesRef.current.playerHasDropped) return;
    entitiesRef.current.playerHasDropped = true;
    setPlayerHasDropped(true);

    // Position player where the private jet currently is
    const startX = 200;
    const startY = 200;
    const endX = MAP_WIDTH - 200;
    const endY = MAP_HEIGHT - 200;
    const currPlaneX = startX + (endX - startX) * entitiesRef.current.planeProgress;
    const currPlaneY = startY + (endY - startY) * entitiesRef.current.planeProgress;

    if (entitiesRef.current.player) {
      entitiesRef.current.player.x = currPlaneX;
      entitiesRef.current.player.y = currPlaneY;
      entitiesRef.current.player.isParachuting = true;
      entitiesRef.current.player.parachuteHeight = 1.0;
    }

    setGamePhase('in_game');
  }, []);

  // Aim Angle input callback
  const handleAimAngleChange = useCallback((angle: number) => {
    aimAngleRef.current = angle;
    if (entitiesRef.current.player) {
      entitiesRef.current.player.angle = angle;
    }
  }, []);

  // Movement input callback
  const handleMovementInput = useCallback((dx: number, dy: number) => {
    inputMove.current = { dx, dy };
  }, []);

  // Weapon slot select
  const handleSelectWeaponSlot = useCallback((slot: number) => {
    const p = entitiesRef.current.player;
    if (p && p.weapons[slot]) {
      p.activeWeaponIndex = slot;
      setPlayer({ ...p });
    }
  }, []);

  // Weapon reload
  const handleReload = useCallback(() => {
    const p = entitiesRef.current.player;
    if (!p || !p.isAlive) return;
    const weapon = p.weapons[p.activeWeaponIndex];
    if (!weapon || weapon.isReloading || weapon.currentAmmo === weapon.maxAmmo) return;

    weapon.isReloading = true;
    weapon.reloadStartTime = Date.now();
    sound.playReload();
    setPlayer({ ...p });
  }, []);

  // Use Active Ability
  const handleUseAbility = useCallback(() => {
    const p = entitiesRef.current.player;
    if (!p || !p.isAlive || p.abilityCooldownRemaining > 0) return;

    const charDef = getCharacter(p.characterId);
    p.abilityCooldownRemaining = charDef.abilityCooldown;
    p.abilityActiveDuration = charDef.abilityDuration || 4;
    p.isAbilityActive = true;
    sound.playAbility(p.characterId);

    // Unique active ability effects
    if (p.characterId === 'barker') {
      // Golden Zoomies: stun & knockback all nearby enemies within 260px!
      entitiesRef.current.combatants.forEach((c) => {
        if (c.id === p.id || !c.isAlive) return;
        const dist = Math.hypot(c.x - p.x, c.y - p.y);
        if (dist < 260) {
          const knockAngle = Math.atan2(c.y - p.y, c.x - p.x);
          c.vx += Math.cos(knockAngle) * 450;
          c.vy += Math.sin(knockAngle) * 450;
          c.hp -= 20;
          entitiesRef.current.floatingTexts.push({
            id: `ft_${Math.random()}`,
            x: c.x,
            y: c.y - 30,
            text: 'BARK STUN! -20',
            color: '#facc15',
            life: 1.0,
            maxLife: 1.0,
            vy: -40,
            isCrit: true,
          });
        }
      });
    } else if (p.characterId === 'sterling') {
      // Executive Veto: grant +60 temporary shield
      p.shield = Math.min(p.maxShield, p.shield + 60);
    } else if (p.characterId === 'marcus') {
      // Golden Parachute: dash forward & drop explosive briefcase
      const dashAngle = p.angle;
      p.vx += Math.cos(dashAngle) * 600;
      p.vy += Math.sin(dashAngle) * 600;
      // Spawn explosive briefcase bullet
      entitiesRef.current.bullets.push({
        id: `briefcase_bomb_${Math.random()}`,
        x: p.x - Math.cos(dashAngle) * 40,
        y: p.y - Math.sin(dashAngle) * 40,
        vx: 0,
        vy: 0,
        damage: 90,
        distanceTraveled: 0,
        maxDistance: 200,
        ownerId: p.id,
        isPlayer: true,
        color: '#f59e0b',
        size: 9,
        isCrit: true,
        isExplosive: true,
        splashRadius: 180,
      });
    }

    setPlayer({ ...p });
  }, []);

  // Use Consumable (Medkit / Coffee)
  const handleUseConsumable = useCallback((type: 'medkit' | 'coffee') => {
    const p = entitiesRef.current.player;
    if (!p || !p.isAlive) return;

    if (type === 'medkit' && p.consumables.medkits > 0) {
      if (p.hp >= p.maxHp) return;
      p.consumables.medkits -= 1;
      p.hp = Math.min(p.maxHp, p.hp + 50);
      sound.playLootPickup('heal');
      entitiesRef.current.floatingTexts.push({
        id: `heal_${Math.random()}`,
        x: p.x,
        y: p.y - 30,
        text: '+50 HP',
        color: '#22c55e',
        life: 1.2,
        maxLife: 1.2,
        vy: -30,
      });
      setPlayer({ ...p });
    } else if (type === 'coffee' && p.consumables.coffee > 0) {
      if (p.hp >= p.maxHp && p.shield >= p.maxShield) return;
      p.consumables.coffee -= 1;
      p.hp = Math.min(p.maxHp, p.hp + 25);
      p.speed *= 1.2;
      setTimeout(() => {
        if (entitiesRef.current.player) {
          const char = getCharacter(entitiesRef.current.player.characterId);
          entitiesRef.current.player.speed = 240 * char.speedMultiplier;
        }
      }, 6000);
      sound.playLootPickup('heal');
      entitiesRef.current.floatingTexts.push({
        id: `coffee_${Math.random()}`,
        x: p.x,
        y: p.y - 30,
        text: '+25 HP & SPRINT',
        color: '#eab308',
        life: 1.2,
        maxLife: 1.2,
        vy: -30,
      });
      setPlayer({ ...p });
    }
  }, []);

  // Weapon Fire
  const handleFireWeapon = useCallback(() => {
    const p = entitiesRef.current.player;
    if (!p || !p.isAlive || p.isParachuting) return;

    const weapon = p.weapons[p.activeWeaponIndex];
    if (!weapon || weapon.isReloading) return;

    const now = Date.now();
    const minInterval = 1000 / weapon.fireRate;
    if (now - weapon.lastShotTime < minInterval) return;

    if (weapon.currentAmmo <= 0) {
      handleReload();
      return;
    }

    // Spend ammo
    weapon.currentAmmo -= 1;
    weapon.lastShotTime = now;
    sound.playShoot(weapon.type);

    // Muzzle flash particles
    const muzzleX = p.x + Math.cos(p.angle) * 28;
    const muzzleY = p.y + Math.sin(p.angle) * 28;
    entitiesRef.current.particles.push({
      id: `muzzle_${Math.random()}`,
      x: muzzleX,
      y: muzzleY,
      vx: 0,
      vy: 0,
      color: '#fde047',
      size: 7,
      life: 0.08,
      maxLife: 0.08,
      type: 'muzzle',
      rotation: p.angle,
      vRot: 0,
    });

    // Spawn Projectile(s)
    const charDef = getCharacter(p.characterId);
    const critChance = charDef.critChanceBonus + (p.characterId === 'mortimer' ? 0.25 : 0.05);

    for (let i = 0; i < weapon.bulletsPerShot; i++) {
      const spreadAngle = p.angle + (Math.random() - 0.5) * weapon.spread;
      const isCrit = Math.random() < critChance;
      const finalDamage = isCrit ? Math.round(weapon.damage * 1.85) : weapon.damage;

      entitiesRef.current.bullets.push({
        id: `bullet_${Math.random()}`,
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(spreadAngle) * weapon.bulletSpeed,
        vy: Math.sin(spreadAngle) * weapon.bulletSpeed,
        damage: finalDamage,
        distanceTraveled: 0,
        maxDistance: weapon.range,
        ownerId: p.id,
        isPlayer: true,
        color: isCrit ? '#facc15' : weapon.bulletColor,
        size: weapon.bulletSize,
        isCrit,
        isExplosive: weapon.type === 'briefcase_launcher',
        splashRadius: weapon.type === 'briefcase_launcher' ? 140 : undefined,
      });
    }

    setPlayer({ ...p });
  }, [handleReload]);

  // Pickup Nearby Loot
  const handlePickupLoot = useCallback(() => {
    const p = entitiesRef.current.player;
    if (!p || !p.isAlive) return;

    const lootList = entitiesRef.current.loot;
    for (let i = lootList.length - 1; i >= 0; i--) {
      const item = lootList[i];
      const dist = Math.hypot(item.x - p.x, item.y - p.y);
      if (dist < 60) {
        // Collect item
        if (item.type === 'weapon' && item.weaponDef) {
          const newWep = createWeaponInstance(item.weaponDef.id);
          // If current slot is empty or replace
          const emptySlot = p.weapons.findIndex((w) => w === null);
          if (emptySlot !== -1) {
            p.weapons[emptySlot] = newWep;
            p.activeWeaponIndex = emptySlot;
          } else {
            p.weapons[p.activeWeaponIndex] = newWep;
          }
          sound.playLootPickup('weapon');
        } else if (item.type === 'medkit') {
          p.consumables.medkits += 1;
          sound.playLootPickup('item');
        } else if (item.type === 'coffee') {
          p.consumables.coffee += 1;
          sound.playLootPickup('item');
        } else if (item.type === 'kevlar') {
          p.shield = Math.min(p.maxShield, p.shield + 50);
          sound.playLootPickup('shield');
        } else if (item.type === 'ammo') {
          sound.playLootPickup('ammo');
          // Restock all ammo
          (Object.keys(p.ammoReserve) as WeaponType[]).forEach((k) => {
            p.ammoReserve[k] += 30;
          });
        } else if (item.type === 'golden_briefcase') {
          p.shield = p.maxShield;
          p.hp = p.maxHp;
          p.kills += 1;
          sound.playLootPickup('legendary');
        }

        lootList.splice(i, 1);
        break;
      }
    }
    setPlayer({ ...p });
  }, []);

  // Spectate next executive
  const handleNextSpectator = useCallback(() => {
    const aliveBots = entitiesRef.current.combatants.filter((c) => c.isAlive && !c.isPlayer);
    if (aliveBots.length === 0) return;
    const currIdx = aliveBots.findIndex((b) => b.id === spectatingTargetId);
    const nextIdx = (currIdx + 1) % aliveBots.length;
    setSpectatingTargetId(aliveBots[nextIdx].id);
  }, [spectatingTargetId]);

  // ====================================================
  // MAIN 60 FPS SIMULATION LOOP
  // ====================================================
  useEffect(() => {
    let animId: number;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastLoopTime.current) / 1000);
      lastLoopTime.current = currentTime;

      const ent = entitiesRef.current;

      // ------------------------------------------------
      // 1. AIRLIFT DROP PHASE UPDATE
      // ------------------------------------------------
      if (gamePhase === 'plane_drop') {
        ent.planeProgress += dt * 0.12; // 8 seconds flight time across map
        setPlaneProgress(Math.min(1.0, ent.planeProgress));

        // Auto drop when plane reaches end
        if (ent.planeProgress >= 0.95 && !ent.playerHasDropped) {
          handleDrop();
        }
      }

      // ------------------------------------------------
      // 2. IN-GAME PHASE UPDATE
      // ------------------------------------------------
      if (gamePhase === 'in_game' || gamePhase === 'game_over') {
        // A. STORM TICK & PROGRESSION
        const st = ent.storm;
        st.phaseTimeLeft -= dt;

        if (st.phaseTimeLeft <= 0) {
          if (!st.isShrinking) {
            // Start shrinking
            st.isShrinking = true;
            st.phaseDuration = 25;
            st.phaseTimeLeft = 25;
            sound.playStormWarning();
          } else {
            // Finished shrinking, advance phase
            st.isShrinking = false;
            st.phase += 1;
            st.radius = st.targetRadius;
            st.x = st.targetX;
            st.y = st.targetY;
            st.phaseDuration = Math.max(15, 40 - st.phase * 5);
            st.phaseTimeLeft = st.phaseDuration;
            st.damagePerTick += 2;

            // Pick next safe zone center inside current circle
            const offsetDist = Math.random() * (st.radius * 0.4);
            const offsetAngle = Math.random() * Math.PI * 2;
            st.targetX = Math.max(300, Math.min(MAP_WIDTH - 300, st.x + Math.cos(offsetAngle) * offsetDist));
            st.targetY = Math.max(300, Math.min(MAP_HEIGHT - 300, st.y + Math.sin(offsetAngle) * offsetDist));
            st.targetRadius = Math.max(150, st.radius * 0.55);
          }
        }

        if (st.isShrinking) {
          // Interpolate current storm circle towards target
          const shrinkStep = st.shrinkSpeed * dt;
          st.radius = Math.max(st.targetRadius, st.radius - shrinkStep);
          st.x += (st.targetX - st.x) * (dt * 0.08);
          st.y += (st.targetY - st.y) * (dt * 0.08);
        }

        // B. HUMAN PLAYER MOVEMENT & UPDATE
        const p = ent.player;
        if (p && p.isAlive) {
          if (p.isParachuting) {
            // Gliding down to ground
            p.parachuteHeight -= dt * 0.4;
            // Steer glide
            p.x += inputMove.current.dx * (p.speed * 1.3) * dt;
            p.y += inputMove.current.dy * (p.speed * 1.3) * dt;
            if (p.parachuteHeight <= 0) {
              p.isParachuting = false;
              p.parachuteHeight = 0;
            }
          } else {
            // Ground movement
            p.x += inputMove.current.dx * p.speed * dt;
            p.y += inputMove.current.dy * p.speed * dt;
            p.angle = aimAngleRef.current;

            // Handle active weapon reload completion
            const currentWeapon = p.weapons[p.activeWeaponIndex];
            if (currentWeapon && currentWeapon.isReloading) {
              const elapsed = (Date.now() - currentWeapon.reloadStartTime) / 1000;
              if (elapsed >= currentWeapon.reloadTime) {
                currentWeapon.isReloading = false;
                currentWeapon.currentAmmo = currentWeapon.maxAmmo;
              }
            }

            // Ability timers
            if (p.abilityCooldownRemaining > 0) {
              p.abilityCooldownRemaining = Math.max(0, p.abilityCooldownRemaining - dt);
            }
            if (p.abilityActiveDuration > 0) {
              p.abilityActiveDuration = Math.max(0, p.abilityActiveDuration - dt);
              if (p.abilityActiveDuration <= 0) {
                p.isAbilityActive = false;
              }
            }

            // Auto-pickup items under feet
            ent.loot.forEach((item, lIdx) => {
              const dist = Math.hypot(item.x - p.x, item.y - p.y);
              if (dist < 40) {
                // If consumable or armor, auto-loot immediately
                if (item.type === 'medkit') {
                  p.consumables.medkits += 1;
                  sound.playLootPickup('item');
                  ent.loot.splice(lIdx, 1);
                } else if (item.type === 'coffee') {
                  p.consumables.coffee += 1;
                  sound.playLootPickup('item');
                  ent.loot.splice(lIdx, 1);
                } else if (item.type === 'kevlar' && p.shield < p.maxShield) {
                  p.shield = Math.min(p.maxShield, p.shield + 50);
                  sound.playLootPickup('shield');
                  ent.loot.splice(lIdx, 1);
                }
              }
            });

            // Obstacle collision resolution for player
            for (const obs of ent.obstacles) {
              const col = circleCollidesWithRect(p.x, p.y, 16, obs.x, obs.y, obs.width, obs.height);
              if (col.collides) {
                p.x += col.resolveX;
                p.y += col.resolveY;
              }
            }

            // Clamp player to map boundaries
            p.x = Math.max(50, Math.min(MAP_WIDTH - 50, p.x));
            p.y = Math.max(50, Math.min(MAP_HEIGHT - 50, p.y));
          }
        }

        // C. BOT EXECUTIVES AI & MOVEMENT
        ent.combatants.forEach((c) => {
          if (c.isPlayer || !c.isAlive) return;

          if (c.isParachuting) {
            c.parachuteHeight -= dt * 0.45;
            if (c.parachuteHeight <= 0) {
              c.isParachuting = false;
              c.parachuteHeight = 0;
            }
          } else {
            // Run AI
            const decision = updateBotAI(c, ent.combatants, ent.loot, ent.obstacles, st, dt);
            c.x += decision.moveDirX * c.speed * dt;
            c.y += decision.moveDirY * c.speed * dt;
            c.angle = decision.aimAngle;

            // Bot shoot
            if (decision.shouldShoot) {
              const botWep = c.weapons[c.activeWeaponIndex];
              if (botWep && !botWep.isReloading) {
                const now = Date.now();
                if (now - botWep.lastShotTime > 1000 / botWep.fireRate) {
                  botWep.currentAmmo -= 1;
                  botWep.lastShotTime = now;
                  sound.playShoot(botWep.type);

                  for (let i = 0; i < botWep.bulletsPerShot; i++) {
                    const sp = c.angle + (Math.random() - 0.5) * botWep.spread;
                    ent.bullets.push({
                      id: `bot_bullet_${Math.random()}`,
                      x: c.x + Math.cos(c.angle) * 22,
                      y: c.y + Math.sin(c.angle) * 22,
                      vx: Math.cos(sp) * botWep.bulletSpeed,
                      vy: Math.sin(sp) * botWep.bulletSpeed,
                      damage: botWep.damage,
                      distanceTraveled: 0,
                      maxDistance: botWep.range,
                      ownerId: c.id,
                      isPlayer: false,
                      color: botWep.bulletColor,
                      size: botWep.bulletSize,
                      isCrit: false,
                    });
                  }

                  if (botWep.currentAmmo <= 0) {
                    botWep.isReloading = true;
                    setTimeout(() => {
                      botWep.isReloading = false;
                      botWep.currentAmmo = botWep.maxAmmo;
                    }, botWep.reloadTime * 1000);
                  }
                }
              }
            }

            // Bot Ability
            if (decision.useAbility && c.abilityCooldownRemaining <= 0) {
              const def = getCharacter(c.characterId);
              c.abilityCooldownRemaining = def.abilityCooldown;
              c.isAbilityActive = true;
              setTimeout(() => {
                c.isAbilityActive = false;
              }, (def.abilityDuration || 4) * 1000);
            }

            // Bot Heal
            if (decision.healConsumable === 'medkit' && c.consumables.medkits > 0) {
              c.consumables.medkits -= 1;
              c.hp = Math.min(c.maxHp, c.hp + 50);
            }

            // Bot obstacle collision
            for (const obs of ent.obstacles) {
              const col = circleCollidesWithRect(c.x, c.y, 16, obs.x, obs.y, obs.width, obs.height);
              if (col.collides) {
                c.x += col.resolveX;
                c.y += col.resolveY;
              }
            }

            c.x = Math.max(50, Math.min(MAP_WIDTH - 50, c.x));
            c.y = Math.max(50, Math.min(MAP_HEIGHT - 50, c.y));
          }
        });

        // D. BULLET PHYSICS & HIT DETECTION
        for (let bIdx = ent.bullets.length - 1; bIdx >= 0; bIdx--) {
          const b = ent.bullets[bIdx];
          const distStep = Math.hypot(b.vx, b.vy) * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.distanceTraveled += distStep;

          // Check if bullet expired
          if (b.distanceTraveled >= b.maxDistance) {
            ent.bullets.splice(bIdx, 1);
            continue;
          }

          // Bullet vs Obstacle collision
          let hitObstacle = false;
          for (const obs of ent.obstacles) {
            if (
              b.x >= obs.x &&
              b.x <= obs.x + obs.width &&
              b.y >= obs.y &&
              b.y <= obs.y + obs.height
            ) {
              hitObstacle = true;
              if (obs.destructible) {
                obs.hp -= b.damage;
                if (obs.hp <= 0) {
                  // Destructible obstacle shattered: spawn paper / dust particles
                  for (let i = 0; i < 6; i++) {
                    ent.particles.push({
                      id: `p_obs_${Math.random()}`,
                      x: obs.x + obs.width / 2,
                      y: obs.y + obs.height / 2,
                      vx: (Math.random() - 0.5) * 200,
                      vy: (Math.random() - 0.5) * 200,
                      color: obs.accentColor,
                      size: 4,
                      life: 0.6,
                      maxLife: 0.6,
                      type: 'paper',
                      rotation: Math.random() * Math.PI,
                      vRot: 2,
                    });
                  }
                }
              }
              break;
            }
          }

          if (hitObstacle) {
            ent.bullets.splice(bIdx, 1);
            continue;
          }

          // Bullet vs Combatant collision
          let hitCombatant = false;
          for (const target of ent.combatants) {
            if (!target.isAlive || target.isParachuting || target.id === b.ownerId) continue;

            const dist = Math.hypot(target.x - b.x, target.y - b.y);
            if (dist < 18) {
              hitCombatant = true;

              // Calculate shield vs health damage
              let remainingDmg = b.damage;
              // Sterling ability halves storm/bullet damage
              if (target.characterId === 'sterling' && target.isAbilityActive) {
                remainingDmg *= 0.5;
              }

              if (target.shield > 0) {
                if (target.shield >= remainingDmg) {
                  target.shield -= remainingDmg;
                  remainingDmg = 0;
                } else {
                  remainingDmg -= target.shield;
                  target.shield = 0;
                  sound.playShieldBreak();
                }
              }

              target.hp -= remainingDmg;

              // Track shooter's stats
              const shooter = ent.combatants.find((s) => s.id === b.ownerId);
              if (shooter) {
                shooter.damageDealt += b.damage;
              }

              // Sound & visual feedback
              if (b.isPlayer || target.isPlayer) {
                sound.playHit(b.isCrit);
              }

              // Floating damage text
              ent.floatingTexts.push({
                id: `dmg_${Math.random()}`,
                x: target.x,
                y: target.y - 20,
                text: `${Math.round(b.damage)}${b.isCrit ? ' CRIT!' : ''}`,
                color: b.isCrit ? '#facc15' : target.shield > 0 ? '#38bdf8' : '#ef4444',
                life: 0.85,
                maxLife: 0.85,
                vy: -35,
                isCrit: b.isCrit,
              });

              // Check Elimination
              if (target.hp <= 0) {
                target.isAlive = false;
                target.hp = 0;

                if (shooter) {
                  shooter.kills += 1;
                }

                // Drop loot on death
                ent.loot.push(spawnLootItem(target.x, target.y, 'weapon'));
                ent.loot.push(spawnLootItem(target.x + 20, target.y + 10, 'medkit'));

                // Elimination sound & Kill Feed Entry
                const victimName = target.name;
                const killerName = shooter ? shooter.name : 'The Downsizing Storm';
                const killerChar = shooter ? shooter.characterId : 'mortimer';

                ent.killFeed.push({
                  id: `kf_${Math.random()}`,
                  killerName,
                  killerCharId: killerChar,
                  victimName,
                  victimCharId: target.characterId,
                  weaponName: shooter?.weapons[shooter.activeWeaponIndex]?.name.split(' ')[0] || 'Takeover',
                  timestamp: Date.now(),
                  isPlayerKill: shooter?.isPlayer || false,
                });

                if (target.isPlayer) {
                  sound.playElimination();
                } else if (shooter?.isPlayer) {
                  sound.playLootPickup('legendary');
                }

                // Compute alive executives
                const remaining = ent.combatants.filter((c) => c.isAlive).length;

                // Check Match Conclusion
                if (target.isPlayer) {
                  // Player eliminated
                  setPlayerRank(remaining + 1);
                  setMatchDurationSec((Date.now() - matchStartTime) / 1000);
                  // Automatically switch spectator camera to the killer
                  if (shooter && shooter.isAlive) {
                    setSpectatingTargetId(shooter.id);
                  }
                  setGamePhase('game_over');
                } else if (remaining === 1 && p && p.isAlive) {
                  // Player Wins (#1 Sole Surviving CEO!)
                  sound.playVictory();
                  setPlayerRank(1);
                  setMatchDurationSec((Date.now() - matchStartTime) / 1000);
                  setGamePhase('game_over');
                }
              }

              break;
            }
          }

          if (hitCombatant) {
            ent.bullets.splice(bIdx, 1);
          }
        }

        // E. STORM DAMAGE TICK
        ent.combatants.forEach((c) => {
          if (!c.isAlive || c.isParachuting) return;

          const distToStorm = Math.hypot(c.x - st.x, c.y - st.y);
          if (distToStorm > st.radius) {
            // Outside storm circle: take severance tick damage
            c.hp -= st.damagePerTick * dt;
            if (c.hp <= 0) {
              c.isAlive = false;
              c.hp = 0;
              ent.killFeed.push({
                id: `kf_storm_${Math.random()}`,
                killerName: 'Severance Storm',
                killerCharId: 'mortimer',
                victimName: c.name,
                victimCharId: c.characterId,
                weaponName: 'Downsizing',
                timestamp: Date.now(),
                isPlayerKill: false,
              });

              if (c.isPlayer) {
                const remaining = ent.combatants.filter((co) => co.isAlive).length;
                setPlayerRank(remaining + 1);
                setMatchDurationSec((Date.now() - matchStartTime) / 1000);
                setGamePhase('game_over');
              }
            }
          }
        });

        // F. PARTICLES & FLOATING TEXT UPDATE
        for (let i = ent.particles.length - 1; i >= 0; i--) {
          const pt = ent.particles[i];
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.rotation += pt.vRot * dt;
          pt.life -= dt;
          if (pt.life <= 0) {
            ent.particles.splice(i, 1);
          }
        }

        for (let i = ent.floatingTexts.length - 1; i >= 0; i--) {
          const ft = ent.floatingTexts[i];
          ft.y += ft.vy * dt;
          ft.life -= dt;
          if (ft.life <= 0) {
            ent.floatingTexts.splice(i, 1);
          }
        }
      }

      // Sync state for React UI every few frames
      setBullets([...ent.bullets]);
      setParticles([...ent.particles]);
      setFloatingTexts([...ent.floatingTexts]);
      setKillFeed([...ent.killFeed]);
      setCombatants([...ent.combatants]);
      if (ent.player) {
        setPlayer({ ...ent.player });
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gamePhase, handleDrop, matchStartTime]);

  const aliveExecutivesCount = combatants.filter((c) => c.isAlive).length;
  const spectatingCombatant = combatants.find((c) => c.id === spectatingTargetId) || null;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 1. CHARACTER SELECTION LOBBY */}
      {gamePhase === 'select_character' && (
        <CharacterSelect
          onSelectAndStart={handleStartGame}
          onOpenHelp={() => setIsHelpOpen(true)}
        />
      )}

      {/* 2. IN-GAME & SPECTATOR CANVAS */}
      {(gamePhase === 'in_game' || gamePhase === 'plane_drop' || gamePhase === 'game_over') && (
        <div className="relative w-full h-full">
          <GameCanvas
            player={player}
            combatants={combatants}
            spectatingTargetId={spectatingTargetId}
            bullets={bullets}
            loot={loot}
            obstacles={obstacles}
            particles={particles}
            floatingTexts={floatingTexts}
            storm={storm}
            isMapExpanded={isMapExpanded}
            onFireWeapon={handleFireWeapon}
            onReload={handleReload}
            onUseAbility={handleUseAbility}
            onPickupLoot={handlePickupLoot}
            onSelectWeaponSlot={handleSelectWeaponSlot}
            onAimAngleChange={handleAimAngleChange}
            onMovementInput={handleMovementInput}
            touchControlsActive={touchControlsActive.current}
          />

          {/* DROP PHASE OVERLAY */}
          {gamePhase === 'plane_drop' && (
            <DropPhaseOverlay
              planeProgress={planeProgress}
              onDrop={handleDrop}
              hasDropped={playerHasDropped}
            />
          )}

          {/* IN-GAME HEADS-UP DISPLAY (HUD) */}
          <HUD
            player={player}
            spectatingCombatant={spectatingCombatant}
            aliveCount={aliveExecutivesCount}
            totalCombatants={combatants.length}
            killFeed={killFeed}
            storm={storm}
            isMapExpanded={isMapExpanded}
            onToggleMap={() => setIsMapExpanded((prev) => !prev)}
            onSelectWeaponSlot={handleSelectWeaponSlot}
            onReload={handleReload}
            onUseAbility={handleUseAbility}
            onUseConsumable={handleUseConsumable}
            soundMuted={soundMuted}
            onToggleSound={handleToggleSound}
            onOpenHelp={() => setIsHelpOpen(true)}
            onNextSpectator={handleNextSpectator}
          />

          {/* GAME OVER & VICTORY PODIUM MODAL */}
          {gamePhase === 'game_over' && player && (
            <GameOverModal
              player={player}
              rank={playerRank}
              totalCombatants={combatants.length}
              matchDurationSec={matchDurationSec}
              onPlayAgain={() => handleStartGame(selectedCharId)}
              onSpectate={() => {
                const alive = combatants.find((c) => c.isAlive && !c.isPlayer);
                if (alive) {
                  setSpectatingTargetId(alive.id);
                  setGamePhase('in_game');
                }
              }}
              onBackToMenu={() => setGamePhase('select_character')}
            />
          )}
        </div>
      )}

      {/* CONTROLS & RULES MODAL */}
      {isHelpOpen && <ControlsHelpModal onClose={() => setIsHelpOpen(false)} />}
    </main>
  );
}
