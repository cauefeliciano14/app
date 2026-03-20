import React, { useState } from 'react';
import bgData from '../../data/db.json';
import classDetailsData from '../../data/classDetails.json';
import { FeatureExpandable } from '../FeatureExpandable';
import { ValidationBanner } from '../ValidationBanner';
import { StepLayout } from './StepLayout';
import styles from './ClassSelectionStep.module.css';
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

type ClassDetails = {
  basicTraits: Record<string, string>;
  features?: Array<any>;
  options?: Array<any>;
};

function getTraitValue(traits: Record<string, string>, labels: string[]) {
  const entry = Object.entries(traits).find(([key]) => labels.includes(key));
  return entry?.[1] ?? null;
}

function getClassCardMeta(classId: string) {
  const details = (classDetailsData as Record<string, ClassDetails>)[classId];
  const traits = details?.basicTraits ?? {};

  return {
    primaryAttribute: getTraitValue(traits, ['Atributo Primário']),
    hitDie: getClassHPData(classId)?.hitDieLabel ?? getTraitValue(traits, ['Dado de Ponto de Vida']),
  };
}

function isSkillChoiceOption(opt: any): boolean {
  const name: string = (opt.name ?? '').toLowerCase();
  return name.includes('perícia') || name.includes('pericia') || name.includes('skill');
}

interface SkillChoicesGroupProps {
  options: any[];
  choices: Record<string, string>;
  onChoiceChange: (id: string, val: string) => void;
  allSelections?: string[];
}

function SkillChoicesGroup({ options, choices, onChoiceChange, allSelections }: SkillChoicesGroupProps) {
  const [open, setOpen] = useState(false);
  const allComplete = options.every(opt => !!choices[opt.id]);

  return (
    <details
      style={{
        background: '#1a1b23',
        borderRadius: '8px',
        border: allComplete ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f97316',
        position: 'relative',
      }}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', listStyle: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!allComplete && (
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#f97316', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0, boxShadow: '0 0 8px rgba(249,115,22,0.4)' }} title="Ação Necessária">!</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: '500' }}>Escolhas de Perícias</span>
            <span style={{ fontSize: '0.7rem', color: !allComplete ? '#f97316' : '#64748b' }}>
              {options.length} Escolha{options.length > 1 ? 's' : ''} — Nível 1
            </span>
          </div>
        </div>
        <span style={{ color: '#cbd5e1', fontSize: '0.8rem', opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </summary>

      {open && (
        <div style={{ borderTop: !allComplete ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {options.map((opt) => {
            const isSelectedElsewhere = (c: string) => allSelections?.includes(c) && choices[opt.id] !== c;
            return (
              <div key={opt.id}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '4px' }}>{opt.name}</label>
                <select
                  className="premium-select"
                  value={choices[opt.id] || ''}
                  onChange={(e) => onChoiceChange(opt.id, e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">— Escolher —</option>
                  {(opt.choices ?? [])
                    .filter((c: string) => !options.some((o: any) => o.id !== opt.id && choices[o.id] === c))
                    .map((c: string) => (
                      <option key={c} value={c} className={isSelectedElsewhere(c) ? 'option-taken' : ''}>
                        {isSelectedElsewhere(c) ? '✓ ' : ''}{c}
                      </option>
                    ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </details>
  );
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
  } = useCharacter();
  const { setCurrentStep, setIsPortraitModalOpen } = useWizard();

  const validationErrors = validationResult.byStep.class;
  const canAdvance = validationErrors.length === 0;
  const selectedClass = character.characterClass;
  const classDetails = selectedClass ? (classDetailsData as Record<string, ClassDetails>)[selectedClass.id] : null;
  const selectedClassMeta = selectedClass ? getClassCardMeta(selectedClass.id) : null;
  const activeFeatures = (classDetails?.features ?? []).filter((feature) => feature.level <= characterLevel);

  // Split options into skill choices (grouped) and others
  const allOptions = classDetails?.options ?? [];
  const skillOptions = allOptions.filter(isSkillChoiceOption);
  const otherOptions = allOptions.filter((opt: any) => !isSkillChoiceOption(opt));

  return (
    <StepLayout
      onNext={() => setCurrentStep(1)}
      canAdvance={canAdvance}
      activeStep={1}
      onStepClick={setCurrentStep}
      characterName={character.name}
      setCharacterName={(name: string) => setCharacter((prev) => ({ ...prev, name }))}
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
              </div>
              <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
                Selecione uma classe para ver tudo o que muda na ficha imediatamente.
              </p>
            </div>
            <div className={styles.classList}>
              {bgData.classes.map((cls) => {
                const isSelected = selectedClass?.id === cls.id;
                const cardMeta = getClassCardMeta(cls.id);
                return (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className={`${styles.classCard} ${isSelected ? styles.classCardSelected : ''}`}
                  >
                    <div className={styles.classCardArtWrap}>
                      <img src={getClassCardArtSrc(cls.id)} alt="" aria-hidden="true" className={styles.classCardArt} />
                      <div className={styles.classCardOverlay} />
                      <div className={styles.classCardIdentityBadge}>
                        <img src={getClassIconSrc(cls.id)} alt="" aria-hidden="true" className={styles.classCardIcon} />
                      </div>
                      <div className={styles.classCardTitleOnArt}>{cls.name}</div>
                    </div>
                    <div className={styles.classCardBody}>
                      <div className={styles.classCardMetaRow}>
                        {cardMeta.primaryAttribute ? (
                          <span className={styles.classMetaChip}>{cardMeta.primaryAttribute}</span>
                        ) : null}
                        {cardMeta.hitDie ? <span className={styles.classMetaChip}>{cardMeta.hitDie}</span> : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={onReset} className={styles.resetButton}>
              Novo Personagem
            </button>
          </div>

          <div className={styles.detailsColumn}>
            {!selectedClass || !classDetails ? (
              <div className={styles.placeholder}>Escolha uma classe para revisar detalhes e opções obrigatórias.</div>
            ) : (
              <>
                <div className={styles.classSummaryCard}>
                  <div className={styles.summaryHeroPanel}>
                    <div className={styles.summaryHeroWrap}>
                      <img src={getClassHeroArtSrc(selectedClass.id)} alt={`Arte de ${selectedClass.name}`} className={styles.summaryHeroArt} />
                      <div className={styles.summaryHeroOverlay} />
                    </div>
                    <div className={styles.summaryHeroContent}>
                      <div className={styles.summaryTopRow}>
                        <div className={styles.summaryBadge}>
                          <img src={getClassIconSrc(selectedClass.id)} alt="" aria-hidden="true" className={styles.summaryBadgeIcon} />
                          Classe selecionada
                        </div>
                      </div>
                      <h3 className={styles.summaryTitle}>{selectedClass.name}</h3>
                      <p className={styles.summaryDescription}>{selectedClass.description}</p>
                      <div className={styles.summaryStatsInline}>
                        <SummaryStat label="Dado de vida" value={getClassHPData(selectedClass.id)?.hitDieLabel || '—'} />
                        {selectedClassMeta?.primaryAttribute ? (
                          <SummaryStat label="Atributo-chave" value={selectedClassMeta.primaryAttribute || '—'} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className={styles.traitsHeader}>
                    <h4 className={styles.traitsTitle}>Traços-base</h4>
                  </div>
                  <div className={styles.traitsGrid}>
                    {Object.entries(classDetails.basicTraits).map(([key, value]) => (
                      <div key={key} className={styles.traitCard}>
                        <div className={styles.traitLabel}>{key}</div>
                        <div className={styles.traitValue}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {(skillOptions.length > 0 || otherOptions.length > 0 || activeFeatures.length > 0) && (
                  <>
                    <div className={styles.optionsHeader}>
                      <h4 className={styles.optionsTitle}>Escolhas e características</h4>
                      {validationErrors.length > 0 && (
                        <span className={styles.optionsCounterChip}>
                          {validationErrors.length} pendênci{validationErrors.length === 1 ? 'a' : 'as'}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {skillOptions.length > 0 && (
                        <SkillChoicesGroup
                          options={skillOptions}
                          choices={character.choices}
                          onChoiceChange={handleChoiceChange}
                          allSelections={allSelections}
                        />
                      )}

                      {otherOptions.map((opt: any) => (
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
                          needsChoice={feature.options?.some((opt: { id: string }) => !character.choices[opt.id])}
                          options={feature.options}
                          choices={character.choices}
                          onChoiceChange={handleChoiceChange}
                          allSelections={allSelections}
                        />
                      ))}
                    </div>
                  </>
                )}
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
    <div className={styles.summaryStat}>
      <div className={styles.summaryStatLabel}>{label}</div>
      <div className={styles.summaryStatValue}>{value}</div>
    </div>
  );
}
