import type { ComponentMetadataDefinition } from '../schema';

export const checkboxMetadata = {
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
    className: {
      type: 'string',
      description: '레이아웃 보정 목적의 className입니다. 색상, spacing, typography 변경에는 사용하지 않습니다.'
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
  ],
  stylePolicy: {
    disallowStyleProp: true,
    classNameUsage: 'layout-only'
  },
  componentTokens: [
    'checkbox.control.size.square',
    'checkbox.control.size.circle',
    'checkbox.control.radius.square',
    'checkbox.control.radius.circle',
    'checkbox.control.color.border',
    'checkbox.control.color.background',
    'checkbox.control.color.selected',
    'checkbox.control.color.warning',
    'checkbox.icon.size.check',
    'checkbox.icon.size.partial'
  ],
  deprecated: {
    isDeprecated: false
  },
  migration: {
    notes: []
  }
} as const satisfies ComponentMetadataDefinition;
