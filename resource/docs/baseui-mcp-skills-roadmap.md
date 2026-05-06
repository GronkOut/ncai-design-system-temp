# Base UI 기반 디자인 시스템 MCP/Skills 하이브리드 로드맵

## 1. 목표와 설계 원칙

이 프로젝트의 목표는 Base UI를 기반으로 사내 디자인 시스템을 React UI 프레임워크로 제품화하고, MCP와 Agent Skills를 함께 제공해 에이전트가 디자인 시스템을 정확히 사용하도록 만드는 것이다. 배포 대상은 사내 전용이 아니라 외부 사용자까지 포함하므로, 패키지 구조, 문서, 버전 정책, 라이선스, 업데이트 경로를 처음부터 공개 배포 기준으로 설계한다.

핵심 원칙은 다음과 같다.

- Base UI는 접근성, 상태 관리, 조합 가능한 headless primitive 계층으로 사용한다.
- 사내 디자인 시스템의 토큰, 아이콘, 컴포넌트 디자인은 별도 패키지로 정규화하고, React 컴포넌트는 이 정규화된 소스만 사용한다.
- MCP는 최신 디자인 시스템 데이터, 컴포넌트 사용법, 코드 생성 입력, 검증 결과를 제공하는 동적 인터페이스로 둔다.
- Skills는 에이전트의 행동 규칙, 금지 사항, 작업 순서, 결과물 포맷을 고정하는 정적 가이드로 둔다.
- 에이전트가 임의 색상, spacing, radius, shadow, typography, 아이콘, 컴포넌트 구조를 생성하지 못하도록 Skills와 MCP 양쪽에 중복 가드레일을 둔다.
- 디자인 가이드 변경 시 토큰, 아이콘, 컴포넌트 문서, MCP 응답, Skills 가이드가 한 릴리스 파이프라인에서 함께 갱신되도록 한다.

## 2. 권장 기술 스택

### 런타임 및 패키징

- 패키지 매니저: `pnpm`
- 모노레포: Turborepo
- 언어: TypeScript
- UI: React
- Primitive: `@base-ui/react`
- 번들러: `tsup` 또는 `vite`
- 패키지 배포: npm public registry
- 버전 관리: Changesets
- 테스트: Vitest, Testing Library, Playwright
- 접근성 테스트: axe-core, Storybook a11y addon
- 문서/프리뷰: Storybook
- 시각 회귀 테스트: Chromatic, Loki, 또는 Playwright screenshot

### 로컬 컴포넌트 개발 도구

기본 추천은 Storybook이다. 이유는 다음과 같다.

- 컴포넌트 상태, variant, density, theme, interaction을 story 단위로 분리할 수 있다.
- 접근성 검사, 문서화, controls, visual regression, interaction test 생태계가 가장 성숙하다.
- 외부 배포용 디자인 시스템에서는 사용자가 가장 익숙하게 소비하는 문서 형태다.

다만 개발자가 빠르게 수정하며 보는 내부 playground도 별도로 두는 것을 추천한다. Storybook은 공식 문서와 QA 허브로 사용하고, `apps/playground`는 실제 앱 환경에서 컴포넌트 조합, 라우팅, 폼, overlay, portal, z-index 문제를 확인하는 용도로 둔다.

## 3. 전체 아키텍처

```text
Design Source
  Figma / Tokens Studio / Icon Source / Component Spec
    ↓
Design System Source Packages
  tokens / icons / component metadata / theme
    ↓
Runtime Packages
  React components / CSS variables / utility APIs
    ↓
Agent Packages
  MCP server / Skills / CLI installer / validators
    ↓
Consumers
  React apps / Cursor / Claude Desktop / CI / external users
```

MCP와 Skills는 같은 지식을 다루지만 역할을 분리한다.

| 영역 | MCP가 담당 | Skills가 담당 |
| --- | --- | --- |
| 토큰 | 최신 토큰 조회, 검색, 추천, 검증 | 임의 토큰 생성 금지, 토큰 사용 규칙 |
| 아이콘 | 아이콘 목록, 이름, SVG 메타데이터 조회 | 임의 SVG 작성 금지, 승인된 아이콘만 사용 |
| 컴포넌트 | props, variants, anatomy, 예제 코드 반환 | 컴포넌트 선택 순서, Base UI 직접 사용 제한 |
| 검증 | 코드 스캔, 사용 불가 스타일 탐지, 자동 수정 제안 | 작업 후 반드시 검증하라는 프로세스 |
| 업데이트 | 패키지 버전별 데이터 제공 | 새 버전 사용 시 확인할 체크리스트 |

## 4. Turborepo 모노레포 구조

```text
.
├── apps
│   ├── storybook
│   ├── playground
│   └── docs-site
├── packages
│   ├── tokens
│   ├── icons
│   ├── theme
│   ├── react
│   ├── component-metadata
│   ├── mcp-server
│   ├── agent-skills
│   ├── cli
│   ├── eslint-plugin
│   ├── codemods
│   └── config
├── examples
│   ├── vite-react
│   └── next-react
├── docs
└── .changeset
```

### 주요 패키지 책임

`packages/tokens`

- 디자인 토큰의 단일 배포 단위다.
- 입력은 Tokens Studio JSON, Style Dictionary 호환 JSON, 또는 사내 토큰 스키마를 사용한다.
- 출력은 CSS variables, TypeScript token map, JSON schema를 모두 제공한다.
- 예: `@company-ui/tokens`

`packages/icons`

- 승인된 아이콘만 export한다.
- SVG 원본을 정규화하고 React 컴포넌트와 metadata JSON을 생성한다.
- 아이콘 이름, 카테고리, 태그, 크기, deprecated 여부를 metadata로 제공한다.
- 예: `@company-ui/icons`

`packages/theme`

- CSS variables, reset, layer, theme switching, color mode를 제공한다.
- Base UI portal 사용을 고려해 root stacking context 스타일을 포함한다.
- 예: `@company-ui/theme`

`packages/react`

- 외부 사용자가 실제로 import하는 React 컴포넌트 패키지다.
- Base UI primitive를 내부 구현으로 감싸고, 공개 API는 사내 디자인 시스템의 컴포넌트 계약으로 제한한다.
- 예: `@company-ui/react`

`packages/component-metadata`

- 컴포넌트 anatomy, props, variants, usage rules, accessibility notes, examples를 구조화된 JSON/MD로 제공한다.
- Storybook, docs-site, MCP server, Skills 생성 파이프라인이 이 데이터를 함께 사용한다.
- 예: `@company-ui/component-metadata`

`packages/mcp-server`

- 디자인 시스템을 에이전트가 질의하고 검증할 수 있는 MCP 서버다.
- stdio transport를 기본 제공하고, 필요하면 Streamable HTTP transport를 추가한다.
- 예: `@company-ui/mcp`

`packages/agent-skills`

- Cursor 등 Agent Skill을 사용하는 환경에 설치할 수 있는 Skill 파일을 포함한다.
- Skills 본문에는 에이전트가 따라야 할 규칙과 금지 사항만 압축해서 넣고, 상세 데이터는 MCP 또는 metadata resource를 조회하게 한다.
- 예: `@company-ui/agent-skills`

`packages/cli`

- `npx`로 실행되는 설치 및 검증 CLI다.
- MCP 설정, Skills 설치, example app 생성, 코드 검증, migration을 제공한다.
- 예: `@company-ui/cli`

`packages/eslint-plugin`

- 임의 스타일 사용, 금지된 import, 미승인 아이콘, token bypass를 정적 분석으로 차단한다.
- 예: `@company-ui/eslint-plugin`

`packages/codemods`

- 디자인 가이드 변경, prop 변경, component rename, token rename을 자동 마이그레이션한다.
- 예: `@company-ui/codemods`

## 5. Base UI 적용 전략

Base UI는 headless primitive로만 사용하고, 외부 사용자가 직접 Base UI anatomy를 조립하지 않도록 한다. 공개 API는 디자인 시스템 컴포넌트 API로 고정한다.

예시 원칙:

- `Dialog`, `Popover`, `Menu`, `Select`, `Tabs`, `Tooltip` 등 접근성과 상태 관리가 중요한 컴포넌트는 Base UI primitive를 우선 사용한다.
- `Button`, `Badge`, `Text`, `Stack`, `Grid`처럼 primitive 의존도가 낮은 컴포넌트는 토큰 기반 자체 구현으로 둔다.
- Base UI의 part 구조는 내부 구현 세부 사항으로 취급하고, 외부 문서에는 디자인 시스템 anatomy만 노출한다.
- CSS는 토큰 기반 CSS variables를 우선 사용한다.
- 임의 className escape hatch는 최소화한다. 필요한 경우 `className`은 layout 보정 용도로만 허용하고 색상, spacing, typography 변경은 금지한다.
- portal 기반 컴포넌트를 위해 앱 root에 `isolation: isolate` 적용 가이드를 제공한다.

권장 레이어:

```text
@base-ui/react primitive
  ↓
internal hooks and anatomy adapters
  ↓
design-token styles
  ↓
public @company-ui/react component API
```

## 6. 토큰 설계

토큰은 디자인 시스템 업데이트의 중심이다. 토큰 변경이 쉬워야 MCP, Skills, Storybook, React 컴포넌트가 함께 최신 상태를 유지할 수 있다.

### 토큰 계층

- Primitive token: raw color, size, font family 등 원천 값
- Semantic token: `color.bg.default`, `color.text.primary`, `space.3`처럼 사용 의미가 있는 값
- Component token: `button.primary.bg`, `dialog.overlay.bg`처럼 컴포넌트에 귀속된 값
- Mode token: light, dark, high-contrast, density, platform variation

### 출력 형식

`@company-ui/tokens`는 최소한 다음 출력을 제공한다.

```text
dist
├── tokens.json
├── tokens.schema.json
├── css
│   ├── variables.css
│   ├── light.css
│   └── dark.css
├── ts
│   ├── tokens.ts
│   └── token-types.ts
└── metadata
    ├── deprecated.json
    └── aliases.json
```

### 업데이트 전략

- 디자인 소스에서 토큰 JSON을 export한다.
- CI에서 token schema validation을 수행한다.
- 변경된 토큰을 diff로 요약한다.
- deprecated token은 최소 한 minor 버전 동안 alias를 유지한다.
- breaking token 삭제는 major 버전에서만 허용한다.
- MCP의 `get_token`, `search_tokens`, `validate_tokens`는 배포된 token metadata를 그대로 읽는다.

## 7. 아이콘 설계

아이콘은 승인된 asset만 사용하도록 강하게 통제한다.

### 파이프라인

1. Figma 또는 아이콘 저장소에서 SVG 원본을 export한다.
2. SVGO로 정규화한다.
3. 아이콘 이름 규칙을 검증한다.
4. React component와 metadata를 생성한다.
5. Storybook icon gallery와 MCP icon resource를 자동 갱신한다.

### 금지 사항

- 에이전트가 inline SVG를 새로 작성하지 않는다.
- 외부 icon library를 임의로 설치하지 않는다.
- 아이콘 이름이 없으면 MCP의 `search_icons`로 검색한다.
- 원하는 아이콘이 없으면 `IconMissing` 같은 fallback을 만들지 않고 요청/등록 절차를 안내한다.

## 8. React 컴포넌트 설계

각 컴포넌트는 다음 산출물을 갖는다.

```text
Button
├── Button.tsx
├── Button.types.ts
├── Button.styles.css
├── Button.tokens.ts
├── Button.stories.tsx
├── Button.test.tsx
├── Button.a11y.test.tsx
├── Button.metadata.json
└── Button.mdx
```

### 컴포넌트 API 원칙

- variant는 디자인 시스템에 정의된 값만 허용한다.
- size, color, radius, elevation 같은 시각 속성은 token contract와 연결한다.
- `style` prop 사용은 기본적으로 금지한다.
- `className`은 허용하되, 문서에서 layout 조정 목적이라고 명시한다.
- 컴포넌트 내부에서 Base UI primitive를 사용할 때는 accessibility contract를 테스트로 고정한다.
- compound component가 필요한 경우에도 외부 API는 가능한 단순하게 유지한다.

### 컴포넌트 metadata 예시

```json
{
  "name": "Button",
  "description": "Primary action, secondary action, destructive action에 사용하는 버튼",
  "status": "stable",
  "baseUiDependencies": [],
  "variants": {
    "variant": ["primary", "secondary", "ghost", "danger"],
    "size": ["sm", "md", "lg"]
  },
  "allowedTokens": [
    "button.primary.bg",
    "button.primary.fg",
    "button.radius"
  ],
  "disallowed": [
    "inline style",
    "arbitrary hex color",
    "custom SVG icon"
  ],
  "examples": ["basic", "loading", "with-icon"]
}
```

## 9. MCP 서버 설계

MCP 서버는 에이전트가 최신 디자인 시스템 정보를 안전하게 조회하고 검증하는 인터페이스다. 로컬 사용을 위해 stdio transport를 기본으로 제공하고, 조직 단위 중앙 서버가 필요하면 Streamable HTTP transport를 별도 옵션으로 제공한다.

### MCP 제공 기능

Tools:

- `search_components`: 목적, 이름, 키워드로 컴포넌트를 검색한다.
- `get_component_usage`: 컴포넌트의 props, variants, examples, 금지 사항을 반환한다.
- `get_component_recipe`: 특정 UI 요구사항에 맞는 승인된 컴포넌트 조합을 반환한다.
- `search_tokens`: 의미, 이름, 값, 카테고리로 토큰을 검색한다.
- `get_token`: 토큰 상세, CSS variable, deprecated 여부를 반환한다.
- `search_icons`: 승인된 아이콘을 검색한다.
- `get_icon_usage`: 아이콘 import 경로와 접근성 라벨 규칙을 반환한다.
- `validate_ui_code`: 코드에서 임의 스타일, 금지 import, 미승인 token, 잘못된 variant를 탐지한다.
- `suggest_migration`: deprecated token 또는 component API 변경에 대한 migration을 제안한다.

Resources:

- `company-ui://tokens/latest`
- `company-ui://tokens/{version}`
- `company-ui://components/latest`
- `company-ui://components/{name}`
- `company-ui://icons/latest`
- `company-ui://skills/latest`

Prompts:

- `build_component_with_company_ui`
- `refactor_to_company_ui`
- `review_company_ui_usage`
- `migrate_company_ui_version`

### MCP 응답 원칙

- 모든 tool은 structured output을 제공한다.
- 코드 예시는 반드시 승인된 import와 token만 사용한다.
- 존재하지 않는 variant나 token은 생성하지 않고, 대체 가능한 승인 항목을 제안한다.
- 검증 tool은 warning과 error를 구분한다.
- 자동 수정 가능 여부를 `fixable`로 표시한다.
- 외부 사용자를 위해 오류 메시지는 사내 약어가 아니라 공개 문서 기준 용어로 작성한다.

### 설치 방식

로컬 stdio 사용:

```bash
npm install -D @company-ui/mcp
npx @company-ui/mcp --stdio
```

CLI로 MCP 설정 생성:

```bash
npx @company-ui/cli mcp init
```

원격 서버 옵션:

```bash
npx @company-ui/mcp --http --port 3333
```

## 10. Skills 설계

Skills는 에이전트가 디자인 시스템을 사용하는 행동 규칙이다. 상세한 토큰 목록이나 컴포넌트 전체 문서를 Skills에 모두 넣지 않는다. Skills는 작고 명확해야 하며, 최신 정보는 MCP를 조회하도록 유도한다.

### Skill 패키지 구조

```text
packages/agent-skills
├── skills
│   └── company-ui
│       ├── SKILL.md
│       ├── component-workflow.md
│       ├── style-rules.md
│       └── validation.md
└── scripts
    └── install-skills.ts
```

### `SKILL.md` 핵심 내용

Skill에는 다음 규칙을 명시한다.

- UI를 만들기 전에 MCP의 `search_components` 또는 `get_component_recipe`를 먼저 사용한다.
- 컴포넌트 구현 전 `get_component_usage`로 props와 variants를 확인한다.
- 색상, spacing, radius, shadow, typography는 승인된 token만 사용한다.
- hex, rgb, hsl, arbitrary Tailwind value, inline style을 임의 생성하지 않는다.
- 아이콘은 `@company-ui/icons`의 승인된 아이콘만 사용한다.
- Base UI primitive를 앱 코드에서 직접 import하지 않는다. 필요한 경우 `@company-ui/react` 컴포넌트 확장을 먼저 검토한다.
- 작업 후 `validate_ui_code` 또는 `npx @company-ui/cli validate`를 실행한다.
- MCP가 없는 환경에서는 로컬 metadata와 문서를 참조하되, 모르는 값은 생성하지 않고 사용자에게 확인한다.

### Skill description 예시

```yaml
---
name: company-ui
description: Builds and reviews React UI using Company UI design system, Base UI-backed components, approved tokens, and approved icons. Use when creating, refactoring, or reviewing UI with Company UI, design tokens, icons, components, MCP, or Storybook.
---
```

### Skills 설치 방식

```bash
npm install -D @company-ui/agent-skills
npx @company-ui/cli skills install
```

Cursor 프로젝트에 설치하는 경우:

```bash
npx @company-ui/cli skills install --target cursor-project
```

개인 환경에 설치하는 경우:

```bash
npx @company-ui/cli skills install --target cursor-user
```

## 11. 에이전트 임의 스타일 방지 전략

임의 스타일 방지는 문서만으로는 부족하다. Skills, MCP, ESLint, CLI, 테스트를 모두 사용한다.

### 1차 방어: Skills

- 에이전트에게 금지 사항을 명확히 지시한다.
- "없으면 만들지 말고 MCP로 검색하거나 사용자에게 확인"하도록 지시한다.

### 2차 방어: MCP

- MCP tool은 승인된 token, icon, component metadata만 반환한다.
- `validate_ui_code`로 결과물을 검사한다.
- 미승인 스타일 발견 시 수정 가능한 대안을 함께 반환한다.

### 3차 방어: ESLint

금지 예:

- `style={{ color: '#...' }}`
- `className="text-[#123456]"`
- `import { Dialog } from '@base-ui/react/dialog'` in app code
- `import { SomeIcon } from 'lucide-react'`

허용 예:

- `className`으로 grid/flex layout만 조정
- `@company-ui/react` 컴포넌트 사용
- `@company-ui/icons` 아이콘 사용
- `var(--company-color-bg-default)` 같은 승인된 CSS variable 사용

### 4차 방어: CI

- `pnpm lint`
- `pnpm test`
- `pnpm test:a11y`
- `pnpm test:visual`
- `pnpm company-ui validate`

## 12. 로컬 개발 경험

### Storybook

Storybook은 다음 기능을 제공한다.

- 컴포넌트별 stories
- variant controls
- theme switching
- dark mode
- density mode
- RTL preview
- accessibility panel
- interaction tests
- visual regression snapshots

권장 명령:

```bash
pnpm storybook
```

### Playground 앱

`apps/playground`는 실제 앱에 가까운 환경에서 컴포넌트 상태를 확인한다.

포함할 페이지:

- Form examples
- Dialog/Popover/Menu overlay examples
- Data-heavy layout examples
- Theme switching examples
- Responsive examples
- Error and loading state examples

권장 명령:

```bash
pnpm dev
```

### 외부 사용자용 example

외부 사용자는 다음 명령으로 예제를 생성할 수 있게 한다.

```bash
npx @company-ui/cli create my-app --template vite-react
cd my-app
npm install
npm run dev
```

## 13. 외부 사용자 설치 시나리오

### UI 패키지 설치

```bash
npm install @company-ui/react @company-ui/theme @company-ui/icons
```

기본 CSS import:

```tsx
import '@company-ui/theme/styles.css';
```

컴포넌트 사용:

```tsx
import { Button } from '@company-ui/react';

export function Example() {
  return <Button variant="primary">저장</Button>;
}
```

### MCP 설치

```bash
npm install -D @company-ui/mcp
npx @company-ui/cli mcp init
```

직접 실행:

```bash
npx @company-ui/mcp --stdio
```

### Skills 설치

```bash
npm install -D @company-ui/agent-skills
npx @company-ui/cli skills install
```

### 검증

```bash
npx @company-ui/cli validate
```

### 마이그레이션

```bash
npx @company-ui/cli migrate --from 1.x --to 2.x
```

## 14. CLI 설계

`@company-ui/cli`는 외부 사용자의 진입점을 단순화한다.

명령 예:

```bash
npx @company-ui/cli init
npx @company-ui/cli create my-app --template vite-react
npx @company-ui/cli mcp init
npx @company-ui/cli skills install
npx @company-ui/cli validate
npx @company-ui/cli migrate --to latest
npx @company-ui/cli doctor
```

`doctor`는 다음을 확인한다.

- React version
- `@company-ui/*` package version alignment
- theme CSS import 여부
- MCP 설정 여부
- Skills 설치 여부
- ESLint plugin 설정 여부
- deprecated token/component 사용 여부

## 15. 문서 전략

문서는 사람이 보는 문서와 에이전트가 읽는 문서를 분리하되, 같은 metadata에서 생성한다.

### 사람이 보는 문서

- docs site
- Storybook
- migration guide
- release notes
- accessibility guide
- theming guide

### 에이전트가 읽는 문서

- `llms.txt`
- `llms-full.txt`
- component metadata JSON
- MCP resources
- Skills reference files

### 문서 자동 생성

컴포넌트 metadata에서 다음을 생성한다.

- Storybook docs
- docs-site component page
- MCP resource
- Skill reference
- migration hints

이렇게 해야 디자인 가이드 변경 시 여러 문서를 수동으로 수정하지 않아도 된다.

## 16. 배포 전략

### 패키지 이름 예시

- `@company-ui/react`
- `@company-ui/tokens`
- `@company-ui/icons`
- `@company-ui/theme`
- `@company-ui/mcp`
- `@company-ui/agent-skills`
- `@company-ui/cli`
- `@company-ui/eslint-plugin`
- `@company-ui/codemods`

### 릴리스 방식

- Changesets로 변경 사항을 기록한다.
- GitHub Actions에서 test, lint, build, package smoke test를 수행한다.
- canary 배포를 먼저 수행한다.
- main merge 후 stable release를 배포한다.
- release note에는 human-facing 변경과 agent-facing 변경을 분리해서 작성한다.

### 버전 정책

- patch: 버그 수정, 문서 수정, 비파괴 token metadata 수정
- minor: 새 컴포넌트, 새 token, 새 icon, 새 variant 추가
- major: token 삭제, component API 변경, 스타일 동작 변경, Skills/MCP 계약 변경

### 패키지 정렬

`@company-ui/*` 패키지는 기본적으로 같은 major version을 유지한다. CLI의 `doctor`가 version mismatch를 감지하도록 한다.

## 17. CI/CD 파이프라인

권장 GitHub Actions 단계:

```text
install
  pnpm install --frozen-lockfile

quality
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm test:a11y

build
  pnpm build
  pnpm build:storybook

validate-design-system
  pnpm tokens:validate
  pnpm icons:validate
  pnpm metadata:validate
  pnpm mcp:test
  pnpm skills:validate

release
  pnpm changeset version
  pnpm changeset publish
```

추가로 npm pack smoke test를 넣는다.

```bash
pnpm -r build
pnpm -r pack
npx @company-ui/cli doctor
```

## 18. 디자인 가이드 변경 대응

디자인 가이드가 변경되면 다음 흐름으로 반영한다.

1. 디자인 소스에서 token/icon/component spec을 export한다.
2. `packages/tokens`, `packages/icons`, `packages/component-metadata`를 갱신한다.
3. schema validation을 실행한다.
4. React 컴포넌트의 snapshot, interaction, a11y test를 실행한다.
5. Storybook visual regression을 실행한다.
6. MCP resource와 tool fixture를 갱신한다.
7. Skills reference 문서가 새 metadata를 가리키는지 검증한다.
8. deprecated 항목과 migration guide를 생성한다.
9. Changesets로 버전과 릴리스 노트를 작성한다.
10. canary 배포 후 example app에서 설치 검증한다.
11. stable 배포를 진행한다.

중요한 점은 Skills에 최신 토큰 값을 직접 많이 넣지 않는 것이다. Skills에 값을 복사하면 업데이트 때 누락될 가능성이 높아진다. Skills는 "반드시 MCP나 metadata에서 조회하라"는 규칙을 갖고, 실제 최신 데이터는 MCP와 metadata 패키지가 책임진다.

## 19. 구현 단계별 로드맵

### Phase 0. 제품 범위 확정

목표:

- 공개 배포할 범위와 사내 전용 범위를 분리한다.
- 라이선스, 네이밍, npm scope, GitHub repository 공개 범위를 결정한다.

산출물:

- 패키지 목록
- 지원 React version
- 지원 브라우저 범위
- 디자인 토큰 스키마 초안
- 컴포넌트 우선순위 목록

완료 기준:

- `@company-ui/*` 공개 패키지 naming 확정
- 디자인 소스 export 방식 확정
- Base UI를 사용할 컴포넌트 목록 확정

### Phase 1. 모노레포 부트스트랩

목표:

- Turborepo와 pnpm workspace를 구성한다.
- 공통 TypeScript, ESLint, Prettier, Vitest 설정을 잡는다.

산출물:

- `pnpm-workspace.yaml`
- `turbo.json`
- `packages/config`
- `apps/storybook`
- `apps/playground`

완료 기준:

- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm storybook`

### Phase 2. 토큰/아이콘 파이프라인

목표:

- 디자인 소스를 코드 패키지로 변환한다.
- token/icon metadata를 MCP와 문서에서 재사용할 수 있게 한다.

산출물:

- `@company-ui/tokens`
- `@company-ui/icons`
- token schema
- icon metadata
- Storybook token/icon gallery

완료 기준:

- CSS variables 생성
- TypeScript token export
- React icon component 생성
- token/icon validation 통과

### Phase 3. React 컴포넌트 MVP

목표:

- 가장 많이 쓰는 핵심 컴포넌트를 먼저 구현한다.

우선순위 예:

- Button
- Text
- Heading
- Icon
- Badge
- TextField
- Checkbox
- Radio
- Select
- Dialog
- Popover
- Tooltip
- Tabs
- Menu

완료 기준:

- 각 컴포넌트의 Storybook stories 존재
- variant controls 제공
- unit test 통과
- accessibility test 통과
- component metadata 존재

### Phase 4. MCP 서버 MVP

목표:

- 에이전트가 컴포넌트, 토큰, 아이콘 정보를 조회하고 코드 검증을 수행하게 한다.

산출물:

- `@company-ui/mcp`
- stdio server
- component/token/icon resources
- `search_components`
- `get_component_usage`
- `search_tokens`
- `search_icons`
- `validate_ui_code`

완료 기준:

- `npx @company-ui/mcp --stdio` 실행 가능
- MCP inspector 또는 실제 에이전트 환경에서 tool 호출 검증
- fixture 기반 MCP tool test 통과

### Phase 5. Skills MVP

목표:

- 에이전트의 디자인 시스템 사용 규칙을 고정한다.

산출물:

- `@company-ui/agent-skills`
- `company-ui/SKILL.md`
- `style-rules.md`
- `component-workflow.md`
- `validation.md`
- 설치 스크립트

완료 기준:

- `npx @company-ui/cli skills install` 동작
- Skill description이 trigger terms를 포함
- Skills 본문이 불필요하게 길지 않음
- MCP가 없을 때의 fallback 규칙 명시

### Phase 6. CLI와 외부 설치 경험

목표:

- 외부 사용자가 npm install과 npx만으로 시작할 수 있게 한다.

산출물:

- `@company-ui/cli`
- `create`
- `init`
- `mcp init`
- `skills install`
- `validate`
- `doctor`

완료 기준:

- 새 Vite React 앱 생성 가능
- UI 패키지 설치 가능
- MCP 설정 자동 생성 가능
- Skills 설치 가능
- `doctor`가 환경 문제를 진단

### Phase 7. 검증과 가드레일 강화

목표:

- 에이전트와 사람이 모두 디자인 시스템 규칙을 어기기 어렵게 만든다.

산출물:

- `@company-ui/eslint-plugin`
- `@company-ui/codemods`
- CLI validator
- CI template

완료 기준:

- 임의 색상 사용 탐지
- 임의 spacing 사용 탐지
- Base UI 직접 import 탐지
- 미승인 icon import 탐지
- deprecated token migration 제안

### Phase 8. 공개 배포 준비

목표:

- npm과 GitHub에서 외부 사용자가 신뢰할 수 있는 상태로 공개한다.

산출물:

- README
- Getting Started
- Migration Guide
- Contributing Guide
- Security Policy
- License
- Code of Conduct
- examples

완료 기준:

- npm package metadata 정리
- package exports 검증
- ESM/CJS 정책 확정
- tree-shaking 검증
- example app에서 설치 검증
- canary 릴리스 검증

## 20. 실제 사용 시나리오

### 시나리오 A. 사용자가 새 앱에 설치

```bash
npx @company-ui/cli create my-app --template vite-react
cd my-app
npm install
npm run dev
```

또는 기존 앱에 직접 설치:

```bash
npm install @company-ui/react @company-ui/theme @company-ui/icons
npm install -D @company-ui/cli @company-ui/mcp @company-ui/agent-skills
npx @company-ui/cli init
npx @company-ui/cli mcp init
npx @company-ui/cli skills install
```

### 시나리오 B. 에이전트가 UI 생성

1. 사용자가 "로그인 폼을 만들어줘"라고 요청한다.
2. Skill이 먼저 MCP 조회를 지시한다.
3. 에이전트가 `get_component_recipe`로 Form, TextField, Button 조합을 받는다.
4. 에이전트가 `get_component_usage`로 각 컴포넌트 props와 variants를 확인한다.
5. 에이전트가 승인된 컴포넌트와 token만 사용해 코드를 작성한다.
6. 에이전트가 `validate_ui_code` 또는 `npx @company-ui/cli validate`를 실행한다.
7. 검증 오류가 있으면 MCP가 제안한 수정안을 반영한다.

### 시나리오 C. 디자인 가이드 업데이트

1. 디자이너가 token과 component spec을 업데이트한다.
2. 개발자가 token/icon/component metadata generation을 실행한다.
3. 변경 diff와 migration guide가 생성된다.
4. React 컴포넌트와 Storybook snapshot을 업데이트한다.
5. MCP fixture와 Skills reference를 갱신한다.
6. canary 배포 후 example app에서 검증한다.
7. stable 배포 후 release note를 게시한다.

## 21. 초기 구현 체크리스트

- [ ] npm scope 결정
- [ ] 라이선스 결정
- [ ] Turborepo 생성
- [ ] pnpm workspace 구성
- [ ] Base UI 의존성 추가
- [ ] token schema 작성
- [ ] icon pipeline 작성
- [ ] Storybook 구성
- [ ] playground 앱 구성
- [ ] Button/Text/Icon/Dialog MVP 구현
- [ ] component metadata 생성
- [ ] MCP server stdio 구현
- [ ] Skills 초안 작성
- [ ] CLI `init`, `mcp init`, `skills install`, `validate` 구현
- [ ] ESLint plugin MVP 구현
- [ ] Changesets 릴리스 구성
- [ ] canary 배포 검증
- [ ] 외부 README와 examples 작성

## 22. 주요 리스크와 대응

| 리스크 | 대응 |
| --- | --- |
| Skills가 오래된 토큰 값을 포함 | Skills에는 규칙만 두고 값은 MCP/metadata에서 조회 |
| 에이전트가 임의 스타일 생성 | Skills, MCP validation, ESLint, CLI validation으로 중복 차단 |
| Base UI API 변경 | wrapper 내부에서 흡수하고 공개 API를 디자인 시스템 기준으로 유지 |
| 외부 사용자의 설치 복잡도 증가 | `@company-ui/cli init`, `doctor`, example template 제공 |
| 디자인 변경 시 문서 누락 | component metadata에서 Storybook, docs, MCP resource를 자동 생성 |
| 아이콘/토큰 이름 충돌 | schema validation과 naming convention CI로 차단 |
| 접근성 회귀 | Base UI primitive 활용, axe, interaction test, Storybook a11y로 검증 |

## 23. 추천 시작 순서

가장 먼저 만들 것은 React 컴포넌트가 아니라 데이터 계약이다.

1. token schema
2. icon metadata schema
3. component metadata schema
4. React component public API convention
5. Storybook MVP
6. MCP resource shape
7. Skills rule draft

이 순서로 시작하면 디자인 가이드 변경에 강한 구조가 된다. React 컴포넌트, 문서, MCP, Skills가 모두 같은 metadata를 바라보게 되므로 업데이트와 배포가 쉬워지고, 에이전트가 임의 스타일을 만들 가능성도 줄어든다.
