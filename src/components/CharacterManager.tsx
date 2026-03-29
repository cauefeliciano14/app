import { useState, useEffect } from 'react';
import {
  listSavedCharacters,
  loadSavedCharacter,
  saveCharacter,
  deleteCharacter,
  type SavedCharacterMeta,
  type SavedCharacter,
  CREATION_STORAGE_KEY,
  CREATION_STATE_VERSION,
} from '../utils/persistence';
import styles from './CharacterManager.module.css';

interface CharacterManagerProps {
  /** Current character state to offer "Save" */
  currentCharacter: {
    name: string;
    className: string;
    speciesName: string;
    level: number;
    portrait: string | null;
  } | null;
  onSaveCurrent: (id: string) => void;
  onLoadCharacter: (saved: SavedCharacter) => void;
  onNewCharacter: () => void;
}

export function CharacterManager({
  currentCharacter,
  onSaveCurrent,
  onLoadCharacter,
  onNewCharacter,
}: CharacterManagerProps) {
  const [open, setOpen] = useState(false);
  const [characters, setCharacters] = useState<SavedCharacterMeta[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (open) setCharacters(listSavedCharacters());
  }, [open]);

  const handleSave = () => {
    if (!currentCharacter) return;
    const id = `char-${Date.now()}`;
    // Read current creation state
    let creationSnapshot: any = null;
    try {
      const raw = localStorage.getItem(CREATION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.version === CREATION_STATE_VERSION) creationSnapshot = parsed;
      }
    } catch { /* ignore */ }

    let playState: any = null;
    try {
      const raw = localStorage.getItem('dnd_play_state');
      if (raw) playState = JSON.parse(raw);
    } catch { /* ignore */ }

    const saved: SavedCharacter = {
      id,
      name: currentCharacter.name || 'Personagem sem nome',
      className: currentCharacter.className,
      speciesName: currentCharacter.speciesName,
      level: currentCharacter.level,
      portrait: currentCharacter.portrait,
      savedAt: Date.now(),
      creationSnapshot,
      playState,
    };
    saveCharacter(saved);
    onSaveCurrent(id);
    setCharacters(listSavedCharacters());
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleLoad = (meta: SavedCharacterMeta) => {
    const saved = loadSavedCharacter(meta.id);
    if (saved) {
      onLoadCharacter(saved);
      setOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteCharacter(id);
    setCharacters(listSavedCharacters());
    setConfirmDelete(null);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className={styles.openBtn} title="Gerenciar Personagens">
        👥 Personagens
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <div className={styles.title}>GERENCIADOR DE PERSONAGENS</div>
              <button onClick={() => setOpen(false)} className={styles.closeBtn}>✕</button>
            </div>

            <div className={styles.actions}>
              <button onClick={handleSave} className={`${styles.actionBtn} ${savedFlash ? styles.savedFlash : ''}`}>
                {savedFlash ? '✓ Salvo!' : '💾 Salvar Personagem Atual'}
              </button>
              <button onClick={() => { onNewCharacter(); setOpen(false); }} className={styles.actionBtnSecondary}>
                ＋ Novo Personagem
              </button>
            </div>

            <div className={styles.listTitle}>PERSONAGENS SALVOS ({characters.length})</div>

            {characters.length === 0 ? (
              <div className={styles.empty}>Nenhum personagem salvo ainda.</div>
            ) : (
              <div className={styles.list}>
                {[...characters].sort((a, b) => b.savedAt - a.savedAt).map(meta => (
                  <div key={meta.id} className={styles.charRow}>
                    <div className={styles.charPortrait}>
                      {meta.portrait ? (
                        <img src={`/imgs/portrait_caracter/${meta.portrait}`} alt={meta.name} className={styles.portraitImg} />
                      ) : (
                        <span className={styles.portraitFallback}>🧙</span>
                      )}
                    </div>
                    <div className={styles.charInfo}>
                      <div className={styles.charName}>{meta.name || 'Sem nome'}</div>
                      <div className={styles.charMeta}>
                        Nível {meta.level} · {meta.className || '—'} · {meta.speciesName || '—'}
                      </div>
                      <div className={styles.charDate}>
                        {new Date(meta.savedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className={styles.charActions}>
                      <button onClick={() => handleLoad(meta)} className={styles.loadBtn}>Carregar</button>
                      {confirmDelete === meta.id ? (
                        <div className={styles.confirmRow}>
                          <span className={styles.confirmText}>Deletar?</span>
                          <button onClick={() => handleDelete(meta.id)} className={styles.confirmYes}>Sim</button>
                          <button onClick={() => setConfirmDelete(null)} className={styles.confirmNo}>Não</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(meta.id)} className={styles.deleteBtn}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
