# NC AI Design System Temp

Base UI를 내부 primitive로 사용하고, NC AI 디자인 토큰과 승인된 아이콘만 노출하는 React 디자인 시스템 MVP입니다. 현재 공개 테스트 배포를 위해 패키지명 끝에 `temp`를 붙인 상태이며, 첫 MVP 범위는 `Checkbox` 컴포넌트, 토큰, 아이콘, metadata, MCP 서버, Agent Skill, 설치 CLI입니다.

이 저장소는 개인 GitHub 저장소 [GronkOut/ncai-design-system-temp](https://github.com/GronkOut/ncai-design-system-temp.git)에 업로드하고 npm organization `@ncai`로 public package를 배포하는 구성을 기준으로 합니다.

## 빠른 설치

React 앱에서 UI만 사용할 때:

```bash
npm install @ncai/design-system-temp @ncai/design-tokens-temp
```

앱 entry 파일에서 스타일을 한 번 import합니다.

```tsx
import '@ncai/design-tokens-temp/styles.css';
import '@ncai/design-system-temp/styles.css';
```

컴포넌트 사용 예:

```tsx
import { Checkbox } from '@ncai/design-system-temp';

export function Example() {
  return <Checkbox aria-label="약관 동의" />;
}
```

아이콘을 직접 써야 하는 경우에만 아이콘 패키지를 추가합니다.

```bash
npm install @ncai/design-icons-temp
```

에이전트 MCP와 Skill까지 설정할 때:

```bash
npm install -D @ncai/design-system-cli-temp
npx @ncai/design-system-cli-temp setup-mcp
npx @ncai/design-system-cli-temp install-skill
```

직접 MCP 서버를 실행해야 하는 환경에서는 다음 패키지를 설치합니다.

```bash
npm install -D @ncai/design-system-mcp-temp
npx @ncai/design-system-mcp-temp
```

## 패키지 구성

`packages/react`는 npm에서 `@ncai/design-system-temp`로 배포됩니다. 외부 사용자가 실제로 import하는 React 컴포넌트 패키지이며, 현재 `Checkbox`와 `metadata` re-export를 제공합니다. Base UI는 내부 구현 세부 사항으로 두고 공개 API는 디자인 시스템 계약으로 제한합니다.

`packages/tokens`는 `@ncai/design-tokens-temp`입니다. `resource/token/figma.scss`를 원천 참고 자료로 삼고, 앱에서 import 가능한 `--ncai-*` CSS variables를 생성합니다.

`packages/icons`는 `@ncai/design-icons-temp`입니다. 현재 `Checkbox`에서 쓰는 `CheckIcon`, `PartialIcon`만 승인 아이콘으로 제공합니다. 임의 SVG나 외부 아이콘 라이브러리 사용을 줄이기 위한 독립 패키지입니다.

`packages/metadata`는 `@ncai/design-system-metadata-temp`입니다. 컴포넌트, 토큰, 아이콘 metadata의 단일 소스이며 React 패키지, MCP, CLI가 같은 데이터를 보도록 합니다.

`packages/mcp`는 `@ncai/design-system-mcp-temp`입니다. 에이전트가 컴포넌트 사용법, 승인 토큰, 승인 아이콘을 조회하고 UI 코드 검증을 수행할 수 있는 stdio MCP 서버입니다.

`packages/skills`는 `@ncai/design-system-skills-temp`입니다. Cursor Agent Skill 형식의 정적 규칙을 제공합니다. 상세 데이터는 Skill에 복사하지 않고 MCP와 metadata를 조회하도록 유도합니다.

`packages/cli`는 `@ncai/design-system-cli-temp`입니다. 사용자 프로젝트에서 `setup-mcp`, `install-skill`, `validate`, `doctor` 명령을 실행하는 설치 진입점입니다.

`apps/storybook`은 로컬 문서와 시각 확인용 Storybook 앱입니다. npm 배포 대상이 아니라 개발/QA용 앱으로 유지합니다.

`resource`는 토큰 원본과 로드맵 등 설계 참고 자료를 둡니다. `resource/docs/baseui-mcp-skills-roadmap.md`는 장기 구조 기준 문서이며, `resource/token/figma.scss`는 현재 토큰 alias의 원천 참고 파일입니다.

## 로컬 개발

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm storybook
```

주요 명령:

- `pnpm build`: 모든 배포 패키지와 Storybook 정적 빌드를 생성합니다.
- `pnpm typecheck`: 각 워크스페이스의 TypeScript 검사를 실행합니다.
- `pnpm test`: React 컴포넌트 테스트와 MCP validation 테스트를 실행합니다.
- `pnpm storybook`: 로컬 Storybook을 실행합니다.
- `pnpm smoke:pack`: npm publish 전 tarball을 만들고 임시 소비자 프로젝트에 설치해 exports와 파일 구성을 확인합니다.
- `pnpm mcp`: 로컬 MCP 서버를 source 상태로 실행합니다.

## Checkbox

현재 MVP 컴포넌트는 `Checkbox` 하나입니다.

```tsx
import { Checkbox } from '@ncai/design-system-temp';

export function AgreementField() {
  return <Checkbox aria-label="약관 동의" defaultChecked />;
}
```

지원하는 디자인 시스템 API:

- `shape`: `square` 또는 `circle`
- `warning`: 미선택 상태의 경고 보더
- `indeterminate`: 일부 선택 상태
- Base UI `Checkbox.Root`에서 전달되는 `checked`, `defaultChecked`, `disabled`, `required`, `name`, `value`, `onCheckedChange` 등

접근 가능한 이름은 필수입니다. 외부 `<label>`로 연결하거나 `aria-label`을 전달해야 합니다.

```tsx
<Checkbox aria-label="항목 선택" shape="circle" />
<Checkbox aria-label="확인 필요" warning />
```

구현 위치:

- `packages/react/src/components/Checkbox/Checkbox.tsx`
- `packages/react/src/components/Checkbox/Checkbox.css`
- `apps/storybook/src/Checkbox.stories.tsx`
- `packages/metadata/src/index.ts`

## MCP와 Agent Skill

MCP 서버가 제공하는 주요 도구:

- `search_components`
- `get_component_usage`
- `get_component_recipe`
- `list_design_tokens`
- `search_tokens`
- `list_icons`
- `search_icons`
- `validate_ui_code`

Cursor 프로젝트에 기본 MCP 설정을 추가합니다.

```bash
npx @ncai/design-system-cli-temp setup-mcp
```

기본적으로 `.cursor/mcp.json`에 다음 형태의 서버 설정을 병합합니다.

```json
{
  "mcpServers": {
    "ncai-design-system-temp": {
      "command": "npx",
      "args": ["-y", "@ncai/design-system-mcp-temp"]
    }
  }
}
```

Cursor Skill을 프로젝트에 설치합니다.

```bash
npx @ncai/design-system-cli-temp install-skill
```

개인 Cursor 환경에 설치하려면:

```bash
npx @ncai/design-system-cli-temp install-skill --target cursor-user
```

검증 명령 예:

```bash
npx @ncai/design-system-cli-temp validate --file src/App.tsx
npx @ncai/design-system-cli-temp doctor
```

`doctor`는 소비자 프로젝트 루트에서 다음 항목을 진단합니다.

- React 18 이상 설치 여부
- `@ncai/design-system-temp`, `@ncai/design-tokens-temp` 설치 여부
- 설치된 `@ncai/*-temp` 디자인 시스템 패키지의 버전 정렬 여부
- 앱 소스의 `@ncai/design-tokens-temp/styles.css`, `@ncai/design-system-temp/styles.css` import 여부
- `.cursor/mcp.json`의 MCP 서버 등록 여부
- `.cursor/skills/ncai-design-system/SKILL.md` 설치 여부

다른 경로의 프로젝트를 검사하려면 `--cwd`를 사용합니다.

```bash
npx @ncai/design-system-cli-temp doctor --cwd ../my-react-app
```

## 디자인 업데이트 흐름

토큰이 바뀌면 `resource/token/figma.scss`를 새 export로 교체한 뒤 `packages/tokens/src/styles.scss`의 alias mapping만 확인합니다. CSS variable 이름이 유지되면 React 컴포넌트와 MCP metadata 변경 없이 빌드 검증만으로 반영할 수 있습니다.

컴포넌트를 추가하거나 변경할 때는 metadata를 먼저 갱신하고, React 구현, CSS, Storybook, 테스트, MCP/Skill 규칙을 같은 PR에서 맞춥니다. 현재 권장 순서는 `metadata -> tokens/icons 필요 여부 -> React component -> Storybook -> tests -> MCP validation -> Skill rule`입니다.

새 컴포넌트는 최소한 다음 산출물을 갖는 것을 목표로 합니다.

```text
packages/react/src/components/ComponentName/
├── ComponentName.tsx
├── ComponentName.css
├── ComponentName.test.tsx
└── index.ts
```

그리고 다음 파일을 함께 갱신합니다.

- `packages/react/src/index.ts`
- `packages/metadata/src/index.ts`
- `apps/storybook/src/ComponentName.stories.tsx`
- 필요한 경우 `packages/icons` 또는 `packages/tokens`
- 필요한 경우 `packages/mcp/src/validation.ts`와 `packages/skills/company-ui/SKILL.md`

## 배포

npm public 배포 대상:

- `@ncai/design-system-temp`
- `@ncai/design-tokens-temp`
- `@ncai/design-icons-temp`
- `@ncai/design-system-metadata-temp`
- `@ncai/design-system-mcp-temp`
- `@ncai/design-system-skills-temp`
- `@ncai/design-system-cli-temp`

배포 전 검증:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm smoke:pack
```

릴리스는 Changesets와 GitHub Actions를 사용합니다. GitHub 저장소에 `NPM_TOKEN` secret이 등록되어 있으면 `Release` workflow를 수동 실행해 verify 후 publish할 수 있습니다.

로컬에서 직접 배포해야 하는 경우:

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

`pnpm release`는 `pnpm build`, `pnpm smoke:pack`, `changeset publish` 순서로 실행됩니다.

## 운영 원칙

Base UI는 외부 사용자가 직접 조립하는 API가 아니라 내부 접근성 primitive로 사용합니다. 외부 문서와 예제는 `@ncai/design-system-temp` 컴포넌트만 보여줍니다.

Skills에는 토큰 전체 목록이나 컴포넌트 상세를 길게 복사하지 않습니다. 자주 바뀌는 데이터는 `packages/metadata`와 MCP가 책임지고, Skills는 "조회하고 검증하라"는 행동 규칙만 유지합니다.

임의 색상, inline SVG, 미승인 아이콘, 앱 코드의 Base UI 직접 import는 장기적으로 CLI/MCP/ESLint 단계에서 계속 강화해야 합니다. 현재 MVP는 MCP `validate_ui_code`와 CLI `validate`로 기본 패턴만 검사합니다.
