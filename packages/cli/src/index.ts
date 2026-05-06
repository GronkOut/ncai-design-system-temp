#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { componentMetadata } from '@ncai/design-system-metadata-temp';

type Command = 'setup-mcp' | 'install-skill' | 'validate' | 'doctor' | 'help';

const args = process.argv.slice(2);
const command = normalizeCommand(args[0]);

function normalizeCommand(value: string | undefined): Command {
  if (!value || value === '--help' || value === '-h') return 'help';
  if (value === 'mcp' && args[1] === 'init') return 'setup-mcp';
  if (value === 'skills' && args[1] === 'install') return 'install-skill';
  if (['setup-mcp', 'install-skill', 'validate', 'doctor'].includes(value)) return value as Command;
  return 'help';
}

function optionValue(name: string) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

async function pathExists(path: string) {
  try {
    await readFile(path, 'utf8');
    return true;
  } catch {
    return false;
  }
}

async function writeJson(path: string, data: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function setupMcp() {
  const target = resolve(optionValue('--target') ?? '.cursor/mcp.json');
  const existing = (await pathExists(target)) ? JSON.parse(await readFile(target, 'utf8')) : {};

  const next = {
    ...existing,
    mcpServers: {
      ...(existing.mcpServers ?? {}),
      'ncai-design-system-temp': {
        command: 'npx',
        args: ['-y', '@ncai/design-system-mcp-temp']
      }
    }
  };

  await writeJson(target, next);
  console.log(`NC AI MCP 설정을 작성했습니다: ${target}`);
}

async function installSkill() {
  const target =
    optionValue('--target') === 'cursor-user'
      ? join(homedir(), '.cursor', 'skills', 'ncai-design-system')
      : resolve(optionValue('--path') ?? '.cursor/skills/ncai-design-system');

  const skill = `---
name: ncai-design-system
description: Builds and reviews React UI with NC AI Design System temp packages, Base UI-backed components, approved design tokens, approved icons, MCP component metadata, and UI validation.
---

# NC AI Design System

1. UI를 만들기 전에 MCP \`search_components\`, \`get_component_recipe\`, \`get_component_usage\`로 승인된 컴포넌트를 확인한다.
2. 앱 코드에서 \`@base-ui/react\`를 직접 import하지 않는다. 공개 컴포넌트는 \`@ncai/design-system-temp\`에서 import한다.
3. 색상, spacing, radius, typography, shadow는 승인된 \`--ncai-*\` 토큰만 사용한다.
4. 아이콘은 \`@ncai/design-icons-temp\`의 승인된 아이콘만 사용한다.
5. 현재 MVP 컴포넌트는 \`Checkbox\`뿐이다. 없는 컴포넌트를 새로 꾸며 만들지 말고 사용자에게 범위 확장을 확인한다.
6. 작업 후 MCP \`validate_ui_code\` 또는 \`npx @ncai/design-system-cli-temp validate\`로 결과를 확인한다.
`;

  await mkdir(target, { recursive: true });
  await writeFile(join(target, 'SKILL.md'), skill, 'utf8');
  console.log(`NC AI Skill을 설치했습니다: ${target}`);
}

async function validate() {
  const file = optionValue('--file');
  if (!file) {
    console.log('현재 CLI validate는 --file <path> 코드 문자열 검증을 지원합니다.');
    console.log('예: npx @ncai/design-system-cli-temp validate --file src/App.tsx');
    return;
  }

  const code = await readFile(resolve(file), 'utf8');
  const findings = [
    /@base-ui\/react/.test(code) && '앱 코드에서 @base-ui/react 직접 import를 발견했습니다.',
    /#(?:[0-9a-fA-F]{3,8})\b|rgb\(|hsl\(/.test(code) && '임의 색상값을 발견했습니다.',
    /lucide-react|react-icons|@heroicons/.test(code) && '미승인 아이콘 라이브러리 import를 발견했습니다.'
  ].filter(Boolean);

  if (findings.length > 0) {
    console.error(findings.join('\n'));
    process.exitCode = 1;
    return;
  }

  console.log('NC AI UI 기본 검증을 통과했습니다.');
}

function doctor() {
  console.log('NC AI Design System temp doctor');
  console.log(`- components: ${componentMetadata.map((item) => item.name).join(', ')}`);
  console.log('- expected runtime package: @ncai/design-system-temp');
  console.log('- expected token package: @ncai/design-tokens-temp');
  console.log('- expected MCP package: @ncai/design-system-mcp-temp');
}

function help() {
  console.log(`NC AI Design System CLI

Commands:
  setup-mcp                    .cursor/mcp.json에 MCP 서버 설정을 추가합니다.
  install-skill                .cursor/skills/ncai-design-system에 Skill을 설치합니다.
  validate --file <path>       코드 파일의 기본 디자인 시스템 위반을 검사합니다.
  doctor                       설치와 공개 컴포넌트 정보를 출력합니다.

Aliases:
  mcp init                     setup-mcp와 같습니다.
  skills install               install-skill과 같습니다.
`);
}

if (command === 'setup-mcp') await setupMcp();
if (command === 'install-skill') await installSkill();
if (command === 'validate') await validate();
if (command === 'doctor') doctor();
if (command === 'help') help();
