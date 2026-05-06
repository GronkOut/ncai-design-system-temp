import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { CheckIcon, PartialIcon } from '@ncai/design-icons-temp';
import type { ComponentPropsWithoutRef } from 'react';
import { cx } from '../../utils';

type BaseCheckboxRootProps = ComponentPropsWithoutRef<typeof BaseCheckbox.Root>;

export type CheckboxShape = 'square' | 'circle';

export type CheckboxProps = Omit<BaseCheckboxRootProps, 'className' | 'style'> & {
  /** 체크박스 root에 추가할 className입니다. 색상/크기 변경보다는 레이아웃 보정에만 사용합니다. */
  className?: string;
  /** 체크박스 형태입니다. `square`는 사각형, `circle`은 원형입니다. */
  shape?: CheckboxShape;
  /** 미선택 상태에서 경고 의미의 빨간 보더를 표시합니다. 선택되면 일반 선택 스타일로 표시됩니다. */
  warning?: boolean;
};

export function Checkbox({ className, indeterminate, shape = 'square', warning, ...props }: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      className={cx('ncai-checkbox__control', className)}
      data-shape={shape}
      data-warning={warning || undefined}
      indeterminate={indeterminate}
      {...props}
    >
      <BaseCheckbox.Indicator className="ncai-checkbox__indicator" keepMounted>
        {indeterminate ? (
          <PartialIcon className="ncai-checkbox__icon ncai-checkbox__icon--partial" />
        ) : (
          <CheckIcon className="ncai-checkbox__icon ncai-checkbox__icon--check" />
        )}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
