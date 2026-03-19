import type { CharacterChoices } from '../types/CharacterChoices';
import { isValidClass, getClassDetails, getClassSpellcastingData } from '../data/classRules';
import { isValidBackground, getAllowedBonusAttributes, getBackgroundTalent } from '../data/backgroundRules';
import { isAttributesStepComplete, validateBonusDistribution } from '../calculators/attributes';
import { checkTalentComplete } from '../../components/TalentChoices';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Antecedentes que exigem escolha de ferramenta
// ---------------------------------------------------------------------------

const BACKGROUNDS_WITH_TOOL_SELECTOR = new Set([
  'artesao', 'artista', 'guarda', 'nobre', 'soldado',
]);

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

// ---------------------------------------------------------------------------
// Adapter: número de magias obrigatórias por classe no nível dado
// ---------------------------------------------------------------------------

/**
 * Retorna o número de magias (não truques) que o jogador precisa selecionar.
 * Usa preparedSpellsByLevel para classes que preparam, ou
 * spellSlotsKnownByLevel para classes que conhecem.
 *
 * TODO: Renomear spellSlotsKnownByLevel para spellsKnownByLevel no futuro
 * para evitar confusão semântica entre "spell slots" e "spells known".
 */
function getRequiredSpellSelections(classId: string, level: number): number {
  const data = getClassSpellcastingData(classId);
  if (!data?.isCaster) return 0;
  const idx = Math.max(0, Math.min(level - 1, 19));
  return data.preparedSpellsByLevel?.[idx]
    ?? data.spellSlotsKnownByLevel?.[idx]
    ?? 0;
}

// ---------------------------------------------------------------------------
// Validação principal
// ---------------------------------------------------------------------------

/**
 * Valida todas as escolhas do personagem e retorna erros por etapa.
 * Esta função é pura e determinística — mesma entrada, mesma saída.
 */
export function validateChoices(choices: CharacterChoices): ValidationResult {
  const byStep: StepValidation = {
    class: [],
    background: [],
    species: [],
    attributes: [],
    equipment: [],
  };

  const level = choices.level ?? 1;

  // =========================================================================
  // Etapa 0 — Classe
  // =========================================================================

  if (!choices.classId) {
    byStep.class.push('Nenhuma classe selecionada.');
  } else if (!isValidClass(choices.classId)) {
    byStep.class.push(`Classe "${choices.classId}" não reconhecida.`);
  } else {
    // Opções obrigatórias da classe (ex: Estilo de Combate)
    const details = getClassDetails(choices.classId) as Record<string, any> | null;
    if (details?.options) {
      for (const opt of details.options as Array<{ id: string; name: string }>) {
        if (!choices.featureChoices[opt.id]) {
          byStep.class.push(`Escolha obrigatória pendente: ${opt.name ?? opt.id}.`);
        }
      }
    }
  }

  // =========================================================================
  // Etapa 1 — Antecedente (Origem)
  // =========================================================================

  if (!choices.backgroundId) {
    byStep.background.push('Nenhum antecedente selecionado.');
  } else if (!isValidBackground(choices.backgroundId)) {
    byStep.background.push(`Antecedente "${choices.backgroundId}" não reconhecido.`);
  } else {
    // Bônus de atributo
    if (choices.backgroundBonusDistribution) {
      const allowed = getAllowedBonusAttributes(choices.backgroundId);
      const result = validateBonusDistribution(choices.backgroundBonusDistribution, allowed);
      byStep.background.push(...result.errors);
    } else {
      byStep.background.push('Bônus de atributo do antecedente não distribuído.');
    }

    // Ferramenta (se aplicável)
    if (BACKGROUNDS_WITH_TOOL_SELECTOR.has(choices.backgroundId)) {
      if (!choices.featureChoices['toolProficiency']) {
        byStep.background.push('Escolha a proficiência de ferramenta do antecedente.');
      }
    }

    // Talento de origem completo
    const talentName = getBackgroundTalent(choices.backgroundId);
    if (talentName) {
      const talentSel = choices.talentSelections[talentName];
      if (!checkTalentComplete(talentName, talentSel)) {
        byStep.background.push('Talento de origem incompleto — preencha todas as subescolhas.');
      }
    }
  }

  // =========================================================================
  // Etapa 2 — Espécie
  // =========================================================================

  if (!choices.speciesId) {
    byStep.species.push('Nenhuma espécie selecionada.');
  } else {
    // Idiomas: precisa de pelo menos 2 manuais (excluindo common, thieves-cant, druidic)
    const manualLangs = (choices.languageSelections ?? []).filter(
      l => !['thieves-cant', 'druidic', 'common'].includes(l)
    );
    if (manualLangs.length < 2) {
      byStep.species.push(`Selecione ${2 - manualLangs.length} idioma(s) adicional(is).`);
    }

    // Escolhas obrigatórias da espécie (condicionais)
    const required = getRequiredSpeciesChoices(choices.speciesId, choices.featureChoices);
    for (const key of required) {
      if (!choices.featureChoices[key]) {
        byStep.species.push(`Escolha obrigatória pendente: ${key}.`);
      }
    }
  }

  // =========================================================================
  // Etapa 3 — Atributos
  // =========================================================================

  if (!choices.attributeMethod) {
    byStep.attributes.push('Método de geração de atributos não selecionado.');
  } else {
    const complete = isAttributesStepComplete({
      method: choices.attributeMethod,
      base: choices.baseAttributes,
    });
    if (!complete) {
      byStep.attributes.push('Atributos incompletos ou inválidos para o método selecionado.');
    }
  }

  // =========================================================================
  // Etapa 4 — Equipamento e Magias
  // =========================================================================

  if (choices.equipmentChoices.classOption === null) {
    byStep.equipment.push('Opção de equipamento de classe não selecionada.');
  }
  if (choices.equipmentChoices.backgroundOption === null) {
    byStep.equipment.push('Opção de equipamento de antecedente não selecionada.');
  }

  // Validação de magia por classe
  if (choices.classId) {
    const spellData = getClassSpellcastingData(choices.classId);
    if (spellData?.isCaster) {
      // Truques
      const requiredCantrips = spellData.cantripsKnownByLevel[Math.min(level - 1, 19)] ?? 0;
      if (requiredCantrips > 0) {
        const current = choices.spellSelections.cantrips.length;
        if (current < requiredCantrips) {
          byStep.equipment.push(`Selecione ${requiredCantrips - current} truque(s) (${current}/${requiredCantrips}).`);
        }
      }

      // Magias preparadas/conhecidas
      const requiredSpells = getRequiredSpellSelections(choices.classId, level);
      if (requiredSpells > 0) {
        const current = choices.spellSelections.prepared.length;
        if (current < requiredSpells) {
          const verb = spellData.preparedSpellsByLevel ? 'Prepare' : 'Escolha';
          byStep.equipment.push(`${verb} ao menos ${requiredSpells - current} magia(s) (${current}/${requiredSpells}).`);
        }
      }
    }
  }

  // =========================================================================
  // Consolidação
  // =========================================================================

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
