---
name: ncai-design-system
description: Builds and reviews React UI with NC AI Design System, Base UI-backed components, approved design tokens, approved icons, MCP component metadata, and UI validation. Use when creating, refactoring, reviewing, or styling Checkbox, design-system UI, Base UI wrappers, tokens, icons, Storybook stories, or MCP-backed UI code.
---

# NC AI Design System

## 핵심 규칙

1. UI를 만들기 전에 MCP `search_components`, `get_component_recipe`, `get_component_usage`로 승인된 컴포넌트를 확인한다.
2. 앱 코드에서 `@base-ui/react`를 직접 import하지 않는다. 공개 컴포넌트는 `@ncai/design-system-temp`에서 import한다.
3. 색상, spacing, radius, typography, shadow는 승인된 `--ncai-*` 토큰만 사용한다.
4. hex, rgb, hsl, arbitrary Tailwind value, 임의 inline style을 생성하지 않는다.
5. 아이콘은 `@ncai/design-icons-temp`의 승인된 아이콘만 사용한다.
6. 현재 MVP 컴포넌트는 `Checkbox`뿐이다. 없는 컴포넌트를 새로 꾸며 만들지 말고 사용자에게 범위 확장을 확인한다.
7. 작업 후 MCP `validate_ui_code` 또는 프로젝트 검증 명령으로 결과를 확인한다.

## 컴포넌트 사용

`Checkbox`:

- 접근 가능한 이름이 필요하다. `aria-label`을 전달하거나 외부 `<label>`로 감싼다.
- 정의된 시각 상태는 기본, 선택, 부분선택, 경고, 비활성기본, 비활성선택, 비활성부분선택뿐이다.
- `shape`는 `square`, `circle`만 사용한다. 기본값은 `square`다.
- `tone`, `label`, `description` 같은 추가 디자인 API를 만들지 않는다.
- 경고상태는 `warning` prop으로 표현한다.
- indeterminate 상태는 Base UI의 `indeterminate` prop으로 표현한다.

## MCP 우선 사용 흐름

1. `search_components`로 적합한 컴포넌트를 찾는다.
2. `get_component_usage`로 props, variants, 규칙을 확인한다.
3. 필요한 토큰은 `search_tokens` 또는 `list_design_tokens`로 확인한다.
4. 필요한 아이콘은 `search_icons` 또는 `list_icons`로 확인한다.
5. 코드 작성 후 `validate_ui_code`로 검증한다.

## MCP가 없을 때

- 새 토큰, 새 색상, 새 아이콘, 새 variant를 추측해서 만들지 않는다.
- `@ncai/design-system-temp`, `@ncai/design-tokens-temp`, `@ncai/design-icons-temp`에 이미 공개된 항목만 사용한다.
- 확신할 수 없는 디자인 결정은 사용자에게 확인한다.
