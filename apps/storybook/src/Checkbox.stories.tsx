import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';
import { Checkbox } from '@ncai/design-system-temp';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  args: {
    shape: 'square',
    checked: false,
    warning: false,
    indeterminate: false,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component:
          'NC AI 디자인 시스템의 Checkbox 컴포넌트입니다. Base UI Checkbox 사용법은 <a href="https://base-ui.com/react/components/checkbox" target="_blank" rel="noopener noreferrer">Base UI Checkbox 문서</a>에서 확인할 수 있습니다.'
      }
    }
  },
  argTypes: {
    shape: {
      control: 'inline-radio',
      options: ['square', 'circle']
    },
    warning: {
      control: 'boolean'
    },
    indeterminate: {
      description: '체크박스를 일부 선택 상태로 표시합니다. 일부 하위 항목만 선택된 경우에 사용합니다.',
      control: 'boolean'
    },
    checked: {
      description: '체크박스의 선택 여부를 외부 상태로 제어할 때 사용합니다.',
      control: 'boolean'
    },
    disabled: {
      description: '체크박스를 비활성화하여 사용자가 변경할 수 없게 합니다.',
      control: 'boolean'
    }
  }
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const stateItems = [
  { label: '기본', props: {} },
  { label: '선택됨', props: { defaultChecked: true } },
  { label: '일부 선택됨', props: { indeterminate: true } },
  { label: '경고', props: { warning: true } },
  { label: '비활성', props: { disabled: true } },
  { label: '비활성 선택됨', props: { defaultChecked: true, disabled: true } },
  { label: '비활성 일부 선택됨', props: { indeterminate: true, disabled: true } }
] as const;

export const Basic: Story = {
  render: function Render(args) {
    const [{ checked }, updateArgs] = useArgs();

    return (
      <Checkbox
        aria-label="체크박스"
        {...args}
        checked={checked}
        onCheckedChange={(nextChecked, eventDetails) => {
          updateArgs({ checked: nextChecked });
          args.onCheckedChange?.(nextChecked, eventDetails);
        }}
      />
    );
  }
};

export const AllStates: Story = {
  name: 'All States',
  parameters: {
    controls: {
      disable: true
    },
    docs: {
      disable: true
    }
  },
  render: () => (
    <div className="checkbox-state-groups">
      <div className="checkbox-state-section">
        {stateItems.map(({ label, props }) => (
          <div className="checkbox-state-row" key={`square-${label}`}>
            <Checkbox aria-label={`square ${label}`} {...props} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="checkbox-state-section">
        {stateItems.map(({ label, props }) => (
          <div className="checkbox-state-row" key={`circle-${label}`}>
            <Checkbox aria-label={`circle ${label}`} shape="circle" {...props} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
};
