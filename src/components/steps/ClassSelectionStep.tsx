import React from 'react';
import bgData from '../../data/db.json';
import classDetailsData from '../../data/classDetails.json';
import { FeatureExpandable } from '../FeatureExpandable';
import { ValidationBanner } from '../ValidationBanner';
import { ContextualPopover } from '../ui/ContextualPopover';
import { StepLayout } from './StepLayout';
import styles from './ClassSelectionStep.module.css';
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
  const immediateImpact = selectedClass
    ? [
        `PV máximos agora: ${engineCalculateMaxHP(selectedClass.id, characterLevel, derivedSheet.modifiers['constituicao'] ?? 0)}`,
        `CA atual derivada: ${derivedSheet.armorClass}`,
        `Bônus de proficiência: +${derivedSheet.proficiencyBonus}`,
      ]
    : ['Selecione uma classe para calcular PV, CA e proficiência desta etapa.'];

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
      <div className={styles.stepRoot}>
        <ValidationBanner errors={validationErrors} />
        <div className={styles.stepGrid}>
          <div className={styles.classColumn}>
            <div>
              <div className={styles.sectionHeading}>
                <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem' }}>Classe</h2>
                <ContextualPopover label="Impacto agora" title="O que muda imediatamente" variant="chip">
                  <ul className={styles.contextList}>
                    {immediateImpact.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </ContextualPopover>
              </div>
              <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
                Escolha uma classe e consulte os detalhes contextuais apenas quando precisar.
              </p>
            </div>
            <div className={styles.classList}>
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
              className={styles.resetButton}
            >
              Novo Personagem
            </button>
          </div>

          <div className={styles.detailsColumn}>
            {!selectedClass || !classDetails ? (
              <div className={styles.placeholder}>
                Escolha uma classe para revisar detalhes e opções obrigatórias.
              </div>
            ) : (
              <>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '18px' }}>
                  <div className={styles.summaryHeader}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <img src={`/imgs/icone_classe/${selectedClass.id}.png`} alt={selectedClass.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        <div>
                          <div className={styles.sectionHeading}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.6rem' }}>{selectedClass.name}</h3>
                            <ContextualPopover label="Resumo" title="Leitura auxiliar da classe" variant="chip" align="right">
                              <div className={styles.contextText}>
                                Revise os traços abaixo para entender proficiências, papel esperado e restrições antes de fechar as escolhas destacadas.
                              </div>
                            </ContextualPopover>
                          </div>
                          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.86rem' }}>{selectedClass.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className={styles.summaryStats}>
                      <SummaryStat label="PV iniciais" value={String(engineCalculateMaxHP(selectedClass.id, characterLevel, derivedSheet.modifiers['constituicao'] ?? 0))} />
                      <SummaryStat label="Dado de vida" value={getClassHPData(selectedClass.id)?.hitDieLabel || '—'} />
                    </div>
                  </div>
                  <div className={styles.traitsGrid}>
                    {Object.entries(classDetails.basicTraits).map(([key, val]) => (
                      <div key={key} style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '10px', padding: '10px 12px' }}>
                        <div style={{ color: '#f97316', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{key}</div>
                        <div style={{ color: '#e2e8f0', fontSize: '0.84rem', lineHeight: 1.5 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.optionsHeader}>
                  <div>
                    <h4 className={styles.optionsTitle}>Escolhas e características</h4>
                    <p className={styles.optionsSubtitle}>Abra apenas o bloco necessário para concluir a etapa.</p>
                  </div>
                  <ContextualPopover label="Pendências" title="O que ainda falta" variant="chip" align="right">
                    {validationErrors.length === 0 ? (
                      <div className={styles.contextTextSuccess}>Etapa pronta para avançar.</div>
                    ) : (
                      <ul className={styles.contextList}>
                        {validationErrors.map((error) => <li key={error}>{error}</li>)}
                      </ul>
                    )}
                  </ContextualPopover>
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
        </div>
      </div>
    </StepLayout>
  );
};

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '10px', padding: '10px 12px' }}>
      <div style={{ color: '#94a3b8', fontSize: '0.68rem', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
