# Getdesign 정식 디자인 시스템 연동 로드맵

## 목적

이 문서는 PoC MVP 단계를 마친 `ncai-design-system-temp`를 정식 디자인 시스템으로 개편할 때, Getdesign에 등록할 `DESIGN.md`를 어떤 입력물로 준비하고 이 저장소에 어떻게 반영할지 정리한 실행 시나리오다.

Getdesign은 `DESIGN.md`를 배포하고 공유하는 디자인 시스템 컬렉션 서비스다. 프로젝트 루트에 디자인 문서를 내려받은 뒤 AI 코딩 에이전트가 그 문서를 기준으로 UI를 생성하도록 하는 흐름을 제공한다. 공개 예시인 Apple 디자인 시스템은 "프리미엄 화이트 스페이스, SF Pro, 시네마틱 이미지"처럼 브랜드 언어를 문장으로 설명하고, 색상/타이포그래피/레이아웃/컴포넌트/반응형 규칙을 토큰 수준으로 쪼개 제공한다.

이 프로젝트에서는 Getdesign의 `DESIGN.md`를 단순 참고문서가 아니라 아래 패키지들의 상위 입력물로 취급한다.

- `packages/tokens`: CSS variable과 TypeScript token export
- `packages/react`: 승인된 React 컴포넌트와 스타일
- `packages/metadata`: 토큰, 아이콘, 컴포넌트 metadata
- `packages/mcp`: AI 에이전트가 조회하고 검증하는 MCP 서버
- `packages/skills`: Cursor Agent Skill 안내 문서
- `packages/cli`: 사용자 프로젝트의 설치, 검증, doctor 명령

참고 링크:

- [getdesign.md](https://getdesign.md/)
- [Apple DESIGN.md 예시](https://getdesign.md/apple/design-md)

## 디자인팀 준비 요청 범위

디자인팀은 Getdesign에 올릴 `DESIGN.md`를 Apple 예시와 비슷한 밀도로 준비한다. 꼭 Apple과 동일한 미감일 필요는 없지만, 개발자가 토큰과 컴포넌트로 옮길 수 있을 만큼 규칙이 명확해야 한다.

### 1. 브랜드 방향

- 정식버전의 한 문장 정의
- PoC MVP와 달라지는 제품 인상
- 화면에서 가장 먼저 느껴져야 하는 성격
- 사용하면 안 되는 시각 언어
- Apple 예시처럼 "무엇이 중심이고 UI는 어디까지 물러나는가"에 대한 원칙

예시 질문:

- 우리 디자인은 제품 중심인가, 작업 효율 중심인가, 데이터 중심인가?
- 브랜드 액센트 컬러는 하나인가, 역할별로 여러 개인가?
- 카드와 버튼에 그림자/경계/블러/그라디언트를 허용하는가?
- 업무용 UI와 마케팅 UI가 같은 언어를 쓰는가, 별도 모드가 필요한가?

### 2. 색상 토큰

최소한 아래 범위를 정의한다.

- Brand & Accent: primary, hover, active, focus, danger, success, warning
- Surface: canvas, surface, subtle, elevated, inverse, disabled
- Text: primary, secondary, muted, placeholder, inverse, danger
- Border: default, muted, strong, focus, danger
- State: selected, hovered, pressed, disabled
- Dark mode 대응이 필요한 경우 `data-theme='dark'` 기준 값

현재 저장소는 `--ncai-color-*` CSS variable을 사용한다. 디자인팀 산출물은 Getdesign 표기와 별개로 개발 반영 시 아래처럼 매핑 가능해야 한다.

```text
{colors.primary} -> --ncai-color-accent-primary
{colors.canvas} -> --ncai-color-bg-canvas
{colors.ink} -> --ncai-color-text-primary
{colors.hairline} -> --ncai-color-border-default
```

### 3. 타이포그래피

최소한 아래 토큰을 정의한다.

- Font family: display, body, mono가 필요한지 여부
- Display hierarchy: hero, display-lg, display-md
- Body hierarchy: body, body-strong, label, caption, fine-print
- 각 토큰의 size, weight, line-height, letter-spacing
- 한글/영문/숫자 혼합 시 기준
- OS별 폰트 fallback

Apple 예시는 본문을 17px로 두고, display에는 음수 letter-spacing을 주며, 500 weight를 의도적으로 제외한다. 우리 시스템도 이 정도로 "왜 이 값이어야 하는지"가 적혀 있어야 한다.

### 4. 레이아웃과 간격

아래 항목을 정의한다.

- spacing scale: 4, 8, 12, 16, 20, 24, 32, 48 같은 구조적 단위
- section padding, card padding, form spacing, toolbar spacing
- container max-width
- grid column 규칙
- breakpoint와 반응형 전환 기준
- touch target 최소 크기
- 화면 밀도 원칙

현재 MVP 토큰은 `--ncai-space-1`부터 `--ncai-space-5`까지만 있다. 정식버전에서는 section, layout, component spacing까지 확장할지 결정해야 한다.

### 5. 형태, 깊이, 모션

정의할 항목:

- radius scale: none, xs, sm, md, lg, pill, full
- shadow/elevation scale
- border 사용 원칙
- backdrop blur 사용 여부
- active/pressed/focus 모션
- duration/easing
- skeleton/loading 모션이 필요한지 여부

Apple 예시는 그림자를 제품 이미지에만 허용하고 UI 카드에는 허용하지 않는다. 이처럼 금지 규칙까지 같이 적어야 개발 반영이 흔들리지 않는다.

### 6. 컴포넌트 명세

정식버전 첫 범위는 컴포넌트별로 아래 형식을 준비한다.

- 컴포넌트 이름
- 사용 목적
- variants
- sizes
- states: default, hover, active, focus, disabled, selected, invalid
- 주요 props
- accessibility 요구사항
- 사용해야 하는 token reference
- 금지 사용법
- 예시 코드 또는 의사 코드

현재 MVP의 실제 컴포넌트는 `Checkbox` 하나다. 정식버전에서는 Getdesign 문서의 컴포넌트 명세가 `packages/metadata/src/components/*.metadata.ts`, `packages/react/src/components/*`, Storybook stories, MCP 검증 규칙의 원천이 된다.

### 7. 콘텐츠와 에셋 정책

디자인 언어가 이미지나 일러스트에 크게 의존한다면 아래를 반드시 정리한다.

- hero 이미지 비율
- 제품/아이콘/일러스트 crop 규칙
- 이미지 배경 색상
- WebP/PNG/SVG 사용 기준
- dark surface용 이미지가 따로 필요한지
- alt text 작성 원칙

## 개발 반영 시나리오

### Phase 0. 디자인 산출물 수령

입력물:

- Getdesign에 등록된 정식 `DESIGN.md`
- Figma token export 또는 SCSS/JSON token 파일
- 컴포넌트별 Figma variants
- 아이콘 원본과 사용 정책
- 브랜드/콘텐츠 에셋 정책

완료 조건:

- 디자인팀과 개발팀이 토큰 이름, 컴포넌트 이름, 첫 배포 범위에 합의한다.
- MVP의 `temp` 패키지명을 유지할지, 정식 패키지명으로 바꿀지 결정한다.
- breaking change 허용 범위를 정한다.

### Phase 1. Getdesign 문서를 저장소 기준으로 고정

작업:

- 루트에 `DESIGN.md`를 추가한다.
- Getdesign 원문 URL과 적용 버전을 문서 상단에 기록한다.
- Apple 벤치마크 표현은 제거하고 NC AI 고유의 원칙만 남긴다.
- `README.md`에는 정식 디자인 시스템의 기준 문서가 `DESIGN.md`임을 연결한다.

완료 조건:

- 개발자는 저장소만 보고 디자인 원칙을 이해할 수 있다.
- AI 에이전트는 `DESIGN.md`를 우선 참고 문서로 사용할 수 있다.

### Phase 2. 토큰 원천 변환

현재 구조:

- `resource/token/figma.scss`: Figma 기반 원천 참고 파일
- `packages/tokens/src/styles.scss`: `--ncai-*` CSS variable 생성
- `packages/tokens/src/index.ts`: TypeScript token reference export
- `packages/metadata/src/tokens.ts`: MCP/CLI가 승인 토큰으로 보는 목록

작업:

- Getdesign의 `{colors.*}`, `{typography.*}`, `{spacing.*}`, `{rounded.*}`를 `--ncai-*` 네이밍으로 매핑한다.
- light/dark theme 값을 `packages/tokens/src/styles.scss`에 반영한다.
- TypeScript token tree를 `packages/tokens/src/index.ts`에 확장한다.
- 승인 토큰 목록을 `packages/metadata/src/tokens.ts`에 반영한다.
- 기존 MVP 토큰 중 정식 토큰과 충돌하는 이름은 migration note를 만든다.

완료 조건:

- `@ncai/design-tokens-temp/styles.css`만 import해도 정식 토큰 CSS variable이 노출된다.
- `designTokens` TypeScript export로 모든 승인 토큰을 참조할 수 있다.
- MCP와 CLI가 새 토큰을 승인 토큰으로 인식한다.

### Phase 3. 컴포넌트 metadata 확장

작업:

- Getdesign 컴포넌트 명세를 `packages/metadata/src/components/*.metadata.ts`로 옮긴다.
- `status`는 정식 배포 대상만 `stable`, 검증 중인 것은 `experimental`로 둔다.
- `rules`에 금지 사용법과 접근성 요구사항을 넣는다.
- `componentTokens`는 컴포넌트 이름 prefix 규칙에 맞춘다.
- schema가 부족하면 `packages/metadata/src/schema.ts`를 확장한다.

완료 조건:

- `pnpm validate`에서 metadata 검증이 통과한다.
- MCP가 컴포넌트 사용법, 승인 props, 금지 스타일 정책을 조회할 수 있다.

### Phase 4. React 컴포넌트 정식 구현

작업:

- `packages/react/src/components/*`에 정식 컴포넌트를 구현한다.
- Base UI primitive는 내부 구현으로만 사용한다.
- 외부 앱은 `@ncai/design-system-temp`에서 승인 컴포넌트만 import하게 유지한다.
- 컴포넌트 CSS는 직접 hex를 쓰지 않고 `--ncai-*` token만 사용한다.
- `className`은 metadata 정책에 맞춰 layout-only 또는 금지로 제한한다.

완료 조건:

- 정식 컴포넌트가 Storybook과 테스트에 포함된다.
- 컴포넌트 API와 metadata가 서로 어긋나지 않는다.
- 임의 스타일 주입 없이도 디자인팀 명세와 맞는 기본 UI가 나온다.

### Phase 5. Storybook 검증

작업:

- 각 컴포넌트의 variants, sizes, states, theme를 Storybook stories로 만든다.
- Apple 예시처럼 light/dark surface와 주요 breakpoint를 같이 검증한다.
- a11y addon과 interaction test를 통해 접근성 회귀를 확인한다.
- 디자인팀 리뷰용 story URL 또는 static build를 제공한다.

완료 조건:

- 디자인팀이 Storybook에서 실제 구현을 승인한다.
- token 변경이 컴포넌트에 반영되는지 눈으로 확인할 수 있다.
- `pnpm storybook`과 `pnpm build`가 통과한다.

### Phase 6. MCP, Skill, CLI 갱신

작업:

- `packages/mcp`가 새 metadata와 token을 조회하도록 확인한다.
- `validate` 도구가 새 금지 규칙을 잡도록 보강한다.
- `packages/skills/company-ui/SKILL.md`를 정식 디자인 언어 기준으로 갱신한다.
- `packages/cli`의 `doctor`, `validate`, `setup-mcp`, `install-skill` 안내 문구를 정식 패키지명과 맞춘다.

완료 조건:

- AI 에이전트가 `DESIGN.md`, MCP metadata, Skill 문서에서 같은 규칙을 보게 된다.
- 사용자 프로젝트에서 `doctor`가 정식 디자인 시스템 설치 상태를 진단한다.
- `validate`가 임의 hex, 비승인 token, 비승인 component usage를 찾아낸다.

### Phase 7. 소비자 프로젝트 smoke test

작업:

- `examples/vite-react`를 정식 사용 예제로 갱신한다.
- `pnpm smoke:pack`으로 실제 tarball 설치를 검증한다.
- 사용자 프로젝트처럼 새 Vite 앱에 패키지를 설치하고 style import, component import, build를 확인한다.
- MCP/Skill 설치까지 확인한다.

완료 조건:

- 배포 전 README의 설치 흐름이 실제로 동작한다.
- npm publish 후 소비자가 겪을 문제를 사전에 발견한다.

### Phase 8. 정식 릴리스

작업:

- 패키지명에서 `temp`를 제거할지 최종 결정한다.
- `README.md`, package metadata, changelog, changeset을 정리한다.
- breaking change가 있으면 migration guide를 작성한다.
- `pnpm release` 흐름으로 typecheck, validate, test, build, smoke pack, publish를 실행한다.

완료 조건:

- 정식 패키지가 npm에 배포된다.
- Getdesign의 `DESIGN.md`, GitHub README, npm package 설명이 같은 기준을 말한다.
- 사용자 프로젝트에서 정식 설치와 검증이 통과한다.

## 권장 파일 변경 순서

디자인팀 산출물을 받은 뒤에는 아래 순서로 반영한다.

1. `DESIGN.md`
2. `resource/token/figma.scss` 또는 새 token source
3. `packages/tokens/src/styles.scss`
4. `packages/tokens/src/index.ts`
5. `packages/metadata/src/tokens.ts`
6. `packages/metadata/src/components/*.metadata.ts`
7. `packages/react/src/components/*`
8. `apps/storybook/src/*.stories.tsx`
9. `packages/mcp`
10. `packages/skills/company-ui/SKILL.md`
11. `packages/cli`
12. `examples/vite-react`
13. `README.md`

이 순서를 지키면 "디자인 문서 -> 토큰 -> metadata -> 구현 -> 검증 -> 배포" 흐름이 유지된다.

## 디자인팀에 전달할 체크리스트

- 정식 디자인 시스템의 Overview와 Key Characteristics가 있는가?
- 색상 토큰에 light/dark, focus, disabled, danger 등 상태값이 포함되어 있는가?
- 타이포그래피 토큰에 한글 환경 기준이 포함되어 있는가?
- spacing, radius, shadow, motion이 token reference로 정의되어 있는가?
- 컴포넌트별 variant, state, size, accessibility 규칙이 있는가?
- 사용 금지 규칙이 Do/Don't 형태로 명확한가?
- 반응형 breakpoint와 grid 전환 규칙이 있는가?
- 이미지, 아이콘, 일러스트 사용 정책이 있는가?
- AI 에이전트가 따라야 할 Iteration Guide가 있는가?
- 알려진 공백 또는 아직 결정되지 않은 영역이 Known Gaps로 분리되어 있는가?

## 운영 원칙

- Getdesign의 `DESIGN.md`는 브랜드 언어의 원천이다.
- Figma token export는 수치 원천이다.
- `packages/tokens`는 코드에서 쓰는 token API의 원천이다.
- `packages/metadata`는 컴포넌트와 token 검증의 원천이다.
- `packages/mcp`와 `packages/skills`는 AI 에이전트 사용 규칙의 원천이다.
- Storybook은 구현 결과를 디자인팀과 확인하는 시각 검증면이다.
- README는 최종 사용자가 설치하고 사용하는 방법만 짧고 정확하게 설명한다.

정식버전에서는 문서, 토큰, 컴포넌트, MCP 검증이 서로 분리되어 보이더라도 같은 디자인 결정에서 파생되어야 한다. 한 곳만 바꾸는 운영은 금지하고, 디자인 결정이 바뀌면 `DESIGN.md`와 token, metadata, Storybook을 함께 갱신한다.
