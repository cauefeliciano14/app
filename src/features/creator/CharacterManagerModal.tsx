import React, { useMemo } from 'react';
import { listSavedCharacters, deleteCharacter, loadSavedCharacter } from '../../utils/persistence';
import type { SavedCharacterMeta } from '../../utils/persistence';
import { useCharacter } from '../../context/CharacterContext';
import { useWizard } from '../../context/WizardContext';
import styles from './CharacterManagerModal.module.css';
import { useSound } from '../../context/SoundContext';

interface CharacterManagerModalProps {
  onClose: () => void;
}

export function CharacterManagerModal({ onClose }: CharacterManagerModalProps) {
  const characters = listSavedCharacters();
  const { activeCharacterId, handleLoadCharacter, handleResetCharacter } = useCharacter();
  const { setCurrentStep } = useWizard();
  const { playSound } = useSound();

  const handleCreateNew = () => {
    playSound('paper-turn');
    handleResetCharacter();
    setCurrentStep(0);
    onClose();
  };

  const handleLoad = (meta: SavedCharacterMeta) => {
    const fullChar = loadSavedCharacter(meta.id);
    if (fullChar) {
      playSound('success');
      handleLoadCharacter(fullChar);
      setCurrentStep(fullChar.creationSnapshot.currentStep ?? 0);
      onClose();
    }
  };

  const handleDelete = (e: React.MouseEvent, meta: SavedCharacterMeta) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja apagar ${meta.name || 'este personagem'}? Isso não pode ser desfeito.`)) {
      deleteCharacter(meta.id);
      if (activeCharacterId === meta.id) {
        handleResetCharacter();
        setCurrentStep(0);
      }
      playSound('paper-turn');
    }
  };

  // Sort by savedAt descending
  const sorted = useMemo(() => {
    return [...characters].sort((a, b) => b.savedAt - a.savedAt);
  }, [characters, handleDelete]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Gerenciador de Personagens</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.actionBar}>
          <button className={styles.newCharBtn} onClick={handleCreateNew}>
            ✦ Criar Novo Personagem
          </button>
        </div>

        {sorted.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⚔️</div>
            Gere ou crie um novo personagem para vê-lo aqui.
          </div>
        ) : (
          <div className={styles.grid}>
            {sorted.map((c) => {
              const isActive = activeCharacterId === c.id;
              const dateCreated = new Date(c.savedAt).toLocaleDateString('pt-BR');
              const timeCreated = new Date(c.savedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={c.id} className={`${styles.card} ${isActive ? styles.cardActive : ''}`} onClick={() => handleLoad(c)}>
                  <div className={styles.cardVisual}>
                    {c.portrait ? (
                      <img src={c.portrait} alt={c.name} className={styles.cardPortrait} />
                    ) : (
                      <div className={styles.cardPortraitFallback}>?</div>
                    )}
                    {isActive && <div className={styles.activeBadge}>Sessão Atual</div>}
                  </div>
                  
                  <div className={styles.cardInfo}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardName}>{c.name || 'Herói sem Nome'}</span>
                    </div>
                    
                    <div className={styles.cardMetaItems}>
                      <span className={styles.metaChip}>NV {c.level || 1}</span>
                      <span className={styles.metaChip}>{c.className || 'Aventureiro'}</span>
                      <span className={styles.metaChip}>{c.speciesName || 'Convidado'}</span>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.cardDate}>Salvo em {dateCreated} às {timeCreated}</span>
                      <button className={styles.deleteBtn} onClick={(e) => handleDelete(e, c)} title="Apagar personagem">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
