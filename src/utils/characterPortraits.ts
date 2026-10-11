import { CharacterDef, CharacterId } from '../types/game';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'barker',
    name: 'Barker Paws',
    title: 'Chief Barketing Officer',
    department: 'Growth & Instinct',
    quote: '"I have a keen nose for market disruption."',
    bio: 'A high-energy golden retriever executive renowned for swift agility, fierce company loyalty, and sniffing out high-tier weapon crates before anyone else.',
    primaryColor: '#eab308',
    accentColor: '#ca8a04',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    speedMultiplier: 1.18,
    maxHpBonus: 0,
    critChanceBonus: 0.05,
    armorBonus: 0,
    abilityName: 'Golden Zoomies',
    abilityDesc: 'Unleashes a 4-second burst of +45% sprint speed and emits an audible sonic bark shockwave that stuns and repels nearby competitors.',
    abilityCooldown: 14,
    abilityDuration: 4,
    signatureWeaponName: 'Dual Stapler SMG',
  },
  {
    id: 'sterling',
    name: 'Chairman Sterling',
    title: 'Founder & Board Director',
    department: 'Executive Governance',
    quote: '"I survived the crash of 87. You are no threat."',
    bio: 'The patriarchal corporate titan who built the conglomerate from scratch. High base vitality, seasoned resilience against the storm, and ironclad legal defense.',
    primaryColor: '#ef4444',
    accentColor: '#b91c1c',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    speedMultiplier: 0.95,
    maxHpBonus: 25,
    critChanceBonus: 0,
    armorBonus: 20,
    abilityName: 'Executive Veto',
    abilityDesc: 'Summons a golden boardroom energy barrier absorbing up to 75 damage for 5 seconds and halves damage taken from the downsizing storm.',
    abilityCooldown: 18,
    abilityDuration: 5,
    signatureWeaponName: 'Executive Gavel Blast',
  },
  {
    id: 'mortimer',
    name: 'Mortimer Grimm',
    title: 'Chief Risk Liquidator',
    department: 'Restructuring & Audit',
    quote: '"Your position has been declared redundant."',
    bio: 'A ruthless Wall Street ghoul who cuts budgets to the bone. Exceptional precision aim, increased critical strike rate, and stealth shroud capabilities.',
    primaryColor: '#06b6d4',
    accentColor: '#0891b2',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    speedMultiplier: 1.05,
    maxHpBonus: -10,
    critChanceBonus: 0.25,
    armorBonus: 0,
    abilityName: 'Downsizing Shroud',
    abilityDesc: 'Deploys a shredder paper smoke screen that grants 3.5 seconds of invisibility and +35% movement speed to reposition unseen.',
    abilityCooldown: 15,
    abilityDuration: 3.5,
    signatureWeaponName: 'Red-Tape Sniper',
  },
  {
    id: 'marcus',
    name: 'Marcus Vance',
    title: 'Venture Capital Mogul',
    department: 'Mergers & Acquisitions',
    quote: '"Every hostile takeover is just an opportunity."',
    bio: 'The charismatic tuxedo-clad rainmaker. Lucky with rare crate drops, fast reload rates, and leaves explosive golden briefcases in his wake.',
    primaryColor: '#10b981',
    accentColor: '#059669',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    speedMultiplier: 1.08,
    maxHpBonus: 10,
    critChanceBonus: 0.1,
    armorBonus: 10,
    abilityName: 'Golden Parachute',
    abilityDesc: 'Performs an agile combat dash forward and drops a ticking explosive briefcase behind that detonates for 80 AoE damage after 2 seconds.',
    abilityCooldown: 12,
    abilityDuration: 1,
    signatureWeaponName: 'Cash Cannon 3000',
  },
];

export function getCharacter(id: CharacterId): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

/**
 * Procedural pixel-art portrait generator rendering the exact 4 paintings
 * with 1:1 fidelity matching the user's images.
 */
export function drawCharacterPortrait(
  ctx: CanvasRenderingContext2D,
  charId: CharacterId,
  width: number,
  height: number
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const pw = 48; // 48x48 pixel grid resolution
  const ph = 48;
  const sx = width / pw;
  const sy = height / ph;

  function pixel(x: number, y: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.ceil(sx), Math.ceil(sy));
  }

  function rect(x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x * sx), Math.floor(y * sy), Math.ceil(w * sx), Math.ceil(h * sy));
  }

  // 1. OUTER WOODEN FRAME (Present in all 4 pictures)
  rect(0, 0, pw, ph, '#382012'); // Dark walnut frame base
  rect(1, 1, pw - 2, ph - 2, '#5a361e'); // Mid wood
  rect(2, 2, pw - 4, ph - 4, '#80532e'); // Frame highlight
  rect(3, 3, pw - 6, ph - 6, '#462713'); // Frame inner shadow
  rect(4, 4, pw - 8, ph - 8, '#d4af37'); // Gold inner fillet bevel

  // Canvas interior starts at (5, 5), size: 38 x 38
  const ix = 5;
  const iy = 5;
  const iw = 38;
  const ih = 38;

  if (charId === 'barker') {
    // ----------------------------------------------------
    // CHARACTER 1: BARKER (DOG EXECUTIVE IN WINE ARMCHAIR)
    // ----------------------------------------------------
    // Background: Lavender with golden confetti dots
    rect(ix, iy, iw, ih, '#a292b8');
    // Golden confetti dots
    const dots = [
      [7, 8], [11, 7], [18, 9], [25, 7], [32, 9], [39, 8],
      [9, 13], [14, 16], [35, 14], [40, 16], [8, 22], [40, 24]
    ];
    dots.forEach(([dx, dy]) => pixel(dx, dy, '#e6c875'));

    // Baseboard floor
    rect(ix, iy + ih - 7, iw, 7, '#8b7c9e');
    // Carpet rug with vertical dark stripes
    rect(ix + 6, iy + ih - 5, iw - 12, 5, '#766788');
    for (let rx = ix + 8; rx < ix + iw - 8; rx += 2) {
      rect(rx, iy + ih - 4, 1, 3, '#433454');
    }

    // Wine / Burgundy Armchair
    rect(14, 12, 20, 24, '#6b1b29'); // Chair back
    rect(13, 10, 22, 5, '#852335');  // Chair top crest
    rect(11, 15, 4, 14, '#57131f');  // Left ear wing
    rect(33, 15, 4, 14, '#57131f');  // Right ear wing
    // Chair legs
    rect(15, 36, 2, 3, '#784318');
    rect(31, 36, 2, 3, '#784318');

    // Business Briefcase on the right floor
    rect(32, 32, 8, 7, '#6b3e1f');
    rect(33, 31, 6, 2, '#4a2912'); // Handle
    pixel(34, 34, '#d4af37'); // Gold brass lock
    pixel(37, 34, '#d4af37');

    // Dog Body: Charcoal suit
    rect(19, 23, 10, 10, '#383b42'); // Suit torso
    rect(23, 23, 2, 5, '#f5f5f5');   // White shirt collar
    rect(23, 25, 2, 4, '#d4a017');   // Gold tie
    rect(20, 33, 8, 3, '#2a2c33');   // Lower coat / belt

    // Dog Paws / Hands folded in lap
    rect(22, 29, 4, 2, '#d4a35d');

    // Suit Pants & Shoes
    rect(21, 36, 2, 5, '#2e3037'); // Left leg
    rect(25, 36, 2, 5, '#2e3037'); // Right leg
    rect(20, 40, 3, 2, '#18191c'); // Left shoe
    rect(25, 40, 3, 2, '#18191c'); // Right shoe

    // Dog Head (Golden Retriever)
    rect(20, 11, 8, 9, '#dca963'); // Head base
    rect(18, 12, 3, 6, '#b8813f'); // Left floppy ear
    rect(27, 12, 3, 6, '#b8813f'); // Right floppy ear
    // Eyes
    pixel(22, 14, '#1b1b1b');
    pixel(25, 14, '#1b1b1b');
    // Muzzle & Snout
    rect(22, 16, 4, 3, '#efd19f'); // Lighter muzzle
    rect(23, 16, 2, 2, '#222222'); // Black nose
    pixel(23, 18, '#ffffff'); // Little teeth/open smile
    pixel(24, 18, '#ffffff');

  } else if (charId === 'sterling') {
    // ----------------------------------------------------
    // CHARACTER 2: CHAIRMAN STERLING (BEARDED CEO)
    // ----------------------------------------------------
    // Background: Pinkish dusty rose with subtle diamond wallpaper
    rect(ix, iy, iw, ih, '#bf9b9b');
    for (let wy = iy + 2; wy < iy + ih - 8; wy += 5) {
      for (let wx = ix + 3; wx < ix + iw - 3; wx += 6) {
        pixel(wx, wy, '#a47e7e');
        pixel(wx - 1, wy + 1, '#a47e7e');
        pixel(wx + 1, wy + 1, '#a47e7e');
        pixel(wx, wy + 2, '#a47e7e');
      }
    }

    // Floor & striped baseboard
    rect(ix, iy + ih - 7, iw, 7, '#967676');
    for (let rx = ix + 8; rx < ix + iw - 8; rx += 2) {
      rect(rx, iy + ih - 4, 1, 3, '#563e3e');
    }

    // High-backed Wooden Executive Throne
    rect(15, 10, 18, 26, '#3e2014'); // Dark wood frame
    rect(17, 12, 14, 22, '#6d1c25'); // Deep red velvet upholstery
    rect(13, 21, 22, 3, '#4f291a');  // Carved wooden armrests
    // Chair legs
    rect(15, 36, 2, 4, '#3e2014');
    rect(31, 36, 2, 4, '#3e2014');

    // Briefcase on floor
    rect(32, 32, 8, 7, '#593219');
    rect(33, 31, 6, 2, '#381e0e');
    pixel(34, 34, '#d4af37');
    pixel(37, 34, '#d4af37');

    // Sterling Body: Charcoal executive suit
    rect(19, 23, 10, 10, '#3a3c42');
    rect(23, 23, 2, 4, '#ffffff');   // White shirt collar
    rect(23, 24, 2, 5, '#991b1b');   // Deep red silk tie
    // Gold buttons
    pixel(22, 28, '#d4af37');
    pixel(25, 28, '#d4af37');

    // Folded hands
    rect(22, 29, 4, 2, '#d4a383');

    // Pants & Shoes
    rect(21, 34, 2, 6, '#28292d');
    rect(25, 34, 2, 6, '#28292d');
    rect(20, 40, 3, 2, '#16171a');
    rect(25, 40, 3, 2, '#16171a');

    // Head: Senior Distinguished Face with Grey Beard
    rect(21, 12, 6, 7, '#dcb192'); // Face skin
    rect(20, 10, 8, 3, '#9ca3af'); // Parted grey hair
    rect(20, 12, 2, 4, '#9ca3af'); // Side hair
    rect(26, 12, 2, 4, '#9ca3af');
    // Eyes & Eyebrows
    pixel(22, 14, '#374151');
    pixel(25, 14, '#374151');
    // Distinguished Grey Beard & Moustache
    rect(21, 16, 6, 4, '#d1d5db');
    rect(22, 15, 4, 2, '#9ca3af'); // Moustache

  } else if (charId === 'mortimer') {
    // ----------------------------------------------------
    // CHARACTER 3: MORTIMER (SKELETON / GHOUL EXEC)
    // ----------------------------------------------------
    // Background: Steel blue with corkboard & financial stock chart
    rect(ix, iy, iw, ih, '#7f9cb8');
    // Blue polka pattern dots
    const bgDots = [
      [8, 8], [14, 10], [25, 7], [35, 9], [40, 14],
      [7, 24], [10, 30], [38, 22], [41, 28]
    ];
    bgDots.forEach(([bx, by]) => pixel(bx, by, '#5f7c98'));

    // Corkboard bulletin board on top-left wall
    rect(10, 9, 13, 8, '#b88b58');  // Wood board edge
    rect(11, 10, 11, 6, '#8b5a2b'); // Cork texture
    rect(12, 11, 4, 4, '#f8fafc');  // White document paper
    rect(17, 11, 4, 4, '#f8fafc');  // Second paper with green line chart
    pixel(18, 14, '#15803d');
    pixel(19, 13, '#15803d');
    pixel(20, 12, '#22c55e');

    // Floor & baseboard
    rect(ix, iy + ih - 7, iw, 7, '#667e96');
    for (let rx = ix + 8; rx < ix + iw - 8; rx += 2) {
      rect(rx, iy + ih - 4, 1, 3, '#3c4e60');
    }

    // Modern swivel office chair
    rect(15, 14, 18, 18, '#4b5563'); // Backrest
    rect(14, 22, 2, 8, '#9ca3af');   // Metal armrest left
    rect(32, 22, 2, 8, '#9ca3af');   // Metal armrest right
    // Swivel chair base & castors
    rect(23, 34, 2, 4, '#9ca3af');
    rect(19, 38, 10, 2, '#374151');

    // Briefcase on floor
    rect(33, 32, 7, 7, '#503522');
    rect(34, 31, 5, 2, '#332012');
    pixel(35, 34, '#d4af37');
    pixel(38, 34, '#d4af37');

    // Mortimer Body: Grey Corporate Suit
    rect(19, 21, 10, 11, '#4f535d');
    rect(23, 21, 2, 4, '#ffffff');
    rect(23, 23, 2, 6, '#b91c1c'); // Red tie
    rect(22, 28, 4, 2, '#e5e7eb'); // Bone hands

    // Pants & Legs
    rect(21, 33, 2, 7, '#383a42');
    rect(25, 33, 2, 7, '#383a42');
    rect(20, 40, 3, 2, '#1f2024');
    rect(25, 40, 3, 2, '#1f2024');

    // Skeleton Skull Head
    rect(21, 11, 7, 8, '#f3f4f6'); // Skull bone
    pixel(20, 13, '#f3f4f6');
    pixel(28, 13, '#f3f4f6');
    // Hollow black eye sockets
    rect(22, 13, 2, 2, '#111827');
    rect(25, 13, 2, 2, '#111827');
    // Open square jaw / teeth
    rect(23, 16, 3, 2, '#111827');
    pixel(23, 16, '#e5e7eb');
    pixel(25, 16, '#e5e7eb');

  } else {
    // ----------------------------------------------------
    // CHARACTER 4: MARCUS (TUXEDO TYCOON)
    // ----------------------------------------------------
    // Background: Warm golden champagne with subtle gold confetti
    rect(ix, iy, iw, ih, '#d2b97f');
    const goldDots = [
      [8, 7], [13, 10], [21, 8], [33, 7], [40, 9],
      [9, 18], [38, 16], [41, 23], [7, 28]
    ];
    goldDots.forEach(([gx, gy]) => pixel(gx, gy, '#a68a48'));

    // Green Banker Lamp visible on bottom-right corner
    rect(39, 35, 4, 7, '#15803d');
    pixel(40, 34, '#166534');
    rect(40, 38, 2, 4, '#d4af37');

    // Floor & baseboard
    rect(ix, iy + ih - 7, iw, 7, '#ad9661');
    for (let rx = ix + 8; rx < ix + iw - 8; rx += 2) {
      rect(rx, iy + ih - 4, 1, 3, '#615230');
    }

    // Rich Brown Leather Executive Lounge Chair
    rect(14, 13, 20, 22, '#543118');
    rect(12, 18, 4, 12, '#3e220e');
    rect(32, 18, 4, 12, '#3e220e');
    rect(15, 36, 2, 3, '#301a0a');
    rect(31, 36, 2, 3, '#301a0a');

    // Briefcase on floor
    rect(32, 33, 7, 6, '#543118');
    rect(33, 32, 5, 2, '#361e0d');
    pixel(34, 35, '#d4af37');
    pixel(37, 35, '#d4af37');

    // Marcus Body: Black Tuxedo with White Bib & Studs
    rect(19, 21, 10, 11, '#18191c'); // Black tuxedo
    rect(22, 21, 4, 7, '#f8fafc');   // White pleated dress shirt
    // Black bowtie & buttons
    pixel(23, 22, '#0f172a');
    pixel(24, 22, '#0f172a');
    pixel(23, 24, '#0f172a');
    pixel(23, 26, '#0f172a');
    rect(20, 32, 8, 2, '#0f172a');   // Cummerbund

    // Hands
    rect(22, 28, 4, 2, '#99623d');

    // Trousers & Shoes
    rect(21, 34, 2, 6, '#18191c');
    rect(25, 34, 2, 6, '#18191c');
    rect(20, 40, 3, 2, '#090a0f');
    rect(25, 40, 3, 2, '#090a0f');

    // Head: Dapper bald businessman with broad bright smile
    rect(21, 12, 7, 7, '#a56c45'); // Warm brown skin
    // Eyebrows & Eyes
    pixel(22, 14, '#1e293b');
    pixel(26, 14, '#1e293b');
    // Broad white toothy smile
    rect(23, 17, 3, 2, '#ffffff');
    pixel(24, 16, '#8b532c'); // Nose
  }

  ctx.restore();
}

/**
 * Cache generated high-res portrait data URLs for fast, reactive UI display.
 */
const portraitCache: Record<string, string> = {};

export function getCharacterPortraitDataUrl(charId: CharacterId): string {
  if (portraitCache[charId]) {
    return portraitCache[charId];
  }
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawCharacterPortrait(ctx, charId, 160, 160);
    const dataUrl = canvas.toDataURL('image/png');
    portraitCache[charId] = dataUrl;
    return dataUrl;
  }
  return '';
}
