import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './OnboardingModal.module.css';

const ONBOARDING_KEY = 'dnd_onboarding_seen';

interface Step {
  title: string;
  body: string;
  icon: string;
}

const STEPS: Step[] = [
  {
    icon: '⚔️',
    title: 'Bem-vindo ao Criador de Personagens',
    body: 'Crie personagens completos de D&D 5e (2024) em poucos minutos. Tudo é salvo automaticamente no seu navegador — você pode fechar e voltar a qualquer momento.',
  },
  {
    icon: '📋',
    title: '6 Etapas Guiadas',
    body: 'Siga as etapas na ordem: Classe, Antecedente, Espécie, Atributos, Equipamento e Ficha Final. Use a barra lateral para navegar entre elas e o resumo à direita para acompanhar suas escolhas.',
  },
  {
    icon: '🎲',
    title: 'Ficha Interativa',
    body: 'Na etapa final você terá sua ficha completa: role dados, gerencie vida, equipamento, magias e muito mais. Clique nos valores para editá-los e use a aba de ações para combate.',
  },
  {
    icon: '💾',
    title: 'Múltiplos Personagens',
    body: 'Use o botão "Personagens" no canto superior para salvar, carregar e alternar entre diferentes personagens. Cada um mantém seu próprio progresso e estado de jogo.',
  },
];

export function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return createPortal(
    <>
      <div className={styles.backdrop} onClick={dismiss} />
      <div className={styles.panel} role="dialog" aria-modal="true">
        <button className={styles.skipBtn} onClick={dismiss}>Pular</button>

        <div className={styles.icon}>{current.icon}</div>
        <h2 className={styles.title}>{current.title}</h2>
        <p className={styles.body}>{current.body}</p>

        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={i === step ? styles.dotActive : styles.dot}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div className={styles.actions}>
          {step > 0 && (
            <button className={styles.secondaryBtn} onClick={prev}>Voltar</button>
          )}
          <button className={styles.primaryBtn} onClick={next}>
            {isLast ? 'Começar!' : 'Próximo'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
