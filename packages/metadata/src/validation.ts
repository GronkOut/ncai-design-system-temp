import { approvedTokens } from './tokens';

export type UiValidationFinding = { severity: 'error' | 'warning'; message: string; fixable: boolean };

const tailwindColorFamilies = [
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose'
].join('|');

const tailwindColorClassPattern = new RegExp(
  `\\b(?:bg|text|border|ring|fill|stroke|from|via|to)-(?:${tailwindColorFamilies})-(?:50|100|200|300|400|500|600|700|800|900|950)\\b`
);

const tailwindUtilityClassPattern =
  /\b(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y|w|h|min-w|min-h|max-w|max-h|rounded|shadow|opacity|z)-(?:0|px|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96|full|sm|md|lg|xl|2xl|3xl)\b/;

const arbitraryUtilityPattern = /\b(?:bg|text|border|ring|fill|stroke|shadow|rounded|p|px|py|m|mx|my|w|h)-\[[^\]]+\]/;
const conditionalClassNamePattern = /className=\{[^}]*\?|className=\{[^}]*&&|(?:clsx|classnames|cn)\s*\(/;
const cssModuleClassNamePattern = /className=\{[^}]*styles\.[A-Za-z0-9_$]+|className=\{[^}]*styles\[['"][^'"]+['"]\]/;

export function validateUiCode(code: string) {
  const findings: UiValidationFinding[] = [];

  if (/@base-ui\/react/.test(code)) {
    findings.push({
      severity: 'error',
      message: '앱 코드에서는 @base-ui/react를 직접 import하지 말고 @ncai/design-system-temp를 사용하세요.',
      fixable: true
    });
  }

  if (/#(?:[0-9a-fA-F]{3,8})\b|rgb\(|hsl\(/.test(code)) {
    findings.push({
      severity: 'error',
      message: '임의 색상값 대신 @ncai/design-tokens-temp의 --ncai-* CSS variable을 사용하세요.',
      fixable: false
    });
  }

  if (arbitraryUtilityPattern.test(code)) {
    findings.push({
      severity: 'error',
      message: 'Tailwind arbitrary value 대신 승인된 디자인 토큰과 컴포넌트 API를 사용하세요.',
      fixable: false
    });
  }

  if (tailwindColorClassPattern.test(code)) {
    findings.push({
      severity: 'error',
      message: '표준 Tailwind 색상 클래스 대신 NC AI 디자인 토큰 또는 컴포넌트 variant를 사용하세요.',
      fixable: false
    });
  }

  if (tailwindUtilityClassPattern.test(code)) {
    findings.push({
      severity: 'warning',
      message: 'Tailwind spacing/radius/shadow/size 유틸리티는 디자인 토큰 우회가 될 수 있습니다. 레이아웃 목적 className인지 확인하세요.',
      fixable: false
    });
  }

  if (conditionalClassNamePattern.test(code)) {
    findings.push({
      severity: 'warning',
      message: '조건부 className 조합을 발견했습니다. 색상, spacing, typography를 className으로 우회하지 않는지 확인하세요.',
      fixable: false
    });
  }

  if (cssModuleClassNamePattern.test(code)) {
    findings.push({
      severity: 'warning',
      message: 'CSS module className 사용을 발견했습니다. 컴포넌트 스타일 확장이 디자인 토큰과 metadata 정책을 따르는지 확인하세요.',
      fixable: false
    });
  }

  if (/style=\{\{/.test(code)) {
    findings.push({
      severity: 'warning',
      message: 'inline style은 레이아웃 보정 외에는 사용하지 마세요.',
      fixable: false
    });
  }

  const usedTokens = Array.from(code.matchAll(/var\((--ncai-[^)]+)\)/g), (match) => match[1]);
  const unapprovedTokens = usedTokens.filter((token) => !approvedTokens.includes(token as (typeof approvedTokens)[number]));

  for (const token of new Set(unapprovedTokens)) {
    findings.push({
      severity: 'error',
      message: `${token}은 승인된 NC AI 디자인 토큰 목록에 없습니다.`,
      fixable: false
    });
  }

  if (/lucide-react|react-icons|@heroicons/.test(code)) {
    findings.push({
      severity: 'error',
      message: '임의 아이콘 라이브러리 대신 @ncai/design-icons-temp의 승인된 아이콘을 사용하세요.',
      fixable: true
    });
  }

  const disclaimer =
    'validate_ui_code는 제한된 정적 검사입니다. 통과(valid=true)는 “정책 100% 준수”를 의미하지 않습니다. 컴포넌트/토큰 사용 가이드와 실제 렌더링 결과를 함께 확인하세요.';

  const limitations = [
    'className 값이 외부 변수, 함수 반환값, 템플릿 조합으로 구성된 경우 일부 스타일 우회가 누락될 수 있습니다.',
    'CSS module 내부 파일의 실제 선언까지 추적하지는 않습니다. className에서 CSS module 사용을 경고로 표시합니다.',
    'Tailwind 표준 클래스는 주요 색상/spacing/radius/shadow/size 패턴을 탐지하지만 모든 plugin/custom theme class를 알 수는 없습니다.',
    '토큰은 주로 var(--ncai-*) 사용 여부를 기준으로 검사하며, JS 토큰 객체 사용 패턴의 “정책 적합성”은 별도 규칙이 필요할 수 있습니다.',
    '이 검사는 경량 정적 검사이며, 실제 런타임 스타일(Computed CSS)까지 분석하지 않습니다.'
  ] as const;

  return { valid: findings.length === 0, findings, disclaimer, limitations };
}
