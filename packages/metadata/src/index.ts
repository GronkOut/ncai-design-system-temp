export const approvedTokens = [
  '--ncai-font-family-sans',
  '--ncai-color-bg-canvas',
  '--ncai-color-bg-surface',
  '--ncai-color-bg-subtle',
  '--ncai-color-bg-disabled',
  '--ncai-color-text-primary',
  '--ncai-color-text-secondary',
  '--ncai-color-text-placeholder',
  '--ncai-color-text-inverse',
  '--ncai-color-text-danger',
  '--ncai-color-border-default',
  '--ncai-color-border-muted',
  '--ncai-color-border-hover',
  '--ncai-color-border-focus',
  '--ncai-color-border-danger',
  '--ncai-color-accent-primary',
  '--ncai-color-accent-primary-hover',
  '--ncai-color-accent-danger',
  '--ncai-radius-xs',
  '--ncai-radius-checkbox',
  '--ncai-radius-sm',
  '--ncai-radius-md',
  '--ncai-radius-full',
  '--ncai-space-1',
  '--ncai-space-2',
  '--ncai-space-3',
  '--ncai-space-4',
  '--ncai-space-5',
  '--ncai-font-size-caption',
  '--ncai-line-height-caption',
  '--ncai-font-size-label-sm',
  '--ncai-line-height-label-sm',
  '--ncai-font-size-label-md',
  '--ncai-line-height-label-md',
  '--ncai-font-size-label-lg',
  '--ncai-line-height-label-lg',
  '--ncai-duration-fast',
  '--ncai-duration-normal',
  '--ncai-ease-standard'
] as const;

export const approvedIcons = [
  {
    name: 'CheckIcon',
    importPath: '@ncai/design-icons-temp',
    usage: 'Checkbox 선택 상태 표시'
  },
  {
    name: 'PartialIcon',
    importPath: '@ncai/design-icons-temp',
    usage: 'Checkbox 일부 선택 상태 표시'
  }
] as const;

export const componentMetadata = [
  {
    name: 'Checkbox',
    description: 'Base UI Checkbox.Root와 Indicator를 감싼 디자인 시스템 체크박스입니다.',
    status: 'mvp',
    baseUi: ['@base-ui/react/checkbox'],
    props: {
      shape: {
        type: ['square', 'circle'],
        defaultValue: 'square',
        description: '체크박스 형태입니다.'
      },
      warning: {
        type: 'boolean',
        description: '미선택 상태에서 경고 의미의 빨간 보더를 표시합니다.'
      },
      indeterminate: {
        type: 'boolean',
        description: '일부 하위 항목만 선택된 상태를 표시합니다.'
      },
      name: {
        type: 'string',
        description: '폼 제출 시 필드 이름입니다. (Base UI Root pass-through)'
      },
      value: {
        type: 'string',
        description: '선택된 체크박스의 값입니다. (Base UI Root pass-through)'
      },
      checked: {
        type: 'boolean',
        description: '제어 방식으로 선택 여부를 지정합니다.'
      },
      defaultChecked: {
        type: 'boolean',
        description: '비제어 방식의 초기 선택값입니다.'
      },
      disabled: {
        type: 'boolean',
        description: '사용자가 값을 변경할 수 없게 비활성화합니다.'
      },
      readOnly: {
        type: 'boolean',
        description: '사용자가 값을 변경할 수 없게 합니다. (포커스/폼 제출은 가능) (Base UI Root pass-through)'
      },
      required: {
        type: 'boolean',
        description: '폼 제출 전에 반드시 체크되어야 함을 의미합니다. (Base UI Root pass-through)'
      },
      onCheckedChange: {
        type: 'function',
        description: '제어 방식에서 선택 변경을 처리합니다.'
      },
      id: {
        type: 'string',
        description: '숨겨진 input id입니다. 형제 label(htmlFor) 패턴에서 유용합니다. (Base UI Root pass-through)'
      },
      form: {
        type: 'string',
        description: '체크박스가 form 밖에 있어도 특정 form과 연결합니다. (Base UI Root pass-through)'
      },
      'aria-label': {
        type: 'string',
        description: '외부 label이 없을 때 접근 가능한 이름을 제공합니다.'
      }
    },
    examples: [
      "import { Checkbox } from '@ncai/design-system-temp';",
      '<Checkbox aria-label="항목 선택" />',
      '<Checkbox aria-label="항목 선택" shape="circle" />',
      '<Checkbox aria-label="확인 필요" warning />'
    ],
    rules: [
      '폼 컨트롤에는 aria-label 또는 외부 label로 접근 가능한 이름을 제공한다.',
      'shape는 square와 circle만 사용한다.',
      '정의된 상태 외 tone, label, description 디자인을 추가하지 않는다.',
      '임의 색상이나 inline style 대신 @ncai/design-tokens-temp CSS variables를 사용한다.'
    ]
  }
] as const;

export type ApprovedToken = (typeof approvedTokens)[number];
export type ApprovedIcon = (typeof approvedIcons)[number];
export type ComponentMetadata = (typeof componentMetadata)[number];
