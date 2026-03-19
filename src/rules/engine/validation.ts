import type { CharacterChoices } from '../types/CharacterChoices';
import { isValidClass } from '../data/classRules';
import { isValidBackground, getAllowedBonusAttributes } from '../data/backgroundRules';
import { isAttributesStepComplete, validateBonusDistribution } from '../calculators/attributes';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida todas as escolhas do personagem e retorna erros e avisos.
 * Esta função é pura e determinística — mesma entrada, mesma saída.
 */
export function validateChoices(choices: CharacterChoices): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Classe
  if (!choices.classId) {
    errors.push('Nenhuma classe selecionada.');
  } else if (!isValidClass(choices.classId)) {
    errors.push(`Classe "${choices.classId}" não reconhecida.`);
  }

  // 2. Antecedente
  if (!choices.backgroundId) {
    errors.push('Nenhum antecedente selecionado.');
  } else if (!isValidBackground(choices.backgroundId)) {
    errors.push(`Antecedente "${choices.backgroundId}" não reconhecido.`);
  }

  // 3. Espécie
  if (!choices.speciesId) {
    errors.push('Nenhuma espécie selecionada.');
  }

  // 4. Método de atributos
  if (!choices.attributeMethod) {
    errors.push('Método de geração de atributos não selecionado.');
  } else {
    const complete = isAttributesStepComplete({
      method: choices.attributeMethod,
      base: choices.baseAttributes,
    });
    if (!complete) {
      errors.push('Atributos incompletos ou inválidos para o método selecionado.');
    }
  }

  // 5. Distribuição de bônus de antecedente
  if (choices.backgroundId && choices.backgroundBonusDistribution) {
    const allowed = getAllowedBonusAttributes(choices.backgroundId);
    const result = validateBonusDistribution(choices.backgroundBonusDistribution, allowed);
    errors.push(...result.errors);
  } else if (choices.backgroundId && !choices.backgroundBonusDistribution) {
    warnings.push('Bônus de atributo do antecedente ainda não distribuído.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
