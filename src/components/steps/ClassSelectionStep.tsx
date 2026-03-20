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

const getClassIconSrc = (classId: string) => `/imgs/icone_classe/${classId}.png`;
const getClassCardArtSrc = (classId: string) => `/imgs/descriçao_classe/${classId}.png`;
const getClassHeroArtSrc = (classId: string) => `/imgs/${classId}.png`;

type ClassDetails = {
  basicTraits: Record<string, string>;
  features?: Array<any>;
  options?: Array<any>;
};

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
  const classDetails = selectedClass ? (classDetailsData as Record<string, ClassDetails>)[selectedClass.id] : null;
  const activeFeatures = (classDetails?.features ?? []).filter((feature) => feature.level <= characterLevel);
  const immediateImpact = selectedClass
    ? [
        `PV máximos agora: ${engineCalculateMaxHP(selectedClass.id, characterLevel, derivedSheet.modifiers.constituicao ?? 0)}`,
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
                <ContextualPopover label="Impacto agora" title="O que muda imediatamente" variant="chip">
                  <ul className={styles.contextList}>
                    {immediateImpact.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
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
                        <div className={styles.sectionHeading}>
                          <h3 className={styles.summaryTitle}>{selectedClass.name}</h3>
                          <ContextualPopover label="Resumo" title="Leitura auxiliar da classe" variant="chip" align="right">
                            <div className={styles.contextText}>
                              Revise os traços abaixo para entender proficiências, papel esperado e restrições antes de fechar as escolhas destacadas.
                            </div>
                          </ContextualPopover>
                        </div>
                        <p className={styles.summaryDescription}>{selectedClass.description}</p>
                      </div>
                    </div>
                    <div className={styles.summaryStats}>
                      <SummaryStat
                        label="PV iniciais"
                        value={String(engineCalculateMaxHP(selectedClass.id, characterLevel, derivedSheet.modifiers.constituicao ?? 0))}
                      />
                      <SummaryStat label="Dado de vida" value={getClassHPData(selectedClass.id)?.hitDieLabel || '—'} />
                    </div>
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
                        {validationErrors.map((error) => (
                          <li key={error}>{error}</li>
                        ))}
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
    <div className={styles.summaryStat}>
      <div className={styles.summaryStatLabel}>{label}</div>
      <div className={styles.summaryStatValue}>{value}</div>
    </div>
  );
}
