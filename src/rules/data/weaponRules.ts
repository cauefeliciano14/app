import weaponsJson from '../../data/weapons.json';

export type WeaponCategory = 'simpleMelee' | 'simpleRanged' | 'martialMelee' | 'martialRanged';

export interface WeaponEntry {
  name: string;
  category: WeaponCategory;
  damageDice: string;
  damageType: string;
  isFinesse: boolean;
  isRanged: boolean;
  isThrown: boolean;
  isTwoHanded: boolean;
  properties: string;
  range: string;
}

interface RawWeapon {
  name: string;
  damage: string;
  properties: string;
  mastery: string;
  weight: string;
  cost: string;
}

function parseRange(raw: RawWeapon, category: WeaponCategory): string {
  const isRanged = category === 'simpleRanged' || category === 'martialRanged';
  const isThrown = raw.properties.toLowerCase().includes('arremesso');
  // Munição (Alcance 24/96) or Arremesso (Alcance 6/18)
  const m = raw.properties.match(/Alcance\s+(\d+)\/(\d+)/i);
  if (m) {
    const range = `${m[1]}/${m[2]} m`;
    if (isThrown && !isRanged) return `C.C. ou ${range}`;
    return range;
  }
  if (isRanged) return '18/60 m';
  return 'Corpo a Corpo';
}

function parseWeapon(raw: RawWeapon, category: WeaponCategory): WeaponEntry {
  const props = raw.properties.toLowerCase();
  // Dano: "1d6 Perfurante" → dice="1d6", type="Perfurante"
  const dmgMatch = raw.damage.match(/^(\d+d\d+)\s+(.+)$/i);
  const damageDice = dmgMatch ? dmgMatch[1] : raw.damage;
  const damageType = dmgMatch ? dmgMatch[2] : '';

  return {
    name: raw.name,
    category,
    damageDice,
    damageType,
    isFinesse: props.includes('acuidade'),
    isRanged: category === 'simpleRanged' || category === 'martialRanged',
    isThrown: props.includes('arremesso'),
    isTwoHanded: props.includes('duas mãos'),
    properties: raw.properties,
    range: parseRange(raw, category),
  };
}

// Construir índice plano de todas as armas
type RawWeaponsJson = {
  simpleMelee: RawWeapon[];
  simpleRanged: RawWeapon[];
  martialMelee: RawWeapon[];
  martialRanged: RawWeapon[];
};

const raw = weaponsJson as RawWeaponsJson;

const ALL_WEAPONS: WeaponEntry[] = [
  ...raw.simpleMelee.map(w => parseWeapon(w, 'simpleMelee')),
  ...raw.simpleRanged.map(w => parseWeapon(w, 'simpleRanged')),
  ...raw.martialMelee.map(w => parseWeapon(w, 'martialMelee')),
  ...raw.martialRanged.map(w => parseWeapon(w, 'martialRanged')),
];

const WEAPON_BY_NAME: Map<string, WeaponEntry> = new Map(
  ALL_WEAPONS.map(w => [w.name.toLowerCase(), w])
);

export function getWeaponByName(name: string): WeaponEntry | null {
  return WEAPON_BY_NAME.get(name.toLowerCase()) ?? null;
}

export function getAllWeapons(): WeaponEntry[] {
  return ALL_WEAPONS;
}

export function isSimpleWeapon(name: string): boolean {
  const w = getWeaponByName(name);
  return w?.category === 'simpleMelee' || w?.category === 'simpleRanged';
}

export function isMartialWeapon(name: string): boolean {
  const w = getWeaponByName(name);
  return w?.category === 'martialMelee' || w?.category === 'martialRanged';
}
