import React from 'react';
import toolsData from '../data/tools.json';
import { MUSICAL_INSTRUMENTS, GAMING_SETS } from '../data/talentChoiceConfig';
import { ContextualOverlay } from './ui/ContextualOverlay';

interface ToolDetail {
  name: string;
  cost: string;
  weight: string;
  attribute: string;
  useObject: string;
  crafting?: string;
  variants?: string;
}

const TOOL_NAME_ALIASES: Record<string, string> = {
  'Ferramentas de Alvenaria': 'Ferramentas de Pedreiro',
  'Ferramentas de Calígrafo': 'Suprimentos de Calígrafo',
  'Ferramentas de Entalhador': 'Ferramentas de Entalhador',
  'Ferramentas de Pintor': 'Suprimentos de Pintor',
  'Ferramentas de Soprador de Vidro': 'Ferramentas de Vidreiro',
  'Ferramentas de Costureiro': 'Ferramentas de Tecelão',
  'Ferramentas de Trabalhador em Madeira': 'Ferramentas de Carpinteiro',
};

const toolIndex: Record<string, ToolDetail> = {};
(toolsData.artisanTools as ToolDetail[]).forEach(t => { toolIndex[t.name] = t; });
(toolsData.otherTools as ToolDetail[]).forEach(t => { toolIndex[t.name] = t; });

const resolveToolData = (toolName: string): { tool: ToolDetail; specificVariant?: string } | null => {
  const canonicalName = TOOL_NAME_ALIASES[toolName] ?? toolName;
  if (toolIndex[canonicalName]) return { tool: toolIndex[canonicalName] };
  if (MUSICAL_INSTRUMENTS.includes(toolName)) {
    const parent = toolIndex['Instrumento Musical'];
    if (parent) return { tool: parent, specificVariant: toolName };
  }
  if (GAMING_SETS.includes(toolName)) {
    const parent = toolIndex['Kit de Jogos'];
    if (parent) return { tool: parent, specificVariant: toolName };
  }
  return null;
};

export const ToolTooltip: React.FC<{ toolName: string; anchorRect?: DOMRect | null }> = ({ toolName, anchorRect }) => {
  const resolved = resolveToolData(toolName);
  if (!resolved) return null;

  const { tool, specificVariant } = resolved;
  const displayName = specificVariant ?? tool.name;
  const genericRule = (toolsData as any).rules?.['Proficiência com Ferramentas'] as string | undefined;

  return (
    <ContextualOverlay anchorRect={anchorRect} width={360} title={displayName}>
      {specificVariant && <div style={{ color: '#a1a1aa', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '10px' }}>{tool.name}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 14px', fontSize: '0.75rem', marginBottom: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
        <span style={{ color: '#64748b', fontWeight: 600 }}>Atributo:</span><span style={{ color: '#e2e8f0' }}>{tool.attribute}</span>
        <span style={{ color: '#64748b', fontWeight: 600 }}>Custo:</span><span style={{ color: '#e2e8f0' }}>{tool.cost}</span>
        <span style={{ color: '#64748b', fontWeight: 600 }}>Peso:</span><span style={{ color: '#e2e8f0' }}>{tool.weight}</span>
      </div>
      <Section title="Uso com proficiência">{tool.useObject}</Section>
      {tool.crafting ? <Section title="Artesanato">{tool.crafting}</Section> : null}
      {tool.variants && !specificVariant ? <Section title="Variantes">{tool.variants}</Section> : null}
      {genericRule ? <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '8px', marginTop: '4px', color: '#475569', fontSize: '0.7rem', lineHeight: 1.5, fontStyle: 'italic' }}>{genericRule}</div> : null}
    </ContextualOverlay>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{title}</div>
      <div style={{ color: '#cbd5e1', fontSize: '0.78rem', lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}
