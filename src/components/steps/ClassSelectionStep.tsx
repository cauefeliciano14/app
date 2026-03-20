import React from 'react';
import bgData from '../../data/db.json';
import classDetailsData from '../../data/classDetails.json';
import { FeatureExpandable } from '../FeatureExpandable';
import { ValidationBanner } from '../ValidationBanner';
import { StepLayout } from './StepLayout';
import { calculateMaxHP as engineCalculateMaxHP } from '../../rules/calculators/combat';
import { getClassHPData } from '../../rules/data/classRules';
import { useCharacter } from '../../context/CharacterContext';
import { useWizard } from '../../context/WizardContext';

export interface ClassSelectionStepProps {
  onReset: () => void;
  languagesData?: unknown;
}

export const ClassSelectionStep: React.FC<ClassSelectionStepProps> = ({ onReset, languagesData }) => {
  void languagesData;
  const {
    character,
    setCharacter,
    characterLevel,
    handleSelectClass,
    handleChoiceChange,
    allSelections,
    stepSelections,
    validationResult,
    derivedSheet,
  } = useCharacter();
  const { setCurrentStep, setIsPortraitModalOpen } = useWizard();

  const validationErrors = validationResult.byStep.class;
  const canAdvance = validationErrors.length === 0;
  const selectedClass = character.characterClass;
  const classDetails = selectedClass
    ? (classDetailsData as Record<string, { basicTraits: Record<string, string>; features?: Array<any>; options?: Array<any> }>)[selectedClass.id]
    : null;
  const activeFeatures = (classDetails?.features ?? []).filter((feature) => feature.level <= characterLevel);

  return (
    <StepLayout
      onNext={() => setCurrentStep(1)}
      canAdvance={canAdvance}
      activeStep={1}
      onStepClick={setCurrentStep}
      characterName={character.name}
      setCharacterName={(n: string) => setCharacter(prev => ({ ...prev, name: n }))}
      portrait={character.portrait}
      onPortraitClick={() => setIsPortraitModalOpen(true)}
      selections={stepSelections}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
        <ValidationBanner errors={validationErrors} />
        <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr) 260px', gap: '16px', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
            <div>
              <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem' }}>Classe</h2>
              <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
                Selecione uma classe para ver tudo o que muda na ficha imediatamente.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px' }}>
              {bgData.classes.map((cls) => {
                const isSelected = selectedClass?.id === cls.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    style={{
                      background: isSelected ? 'rgba(249,115,22,0.16)' : 'rgba(255,255,255,0.03)',
                      border: isSelected ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      padding: '12px',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={`/imgs/icone_classe/${cls.id}.png`} alt={cls.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                      <div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>{cls.name}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.76rem', lineHeight: 1.4 }}>{cls.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={onReset}
              style={{ marginTop: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8' }}
            >
              Novo Personagem
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '8px' }}>
            {!selectedClass || !classDetails ? (
              <div style={{ minHeight: '360px', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Escolha uma classe para revisar detalhes e opções obrigatórias.
              </div>
            ) : (
              <>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <img src={`/imgs/icone_classe/${selectedClass.id}.png`} alt={selectedClass.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        <div>
                          <h3 style={{ margin: 0, color: '#fff', fontSize: '1.6rem' }}>{selectedClass.name}</h3>
                          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.86rem' }}>{selectedClass.description}</p>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px, 1fr))', gap: '8px', minWidth: '260px' }}>
                      <SummaryStat label="PV iniciais" value={String(engineCalculateMaxHP(selectedClass.id, characterLevel, derivedSheet.modifiers['constituicao'] ?? 0))} />
                      <SummaryStat label="Dado de vida" value={getClassHPData(selectedClass.id)?.hitDieLabel || '—'} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '16px' }}>
                    {Object.entries(classDetails.basicTraits).map(([key, val]) => (
                      <div key={key} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '10px', padding: '10px 12px' }}>
                        <div style={{ color: '#f97316', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{key}</div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.84rem', lineHeight: 1.5 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {classDetails.options?.map((opt) => (
                    <FeatureExpandable
                      key={opt.id}
                      feature={{ name: opt.name, level: 1, description: opt.description ?? '' }}
                      needsChoice={!character.choices[opt.id]}
                      options={[opt]}
                      choices={character.choices}
                      onChoiceChange={handleChoiceChange}
                      allSelections={allSelections}
                    />
                  ))}

                  {activeFeatures.map((feature, idx) => (
                    <FeatureExpandable
                      key={`${feature.name}-${idx}`}
                      feature={feature}
                      needsChoice={feature.options?.some((opt: any) => !character.choices[opt.id])}
                      options={feature.options}
                      choices={character.choices}
                      onChoiceChange={handleChoiceChange}
                      allSelections={allSelections}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Panel title="Impacto imediato">
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6 }}>
                <li>PV máximos: <strong>{selectedClass ? engineCalculateMaxHP(selectedClass.id, characterLevel, derivedSheet.modifiers['constituicao'] ?? 0) : '—'}</strong></li>
                <li>CA atual derivada: <strong>{derivedSheet.armorClass}</strong></li>
                <li>Bônus de proficiência: <strong>+{derivedSheet.proficiencyBonus}</strong></li>
              </ul>
            </Panel>
            <Panel title="O que falta">
              {validationErrors.length === 0 ? (
                <div style={{ color: '#4ade80', fontSize: '0.82rem' }}>Etapa pronta para avançar.</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  {validationErrors.map((error) => <li key={error}>{error}</li>)}
                </ul>
              )}
            </Panel>
            <Panel title="Resumo da classe">
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.6 }}>
                {selectedClass ? 'Veja os detalhes ao centro e finalize quaisquer escolhas obrigatórias destacadas em laranja.' : 'Selecione uma classe na coluna da esquerda.'}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px' }}>
      <div style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '10px', padding: '10px 12px' }}>
      <div style={{ color: '#94a3b8', fontSize: '0.68rem', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
