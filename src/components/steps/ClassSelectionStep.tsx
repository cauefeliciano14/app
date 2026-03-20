import React from 'react';
import bgData from '../../data/db.json';
import classDetailsData from '../../data/classDetails.json';
import { FeatureExpandable } from '../FeatureExpandable';
import { ValidationBanner } from '../ValidationBanner';
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

const getClassIconSrc = (classId: string) => `/imgs/icone_classe/${classId}.png`;
const getClassCardArtSrc = (classId: string) => `/imgs/descriçao_classe/${classId}.png`;
const getClassHeroArtSrc = (classId: string) => `/imgs/${classId}.png`;

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
      <div className={styles.stepRoot}>
        <ValidationBanner errors={validationErrors} />
        <div className={styles.stepGrid}>
          <div className={styles.classColumn}>
            <div>
              <h2 style={{ margin: 0, color: '#f8fafc', fontSize: '1.3rem' }}>Classe</h2>
              <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
                Selecione uma classe para ver tudo o que muda na ficha imediatamente.
              </p>
            </div>
            <div className={styles.classList}>
              {bgData.classes.map((cls) => {
                const isSelected = selectedClass?.id === cls.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className={`${styles.classCard} ${isSelected ? styles.classCardSelected : ''}`}
                  >
                    <div className={styles.classCardArtWrap}>
                      <img src={getClassCardArtSrc(cls.id)} alt="" aria-hidden="true" className={styles.classCardArt} />
                      <div className={styles.classCardOverlay} />
                      <img src={getClassIconSrc(cls.id)} alt="" aria-hidden="true" className={styles.classCardIcon} />
                    </div>
                    <div className={styles.classCardBody}>
                      <div className={styles.classCardTitleRow}>
                        <div className={styles.classCardTitle}>{cls.name}</div>
                      </div>
                      <div className={styles.classCardDescription}>{cls.description}</div>
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
                <div className={styles.classSummaryCard}>
                  <div className={styles.summaryHeader}>
                    <div className={styles.summaryIdentity}>
                      <div className={styles.summaryHeroWrap}>
                        <img src={getClassHeroArtSrc(selectedClass.id)} alt={`Arte de ${selectedClass.name}`} className={styles.summaryHeroArt} />
                      </div>
                      <div className={styles.summaryIdentityText}>
                        <div className={styles.summaryBadge}>
                          <img src={getClassIconSrc(selectedClass.id)} alt="" aria-hidden="true" className={styles.summaryBadgeIcon} />
                          Classe selecionada
                        </div>
                        <h3 className={styles.summaryTitle}>{selectedClass.name}</h3>
                        <p className={styles.summaryDescription}>{selectedClass.description}</p>
                      </div>
                    </div>
                    <div className={styles.summaryStats}>
                      <SummaryStat label="PV iniciais" value={String(engineCalculateMaxHP(selectedClass.id, characterLevel, derivedSheet.modifiers['constituicao'] ?? 0))} />
                      <SummaryStat label="Dado de vida" value={getClassHPData(selectedClass.id)?.hitDieLabel || '—'} />
                    </div>
                  </div>
                  <div className={styles.traitsGrid}>
                    {Object.entries(classDetails.basicTraits).map(([key, val]) => (
                      <div key={key} className={styles.traitCard}>
                        <div className={styles.traitLabel}>{key}</div>
                        <div className={styles.traitValue}>{val}</div>
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

          <div className={styles.sideColumn}>
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
    <div className={styles.summaryStat}>
      <div className={styles.summaryStatLabel}>{label}</div>
      <div className={styles.summaryStatValue}>{value}</div>
    </div>
  );
}
