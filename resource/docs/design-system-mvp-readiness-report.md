# NC AI Design System Temp MVP 준비 리포트

검토 기준: `resource/docs/baseui-mcp-skills-roadmap.md`  
검토 대상: 현재 모노레포 구성, npm/GitHub 배포 준비, 장기 운영 적합성, `Checkbox` MVP 구성

## 결론

현재 프로젝트는 MVP 테스트 배포 기준으로 큰 방향은 잘 잡혀 있다. Turborepo, pnpm workspace, Changesets, GitHub Actions, Storybook, React package, tokens/icons/metadata/MCP/skills가 분리되어 있어 장기적으로 컴포넌트와 agent-facing 데이터를 함께 운영하기 좋은 구조다.

이번 정리로 사용자 설치명도 `@ncai/design-system-temp`, `@ncai/design-tokens-temp`, `@ncai/design-system-cli-temp` 중심으로 단순화했다. 따라서 테스트 배포 후 실제 사용자에게 안내할 최소 설치 흐름은 충분히 만들 수 있다.

## 고도화 우선순위

### Resolved. CLI doctor 진단 범위를 확장했다

`packages/cli`의 `doctor`가 소비자 프로젝트의 React 버전, 필수 `@ncai/*-temp` 패키지 설치 여부, 설치된 디자인 시스템 패키지 버전 정렬, 스타일 import, MCP 설정, Cursor Skill 설치 여부를 진단하도록 보완했다. 이제 외부 사용자는 `npx @ncai/design-system-cli-temp doctor`로 설치 누락과 설정 문제를 바로 확인할 수 있다.

### Resolved. metadata schema와 component별 분리를 추가했다

`packages/metadata/src/schema.ts`에 공통 metadata 타입, JSON schema, validation 함수를 추가했고, `Checkbox` metadata를 `packages/metadata/src/components/Checkbox.metadata.ts`로 분리했다. 각 컴포넌트 metadata는 `deprecated`와 `migration` 필드를 항상 포함하며, `pnpm --filter @ncai/design-system-metadata-temp validate`로 계약을 검증할 수 있다.

### High. 토큰 파이프라인은 MVP에는 충분하지만 공개 운영에는 검증이 부족하다

현재 토큰은 `resource/token/figma.scss`를 참조해 CSS variables로 노출하는 구조라 빠른 시작에는 적절하다. 다만 로드맵에서 말한 `tokens.json`, `tokens.schema.json`, deprecated alias, diff 요약은 아직 없다. 디자인 변경이 잦아질수록 토큰 이름 변경과 삭제를 CI에서 막는 검증이 필요하다.

### Resolved. `Checkbox` 정책을 metadata validation과 테스트로 고정했다

`Checkbox` metadata에 `stylePolicy`와 `componentTokens`를 추가했고, metadata validation에서 `style` prop 노출 금지, `className`의 layout-only 설명, `checkbox.*` component token naming을 검사하도록 했다. React 테스트도 `style` prop이 공개 타입 계약에 없고 `className`이 root에만 병합되는지 확인한다.

### Resolved. MCP validation 탐지 범위를 확장했다

`validate_ui_code`가 Base UI 직접 import, 임의 색상, arbitrary value, 미승인 아이콘 외에도 표준 Tailwind 색상 클래스, spacing/radius/shadow/size 유틸리티, 조건부 `className`, `clsx`/`classnames`/`cn` 조합, CSS module className 사용을 탐지하도록 확장했다. 여전히 런타임 computed style이나 외부 변수 추적까지는 하지 않으므로 장기적으로는 ESLint plugin 또는 AST 기반 validator가 다음 확장 지점이다.

### Resolved. `examples/vite-react`를 추가했다

`examples/vite-react`를 추가해 외부 사용자가 설치하는 방식에 가까운 Vite React 예제를 제공한다. `smoke:pack`은 npm tarball을 만든 뒤 이 예제 앱에 실제로 설치하고 Vite build까지 실행하므로, 단순 export smoke test보다 배포 후 사용 환경에 가까운 검증이 가능하다.

## 배포 준비 상태

GitHub Actions의 CI와 Release workflow는 기본적으로 적절하다. `NPM_TOKEN` secret을 사용하고 Changesets publish를 실행하도록 되어 있어 npm organization `@ncai` public 배포 흐름과 맞다.

배포 대상 패키지명은 테스트 목적에 맞게 `temp` suffix를 유지하면서도 사용자 입장에서 읽히는 이름으로 정리했다.

- `@ncai/design-system-temp`
- `@ncai/design-tokens-temp`
- `@ncai/design-icons-temp`
- `@ncai/design-system-metadata-temp`
- `@ncai/design-system-mcp-temp`
- `@ncai/design-system-skills-temp`
- `@ncai/design-system-cli-temp`

배포 전 반드시 확인할 명령은 다음이다.

```bash
pnpm typecheck
pnpm validate
pnpm test
pnpm build
pnpm smoke:pack
```

## 다음 단계 추천

1. 토큰 JSON/schema/deprecated alias 산출물을 추가한다.
2. 컴포넌트 2-3개를 추가하기 전에 컴포넌트 생성 템플릿을 만든다.
