import type { CharacterChoices, ValidationInventoryItem } from '../types/CharacterChoices';
import { isValidClass, getClassDetails, getClassSpellcastingData } from '../data/classRules';
import { isValidBackground, getAllowedBonusAttributes, getBackgroundTalent } from '../data/backgroundRules';
import { isAttributesStepComplete, validateBonusDistribution } from '../calculators/attributes';
import { checkTalentComplete } from '../../components/TalentChoices';
import { getArmorById, getArmorByName } from '../data/armorRules';
import { getEquipmentForBackground, getEquipmentForClass, itemSubChoices } from '../../data/equipmentData';
import bardoSpells from '../../data/spells/bardo_spells.json';
import bruxoSpells from '../../data/spells/bruxo_spells.json';
import clerigoSpells from '../../data/spells/clerigo_spells.json';
import druidaSpells from '../../data/spells/druida_spells.json';
import feiticeiroSpells from '../../data/spells/feiticeiro_spells.json';
import guardiaoSpells from '../../data/spells/guardiao_spells.json';
import magoSpells from '../../data/spells/mago_spells.json';
import paladinoSpells from '../../data/spells/paladino_spells.json';

export interface StepValidation {
  class: string[];
  background: string[];
  species: string[];
  attributes: string[];
  equipment: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  byStep: StepValidation;
}

const BACKGROUNDS_WITH_TOOL_SELECTOR = new Set([
  'artesao', 'artista', 'guarda', 'nobre', 'soldado',
]);

const STEP_CHOICE_LABELS: Record<string, string> = {
  draconato: 'a ancestralidade dracônica',
  elfo: 'a linhagem élfica',
  'elfo-skill': 'a proficiência de perícia élfica',
  'elfo-attr': 'o atributo da sua herança élfica',
  'elfo-cantrip': 'o truque de alto elfo',
  gnomo: 'a linhagem gnômica',
  'gnomo-attr': 'o atributo da sua herança gnômica',
  golias: 'a ancestralidade golias',
  tiferino: 'a linhagem tiferina',
  'tiferino-size': 'o porte do tiferino',
  'tiferino-attr': 'o atributo da herança tiferina',
  'aasimar-size': 'o porte do aasimar',
  'humano-size': 'o porte do humano',
  'humano-skill': 'a perícia extra do humano',
  'humano-talent': 'o talento do humano',
};

const CLASS_SPELLS_BY_ID: Record<string, Array<{ name: string; level: string | number }>> = {
  bardo: bardoSpells,
  bruxo: bruxoSpells,
  clerigo: clerigoSpells,
  druida: druidaSpells,
  feiticeiro: feiticeiroSpells,
  guardiao: guardiaoSpells,
  mago: magoSpells,
  paladino: paladinoSpells,
};

function describeChoice(choiceKey: string): string {
  return STEP_CHOICE_LABELS[choiceKey] ?? `a opção obrigatória (${choiceKey})`;
}

function makePendingChoiceMessage(choiceKey: string): string {
  return `Escolha ${describeChoice(choiceKey)} para continuar.`;
}

function makeActionableBonusErrors(errors: string[]): string[] {
  return errors.map((error) => {
    const invalidAttr = error.match(/^Atributo "(.+)" não é permitido por este antecedente\.$/);
    if (invalidAttr) {
      return `Redistribua os bônus do antecedente sem usar ${invalidAttr[1]}.`;
    }

    const totalMismatch = error.match(/^Modo (\+[^ ]+) requer bônus total de 3\. Atual: (\d+)\.$/);
    if (totalMismatch) {
      return `Ajuste os bônus do antecedente no padrão ${totalMismatch[1]} até somar 3 pontos.`;
    }

    if (error === 'Modo +2/+1 requer exatamente um atributo com +2 e outro com +1.') {
      return 'Distribua o bônus do antecedente em dois atributos diferentes: um com +2 e outro com +1.';
    }

    if (error === 'Modo +1/+1/+1 requer exatamente três atributos diferentes com +1 cada.') {
      return 'Distribua o bônus do antecedente em três atributos diferentes, com +1 em cada um.';
    }

    return error;
  });
}

// ---------------------------------------------------------------------------
// Escolhas obrigatórias de espécie (condicional)
// ---------------------------------------------------------------------------

function getRequiredSpeciesChoices(
  speciesId: string,
  currentChoices: Record<string, string>
): string[] {
  switch (speciesId) {
    case 'draconato':
      return ['draconato'];
    case 'elfo': {
      const reqs = ['elfo', 'elfo-skill', 'elfo-attr'];
      if (currentChoices['elfo'] === 'alto-elfo') reqs.push('elfo-cantrip');
      return reqs;
    }
    case 'gnomo':
      return ['gnomo', 'gnomo-attr'];
    case 'golias':
      return ['golias'];
    case 'tiferino':
      return ['tiferino', 'tiferino-size', 'tiferino-attr'];
    case 'aasimar':
      return ['aasimar-size'];
    case 'humano':
      return ['humano-size', 'humano-skill', 'humano-talent'];
    default:
      return [];
  }
}

function getRequiredSpellSelections(classId: string, level: number): number {
  const data = getClassSpellcastingData(classId);
  if (!data?.isCaster) return 0;
  const idx = Math.max(0, Math.min(level - 1, 19));
  return data.preparedSpellsByLevel?.[idx]
    ?? data.spellSlotsKnownByLevel?.[idx]
    ?? 0;
}

function countOccurrences(values: string[]): Map<string, number> {
  return values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>());
}

function findDuplicates(values: string[]): string[] {
  return [...countOccurrences(values).entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
}

function getValidSpellNames(classId: string, level: 'cantrip' | 1): Set<string> {
  const spells = CLASS_SPELLS_BY_ID[classId] ?? [];
  return new Set(
    spells
      .filter((spell) => {
        if (level === 'cantrip') return spell.level === 'Truque' || spell.level === 0;
        return spell.level === 1 || spell.level === '1' || spell.level === '1º Círculo';
      })
      .map((spell) => spell.name)
  );
}

function getInventoryCounts(inventory: ValidationInventoryItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of inventory) {
    counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
  }
  return counts;
}

function hasMinimumInventoryForItems(inventory: ValidationInventoryItem[], requiredItems: string[]): boolean {
  const remaining = getInventoryCounts(inventory);

  for (const requiredItem of requiredItems) {
    const directCount = remaining.get(requiredItem) ?? 0;
    if (directCount > 0) {
      remaining.set(requiredItem, directCount - 1);
      continue;
    }

    const subChoices = itemSubChoices[requiredItem] ?? [];
    const matchedSubChoice = subChoices.find((choice) => (remaining.get(choice) ?? 0) > 0);
    if (matchedSubChoice) {
      remaining.set(matchedSubChoice, (remaining.get(matchedSubChoice) ?? 1) - 1);
      continue;
    }

    return false;
  }

  return true;
}

export function validateChoices(choices: CharacterChoices): ValidationResult {
  const byStep: StepValidation = {
    class: [],
    background: [],
    species: [],
    attributes: [],
    equipment: [],
  };

  const level = choices.level ?? 1;
  const inventory = choices.inventory ?? [];

  if (!choices.classId) {
    byStep.class.push('Escolha uma classe para começar a criação do personagem.');
  } else if (!isValidClass(choices.classId)) {
    byStep.class.push('Selecione novamente a classe: a opção salva não é mais válida.');
  } else {
    const details = getClassDetails(choices.classId) as Record<string, any> | null;
    if (details?.options) {
      for (const opt of details.options as Array<{ id: string; name: string }>) {
        if (!choices.featureChoices[opt.id]) {
          byStep.class.push(`Defina ${opt.name ?? opt.id} para concluir a etapa de classe.`);
        }
      }
    }
  }

  if (!choices.backgroundId) {
    byStep.background.push('Escolha um antecedente para liberar os benefícios de origem.');
  } else if (!isValidBackground(choices.backgroundId)) {
    byStep.background.push('Selecione novamente o antecedente: a opção salva não é mais válida.');
  } else {
    if (choices.backgroundBonusDistribution) {
      const allowed = getAllowedBonusAttributes(choices.backgroundId);
      const result = validateBonusDistribution(choices.backgroundBonusDistribution, allowed);
      byStep.background.push(...makeActionableBonusErrors(result.errors));
    } else {
      byStep.background.push('Distribua os bônus de atributo do antecedente antes de avançar.');
    }

    if (BACKGROUNDS_WITH_TOOL_SELECTOR.has(choices.backgroundId)) {
      if (!choices.featureChoices['toolProficiency']) {
        byStep.background.push('Escolha a proficiência de ferramenta concedida pelo antecedente.');
      }
    }

    const talentName = getBackgroundTalent(choices.backgroundId);
    if (talentName) {
      const talentSel = choices.talentSelections[talentName];
      if (!checkTalentComplete(talentName, talentSel)) {
        byStep.background.push('Complete as escolhas do talento de origem para continuar.');
      }
    }
  }

  if (!choices.speciesId) {
    byStep.species.push('Escolha uma espécie para definir os traços do personagem.');
  } else {
    const manualLangs = (choices.languageSelections ?? []).filter(
      l => !['thieves-cant', 'druidic', 'common'].includes(l)
    );
    if (manualLangs.length < 2) {
      byStep.species.push(`Selecione ${2 - manualLangs.length} idioma(s) adicional(is).`);
    }

    const required = getRequiredSpeciesChoices(choices.speciesId, choices.featureChoices);
    for (const key of required) {
      if (!choices.featureChoices[key]) {
        byStep.species.push(makePendingChoiceMessage(key));
      }
    }
  }

  if (!choices.attributeMethod) {
    byStep.attributes.push('Escolha um método para definir os atributos do personagem.');
  } else {
    const complete = isAttributesStepComplete({
      method: choices.attributeMethod,
      base: choices.baseAttributes,
    });
    if (!complete) {
      byStep.attributes.push('Finalize a distribuição de atributos conforme o método selecionado.');
    }
  }

  if (choices.equipmentChoices.classOption === null) {
    byStep.equipment.push('Escolha o pacote de equipamento da classe.');
  }
  if (choices.equipmentChoices.backgroundOption === null) {
    byStep.equipment.push('Escolha o pacote de equipamento do antecedente.');
  }

  if (choices.classId && choices.equipmentChoices.classOption === 'A') {
    const classPackage = getEquipmentForClass(choices.classId);
    if (!hasMinimumInventoryForItems(inventory, classPackage.optionA.items)) {
      byStep.equipment.push('O inventário não corresponde ao pacote de equipamento de classe selecionado.');
    }
  }

  if (choices.backgroundId && choices.equipmentChoices.backgroundOption === 'A') {
    const backgroundPackage = getEquipmentForBackground(choices.backgroundId);
    if (!hasMinimumInventoryForItems(inventory, backgroundPackage.optionA.items)) {
      byStep.equipment.push('O inventário não corresponde ao pacote de equipamento de antecedente selecionado.');
    }
  }

  const equippedArmor = choices.equippedArmorId ? getArmorById(choices.equippedArmorId) : null;
  if (choices.equippedArmorId) {
    const hasArmorInInventory = inventory.some((item) => {
      const armor = getArmorByName(item.name);
      return Boolean(armor && armor.type !== 'shield' && armor.id === choices.equippedArmorId);
    });
    if (!equippedArmor || equippedArmor.type === 'shield' || !hasArmorInInventory) {
      byStep.equipment.push('A armadura equipada precisa existir no inventário atual.');
    }
  }

  if (choices.hasShield) {
    const hasShieldInInventory = inventory.some((item) => getArmorByName(item.name)?.type === 'shield');
    if (!hasShieldInInventory) {
      byStep.equipment.push('O escudo só pode ser equipado quando existir um escudo no inventário.');
    }
  }

  if (choices.classId) {
    const spellData = getClassSpellcastingData(choices.classId);
    if (spellData?.isCaster) {
      const selectedCantrips = choices.spellSelections.cantrips;
      const preparedSpells = choices.spellSelections.prepared;
      const requiredCantrips = spellData.cantripsKnownByLevel[Math.min(level - 1, 19)] ?? 0;
      if (requiredCantrips > 0) {
        const current = choices.spellSelections.cantrips.length;
        if (current < requiredCantrips) {
          byStep.equipment.push(`Escolha mais ${requiredCantrips - current} truque(s) para completar a seleção (${current}/${requiredCantrips}).`);
        }
      }

      // Magias preparadas/conhecidas
      const requiredSpells = getRequiredSpellSelections(choices.classId, level);
      if (requiredSpells > 0) {
        const current = choices.spellSelections.prepared.length;
        if (current < requiredSpells) {
          const verb = spellData.preparedSpellsByLevel ? 'Prepare' : 'Escolha';
          byStep.equipment.push(`${verb} mais ${requiredSpells - current} magia(s) para completar a seleção (${current}/${requiredSpells}).`);
        }
      const requiredSpells = getRequiredSpellSelections(choices.classId, level);
      const validCantrips = getValidSpellNames(choices.classId, 'cantrip');
      const validLevel1Spells = getValidSpellNames(choices.classId, 1);

      const duplicateCantrips = findDuplicates(selectedCantrips);
      if (duplicateCantrips.length > 0) {
        byStep.equipment.push(`Há truques duplicados na seleção: ${duplicateCantrips.join(', ')}.`);
      }

      const duplicatePrepared = findDuplicates(preparedSpells);
      if (duplicatePrepared.length > 0) {
        byStep.equipment.push(`Há magias duplicadas na seleção: ${duplicatePrepared.join(', ')}.`);
      }

      if (selectedCantrips.length > requiredCantrips) {
        byStep.equipment.push(`Selecione no máximo ${requiredCantrips} truque(s) para esta classe no nível ${level}.`);
      } else if (requiredCantrips > 0 && selectedCantrips.length < requiredCantrips) {
        const current = selectedCantrips.length;
        byStep.equipment.push(`Escolha mais ${requiredCantrips - current} truque(s) para completar a seleção (${current}/${requiredCantrips}).`);
      }

      if (preparedSpells.length > requiredSpells) {
        byStep.equipment.push(`Selecione no máximo ${requiredSpells} magia(s) de 1º nível para esta classe no nível ${level}.`);
      } else if (requiredSpells > 0 && preparedSpells.length < requiredSpells) {
        const current = preparedSpells.length;
        const verb = spellData.preparedSpellsByLevel ? 'Prepare' : 'Escolha';
        byStep.equipment.push(`${verb} mais ${requiredSpells - current} magia(s) para completar a seleção (${current}/${requiredSpells}).`);
      }

      const invalidCantrips = selectedCantrips.filter((spell) => !validCantrips.has(spell));
      if (invalidCantrips.length > 0) {
        byStep.equipment.push(`Os truques selecionados precisam pertencer à lista válida da classe no nível 1: ${invalidCantrips.join(', ')}.`);
      }

      const invalidPrepared = preparedSpells.filter((spell) => !validLevel1Spells.has(spell));
      if (invalidPrepared.length > 0) {
        byStep.equipment.push(`As magias selecionadas precisam pertencer à lista válida da classe no nível 1: ${invalidPrepared.join(', ')}.`);
      }
    }
  }

  const allErrors = [
    ...byStep.class,
    ...byStep.background,
    ...byStep.species,
    ...byStep.attributes,
    ...byStep.equipment,
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: [],
    byStep,
  };
}
