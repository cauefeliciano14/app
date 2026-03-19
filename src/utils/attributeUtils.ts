/**
 * Re-exports do rules engine para manter compatibilidade com componentes existentes.
 * A lógica real reside em src/rules/calculators/attributes.ts
 */
export {
  calculateModifier,
  roll4d6DropLowest,
  calculatePointBuyCost,
  calculateTotalPointCost,
  applyBackgroundBonus,
  isAttributesStepComplete,
} from '../rules/calculators/attributes';
