import React from 'react';
import bgData from '../../data/db.json';
import classDetailsData from '../../data/classDetails.json';
import { FeatureExpandable } from '../FeatureExpandable';
import { ValidationBanner } from '../ValidationBanner';
import { HelpTooltip } from '../ui/HelpTooltip';
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
  const pendingChoicesCount = [
    ...(classDetails?.options ?? []),
    ...activeFeatures.filter((feature) => Array.isArray(feature.options) && feature.options.length > 0),
  ].filter((item) => {
    const options = 'id' in item ? [item] : item.options;
    return options?.some((opt: { id: string }) => !character.choices[opt.id]);
  }).length;

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
                <HelpTooltip label="Impacto imediato" title="O que muda ao trocar a classe" align="right">
                  Classe define dado de vida, atributo-chave, escolhas obrigatórias e características já ativas para o nível atual. O restante fica acessível sob demanda.
                </HelpTooltip>
              </div>
              <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '0.84rem' }}>
                Selecione uma classe para ver tudo o que muda na ficha imediatamente. Consulte apenas os detalhes contextuais que fizerem falta durante a decisão.
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
                        <div className={styles.summaryHelpRow}>
                          <HelpTooltip label="Resumo da classe" title={`Visão rápida de ${selectedClass.name}`} variant="chip" align="right">
                            {selectedClass.description}
                          </HelpTooltip>
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
                    <HelpTooltip label="Traços-base" title="Quando consultar" align="right">
                      Estes dados servem como referência curta para comparar classes. Use-os quando precisar confirmar proficiências, recursos centrais e ritmo geral da classe.
                    </HelpTooltip>
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
                    <p className={styles.optionsSubtitle}>As pendências já aparecem no topo; aqui ficam só os blocos que ainda precisam da sua ação.</p>
                  </div>
                  <div className={styles.optionsHelpRow}>
                    <span className={styles.optionsCounterChip}>
                      Pendências · {validationErrors.length}
                    </span>
                    <span className={styles.optionsCounterChip}>
                      Blocos abertos · {pendingChoicesCount}
                    </span>
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
