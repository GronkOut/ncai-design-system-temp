import { approvedTokens } from '@ncai/design-system-metadata-temp';

type Finding = { severity: 'error' | 'warning'; message: string; fixable: boolean };

export function validateUiCode(code: string) {
  const findings: Finding[] = [];

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

  if (/\b(?:bg|text|border|ring|fill|stroke|shadow|rounded|p|px|py|m|mx|my|w|h)-\[[^\]]+\]/.test(code)) {
    findings.push({
      severity: 'error',
      message: 'Tailwind arbitrary value 대신 승인된 디자인 토큰과 컴포넌트 API를 사용하세요.',
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
    'Tailwind 표준 클래스(예: text-red-500, bg-slate-100) 및 className 조합은 완전 탐지하지 못할 수 있습니다.',
    '템플릿/헬퍼 함수로 생성된 className, 조건부 문자열 조합은 정규식 기반 검사에서 누락될 수 있습니다.',
    '토큰은 주로 var(--ncai-*) 사용 여부를 기준으로 검사하며, JS 토큰 객체 사용 패턴의 “정책 적합성”은 별도 규칙이 필요할 수 있습니다.',
    '이 검사는 코드 문자열 기반이며, 실제 런타임 스타일(Computed CSS)까지 분석하지 않습니다.'
  ] as const;

  return { valid: findings.length === 0, findings, disclaimer, limitations };
}
