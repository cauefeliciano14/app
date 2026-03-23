import { useState, useRef, useEffect } from 'react';
import weaponsData from '../data/weapons.json';
import { CANTRIPS_BY_LIST } from '../data/talentChoiceConfig';
import { SpellDetailsAccordion } from './SpellDetailsAccordion';

export interface FeatureExpandableProps {
  feature: any;
  needsChoice?: boolean;
  options?: Array<{
    id: string;
    name: string;
    choices: string[];
    choiceDetails?: Record<string, string>;
    showWhen?: { id: string; value: string };
    sourceChoicesIds?: string[];
    spellSource?: string;
    isSpell?: boolean;
  }>;
  choices?: Record<string, string>;
  onChoiceChange?: (id: string, val: string) => void;
  allSelections?: string[];
}

export const FeatureExpandable = ({
  feature,
  needsChoice = false,
  options,
  choices,
  onChoiceChange,
  allSelections
}: FeatureExpandableProps) => {
  const [showMore, setShowMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const fullHeight = contentRef.current.scrollHeight;
      setNeedsTruncation(fullHeight > 120);
    }
  }, [isOpen]);

  return (
    <details
      style={{
        background: '#1a1b23',
        borderRadius: '8px',
        border: needsChoice ? '1px solid #f97316' : '1px solid rgba(255,255,255,0.05)',
        marginBottom: '8px',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
      onToggle={(e) => { setIsOpen(e.currentTarget.open); setShowMore(false); }}
    >
      <summary style={{ padding: '6px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {needsChoice && (
            <div
              style={{
                width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#f97316',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '0.75rem', flexShrink: 0,
                boxShadow: '0 0 8px rgba(249,115,22,0.4)'
              }}
              title="Ação Necessária"
            >
              !
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
            <span style={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: '500' }}>{feature.name}</span>
            <span style={{ fontSize: '0.7rem', lineHeight: 1, display: 'block' }}>
              {options && (() => {
                const visibleOptions = options.filter(o => !o.showWhen || choices?.[o.showWhen.id] === o.showWhen.value);
                const totalOptions = visibleOptions.length;
                return totalOptions > 0 ? (
                  <span style={{ color: needsChoice ? '#f97316' : '#64748b' }}>{totalOptions} Escolha{totalOptions > 1 ? 's' : ''} — </span>
                ) : null;
              })()}
              <span style={{ color: '#94a3b8' }}>Nível {feature.level}</span>
            </span>
          </div>
        </div>
        <span className="summary-chevron" style={{ color: '#cbd5e1', fontSize: '0.8rem', opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
      </summary>

      {isOpen && (
        <div className="details-content" style={{ borderTop: needsChoice ? '1px solid rgba(249,115,22,0.2)' : '1px solid rgba(255,255,255,0.05)', padding: '14px 18px', color: '#d1d5db', fontSize: '0.85rem', lineHeight: '1.65', textAlign: 'left' }}>
          <div
            ref={contentRef}
            style={!showMore && needsTruncation ? {
              maxHeight: '120px',
              overflow: 'hidden',
              maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
            } : {}}
            dangerouslySetInnerHTML={{ __html: feature.description }}
          />

          {needsTruncation && (
            <button
              onClick={(e) => { e.preventDefault(); setShowMore(!showMore); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontWeight: '400',
                fontStyle: 'italic',
                cursor: 'pointer',
                padding: '0',
                marginTop: '12px',
                fontSize: '0.75rem',
                display: 'inline-block',
                opacity: 0.8,
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#cbd5e1'}
              onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              {showMore ? 'esconder' : 'ler mais...'}
            </button>
          )}

          {options && options.map(opt => {
            // showWhen: só renderiza se a condição for satisfeita
            if (opt.showWhen && choices?.[opt.showWhen.id] !== opt.showWhen.value) return null;

            const isWeaponMastery = opt.id.includes('weapon-mastery');
            const selectedWeaponName = choices?.[opt.id];

            // Helper to find weapon and mastery
            let selectedWeaponObj = null;
            if (isWeaponMastery && selectedWeaponName) {
              const allWeapons = [
                ...weaponsData.simpleMelee,
                ...weaponsData.martialMelee,
                ...weaponsData.simpleRanged,
                ...weaponsData.martialRanged
              ];
              selectedWeaponObj = allWeapons.find(w => w.name === selectedWeaponName);
            }

            // Computar a lista de escolhas efetiva
            const effectiveChoices: string[] = opt.sourceChoicesIds
              ? opt.sourceChoicesIds.map(id => choices?.[id]).filter(Boolean) as string[]
              : opt.spellSource
              ? (CANTRIPS_BY_LIST[opt.spellSource === 'druida' ? 'Druida' : 'Clérigo'] || [])
              : opt.choices;

            return (
              <div key={opt.id} style={{ marginTop: '10px' }}>
                <select
                  className="premium-select"
                  value={choices?.[opt.id] || ''}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    onChoiceChange?.(opt.id, newVal);
                    if (!newVal) {
                      options.forEach(o => {
                        if (o.showWhen?.id === opt.id) onChoiceChange?.(o.id, '');
                      });
                    }
                  }}
                >
                  <option value="">- {opt.name} -</option>
                  {(() => {
                    if (isWeaponMastery) {
                      const categories = [
                        { name: "Armas Simples (Corpo a Corpo)", data: weaponsData.simpleMelee },
                        { name: "Armas Marciais (Corpo a Corpo)", data: weaponsData.martialMelee },
                        { name: "Armas Simples (À Distância)", data: weaponsData.simpleRanged },
                        { name: "Armas Marciais (À Distância)", data: weaponsData.martialRanged }
                      ];

                      return categories.map(cat => {
                        const catChoices = opt.choices.filter(choice =>
                          cat.data.some((w: any) => w.name === choice) &&
                          !options.some(otherOpt => otherOpt.id !== opt.id && choices?.[otherOpt.id] === choice)
                        );

                        if (catChoices.length === 0) return null;

                        return (
                          <optgroup key={cat.name} label={cat.name}>
                            {catChoices.map(c => {
                              const isSelectedElsewhere = allSelections?.includes(c) && choices?.[opt.id] !== c;
                              const w = cat.data.find((weapon: any) => weapon.name === c);
                              const displayName = w ? `${w.name} (${w.mastery})` : c;

                              return (
                                <option
                                  key={c}
                                  value={c}
                                  className={isSelectedElsewhere ? 'option-taken' : ''}
                                >
                                  {isSelectedElsewhere ? '✓ ' : ''}{displayName}
                                </option>
                              );
                            })}
                          </optgroup>
                        );
                      });
                    }

                    return effectiveChoices
                      .filter(c => !options.some(otherOpt => otherOpt.id !== opt.id && choices?.[otherOpt.id] === c))
                      .map(c => {
                        const isSelectedElsewhere = allSelections?.includes(c) && choices?.[opt.id] !== c;
                        return (
                          <option
                            key={c}
                            value={c}
                            className={isSelectedElsewhere ? 'option-taken' : ''}
                          >
                            {isSelectedElsewhere ? '✓ ' : ''}{c}
                          </option>
                        );
                      });
                  })()}
                </select>

                {isWeaponMastery && selectedWeaponObj && (
                  <div style={{ marginTop: '12px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #f97316', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      Maestria · <span style={{ color: '#94a3b8', textTransform: 'none', letterSpacing: 'normal', fontWeight: 400 }}>{selectedWeaponObj.name}s</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontStyle: 'italic', fontSize: '0.9rem' }}>{selectedWeaponObj.mastery}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: '1.6' }}>{(weaponsData.masteries as Record<string, string>)[selectedWeaponObj.mastery]}</span>
                    </div>
                  </div>
                )}

                {opt.choiceDetails && choices?.[opt.id] && opt.choiceDetails[choices[opt.id]] && (
                  <div style={{ marginTop: '12px', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #f97316' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: opt.choiceDetails[choices[opt.id]] }} />
                  </div>
                )}

                {opt.isSpell && choices?.[opt.id] && (
                  <SpellDetailsAccordion spellName={choices[opt.id]} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </details>
  );
};
