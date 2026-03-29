import { useState, useMemo, useRef, useEffect } from 'react';
import { PORTRAITS } from '../../../data/portraits';
import { ModalSurface } from '../../../components/ui/ModalSurface';

interface PortraitPickerModalProps {
  currentPortrait: string | null;
  onClose: () => void;
  onSelect: (portrait: string) => void;
}

type SpeciesFilter = 'all' | 'human' | 'elf' | 'dwarf' | 'dragonborn' | 'tiefling' | 'halfling' | 'gnome' | 'orc' | 'aasimar' | 'goliath' | 'other';

const SPECIES_FILTERS: { value: SpeciesFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'human', label: 'Humano' },
  { value: 'elf', label: 'Elfo' },
  { value: 'dwarf', label: 'Anão' },
  { value: 'dragonborn', label: 'Draconato' },
  { value: 'tiefling', label: 'Tiferino' },
  { value: 'halfling', label: 'Halfling' },
  { value: 'gnome', label: 'Gnomo' },
  { value: 'orc', label: 'Orc' },
  { value: 'aasimar', label: 'Aasimar' },
  { value: 'goliath', label: 'Golias' },
  { value: 'other', label: 'Outros' },
];

const SPECIES_KEYWORDS: Record<Exclude<SpeciesFilter, 'all' | 'other'>, string[]> = {
  human: ['human'],
  elf: ['elf', 'eladrin', 'drow'],
  dwarf: ['dwarf'],
  dragonborn: ['dragonborn'],
  tiefling: ['tiefling'],
  halfling: ['halfling'],
  gnome: ['gnome'],
  orc: ['orc'],
  aasimar: ['aasimar'],
  goliath: ['goliath'],
};

function getPortraitSpecies(filename: string): SpeciesFilter {
  const lower = filename.toLowerCase().replace(/[-_]+/g, ' ');
  for (const [species, keywords] of Object.entries(SPECIES_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return species as SpeciesFilter;
  }
  // Numeric filenames are uncategorized
  if (/^\d+\.\w+$/.test(filename)) return 'other';
  return 'other';
}

export function PortraitPickerModal({ currentPortrait, onClose, onSelect }: PortraitPickerModalProps) {
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const selectedRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filteredPortraits = useMemo(() => {
    return PORTRAITS.filter((portrait) => {
      if (speciesFilter !== 'all' && getPortraitSpecies(portrait) !== speciesFilter) return false;
      if (searchQuery) {
        const readable = portrait.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').toLowerCase();
        return readable.includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [speciesFilter, searchQuery]);

  // Scroll to selected portrait on mount
  useEffect(() => {
    if (selectedRef.current && gridRef.current) {
      const timer = setTimeout(() => {
        selectedRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const speciesCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of PORTRAITS) {
      const sp = getPortraitSpecies(p);
      counts[sp] = (counts[sp] ?? 0) + 1;
    }
    counts['all'] = PORTRAITS.length;
    return counts;
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <ModalSurface
        role="dialog"
        aria-modal="true"
        aria-labelledby="portrait-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="portrait-picker-header">
          <div>
            <h2 id="portrait-picker-title">Escolha seu retrato</h2>
            <p>
              Use esta seleção apenas para a identidade visual. Você pode trocar o retrato a qualquer momento clicando na miniatura do personagem.
            </p>
          </div>
          <button type="button" className="portrait-picker-close" onClick={onClose} aria-label="Fechar seleção de retrato">
            ×
          </button>
        </div>

        {/* ── Search & Filters ── */}
        <div className="portrait-filters">
          <input
            type="text"
            className="portrait-search"
            placeholder="Buscar retrato..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar retrato"
          />
          <div className="portrait-filter-pills">
            {SPECIES_FILTERS.map((sf) => {
              const count = speciesCountMap[sf.value] ?? 0;
              if (count === 0 && sf.value !== 'all') return null;
              return (
                <button
                  key={sf.value}
                  type="button"
                  className={`portrait-filter-pill ${speciesFilter === sf.value ? 'active' : ''}`}
                  onClick={() => setSpeciesFilter(sf.value)}
                >
                  {sf.label}
                  <span className="portrait-filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="portrait-grid" ref={gridRef}>
          {filteredPortraits.length === 0 ? (
            <div className="portrait-empty">
              Nenhum retrato encontrado para este filtro.
            </div>
          ) : (
            filteredPortraits.map((portrait) => (
              <button
                type="button"
                key={portrait}
                ref={currentPortrait === portrait ? selectedRef : undefined}
                className={`portrait-item ${currentPortrait === portrait ? 'selected' : ''}`}
                onClick={() => onSelect(portrait)}
                aria-pressed={currentPortrait === portrait}
              >
                <img
                  src={`/imgs/portrait_caracter/${portrait}`}
                  alt={`Opção de retrato ${portrait.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')}`}
                  loading="lazy"
                />
              </button>
            ))
          )}
        </div>
      </ModalSurface>
    </div>
  );
}
