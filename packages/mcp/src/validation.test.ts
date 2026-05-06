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
});
