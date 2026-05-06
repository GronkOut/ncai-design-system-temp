# NC AI Design System Temp MVP 준비 리포트

검토 기준: `resource/docs/baseui-mcp-skills-roadmap.md`  
검토 대상: 현재 모노레포 구성, npm/GitHub 배포 준비, 장기 운영 적합성, `Checkbox` MVP 구성

## 결론

현재 프로젝트는 MVP 테스트 배포 기준으로 큰 방향은 잘 잡혀 있다. Turborepo, pnpm workspace, Changesets, GitHub Actions, Storybook, React package, tokens/icons/metadata/MCP/skills가 분리되어 있어 장기적으로 컴포넌트와 agent-facing 데이터를 함께 운영하기 좋은 구조다.

이번 정리로 사용자 설치명도 `@ncai/design-system-temp`, `@ncai/design-tokens-temp`, `@ncai/design-system-cli-temp` 중심으로 단순화했다. 따라서 테스트 배포 후 실제 사용자에게 안내할 최소 설치 흐름은 충분히 만들 수 있다.

## 고도화 우선순위

### High. CLI는 MVP 수준이며 자동 설정 범위를 더 넓혀야 한다

`packages/cli`를 추가해 `setup-mcp`, `install-skill`, `validate`, `doctor` 진입점은 생겼다. 다만 현재는 Cursor 중심의 최소 설정만 생성한다. 실제 외부 사용자 경험을 안정화하려면 프로젝트의 React 버전, 설치된 `@ncai/*` 패키지 버전 정렬, 스타일 import 여부, MCP 연결 여부를 `doctor`가 더 정확히 진단해야 한다.

### High. metadata schema가 아직 타입 계약 수준에 머문다

`packages/metadata/src/index.ts`가 단일 소스 역할을 하지만 JSON schema, component별 metadata 파일 분리, deprecated/migration 필드는 아직 없다. 컴포넌트가 늘어나면 한 파일에 규칙과 예제가 계속 쌓이므로 `components/Checkbox.metadata.ts` 같은 구조와 schema validation을 추가하는 것이 좋다.

### High. 토큰 파이프라인은 MVP에는 충분하지만 공개 운영에는 검증이 부족하다

현재 토큰은 `resource/token/figma.scss`를 참조해 CSS variables로 노출하는 구조라 빠른 시작에는 적절하다. 다만 로드맵에서 말한 `tokens.json`, `tokens.schema.json`, deprecated alias, diff 요약은 아직 없다. 디자인 변경이 잦아질수록 토큰 이름 변경과 삭제를 CI에서 막는 검증이 필요하다.

### Medium. `Checkbox`는 MVP 컴포넌트로는 잘 구성되어 있다

`Checkbox`는 Base UI wrapper, token 기반 CSS, Storybook 상태 문서, unit/a11y test, metadata가 함께 있어 첫 컴포넌트 기준으로는 좋다. 다만 컴포넌트가 늘어나기 전에 `style` prop 금지 정책, `className` 사용 범위, component token naming 규칙을 테스트 또는 lint로 고정하는 것이 좋다.

### Medium. MCP validation은 방향은 좋지만 정규식 기반 한계가 명확하다

`validate_ui_code`는 Base UI 직접 import, 임의 색상, arbitrary value, 미승인 아이콘을 탐지한다. 현재 MVP에는 충분하지만 실제 사용자 코드에서는 조건부 className, CSS module, 표준 Tailwind 색상 클래스 등을 놓칠 수 있다. 이후 ESLint plugin 또는 AST 기반 validator로 확장하는 것이 적절하다.

### Medium. examples/playground가 아직 없다

로드맵의 `examples/vite-react`, `examples/next-react`, `apps/playground`는 아직 없다. 당장 배포를 막는 문제는 아니지만, npm 배포 후 실제 설치 검증과 사용자 온보딩을 위해 Vite 예제 하나는 빠르게 추가하는 편이 좋다.

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
pnpm test
pnpm build
pnpm smoke:pack
```

## 다음 단계 추천

1. `doctor`를 실제 소비자 프로젝트 진단 도구로 강화한다.
2. metadata를 component별 파일과 schema validation 구조로 분리한다.
3. 토큰 JSON/schema/deprecated alias 산출물을 추가한다.
4. `examples/vite-react`를 만들어 npm tarball 설치를 더 실제 환경에 가깝게 검증한다.
5. 컴포넌트 2-3개를 추가하기 전에 컴포넌트 생성 규칙과 테스트 템플릿을 확정한다.
