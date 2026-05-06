import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { expect, test } from 'vitest';
import { Checkbox } from './Checkbox';
import type { CheckboxProps } from './Checkbox';

test('renders an accessible checkbox', () => {
  render(<Checkbox aria-label="항목 선택" />);

  expect(screen.getByRole('checkbox', { name: '항목 선택' })).toBeInTheDocument();
});

test('supports uncontrolled checked interaction', async () => {
  const user = userEvent.setup();
  render(<Checkbox aria-label="항목 선택" />);

  const checkbox = screen.getByRole('checkbox', { name: '항목 선택' });
  await user.click(checkbox);

  expect(checkbox).toHaveAttribute('aria-checked', 'true');
});

test('has no basic accessibility violations', async () => {
  const { container } = render(<Checkbox aria-label="항목 선택" />);
  const results = await axe(container);

  expect(results.violations).toHaveLength(0);
});

test('merges className only on the checkbox root for layout hooks', () => {
  render(<Checkbox aria-label="항목 선택" className="layout-hook" />);

  const checkbox = screen.getByRole('checkbox', { name: '항목 선택' });
  expect(checkbox).toHaveClass('ncai-checkbox__control');
  expect(checkbox).toHaveClass('layout-hook');
  expect(document.querySelector('.ncai-checkbox__indicator')).not.toHaveClass('layout-hook');
});

test('does not expose style prop in the public type contract', () => {
  type HasStyleProp = 'style' extends keyof CheckboxProps ? true : false;
  const hasStyleProp: HasStyleProp = false;

  expect(hasStyleProp).toBe(false);
});
