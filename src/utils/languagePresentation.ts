import languagesData from '../data/languages.json';


const LANGUAGE_NAME_BY_ID = new Map<string, string>(
  Object.values(languagesData)
    .flat()
    .map((language) => [language.id, language.name]),
);

/**
 * Converte IDs internos do motor de regras em nomes exibíveis na interface.
 * Mantém o valor original quando não houver tradução cadastrada.
 */
export function getLanguageDisplayName(languageId: string): string {
  return LANGUAGE_NAME_BY_ID.get(languageId) ?? languageId;
}

export function getLanguageDisplayNames(languageIds: string[]): string[] {
  return languageIds.map(getLanguageDisplayName);
}
