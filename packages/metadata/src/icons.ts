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

export type ApprovedIcon = (typeof approvedIcons)[number];
