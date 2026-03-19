import React from 'react';
import { createPortal } from 'react-dom';
import bgData from '../../data/db.json';
import classDetailsData from '../../data/classDetails.json';
import { FeatureExpandable } from '../FeatureExpandable';
import { ValidationBanner } from '../ValidationBanner';
import { StepHeader } from '../StepHeader';
import { calculateMaxHP as engineCalculateMaxHP } from '../../rules/calculators/combat';
import { getClassHPData } from '../../rules/data/classRules';
import { formatDice, ATTRIBUTE_MAP } from '../../utils/formatting';
import { useCharacter } from '../../context/CharacterContext';
import { useWizard } from '../../context/WizardContext';

export interface ClassSelectionStepProps {
  onReset: () => void;
  languagesData?: unknown;
}

export const ClassSelectionStep: React.FC<ClassSelectionStepProps> = ({
  onReset,
}) => {
  const {
    character,
    setCharacter,
    characterLevel,
    setCharacterLevel,
    handleSelectClass,
    handleChoiceChange,
    allSelections,
    stepSelections,
    validationResult,
    derivedSheet,
  } = useCharacter();

  const {
    currentPhase,
    setCurrentPhase,
    setCurrentStep,
    setIsPortraitModalOpen,
    showTooltip,
    setShowTooltip,
  } = useWizard();

  const validationErrors = validationResult.byStep.class;
  const canAdvance = validationErrors.length === 0;

  const closeTooltip = () => {
    setShowTooltip(false);
  };

  const onSelectClass = (cls: any) => {
    handleSelectClass(cls);
    setShowTooltip(true);
  };

  return (
    <div className="step-container">
      <ValidationBanner errors={validationErrors} />
      {currentPhase === 2 && character.characterClass ? (
        <>
          {/* Standardized header for Phase 2 */}
          <StepHeader
            onPrev={() => {
              setCurrentPhase(1);
              setCharacterLevel(1);
              setCharacter(prev => ({ ...prev, choices: {} }));
            }}
            onNext={() => setCurrentStep(1)}
            canAdvance={canAdvance}
            activeStep={1}
            onStepClick={setCurrentStep}
            characterName={character.name}
            setCharacterName={(n: string) => setCharacter(prev => ({ ...prev, name: n }))}
            portrait={character.portrait}
            onPortraitClick={() => setIsPortraitModalOpen(true)}
            selections={stepSelections}
          />
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 10px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s ease-in-out', overflowY: 'auto', paddingRight: '12px', paddingBottom: '40px' }}>
            <div style={{ padding: '0 0 12px 0' }} />

            {/* Level and Stats Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={`/imgs/icone_classe/${character.characterClass.id}.png`} alt="Icon" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                <h3 style={{ fontSize: '1.8rem', color: '#f97316', margin: 0 }}>{character.characterClass.name}</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#cbd5e1', fontSize: '1.2rem', fontWeight: 'bold' }}>Nível</span>
                  {/* Escopo atual: criação nível 1 */}
                  <span className="premium-select" style={{ opacity: 0.6, pointerEvents: 'none' }}>1</span>
                </div>

                {/* Stats Box */}
                <div style={{ background: '#111218', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>
                  <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                    Max Pontos de Vida: <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>
                      {engineCalculateMaxHP(character.characterClass.id, characterLevel, derivedSheet.modifiers['constituicao'] ?? 0)}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                    Dado de Vida: <span style={{ color: '#fff' }}>{getClassHPData(character.characterClass.id)?.hitDieLabel || '1d?'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Level 1 Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(() => {
                const classId = character.characterClass.id;
                const details = (classDetailsData as Record<string, { basicTraits: Record<string, string>; features?: Array<any>; options?: Array<any> }>)[classId];
                if (!details) return null;

                // Active traits based on selected level
                const activeFeatures = (details.features || []).filter(f => f.level <= characterLevel);
                return (
                  <>
                    <FeatureExpandable
                      feature={{
                        name: `Traços Básicos de ${character.characterClass.name}`,
                        level: 1,
                        description: `<table style="width: 100%; border-collapse: collapse;">
                            <tbody>
                              ${Object.entries(details.basicTraits).map(([key, val]) => `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                  <td style="padding: 8px 12px; color: #f97316; font-weight: bold; width: 30%; font-size: 0.82rem; text-align: left;">${key}</td>
                                  <td style="padding: 8px 12px; color: #d1d5db; font-size: 0.82rem; text-align: left;">${val}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>`
                      }}
                      needsChoice={details.options && details.options.some((opt: any) => !character.choices[opt.id])}
                      options={details.options}
                      choices={character.choices}
                      onChoiceChange={handleChoiceChange}
                      allSelections={allSelections}
                    />
                    {activeFeatures.map((f, idx) => (
                      <FeatureExpandable
                        key={idx}
                        feature={f}
                        needsChoice={f.options && f.options.some((opt: any) => !character.choices[opt.id])}
                        options={f.options}
                        choices={character.choices}
                        onChoiceChange={handleChoiceChange}
                        allSelections={allSelections}
                      />
                    ))}
                  </>
                );
              })()}
            </div>

            {/* Higher Level Features Expandable Tray */}
            <details style={{ marginTop: '16px' }}>
              <summary style={{ cursor: 'pointer', color: '#000', background: '#e2e8f0', padding: '8px 16px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
                <span style={{ marginRight: '8px' }}>Disponível em níveis superiores</span>
                <span className="plus-icon">+</span>
              </summary>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(() => {
                  const classId = character.characterClass.id;
                  const details = (classDetailsData as Record<string, { features?: Array<any> }>)[classId];
                  if (!details || !details.features) return null;

                  // Traits strictly above the given level
                  const higherFeatures = details.features.filter(f => f.level > characterLevel);
                  if (higherFeatures.length === 0) return <p style={{ color: '#94a3b8' }}>Nenhuma característica adicional cadastrada ainda.</p>;

                  return higherFeatures.map((f, idx) => (
                    <FeatureExpandable key={`hl-${idx}`} feature={f} allSelections={allSelections} />
                  ));
                })()}
              </div>
            </details>

          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%' }}>
          <h2 className="page-title" style={{ marginBottom: '16px', paddingBottom: 0, width: '100%' }}>Escolha sua classe:</h2>
          <div className="classes-grid" style={{ width: '100%' }}>
            {bgData.classes.map((cls) => (
              <div
                key={cls.id}
                className={`class-card ${character.characterClass?.id === cls.id ? 'selected' : ''}`}
                onClick={() => onSelectClass(cls)}
              >
                <div className="class-card-header">
                  <h3>{cls.name}</h3>
                  <div className="class-icon-placeholder">
                    <img
                      className={`class-icon-image ${character.characterClass?.id === cls.id ? 'selected' : ''}`}
                      src={`/imgs/icone_classe/${cls.id}.png`}
                      alt={`Ícone de ${cls.name}`}
                    />
                  </div>
                </div>
                <p>{cls.description}</p>
                <div className="class-card-chevron">›</div>
              </div>
            ))}
          </div>
          <button
            onClick={onReset}
            style={{
              marginTop: '24px',
              padding: '8px 20px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              color: '#94a3b8',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Novo Personagem
          </button>
        </div>
      )}

      {/* Tooltip Overlay — renderizado via portal fora do stacking context do animate-fade-in */}
      {showTooltip && character.characterClass && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="tooltip-overlay" onClick={closeTooltip} style={{ position: 'absolute', inset: 0 }}></div>
          <div className="class-tooltip" style={{ maxWidth: '1050px', width: '100%', maxHeight: '90vh', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1001 }}>
            <div style={{ background: '#111218', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                 <img src={`/imgs/icone_classe/${character.characterClass.id}.png`} alt="Icon" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                 <span style={{ color: '#ffffff', fontSize: '1rem', fontWeight: '500' }}>Descrição da classe</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <button
                   onClick={() => { setCurrentPhase(2); closeTooltip(); }}
                   style={{
                     background: 'rgba(249, 115, 22, 0.1)',
                     border: '1px solid #f97316',
                     color: '#f97316',
                     fontWeight: '500',
                     padding: '6px 16px',
                     borderRadius: '6px',
                     fontSize: '0.9rem',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease'
                   }}
                   onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(249, 115, 22, 0.2)'; }}
                   onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(249, 115, 22, 0.1)'; }}
                 >
                   Escolher classe
                 </button>
                 <button onClick={closeTooltip} style={{ background: 'transparent', padding: '0', color: '#a1a1aa', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
               </div>
            </div>
            <div style={{ padding: '32px 24px', overflowY: 'auto' }}>
              {(() => {
                const classId = character.characterClass!.id;
                try {
                  const details = (classDetailsData as Record<string, { subtitle: string; basicTraits: Record<string, string>; features?: Array<{ name: string; level: number; description: string }> }>)[classId];
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(500px, 2fr)', gap: '40px', alignItems: 'start' }}>
                      {/* Left Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                          <img
                            src={`/imgs/descriçao_classe/${character.characterClass!.id}.png`}
                            alt={`Descrição da classe ${character.characterClass!.name}`}
                            style={{ width: '100%', display: 'block', borderRadius: '12px', objectFit: 'cover' }}
                          />
                      </div>

                      {/* Right Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {details && (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', marginBottom: '4px' }}>
                                <h3 style={{ color: '#f97316', fontSize: '2.5rem', margin: '0', lineHeight: '1.2', fontWeight: '800' }}>
                                  {character.characterClass!.name}
                                </h3>
                                <p style={{ color: '#cbd5e1', fontSize: '1.15rem', margin: '0', fontStyle: 'italic', opacity: 0.9, lineHeight: '1.5' }}>
                                  {details.subtitle.replace(character.characterClass!.name + ". ", "").replace(character.characterClass!.name + " ", "")}
                                </p>
                              </div>

                              <div style={{ display: 'flex', flexWrap: 'nowrap', marginBottom: '8px', background: 'rgba(26, 22, 37, 0.8)', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '12px', overflow: 'hidden' }}>
                                <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderRight: '1px solid rgba(249, 115, 22, 0.4)' }}>
                                  <span style={{ color: '#f97316', fontSize: '0.70rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Atributo Primário</span>
                                  <span style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{details.basicTraits['Atributo Primário'] || '-'}</span>
                                </div>
                                <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', borderRight: '1px solid rgba(249, 115, 22, 0.4)' }}>
                                  <span style={{ color: '#f97316', fontSize: '0.70rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Dado de Vida</span>
                                  <span style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{details.basicTraits['Dado de Ponto de Vida']?.split(' ')[0] || '-'}</span>
                                </div>
                                <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                                  <span style={{ color: '#f97316', fontSize: '0.70rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Salvaguardas</span>
                                  <span style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', whiteSpace: 'nowrap' }}>{details.basicTraits['Proficiência em Salvaguardas'] || details.basicTraits['Proficiência em Salvaguarda'] || '-'}</span>
                                </div>
                              </div>

                              <details style={{ background: '#1a1b23', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                                <summary style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                                    <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: '500' }}>Traços Básicos de {character.characterClass!.name}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Nível 1</span>
                                  </div>
                                  <span className="summary-chevron" style={{ color: '#cbd5e1', fontSize: '0.8rem', opacity: 0.7 }}>▼</span>
                                </summary>
                                <div className="details-content" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                      {Object.entries(details.basicTraits).map(([key, value], index) => (
                                        <tr key={key} style={{
                                          background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                          borderBottom: index < Object.keys(details.basicTraits).length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                        }}>
                                          <td style={{
                                            width: '35%',
                                            color: '#f97316',
                                            fontWeight: '600',
                                            fontSize: '0.82rem',
                                            padding: '8px 12px',
                                            verticalAlign: 'top',
                                            textAlign: 'left',
                                            borderRight: '1px solid rgba(255,255,255,0.05)'
                                          }}>
                                            {key}
                                          </td>
                                          <td style={{
                                            width: '65%',
                                            color: '#d1d5db',
                                            fontSize: '0.82rem',
                                            lineHeight: '1.5',
                                            padding: '8px 12px',
                                            textAlign: 'left',
                                            whiteSpace: 'pre-wrap'
                                          }}>
                                            <div dangerouslySetInnerHTML={{ __html: formatDice(value as string)
                                              .replace(new RegExp(`\\b(${Object.keys(ATTRIBUTE_MAP).join('|')})\\b`, 'g'), (m: string) => `<strong>${m}</strong> <span style="opacity:0.6; font-size: 0.75rem">(${ATTRIBUTE_MAP[m]})</span>`)
                                            }} />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </details>

                              {details.features && details.features.filter((f: any) => f.level === 1).map((feature: any, i: number) => (
                                <FeatureExpandable key={i} feature={feature} />
                              ))}
                            </>
                          )}
                      </div>
                    </div>
                  );
                } catch(e) {
                   console.error("Failed to load class details", e);
                   return null;
                }
              })()}
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};
