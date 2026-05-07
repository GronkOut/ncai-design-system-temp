# NC AI Design System Temp

NC AI 디자인 시스템의 React MVP 저장소입니다. Base UI는 내부 접근성 primitive로 사용하고, 외부 앱에는 NC AI에서 승인한 컴포넌트, 디자인 토큰, 아이콘만 노출합니다.

현재 공개 테스트 배포를 위해 패키지명 끝에 `temp`를 붙였습니다. 첫 MVP 범위는 `Checkbox` 컴포넌트, 토큰, 아이콘, metadata, MCP 서버, Agent Skill, 설치 CLI입니다.

---

## 목차

- [저장소 이해하기](#저장소-이해하기)
  - [목적](#목적)
  - [관리 범위](#관리-범위)
- [사용자 설치와 사용](#사용자-설치와-사용)
  - [기본 설치](#기본-설치)
  - [스타일 적용](#스타일-적용)
  - [컴포넌트 사용](#컴포넌트-사용)
  - [설치 확인](#설치-확인)
- [저장소 구성](#저장소-구성)
  - [배포 패키지](#배포-패키지)
  - [개발용 앱과 자료](#개발용-앱과-자료)
- [Checkbox 사용법](#checkbox-사용법)
  - [기본 예시](#기본-예시)
  - [접근성](#접근성)
  - [지원 API](#지원-api)
  - [구현 위치](#구현-위치)
- [MCP와 Agent Skill 설정](#mcp와-agent-skill-설정)
  - [MCP 실행 방식](#mcp-실행-방식)
  - [Cursor 프로젝트 설정](#cursor-프로젝트-설정)
  - [Agent Skill 설치](#agent-skill-설치)
  - [MCP 수동 실행](#mcp-수동-실행)
  - [MCP 제공 도구](#mcp-제공-도구)
  - [CLI 코드 검증](#cli-코드-검증)
- [디자이너/개발자 운영 업데이트](#디자이너개발자-운영-업데이트)
  - [토큰 업데이트](#토큰-업데이트)
  - [컴포넌트 업데이트](#컴포넌트-업데이트)
  - [Metadata 관리](#metadata-관리)
- [로컬 개발과 확인](#로컬-개발과-확인)
  - [의존성 설치](#의존성-설치)
  - [Storybook 확인](#storybook-확인)
  - [MCP 로컬 개발](#mcp-로컬-개발)
  - [예제 앱과 전체 빌드](#예제-앱과-전체-빌드)
- [테스트와 배포](#테스트와-배포)
  - [배포 전 검증](#배포-전-검증)
  - [npm 배포 대상](#npm-배포-대상)
  - [릴리스 방법](#릴리스-방법)
- [운영 원칙](#운영-원칙)
  - [공개 API 원칙](#공개-api-원칙)
  - [문서와 규칙 관리](#문서와-규칙-관리)
  - [검증 강화 방향](#검증-강화-방향)

---

## 저장소 이해하기

### 목적

이 저장소는 개인 GitHub 저장소 [GronkOut/ncai-design-system-temp](https://github.com/GronkOut/ncai-design-system-temp.git)에 업로드하고, npm organization `@ncai`로 public package를 배포하는 구성을 기준으로 합니다.

외부 사용자는 대부분 `@ncai/design-system-temp`와 `@ncai/design-tokens-temp`만 설치하면 됩니다. MCP, Skill, CLI는 디자인 시스템을 더 안전하게 사용하거나 검증해야 할 때 추가로 설정합니다.

### 관리 범위

디자인 시스템은 다음 세 가지를 함께 관리합니다.

- React 앱에서 직접 사용하는 컴포넌트와 스타일
- 디자이너와 개발자가 합의한 토큰, 아이콘, 컴포넌트 metadata
- Cursor 같은 에이전트가 올바른 사용법을 조회하고 검증할 수 있는 MCP와 Skill

---

## 사용자 설치와 사용

### 기본 설치

React 앱에서 UI 컴포넌트만 사용할 때는 컴포넌트 패키지와 토큰 패키지를 설치합니다.

```bash
npm install @ncai/design-system-temp @ncai/design-tokens-temp
```

아이콘을 앱 코드에서 직접 써야 하는 경우에만 아이콘 패키지를 추가합니다. 일반적인 컴포넌트 사용에는 별도 설치가 필요하지 않습니다.

```bash
npm install @ncai/design-icons-temp
```

### 스타일 적용

앱 entry 파일에서 디자인 시스템 스타일을 한 번 import합니다. 이 파일은 컴포넌트 스타일과 기본 토큰 CSS variable을 함께 포함합니다.

```tsx
import '@ncai/design-system-temp/styles.css';
```

토큰 CSS만 별도로 쓰는 고급 사용 사례에서는 `@ncai/design-tokens-temp/styles.css`를 직접 import할 수 있지만, 일반적인 컴포넌트 사용에는 필요하지 않습니다.

### 컴포넌트 사용

컴포넌트는 `@ncai/design-system-temp`에서 import합니다.

```tsx
import { Checkbox } from '@ncai/design-system-temp';

export function Example() {
  return <Checkbox aria-label="약관 동의" />;
}
```

### 설치 확인

설치가 제대로 되었는지 확인하려면 사용자 프로젝트 루트에서 CLI의 `doctor`를 실행합니다.

```bash
npx @ncai/design-system-cli-temp doctor
```

`doctor`는 React 버전, 필수 패키지 설치 여부, 디자인 시스템 스타일 import 여부, MCP/Skill 설정 여부를 진단합니다. 다른 경로의 프로젝트를 검사하려면 `--cwd`를 사용합니다.

```bash
npx @ncai/design-system-cli-temp doctor --cwd ../my-react-app
```

---

## 저장소 구성

### 배포 패키지

- `packages/react`
  - npm에서 `@ncai/design-system-temp`로 배포되는 React 컴포넌트 패키지입니다.
  - 현재 `Checkbox`와 `metadata` re-export를 제공합니다.
  - Base UI는 이 패키지 내부 구현으로만 사용하고, 앱에서는 디자인 시스템 컴포넌트만 import하도록 제한합니다.
- `packages/tokens`
  - npm에서 `@ncai/design-tokens-temp`로 배포되는 토큰 패키지입니다.
  - `resource/token/figma.scss`를 원천 참고 자료로 삼고, 앱에서 import할 수 있는 `--ncai-*` CSS variables를 생성합니다.
- `packages/icons`
  - npm에서 `@ncai/design-icons-temp`로 배포되는 아이콘 패키지입니다.
  - 현재 `Checkbox`에서 쓰는 `CheckIcon`, `PartialIcon`만 승인 아이콘으로 제공합니다.
  - 앱에서 임의 SVG나 외부 아이콘을 가져다 쓰는 상황을 줄이기 위한 패키지입니다.
- `packages/metadata`
  - npm에서 `@ncai/design-system-metadata-temp`로 배포되는 metadata 패키지입니다.
  - 컴포넌트, 토큰, 아이콘 metadata의 단일 소스입니다.
  - React 패키지, MCP, CLI가 같은 데이터를 보게 해서 문서와 검증 결과가 어긋나지 않도록 합니다.
- `packages/mcp`
  - npm에서 `@ncai/design-system-mcp-temp`로 배포되는 MCP 패키지입니다.
  - 에이전트가 컴포넌트 사용법, 승인 토큰, 승인 아이콘을 조회하고 UI 코드 검증을 수행할 수 있는 stdio MCP 서버입니다.
- `packages/skills`
  - npm에서 `@ncai/design-system-skills-temp`로 배포되는 Cursor Agent Skill 패키지입니다.
  - 자주 바뀌는 상세 데이터는 Skill에 복사하지 않고 MCP와 metadata를 조회하도록 안내합니다.
- `packages/cli`
  - npm에서 `@ncai/design-system-cli-temp`로 배포되는 CLI 패키지입니다.
  - 사용자 프로젝트에서 `setup-mcp`, `install-skill`, `validate`, `doctor` 같은 명령을 실행하는 설치 진입점입니다.

### 개발용 앱과 자료

- `apps/storybook`
  - 로컬 문서와 시각 확인용 Storybook 앱입니다.
  - npm 배포 대상이 아니라 개발과 QA를 위한 앱으로 유지합니다.
- `examples/vite-react`
  - 외부 사용자가 설치하는 방식에 가까운 Vite React 예제입니다.
  - 로컬에서 실행하려면 저장소 루트에서 `pnpm --filter @ncai/design-system-example-vite-react-temp dev`를 실행합니다.
  - 빌드만 확인하려면 `pnpm --filter @ncai/design-system-example-vite-react-temp build`를 실행합니다.
  - 이 예제는 React 컴포넌트와 토큰 사용을 확인하는 앱이며, MCP/Skill이 연결된 예제는 아닙니다.
  - 배포 전 smoke test에서는 실제 tarball을 설치하고 Vite build, 최소 사용자 설치, CLI 설치 명령까지 확인합니다.
  - tarball은 npm 패키지를 배포 직전 설치 가능한 파일로 묶은 `.tgz` 파일입니다. `pnpm smoke:pack`은 이 파일들을 만든 뒤 임시 소비자 프로젝트에 설치해, npm publish 후에도 README의 설치 흐름이 정상 동작할지 미리 확인합니다.
- `resource`
  - 토큰 원본과 로드맵 등 설계 참고 자료를 둡니다.
  - `resource/token/figma.scss`는 현재 토큰 alias의 원천 참고 파일입니다.

---

## Checkbox 사용법

### 기본 예시

현재 MVP 컴포넌트는 `Checkbox` 하나입니다.

```tsx
import { Checkbox } from '@ncai/design-system-temp';

export function AgreementField() {
  return <Checkbox aria-label="약관 동의" defaultChecked />;
}
```

### 접근성

접근 가능한 이름은 필수입니다. 화면에 보이는 텍스트가 있다면 외부 `<label>`과 연결하고, 보이는 텍스트가 없다면 `aria-label`을 전달합니다.

```tsx
<label>
  <Checkbox defaultChecked /> 약관에 동의합니다
</label>

<Checkbox aria-label="항목 선택" shape="circle" />
```

### 지원 API

지원하는 디자인 시스템 API는 다음과 같습니다.

- `shape`: `square` 또는 `circle`
- `warning`: 미선택 상태의 경고 보더
- `indeterminate`: 일부 선택 상태
- `className`: 레이아웃 보정 목적에만 사용
- 내부 Base UI `Checkbox.Root`로 전달되는 `checked`, `defaultChecked`, `disabled`, `required`, `name`, `value`, `onCheckedChange` 등

색상, spacing, radius, typography는 임의 `style`이 아니라 metadata에 정의된 component token과 `--ncai-*` CSS variable로 관리합니다. 그래서 `style` prop은 공개 타입 계약에서 제외합니다. `className`은 root에만 병합되며 색상이나 크기 변경이 아니라 레이아웃 훅으로만 사용합니다.

```tsx
<Checkbox aria-label="확인 필요" warning />
<Checkbox aria-label="일부 항목 선택됨" indeterminate />
```

### 구현 위치

구현을 확인할 때는 다음 파일을 보면 됩니다.

- `packages/react/src/components/Checkbox/Checkbox.tsx`
- `packages/react/src/components/Checkbox/Checkbox.css`
- `apps/storybook/src/Checkbox.stories.tsx`
- `packages/metadata/src/components/Checkbox.metadata.ts`

---

## MCP와 Agent Skill 설정

### MCP 실행 방식

MCP는 에이전트가 디자인 시스템 정보를 물어볼 수 있는 작은 로컬 서버입니다. 여기서 "서버"는 보통 웹 서버처럼 배포해 두는 HTTP 서버가 아니라, Cursor가 필요할 때 실행하는 stdio 프로세스입니다.

기본 사용자는 이 저장소를 직접 clone하지 않아도 됩니다. npm에 배포된 MCP 패키지를 `npx`로 실행하도록 Cursor 설정만 추가하면 됩니다.

### Cursor 프로젝트 설정

에이전트가 디자인 시스템 규칙을 조회하고 코드를 검증해야 한다면 사용자 프로젝트에 CLI를 개발 의존성으로 설치합니다.

```bash
npm install -D @ncai/design-system-cli-temp
```

그다음 Cursor 프로젝트에 기본 MCP 설정을 추가합니다.

```bash
npx @ncai/design-system-cli-temp setup-mcp
```

이 명령은 기본적으로 `.cursor/mcp.json`에 다음 형태의 서버 설정을 병합합니다.

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

이 설정의 의미는 "Cursor가 `ncai-design-system-temp` MCP를 사용할 때 `npx -y @ncai/design-system-mcp-temp`를 실행한다"입니다. 처음 실행할 때는 npm registry에서 패키지를 받아 로컬에서 실행하고, 이후에는 npm/npx 캐시 정책에 따라 재사용됩니다.

### Agent Skill 설치

Cursor Skill도 함께 설치하면 에이전트가 MCP를 언제 조회하고 어떤 규칙을 따라야 하는지 더 잘 알 수 있습니다.

```bash
npx @ncai/design-system-cli-temp install-skill
```

개인 Cursor 환경에 설치하려면 `--target cursor-user`를 사용합니다.

```bash
npx @ncai/design-system-cli-temp install-skill --target cursor-user
```

### MCP 수동 실행

직접 MCP 서버 동작을 확인해야 하는 환경에서는 MCP 패키지를 설치해 수동으로 실행할 수 있습니다. 이 경우에도 실행 위치는 사용자 PC 또는 CI 같은 로컬 실행 환경입니다.

```bash
npm install -D @ncai/design-system-mcp-temp
npx @ncai/design-system-mcp-temp
```

이 저장소를 clone해서 MCP 자체를 개발하거나 디버깅할 때는 저장소 루트에서 source 상태로 실행합니다.

```bash
pnpm mcp
```

### MCP 제공 도구

MCP 서버가 제공하는 주요 도구는 다음과 같습니다.

- `search_components`: 승인된 컴포넌트를 검색합니다. `query`를 생략하면 전체 컴포넌트 목록을 반환하고, 현재 MVP에서는 `Checkbox`가 조회됩니다.
- `get_component_usage`: 특정 컴포넌트의 props, 사용 규칙, 예시를 반환합니다. 입력 이름은 metadata의 승인 컴포넌트 목록에서 조회하며, 현재는 `Checkbox`가 등록되어 있습니다.
- `get_component_recipe`: "체크박스가 있는 동의 UI를 만들어줘"처럼 간단한 UI 요청을 넣으면 metadata의 컴포넌트 설명, 규칙, 예시를 바탕으로 승인 컴포넌트 조합 방법을 반환합니다.
- `list_design_tokens`: 사용할 수 있는 `--ncai-*` CSS variable 토큰 목록을 반환합니다. 임의 색상이나 spacing을 쓰기 전에 에이전트가 확인하는 용도입니다.
- `search_tokens`: 토큰 이름을 검색합니다. 예를 들어 색상, radius, checkbox 관련 토큰이 필요한지 좁혀볼 때 사용합니다.
- `list_icons`: 승인된 아이콘 컴포넌트 목록을 반환합니다. 앱에서 임의 SVG를 만들기 전에 사용할 아이콘이 있는지 확인합니다.
- `search_icons`: 아이콘 이름이나 사용 목적을 기준으로 승인 아이콘을 검색합니다.
- `validate_ui_code`: 생성된 UI 코드 문자열을 검사합니다. Base UI 직접 import, 임의 색상값, Tailwind arbitrary value, 미승인 아이콘 import 같은 기본 위반을 찾습니다.

예를 들어 에이전트가 `Checkbox`를 사용한 코드를 만들 때는 보통 `search_components`로 가능한 컴포넌트를 찾고, `get_component_usage`로 사용 규칙을 확인한 뒤, 마지막에 `validate_ui_code`로 생성 코드를 점검합니다.

### CLI 코드 검증

UI 코드 한 파일만 빠르게 검사하려면 CLI의 `validate`를 사용합니다.

```bash
npx @ncai/design-system-cli-temp validate --file src/App.tsx
```

CLI `validate`와 MCP `validate_ui_code`는 같은 검증 로직을 사용합니다. 현재 검증은 앱 코드의 Base UI 직접 import, 임의 색상, Tailwind arbitrary value, 표준 Tailwind 색상/spacing 우회, 미승인 토큰, 미승인 아이콘 같은 기본 패턴을 잡는 데 초점을 둡니다.

---

## 디자이너/개발자 운영 업데이트

### 토큰 업데이트

토큰이 바뀌면 `resource/token/figma.scss`를 새 export로 교체한 뒤 `packages/tokens/src/styles.scss`의 alias mapping을 확인합니다. CSS variable 이름이 유지되면 React 컴포넌트와 MCP metadata를 바꾸지 않고도 반영할 수 있습니다.

토큰 변경 후에는 토큰 패키지 빌드와 전체 타입 검사를 확인합니다.

```bash
pnpm --filter @ncai/design-tokens-temp build
pnpm typecheck
```

### 컴포넌트 업데이트

컴포넌트를 추가하거나 변경할 때는 metadata를 먼저 갱신합니다. metadata가 컴포넌트의 이름, props, token, 접근성 요구사항, migration 정보를 설명하므로 React 구현과 MCP/CLI 검증의 기준이 됩니다.

권장 순서는 다음과 같습니다.

```text
metadata -> tokens/icons 필요 여부 -> React component -> Storybook -> tests -> MCP validation -> Skill rule
```

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
- `packages/metadata/src/components/ComponentName.metadata.ts`
- `packages/metadata/src/index.ts`
- `apps/storybook/src/ComponentName.stories.tsx`
- 필요한 경우 `packages/icons` 또는 `packages/tokens`
- 필요한 경우 `packages/mcp/src/validation.ts`와 `packages/skills/company-ui/SKILL.md`

새 컴포넌트 metadata에는 `keywords`, `rules`, `examples`, `componentTokens`, `deprecated`, `migration`을 빠뜨리지 않습니다. 특히 `keywords`는 MCP `get_component_recipe` 검색 품질에 직접 영향을 주므로, 컴포넌트 이름뿐 아니라 사용자가 자연어로 요청할 법한 한국어/영어 표현을 함께 넣습니다.

새 컴포넌트를 추가할 때는 metadata validate와 MCP recipe 테스트도 함께 추가하거나 갱신합니다. 예를 들어 새 컴포넌트를 찾는 자연어 요청은 후보를 반환해야 하고, 관련 없는 일반 UI 요청은 잘못된 후보를 반환하지 않아야 합니다. 이 규칙은 에이전트가 README만 보고 작업할 때도 반드시 따라야 하는 운영 기준입니다.

### Metadata 관리

metadata에는 `deprecated`와 `migration` 필드를 항상 포함합니다. 아직 deprecated가 아니어도 `deprecated: { isDeprecated: false }`, `migration: { notes: [] }`를 명시해 추후 버전 변경과 migration 문서를 같은 구조로 관리합니다.

metadata 계약을 확인할 때는 metadata 패키지의 validate를 실행합니다.

```bash
pnpm --filter @ncai/design-system-metadata-temp validate
```

---

## 로컬 개발과 확인

### 의존성 설치

저장소를 처음 받은 뒤에는 의존성을 설치합니다.

```bash
pnpm install
```

### Storybook 확인

컴포넌트를 눈으로 확인하거나 문서를 보면서 개발할 때는 Storybook을 실행합니다.

```bash
pnpm storybook
```

### MCP 로컬 개발

로컬 MCP 서버를 source 상태로 실행해야 할 때는 다음 명령을 사용합니다.

```bash
pnpm mcp
```

### 예제 앱과 전체 빌드

Vite 예제만 직접 확인할 때는 예제 앱 build를 실행합니다.

```bash
pnpm --filter @ncai/design-system-example-vite-react-temp build
```

전체 패키지 빌드가 필요한 경우에는 루트에서 build를 실행합니다.

```bash
pnpm build
```

`pnpm build`는 모든 배포 패키지와 Storybook 정적 빌드를 생성합니다.

---

## 테스트와 배포

### 배포 전 검증

배포 전에는 타입, metadata, 테스트, 빌드, 패키징 검증을 순서대로 확인합니다.

```bash
pnpm typecheck
pnpm validate
pnpm test
pnpm build
pnpm smoke:pack
```

각 명령은 다음 역할을 합니다.

- `pnpm typecheck`: 각 워크스페이스의 TypeScript 검사를 실행합니다.
- `pnpm validate`: metadata와 각 패키지의 validate 계약을 확인합니다.
- `pnpm test`: React 컴포넌트 테스트와 MCP validation 테스트를 실행합니다.
- `pnpm build`: 배포 패키지와 Storybook 정적 빌드를 생성합니다.
- `pnpm smoke:pack`: npm publish 전 tarball을 만들고 pnpm/npm 임시 소비자 프로젝트와 `examples/vite-react`에 설치해 exports, CLI 명령, 스타일 import, Vite build를 확인합니다.

### npm 배포 대상

npm public 배포 대상은 다음 패키지입니다.

- `@ncai/design-system-temp`
- `@ncai/design-tokens-temp`
- `@ncai/design-icons-temp`
- `@ncai/design-system-metadata-temp`
- `@ncai/design-system-mcp-temp`
- `@ncai/design-system-skills-temp`
- `@ncai/design-system-cli-temp`

### 릴리스 방법

릴리스는 Changesets와 GitHub Actions를 사용합니다. GitHub 저장소에 `NPM_TOKEN` secret이 등록되어 있으면 `Release` workflow를 수동 실행해 verify 후 publish할 수 있습니다.

현재 temp 패키지의 첫 publish 버전은 `0.1.0`으로 확정합니다. 이후 temp 테스트 배포 변경분부터는 반드시 changeset을 만들고 버전을 반영한 뒤 release합니다.

```bash
pnpm changeset
pnpm version-packages
pnpm release
```

`pnpm release`는 내부적으로 `pnpm typecheck`, `pnpm validate`, `pnpm test`, `pnpm build`, `pnpm smoke:pack`, `changeset publish` 순서로 실행됩니다.

GitHub `Release` workflow는 같은 검증 명령을 먼저 실행한 뒤 `changeset publish`만 호출합니다. 로컬에서 직접 배포할 때는 `pnpm release`를 사용하고, GitHub Actions에서는 workflow의 verify 단계를 표준 게이트로 사용합니다.

나중에 정식 패키지로 전환할 때는 패키지명에서 `temp`를 제거하고 `1.0.0` 기준으로 별도 release를 준비합니다.

---

## 운영 원칙

### 공개 API 원칙

Base UI는 외부 사용자가 직접 조립하는 API가 아니라 내부 접근성 primitive로 사용합니다. 외부 문서와 예제는 `@ncai/design-system-temp` 컴포넌트만 보여줍니다.

### 문서와 규칙 관리

Skills에는 토큰 전체 목록이나 컴포넌트 상세를 길게 복사하지 않습니다. 자주 바뀌는 데이터는 `packages/metadata`와 MCP가 책임지고, Skills는 "조회하고 검증하라"는 행동 규칙만 유지합니다.

### 검증 강화 방향

임의 색상, inline SVG, 미승인 아이콘, 앱 코드의 Base UI 직접 import는 장기적으로 CLI/MCP/ESLint 단계에서 계속 강화해야 합니다. 현재 MVP는 metadata 패키지의 공통 검증 로직을 CLI `validate`와 MCP `validate_ui_code`가 함께 사용해 기본 패턴을 검사합니다.

---
