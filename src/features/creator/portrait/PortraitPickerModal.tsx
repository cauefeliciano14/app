import { PORTRAITS } from '../../../data/portraits';

interface PortraitPickerModalProps {
  currentPortrait: string | null;
  onClose: () => void;
  onSelect: (portrait: string) => void;
}

export function PortraitPickerModal({ currentPortrait, onClose, onSelect }: PortraitPickerModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="portrait-picker-modal"
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

        <div className="portrait-picker-tip">
          Dica: escolha a imagem que melhor representa o conceito atual do personagem; isso não altera classe, origem nem atributos.
        </div>

        <div className="portrait-grid">
          {PORTRAITS.map((portrait) => (
            <button
              type="button"
              key={portrait}
              className={`portrait-item ${currentPortrait === portrait ? 'selected' : ''}`}
              onClick={() => onSelect(portrait)}
              aria-pressed={currentPortrait === portrait}
            >
              <img src={`/imgs/portrait_caracter/${portrait}`} alt={portrait} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
