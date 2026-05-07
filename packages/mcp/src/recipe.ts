import type { ComponentMetadata } from '@ncai/design-system-metadata-temp';
import { componentMetadata } from '@ncai/design-system-metadata-temp';

const recipeStopWords = new Set([
  'ui',
  'base',
  '디자인',
  '컴포넌트',
  '만들어줘',
  '만들어',
  '있는',
  '사용',
  '사용법',
  '필요',
  'simple',
  'component',
  'components'
]);

function normalizeRecipeWord(word: string) {
  return word
    .toLowerCase()
    .replace(/(으로|로|을|를|이|가|은|는|에|의|와|과|도|만|좀|요)$/u, '')
    .trim();
}

function tokenizeRecipeQuery(query: string) {
  return query
    .toLowerCase()
    .split(/[^0-9a-zA-Z가-힣-]+/)
    .map(normalizeRecipeWord)
    .filter((word) => word.length >= 2 && !recipeStopWords.has(word));
}

export function findRecipeCandidates(query: string): readonly ComponentMetadata[] {
  const normalizedQuery = query.toLowerCase();
  const queryWords = tokenizeRecipeQuery(query);

  return componentMetadata.filter((component) => {
    const componentName = component.name.toLowerCase();
    const keywords = [componentName, ...component.keywords.map((keyword) => keyword.toLowerCase())];
    const description = component.description.toLowerCase();

    return (
      normalizedQuery.includes(componentName) ||
      keywords.some(
        (keyword) => normalizedQuery.includes(keyword) || queryWords.some((queryWord) => keyword.includes(queryWord) || queryWord.includes(keyword))
      ) ||
      queryWords.some((queryWord) => description.includes(queryWord))
    );
  });
}
