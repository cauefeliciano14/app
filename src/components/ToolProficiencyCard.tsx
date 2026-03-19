import React, { useState } from 'react';
import { BACKGROUND_TOOL_SELECTORS } from '../data/backgroundToolSelectors';
import { ToolTooltip } from './ToolTooltip';
import css from './ToolProficiencyCard.module.css';

export interface ToolProficiencyCardProps {
  selectedBackground: any;
  toolChoice: string;
  onToolChoiceChange: (val: string) => void;
}

export const ToolProficiencyCard: React.FC<ToolProficiencyCardProps> = ({
  selectedBackground,
  toolChoice,
  onToolChoiceChange,
}) => {
  const [hovered, setHovered] = useState(false);
  const [hoveredToolRect, setHoveredToolRect] = useState<DOMRect | null>(null);
  const selector = BACKGROUND_TOOL_SELECTORS[selectedBackground.id];
  const isSelectable = !!selector;
  const displayedToolName = isSelectable ? toolChoice : selectedBackground.toolProficiency;
  const isIncomplete = isSelectable && !toolChoice;

  return (
    <div className={`${css.card} ${isIncomplete ? css.cardIncomplete : ''}`}>
      {/* Title row with optional ! badge */}
      <div className={css.titleRow}>
        {isIncomplete && (
          <span className={css.incompleteBadge}>!</span>
        )}
        <span className={css.titleText}>
          Proficiências em Ferramentas
        </span>
      </div>

      {/* Dropdown for selectable origins */}
      {isSelectable && (
        <select
          className="premium-select"
          value={toolChoice}
          onChange={(e) => onToolChoiceChange(e.target.value)}
          style={{ fontSize: '0.85rem', width: '100%' }}
        >
          <option value="">— Escolha {selector.label} —</option>
          {selector.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {/* Hoverable chip with tooltip */}
      {displayedToolName && (
        <div
          className={css.toolChipWrapper}
          onMouseEnter={(e) => { setHovered(true); setHoveredToolRect(e.currentTarget.getBoundingClientRect()); }}
          onMouseLeave={() => { setHovered(false); setHoveredToolRect(null); }}
        >
          <span className={css.toolChip}>
            {displayedToolName}
          </span>
          {hovered && <ToolTooltip toolName={displayedToolName} anchorRect={hoveredToolRect} />}
        </div>
      )}
    </div>
  );
};
