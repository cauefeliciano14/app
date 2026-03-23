import React from 'react';
import { TALENT_CHOICES_CONFIG, type TalentField } from '../data/talentChoiceConfig';
import { SpellDetailsAccordion } from './SpellDetailsAccordion';

// --- Funções exportadas ---

export const checkTalentComplete = (talentName: string, selections: Record<string, string> = {}) => {
  const config = TALENT_CHOICES_CONFIG[talentName];
  if (!config) return true;
  return config.fields.every(field => {
    if (field.hiddenUntil && !selections[field.hiddenUntil]) return true;
    return !!selections[field.key];
  });
};

/** Retorna o número de escolhas ainda pendentes para um talento (considera apenas campos visíveis). */
export const countPendingTalentChoices = (talentName: string, selections: Record<string, string> = {}): number => {
  const config = TALENT_CHOICES_CONFIG[talentName];
  if (!config) return 0;
  return config.fields.filter(field => {
    if (field.hiddenUntil && !selections[field.hiddenUntil]) return false;
    return !selections[field.key];
  }).length;
};

/** Retorna o total de campos visíveis no momento (independente de preenchidos ou não).
 *  Usado para exibir "X Escolha(s)" fixo no header, refletindo quantos itens existem naquele estado. */
export const countVisibleTalentChoices = (talentName: string, selections: Record<string, string> = {}): number => {
  const config = TALENT_CHOICES_CONFIG[talentName];
  if (!config) return 0;
  return config.fields.filter(field => {
    if (field.hiddenUntil && !selections[field.hiddenUntil]) return false;
    return true;
  }).length;
};

// --- Componente principal ---

interface TalentChoiceSectionProps {
  talentName: string;
  selections: Record<string, string>;
  onChange: (newSelections: Record<string, string>) => void;
  allSelections?: string[];
}

export const TalentChoiceSection: React.FC<TalentChoiceSectionProps> = ({ talentName, selections = {}, onChange, allSelections }) => {
  const config = TALENT_CHOICES_CONFIG[talentName];
  if (!config) return null;

  const isComplete = checkTalentComplete(talentName, selections);

  const handleChange = (key: string, value: string) => {
    const nextSelections = { ...selections, [key]: value };

    // Resetar campos dependentes e campos ocultados por este campo
    config.fields.forEach(f => {
      if (f.dependsOn === key) delete nextSelections[f.key];
      if (!value && f.hiddenUntil === key) delete nextSelections[f.key];
    });

    onChange(nextSelections);
  };

  return (
    <div style={{ 
      marginTop: '8px', 
      padding: '16px', 
      background: 'rgba(0,0,0,0.2)', 
      borderRadius: '8px',
      border: isComplete ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(249,115,22,0.3)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {config.fields.map(field => (
          <TalentChoiceField 
            key={field.key}
            field={field}
            selections={selections}
            onChange={(val) => handleChange(field.key, val)}
            allSelections={allSelections}
          />
        ))}
      </div>
    </div>
  );
};

// --- Componente de campo individual ---

interface TalentChoiceFieldProps {
  field: TalentField;
  selections: Record<string, string>;
  onChange: (value: string) => void;
  allSelections?: string[];
}

const TalentChoiceField: React.FC<TalentChoiceFieldProps> = ({ field, selections, onChange, allSelections }) => {
  const currentValue = selections[field.key] || "";
  
  // Lógica de dependência
  const isDependent = field.type === 'dependentSelect';
  const dependsOnValue = field.dependsOn ? selections[field.dependsOn] : null;
  const isDisabled = isDependent && !dependsOnValue;

  // Se o campo deve ficar oculto até que outro campo tenha valor
  if (field.hiddenUntil && !selections[field.hiddenUntil]) {
    return null;
  }
  let optionsToRender: string[] = [];
  if (field.options) {
    optionsToRender = field.options;
  } else if (field.optionsResolver) {
    optionsToRender = field.optionsResolver(selections);
  }

  // Filtrar opções já selecionadas em outros campos que compartilham exclusividade
  if (field.excludeSelectedFrom && field.excludeSelectedFrom.length > 0) {
    const selectedElsewhere = field.excludeSelectedFrom.map(otherKey => selections[otherKey]).filter(Boolean);
    optionsToRender = optionsToRender.filter(opt => !selectedElsewhere.includes(opt));
  }

  // Placeholder customizado
  const placeholderText = field.placeholder || (isDisabled ? `Necessita de ${field.dependsOn}` : 'Selecione...');

  // Verifica se o campo selecionado é uma magia (para tooltip)
  const isSpellField = field.isSpell && currentValue;

  // Texto de confirmação para atributo de conjuração
  const isAbilityField = field.key === 'spellcastingAbility' && currentValue;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
        {field.label}
      </label>

      {field.optionGroups ? (
        <select
          className="premium-select"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          title={isDisabled ? `Depende da escolha de: ${field.dependsOn}` : field.tooltip || ""}
        >
          <option value="">{placeholderText}</option>
          {field.optionGroups.map(group => {
            const selectedElsewhere = field.excludeSelectedFrom
              ? field.excludeSelectedFrom.map(otherKey => selections[otherKey]).filter(Boolean)
              : [];
            const visibleOptions = group.options.filter(opt => !selectedElsewhere.includes(opt));
            if (visibleOptions.length === 0) return null;
            return (
              <optgroup key={group.label} label={group.label}>
                {visibleOptions.map(opt => {
                  const isSelectedGlobally = allSelections?.includes(opt) && selections[field.key] !== opt;
                  return (
                    <option
                      key={opt}
                      value={opt}
                      className={isSelectedGlobally ? 'option-taken' : ''}
                    >
                      {isSelectedGlobally ? '✓ ' : ''}{opt}
                    </option>
                  );
                })}
              </optgroup>
            );
          })}
        </select>
      ) : (
        <select
          className="premium-select"
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          title={isDisabled ? `Depende da escolha de: ${field.dependsOn}` : field.tooltip || ""}
        >
          <option value="">{placeholderText}</option>
          {optionsToRender.map(opt => {
            const isSelectedInField = field.excludeSelectedFrom?.some(key => selections[key] === opt);
            const isSelectedGlobally = allSelections?.includes(opt) && selections[field.key] !== opt;
            return (
              <option 
                key={opt} 
                value={opt} 
                disabled={isSelectedInField}
                className={isSelectedGlobally ? 'option-taken' : ''}
              >
                {isSelectedGlobally ? '✓ ' : ''}{opt}
              </option>
            );
          })}
        </select>
      )}

      {/* Texto de confirmação para atributo de conjuração */}
      {isAbilityField && (
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '4px 0 0 0', fontStyle: 'italic' }}>
          <strong style={{ color: '#e2e8f0' }}>{currentValue}</strong> é sua habilidade de conjuração para as magias deste talento.
        </p>
      )}

      {/* Detalhes da magia selecionada em accordion */}
      {isSpellField && (
        <SpellDetailsAccordion spellName={currentValue} />
      )}
    </div>
  );
};
