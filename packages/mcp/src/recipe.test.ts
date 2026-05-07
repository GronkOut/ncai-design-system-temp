import { describe, expect, test } from 'vitest';
import { findRecipeCandidates } from './recipe';

describe('findRecipeCandidates', () => {
  test('matches Korean checkbox requests through metadata keywords', () => {
    const candidates = findRecipeCandidates('체크박스가 있는 동의 UI를 만들어줘');

    expect(candidates.map((component) => component.name)).toContain('Checkbox');
  });

  test('does not match unrelated generic UI requests', () => {
    const candidates = findRecipeCandidates('카드 UI 만들어줘');

    expect(candidates).toHaveLength(0);
  });
});
