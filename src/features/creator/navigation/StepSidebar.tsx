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

  const currentItem = ITEMS[currentStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        Etapas
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 600 }}>Ir para etapa</span>
        <select
          className="premium-select"
          aria-label="Ir para etapa"
          value={currentStep}
          onChange={(e) => setCurrentStep(Number(e.target.value))}
        >
          {ITEMS.map((item) => {
            const pending = pendingMap[item.key];

            return (
              <option key={item.label} value={item.index}>
                {item.index + 1}. {item.label}{pending > 0 ? ` · ${pending} pendência${pending > 1 ? 's' : ''}` : ''}
              </option>
            );
          })}
        </select>
      </label>

      <details open style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
        <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '12px 14px', color: '#f8fafc', fontWeight: 700 }}>
          Navegação detalhada
        </summary>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px 12px' }}>
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
      </details>

      <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: '14px', padding: '12px 14px' }}>
        <div style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '6px' }}>Etapa atual</div>
        <div style={{ color: '#fed7aa', fontSize: '0.9rem', marginBottom: '4px' }}>{currentItem?.label ?? '—'}</div>
        <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.5 }}>
          {currentItem ? `${pendingMap[currentItem.key]} pendência${pendingMap[currentItem.key] !== 1 ? 's' : ''} nesta etapa.` : 'Selecione uma etapa para continuar.'}
        </div>
      </div>
    </div>
  );
}
