import React from 'react';
import { createPortal } from 'react-dom';
import toolsData from '../data/tools.json';
import { MUSICAL_INSTRUMENTS, GAMING_SETS } from '../data/talentChoiceConfig';

interface ToolDetail {
  name: string;
  cost: string;
  weight: string;
  attribute: string;
  useObject: string;
  crafting?: string;
  variants?: string;
}

// Maps display names used in ARTISAN_TOOLS list → canonical names in tools.json
const TOOL_NAME_ALIASES: Record<string, string> = {
  "Ferramentas de Alvenaria": "Ferramentas de Pedreiro",
  "Ferramentas de Calígrafo": "Suprimentos de Calígrafo",
  "Ferramentas de Entalhador": "Ferramentas de Entalhador",
  "Ferramentas de Pintor": "Suprimentos de Pintor",
  "Ferramentas de Soprador de Vidro": "Ferramentas de Vidreiro",
  "Ferramentas de Costureiro": "Ferramentas de Tecelão",
  "Ferramentas de Trabalhador em Madeira": "Ferramentas de Carpinteiro",
};

const toolIndex: Record<string, ToolDetail> = {};
(toolsData.artisanTools as ToolDetail[]).forEach(t => { toolIndex[t.name] = t; });
(toolsData.otherTools as ToolDetail[]).forEach(t => { toolIndex[t.name] = t; });

const resolveToolData = (
  toolName: string
): { tool: ToolDetail; specificVariant?: string } | null => {
  // Alias resolution first
  const canonicalName = TOOL_NAME_ALIASES[toolName] ?? toolName;

  // Direct match
  if (toolIndex[canonicalName]) {
    return { tool: toolIndex[canonicalName] };
  }

  // Musical instrument variant → use parent "Instrumento Musical" data
  if (MUSICAL_INSTRUMENTS.includes(toolName)) {
    const parent = toolIndex["Instrumento Musical"];
    if (parent) return { tool: parent, specificVariant: toolName };
  }

  // Gaming set variant → use parent "Kit de Jogos" data
  if (GAMING_SETS.includes(toolName)) {
    const parent = toolIndex["Kit de Jogos"];
    if (parent) return { tool: parent, specificVariant: toolName };
  }

  return null;
};

export const ToolTooltip: React.FC<{ toolName: string; anchorRect?: DOMRect | null }> = ({ toolName }) => {
  const resolved = resolveToolData(toolName);
  if (!resolved) return null;

  const { tool, specificVariant } = resolved;
  const displayName = specificVariant ?? tool.name;
  const genericRule = (toolsData as any).rules?.["Proficiência com Ferramentas"] as string | undefined;

  return createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, pointerEvents: 'none' }} />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(17, 18, 24, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(249,115,22,0.4)',
        borderRadius: '12px',
        padding: '16px 20px',
        minWidth: '300px',
        maxWidth: '380px',
        zIndex: 9999,
        boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 20px rgba(249,115,22,0.12)',
        pointerEvents: 'none',
        animation: 'tooltipFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        <style>{`
          @keyframes tooltipFadeIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}</style>

        {/* Header */}
        <div style={{ marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <div style={{ color: '#f97316', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
            {displayName}
          </div>
          {specificVariant && (
            <div style={{ color: '#a1a1aa', fontSize: '0.75rem', fontStyle: 'italic', marginTop: '2px' }}>
              {tool.name}
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 14px', fontSize: '0.75rem', marginBottom: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Atributo:</span>
          <span style={{ color: '#e2e8f0' }}>{tool.attribute}</span>

          <span style={{ color: '#64748b', fontWeight: 600 }}>Custo:</span>
          <span style={{ color: '#e2e8f0' }}>{tool.cost}</span>

          <span style={{ color: '#64748b', fontWeight: 600 }}>Peso:</span>
          <span style={{ color: '#e2e8f0' }}>{tool.weight}</span>
        </div>

        {/* Proficiency use */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>Uso com Proficiência</div>
          <div style={{ color: '#cbd5e1', fontSize: '0.78rem', lineHeight: 1.5 }}>{tool.useObject}</div>
        </div>

        {/* Crafting */}
        {tool.crafting && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>Artesanato</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', lineHeight: 1.5 }}>{tool.crafting}</div>
          </div>
        )}

        {/* Variants (shown only when NOT a specific variant) */}
        {tool.variants && !specificVariant && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>Variantes</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', lineHeight: 1.5 }}>{tool.variants}</div>
          </div>
        )}

        {/* Generic rule footer */}
        {genericRule && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '8px', marginTop: '4px', color: '#475569', fontSize: '0.7rem', lineHeight: 1.5, fontStyle: 'italic' }}>
            {genericRule}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
