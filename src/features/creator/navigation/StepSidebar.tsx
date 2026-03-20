import { useWizard } from '../../../context/WizardContext';
import { useCharacter } from '../../../context/CharacterContext';

const ITEMS = [
  { index: 0, label: 'Classe', key: 'class' },
  { index: 1, label: 'Origem', key: 'background' },
  { index: 2, label: 'Espécie', key: 'species' },
  { index: 3, label: 'Atributos', key: 'attributes' },
  { index: 4, label: 'Equipamento', key: 'equipment' },
  { index: 5, label: 'Ficha', key: 'sheet' },
] as const;

export function StepSidebar() {
  const { currentStep, setCurrentStep } = useWizard();
  const { validationResult, stepSelections } = useCharacter();

  const pendingMap = {
    class: validationResult.byStep.class.length,
    background: validationResult.byStep.background.length,
    species: validationResult.byStep.species.length,
    attributes: validationResult.byStep.attributes.length,
    equipment: validationResult.byStep.equipment.length,
    sheet: validationResult.errors.length,
  };

  return (
    <div>
      <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
        Etapas
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ITEMS.map((item) => {
          const active = currentStep === item.index;
          const pending = pendingMap[item.key];
          const selectedLabel = stepSelections[item.index + 1];
          const complete = item.key === 'sheet' ? validationResult.isValid : Boolean(selectedLabel) && pending === 0;

          return (
            <button
              key={item.label}
              onClick={() => setCurrentStep(item.index)}
              style={{
                background: active ? 'rgba(249,115,22,0.14)' : 'rgba(255,255,255,0.03)',
                border: active ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: active ? '0 8px 24px rgba(249,115,22,0.12)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.92rem' }}>{item.label}</span>
                <span style={{
                  minWidth: '24px',
                  height: '24px',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: complete ? 'rgba(34,197,94,0.18)' : pending > 0 ? 'rgba(249,115,22,0.18)' : 'rgba(148,163,184,0.12)',
                  color: complete ? '#4ade80' : pending > 0 ? '#fb923c' : '#94a3b8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {complete ? '✓' : pending > 0 ? pending : item.index + 1}
                </span>
              </div>
              <span style={{ color: active ? '#fed7aa' : '#94a3b8', fontSize: '0.77rem', lineHeight: 1.4 }}>
                {pending > 0
                  ? `${pending} pendência${pending > 1 ? 's' : ''}`
                  : selectedLabel ?? (item.key === 'sheet' ? 'Revisão final' : 'Pronto para revisar')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
