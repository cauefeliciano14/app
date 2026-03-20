import { useMemo } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import classDetailsData from '../../data/classDetails.json';
import { CLASS_HP_DATA, CLASS_PROFICIENCY_DATA } from '../../rules/data/classRules';
import styles from './ChoiceImpact.module.css';

interface ImpactItem {
  icon: string;
  text: string;
}

const SPELL_ATTR_LABELS: Record<string, string> = {
  inteligencia: 'Inteligência',
  sabedoria: 'Sabedoria',
  carisma: 'Carisma',
};

function modStr(score: number): string {
  const m = Math.floor((score - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
}

interface Props {
  step: number;
}

export function ChoiceImpact({ step }: Props) {
  const { character, derivedSheet } = useCharacter();

  const items = useMemo((): ImpactItem[] | null => {
    switch (step) {
      case 0: {
        if (!character.characterClass) return null;
        const classId = character.characterClass.id;
        const hpData = CLASS_HP_DATA[classId];
        const profData = CLASS_PROFICIENCY_DATA[classId];
        const details = (classDetailsData as Record<string, any>)[classId];
        const traits: Record<string, string> = details?.basicTraits ?? {};
        const result: ImpactItem[] = [];

        if (hpData) result.push({ icon: '♥', text: `Dado de Vida: ${hpData.hitDieLabel}` });
        if (traits['Atributo Primário']) result.push({ icon: '⚡', text: `Atributo-chave: ${traits['Atributo Primário']}` });
        if (derivedSheet.maxHP > 0) result.push({ icon: '❤', text: `PV no nível 1: ${derivedSheet.maxHP}` });
        if (profData?.skillChoiceCount) {
          result.push({ icon: '◆', text: `Perícias: ${profData.skillChoiceCount} à escolher` });
        }
        if (derivedSheet.isCaster) {
          const abilityLabel = derivedSheet.spellcastingAbility
            ? (SPELL_ATTR_LABELS[derivedSheet.spellcastingAbility] ?? derivedSheet.spellcastingAbility)
            : null;
          if (abilityLabel) result.push({ icon: '✦', text: `Conjuração: ${abilityLabel}` });
          if (derivedSheet.spellSaveDC) result.push({ icon: '✦', text: `CD de magia: ${derivedSheet.spellSaveDC}` });
        }
        if (profData?.savingThrows?.length) {
          result.push({ icon: '🛡', text: `Salvaguardas: ${profData.savingThrows.join(' e ')}` });
        }
        return result.slice(0, 6);
      }

      case 2: {
        if (!character.species) return null;
        const result: ImpactItem[] = [];

        if (derivedSheet.languages.length > 0) {
          result.push({ icon: '💬', text: `Idiomas: ${derivedSheet.languages.length} conhecidos` });
        }
        if (derivedSheet.specialSenses.length > 0) {
          result.push({ icon: '👁', text: derivedSheet.specialSenses.join(', ') });
        }
        if (derivedSheet.speed) {
          result.push({ icon: '→', text: `Deslocamento: ${derivedSheet.speed}` });
        }
        if (derivedSheet.racialCantrips.length > 0) {
          result.push({ icon: '✦', text: `Truques: ${derivedSheet.racialCantrips.join(', ')}` });
        }
        if (derivedSheet.derivedDefenses.length > 0) {
          result.push({ icon: '🛡', text: derivedSheet.derivedDefenses.slice(0, 2).join(', ') });
        }
        return result.slice(0, 6);
      }

      case 3: {
        const { finalAttributes, modifiers, proficiencyBonus } = derivedSheet;
        if (!finalAttributes || Object.keys(finalAttributes).length === 0) return null;
        const result: ImpactItem[] = [];

        result.push({ icon: '⚡', text: `Bônus de proficiência: +${proficiencyBonus}` });
        result.push({ icon: '💪', text: `FOR ${finalAttributes.forca} (${modStr(finalAttributes.forca)})  DES ${finalAttributes.destreza} (${modStr(finalAttributes.destreza)})  CON ${finalAttributes.constituicao} (${modStr(finalAttributes.constituicao)})` });
        result.push({ icon: '🧠', text: `INT ${finalAttributes.inteligencia} (${modStr(finalAttributes.inteligencia)})  SAB ${finalAttributes.sabedoria} (${modStr(finalAttributes.sabedoria)})  CAR ${finalAttributes.carisma} (${modStr(finalAttributes.carisma)})` });

        if (derivedSheet.initiative !== undefined) {
          const initStr = derivedSheet.initiative >= 0 ? `+${derivedSheet.initiative}` : String(derivedSheet.initiative);
          result.push({ icon: '🎲', text: `Iniciativa: ${initStr}` });
        }
        if (modifiers?.constituicao !== undefined) {
          result.push({ icon: '❤', text: `PV máximo: ${derivedSheet.maxHP}` });
        }
        return result.slice(0, 5);
      }

      case 4: {
        const result: ImpactItem[] = [];
        result.push({ icon: '🛡', text: `CA atual: ${derivedSheet.armorClass}` });

        if (derivedSheet.weaponAttacks.length > 0) {
          const atk = derivedSheet.weaponAttacks[0];
          const bonus = atk.attackBonus >= 0 ? `+${atk.attackBonus}` : String(atk.attackBonus);
          result.push({ icon: '⚔', text: `${atk.weaponName}: ${bonus} para acertar, ${atk.damageDice}` });
          if (derivedSheet.weaponAttacks.length > 1) {
            result.push({ icon: '⚔', text: `+${derivedSheet.weaponAttacks.length - 1} outra${derivedSheet.weaponAttacks.length > 2 ? 's' : ''} arma${derivedSheet.weaponAttacks.length > 2 ? 's' : ''}` });
          }
        }
        if (derivedSheet.armorProficiencies.length > 0) {
          result.push({ icon: '◆', text: `Prof. armadura: ${derivedSheet.armorProficiencies.slice(0, 2).join(', ')}` });
        }
        return result.slice(0, 5);
      }

      default:
        return null;
    }
  }, [step, character.characterClass, character.species, derivedSheet]);

  if (!items || items.length === 0) return null;

  return (
    <div className={styles.block}>
      <div className={styles.title}>Impacto desta escolha</div>
      <ul className={styles.list}>
        {items.map((item, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.text}>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
