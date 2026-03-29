/**
 * Default class resource counters for each class.
 * `max` can be a fixed number or a level-indexed array (index 0 = level 1).
 */

export interface ClassResourceTemplate {
  id: string;
  name: string;
  /** Fixed max OR array[20] where index = level-1 */
  maxByLevel: number[];
  resetOn: 'short' | 'long';
  description?: string;
}

// Level arrays: index 0 = level 1, length 20
const BARBARO_RAGE = [2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6];
const BARBARO_RAGE_DMG = [2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,4,4,4,4];
const MONGE_KI = [0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
const LADINO_SNEAK = [1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10];
const GUERREIRO_SURTO = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2];
const BARDO_INSPIRATION = [2,2,2,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5];
const FEITICEIRO_SORCERY = [2,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
const PALADINO_CD = [1,1,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3];
const CLERIGO_CD = [1,1,1,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3];
const DRUIDA_WILD = [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2];
const GUERREIRO_WIND = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];

export const CLASS_RESOURCES: Record<string, ClassResourceTemplate[]> = {
  barbaro: [
    {
      id: 'barbaro-rage',
      name: 'Usos de Fúria',
      maxByLevel: BARBARO_RAGE,
      resetOn: 'long',
      description: 'Bônus de dano: ' + BARBARO_RAGE_DMG.map((v, i) => `Nív ${i+1}: +${v}`).slice(0,4).join(', ') + '…',
    },
  ],
  bardo: [
    {
      id: 'bardo-inspiration',
      name: 'Inspiração de Bardo',
      maxByLevel: BARDO_INSPIRATION,
      resetOn: 'short',
    },
  ],
  clerigo: [
    {
      id: 'clerigo-channel',
      name: 'Canalizar Divindade',
      maxByLevel: CLERIGO_CD,
      resetOn: 'short',
    },
  ],
  druida: [
    {
      id: 'druida-wildshape',
      name: 'Transformação Selvagem',
      maxByLevel: DRUIDA_WILD,
      resetOn: 'short',
    },
  ],
  feiticeiro: [
    {
      id: 'feiticeiro-sorcery',
      name: 'Pontos de Feitiçaria',
      maxByLevel: FEITICEIRO_SORCERY,
      resetOn: 'long',
    },
  ],
  guerreiro: [
    {
      id: 'guerreiro-secondwind',
      name: 'Segundo Fôlego',
      maxByLevel: GUERREIRO_WIND,
      resetOn: 'short',
    },
    {
      id: 'guerreiro-actionsurge',
      name: 'Surto de Ação',
      maxByLevel: GUERREIRO_SURTO,
      resetOn: 'short',
    },
  ],
  ladino: [
    {
      id: 'ladino-cunningaction',
      name: 'Ataque Furtivo (d6s)',
      maxByLevel: LADINO_SNEAK,
      resetOn: 'short',
      description: 'Número de d6 para Ataque Furtivo (não é um recurso limitado — use como referência)',
    },
  ],
  monge: [
    {
      id: 'monge-ki',
      name: 'Pontos de Ki',
      maxByLevel: MONGE_KI,
      resetOn: 'short',
    },
  ],
  paladino: [
    {
      id: 'paladino-channel',
      name: 'Canalizar Divindade',
      maxByLevel: PALADINO_CD,
      resetOn: 'short',
    },
  ],
};

/**
 * Returns default CustomCounter[] for the given class and level,
 * skipping any counter whose max at that level is 0.
 */
export function getDefaultClassCounters(
  classId: string,
  level: number,
): Array<{ id: string; name: string; current: number; max: number; resetOn: 'short' | 'long' | 'manual' }> {
  const templates = CLASS_RESOURCES[classId] ?? [];
  const lvlIdx = Math.max(0, Math.min(19, level - 1));
  return templates
    .map(t => ({ id: t.id, name: t.name, current: t.maxByLevel[lvlIdx], max: t.maxByLevel[lvlIdx], resetOn: t.resetOn }))
    .filter(c => c.max > 0);
}
