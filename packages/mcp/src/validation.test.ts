import { describe, expect, test } from 'vitest';
import { validateUiCode } from './validation';

describe('validateUiCode', () => {
  test('allows approved Checkbox usage', () => {
    const result = validateUiCode("import { Checkbox } from '@ncai/design-system-temp';\n<Checkbox aria-label=\"항목 선택\" />");

    expect(result.valid).toBe(true);
  });

  test('blocks raw Base UI and arbitrary styles', () => {
    const result = validateUiCode(
      "import { Checkbox } from '@base-ui/react/checkbox';\n<div className=\"bg-[#fff]\" style={{ color: '#fff' }} />"
    );

    expect(result.valid).toBe(false);
    expect(result.findings.some((finding) => finding.severity === 'error')).toBe(true);
  });

  test('detects standard Tailwind color classes', () => {
    const result = validateUiCode('<div className="bg-slate-100 text-red-500" />');

    expect(result.valid).toBe(false);
    expect(result.findings.some((finding) => finding.message.includes('표준 Tailwind 색상 클래스'))).toBe(true);
  });

  test('warns on conditional className composition', () => {
    const result = validateUiCode("<div className={isDanger ? 'text-red-500' : 'text-slate-900'} />");

    expect(result.valid).toBe(false);
    expect(result.findings.some((finding) => finding.message.includes('조건부 className'))).toBe(true);
  });

  test('warns on className helper composition', () => {
    const result = validateUiCode("<div className={clsx('layout-hook', isDanger && 'bg-red-500')} />");

    expect(result.valid).toBe(false);
    expect(result.findings.some((finding) => finding.message.includes('조건부 className'))).toBe(true);
  });

  test('warns on CSS module className usage', () => {
    const result = validateUiCode('<div className={styles.danger} />');

    expect(result.valid).toBe(false);
    expect(result.findings.some((finding) => finding.message.includes('CSS module'))).toBe(true);
  });

  test('warns on Tailwind spacing utilities that may bypass tokens', () => {
    const result = validateUiCode('<div className="p-4 rounded-lg shadow-md" />');

    expect(result.valid).toBe(false);
    expect(result.findings.some((finding) => finding.message.includes('Tailwind spacing'))).toBe(true);
  });
});
