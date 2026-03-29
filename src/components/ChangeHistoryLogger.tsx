import { useEffect, useRef } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { useChangeHistory } from '../context/ChangeHistoryContext';

/**
 * Componente headless que observa mudanças no personagem e registra no histórico.
 * Deve ser renderizado dentro dos providers CharacterProvider e ChangeHistoryProvider.
 */
export function ChangeHistoryLogger() {
  const { character, selectedBackground } = useCharacter();
  const { logChange } = useChangeHistory();

  const prevClassRef = useRef<string | null>(null);
  const prevBgRef = useRef<string | null>(null);
  const prevSpeciesRef = useRef<string | null>(null);
  const prevNameRef = useRef<string>('');
  const prevPortraitRef = useRef<string | null>(null);
  const prevMethodRef = useRef<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      // Inicializa as refs sem logar
      prevClassRef.current = character.characterClass?.id ?? null;
      prevBgRef.current = selectedBackground?.id ?? null;
      prevSpeciesRef.current = character.species?.id ?? null;
      prevNameRef.current = character.name;
      prevPortraitRef.current = character.portrait;
      prevMethodRef.current = character.attributes.method;
      isFirstRender.current = false;
      return;
    }

    const classId = character.characterClass?.id ?? null;
    const bgId = selectedBackground?.id ?? null;
    const speciesId = character.species?.id ?? null;

    if (classId !== prevClassRef.current) {
      if (classId) {
        logChange({
          type: 'class',
          description: `Classe alterada para ${character.characterClass?.name ?? classId}`,
          previous: prevClassRef.current ?? undefined,
          current: classId,
        });
      }
      prevClassRef.current = classId;
    }

    if (bgId !== prevBgRef.current) {
      if (bgId) {
        logChange({
          type: 'background',
          description: `Origem alterada para ${selectedBackground?.name ?? bgId}`,
          previous: prevBgRef.current ?? undefined,
          current: bgId,
        });
      }
      prevBgRef.current = bgId;
    }

    if (speciesId !== prevSpeciesRef.current) {
      if (speciesId) {
        logChange({
          type: 'species',
          description: `Espécie alterada para ${character.species?.name ?? speciesId}`,
          previous: prevSpeciesRef.current ?? undefined,
          current: speciesId,
        });
      }
      prevSpeciesRef.current = speciesId;
    }

    if (character.name !== prevNameRef.current && character.name) {
      logChange({
        type: 'name',
        description: `Nome definido como "${character.name}"`,
        previous: prevNameRef.current || undefined,
        current: character.name,
      });
      prevNameRef.current = character.name;
    }

    if (character.portrait !== prevPortraitRef.current && character.portrait) {
      logChange({
        type: 'portrait',
        description: 'Retrato do personagem atualizado',
      });
      prevPortraitRef.current = character.portrait;
    }

    if (character.attributes.method !== prevMethodRef.current && character.attributes.method) {
      const labels: Record<string, string> = {
        standard: 'Conjunto Padrão',
        random: 'Geração Aleatória',
        pointBuy: 'Custo de Pontos',
      };
      logChange({
        type: 'attribute',
        description: `Método de atributos: ${labels[character.attributes.method] ?? character.attributes.method}`,
        previous: prevMethodRef.current ?? undefined,
        current: character.attributes.method,
      });
      prevMethodRef.current = character.attributes.method;
    }
  }, [
    character.characterClass?.id,
    selectedBackground?.id,
    character.species?.id,
    character.name,
    character.portrait,
    character.attributes.method,
    character.characterClass?.name,
    character.species?.name,
    selectedBackground?.name,
    logChange,
  ]);

  return null;
}
