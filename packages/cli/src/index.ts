#!/usr/bin/env node
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { componentMetadata } from '@ncai/design-system-metadata-temp';

type Command = 'setup-mcp' | 'install-skill' | 'validate' | 'doctor' | 'help';

const args = process.argv.slice(2);
const command = normalizeCommand(args[0]);

const runtimePackage = '@ncai/design-system-temp';
const tokenPackage = '@ncai/design-tokens-temp';
const iconPackage = '@ncai/design-icons-temp';
const mcpPackage = '@ncai/design-system-mcp-temp';
const skillsPackage = '@ncai/design-system-skills-temp';
const cliPackage = '@ncai/design-system-cli-temp';

const ncaiPackages = [runtimePackage, tokenPackage, iconPackage, mcpPackage, skillsPackage, cliPackage] as const;

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

type DiagnosticStatus = 'pass' | 'warn' | 'fail';

type Diagnostic = {
  status: DiagnosticStatus;
  label: string;
  detail: string;
  fix?: string;
};

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
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(path: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as T;
  } catch {
    return undefined;
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

function allDependencies(packageJson: PackageJson) {
  return {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
    ...(packageJson.peerDependencies ?? {}),
    ...(packageJson.optionalDependencies ?? {})
  };
}

function declaredDependency(packageJson: PackageJson, name: string) {
  return allDependencies(packageJson)[name];
}

function parseMajor(version: string | undefined) {
  if (!version) return undefined;
  const match = version.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

async function installedPackageVersion(projectRoot: string, name: string) {
  const packageJsonPath = join(projectRoot, 'node_modules', ...name.split('/'), 'package.json');
  return (await readJson<{ version?: string }>(packageJsonPath))?.version;
}

async function collectSourceFiles(root: string, limit = 500) {
  const files: string[] = [];
  const skipped = new Set([
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '.turbo',
    'storybook-static',
    '.cache'
  ]);
  const allowedExtensions = /\.(cjs|css|js|jsx|mjs|scss|ts|tsx)$/;

  async function visit(directory: string) {
    if (files.length >= limit) return;
    let entries;

    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= limit) return;
      if (entry.name.startsWith('.') && entry.name !== '.cursor') continue;
      if (skipped.has(entry.name)) continue;

      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
        continue;
      }

      if (entry.isFile() && allowedExtensions.test(entry.name)) {
        files.push(path);
      }
    }
  }

  for (const candidate of ['src', 'app', 'pages', 'components']) {
    const path = join(root, candidate);
    if (await pathExists(path)) await visit(path);
  }

  if (files.length === 0) {
    await visit(root);
  }

  return files;
}

async function fileContainsAny(paths: string[], patterns: RegExp[]) {
  for (const path of paths) {
    let content = '';
    try {
      content = await readFile(path, 'utf8');
    } catch {
      continue;
    }

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        return path;
      }
    }
  }

  return undefined;
}

async function diagnoseStyles(projectRoot: string): Promise<Diagnostic[]> {
  const sourceFiles = await collectSourceFiles(projectRoot);
  const tokenImport = await fileContainsAny(sourceFiles, [
    /@ncai\/design-tokens-temp\/styles\.css/,
    /@import\s+['"]@ncai\/design-tokens-temp\/styles\.css['"]/
  ]);
  const componentImport = await fileContainsAny(sourceFiles, [
    /@ncai\/design-system-temp\/styles\.css/,
    /@import\s+['"]@ncai\/design-system-temp\/styles\.css['"]/
  ]);

  return [
    tokenImport
      ? {
          status: 'pass',
          label: '토큰 스타일 import',
          detail: `발견됨: ${tokenImport}`
        }
      : {
          status: 'warn',
          label: '토큰 스타일 import',
          detail: `${tokenPackage}/styles.css import를 찾지 못했습니다.`,
          fix: `앱 entry에 import '${tokenPackage}/styles.css'; 를 추가하세요.`
        },
    componentImport
      ? {
          status: 'pass',
          label: '컴포넌트 스타일 import',
          detail: `발견됨: ${componentImport}`
        }
      : {
          status: 'warn',
          label: '컴포넌트 스타일 import',
          detail: `${runtimePackage}/styles.css import를 찾지 못했습니다.`,
          fix: `앱 entry에 import '${runtimePackage}/styles.css'; 를 추가하세요.`
        }
  ];
}

async function diagnoseMcp(projectRoot: string): Promise<Diagnostic[]> {
  const mcpConfigPath = join(projectRoot, '.cursor', 'mcp.json');
  const mcpConfig = await readJson<{ mcpServers?: Record<string, { command?: string; args?: string[] }> }>(mcpConfigPath);
  const server = mcpConfig?.mcpServers?.['ncai-design-system-temp'];
  const hasMcpPackage = server?.args?.some((arg) => arg.includes(mcpPackage));

  const skillPath = join(projectRoot, '.cursor', 'skills', 'ncai-design-system', 'SKILL.md');

  return [
    server && hasMcpPackage
      ? {
          status: 'pass',
          label: 'MCP 설정',
          detail: `${mcpConfigPath}에 ncai-design-system-temp 서버가 등록되어 있습니다.`
        }
      : {
          status: 'warn',
          label: 'MCP 설정',
          detail: '프로젝트 MCP 설정을 찾지 못했거나 MCP 패키지명이 다릅니다.',
          fix: `npx ${cliPackage} setup-mcp`
        },
    (await pathExists(skillPath))
      ? {
          status: 'pass',
          label: 'Cursor Skill',
          detail: `발견됨: ${skillPath}`
        }
      : {
          status: 'warn',
          label: 'Cursor Skill',
          detail: '프로젝트 Skill 설치를 찾지 못했습니다.',
          fix: `npx ${cliPackage} install-skill`
        }
  ];
}

async function diagnosePackages(projectRoot: string, packageJson: PackageJson): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const reactRange = declaredDependency(packageJson, 'react');
  const reactInstalledVersion = await installedPackageVersion(projectRoot, 'react');
  const reactMajor = parseMajor(reactInstalledVersion ?? reactRange);

  diagnostics.push(
    reactMajor && reactMajor >= 18
      ? {
          status: 'pass',
          label: 'React 버전',
          detail: `React ${reactInstalledVersion ?? reactRange} 사용 중입니다.`
        }
      : {
          status: 'fail',
          label: 'React 버전',
          detail: reactRange ? `React ${reactRange}가 선언되어 있으나 지원 범위(>=18)를 확인하지 못했습니다.` : 'React 의존성이 없습니다.',
          fix: 'React 18 이상을 설치하세요.'
        }
  );

  for (const name of [runtimePackage, tokenPackage]) {
    const declared = declaredDependency(packageJson, name);
    const installed = await installedPackageVersion(projectRoot, name);
    diagnostics.push(
      declared || installed
        ? {
            status: 'pass',
            label: `${name} 설치`,
            detail: installed ? `설치됨: ${installed}` : `선언됨: ${declared}`
          }
        : {
            status: 'fail',
            label: `${name} 설치`,
            detail: '필수 패키지를 찾지 못했습니다.',
            fix: `npm install ${runtimePackage} ${tokenPackage}`
          }
    );
  }

  const installedNCAIVersions = (
    await Promise.all(
      ncaiPackages.map(async (name) => {
        const installed = await installedPackageVersion(projectRoot, name);
        return installed ? [name, installed] : undefined;
      })
    )
  ).filter((item): item is [string, string] => Boolean(item));
  const versionSet = new Set(installedNCAIVersions.map(([, version]) => version));

  if (installedNCAIVersions.length <= 1 || versionSet.size <= 1) {
    diagnostics.push({
      status: 'pass',
      label: '@ncai 패키지 버전 정렬',
      detail:
        installedNCAIVersions.length === 0
          ? '설치된 @ncai design system 패키지는 아직 없습니다.'
          : installedNCAIVersions.map(([name, version]) => `${name}@${version}`).join(', ')
    });
  } else {
    diagnostics.push({
      status: 'warn',
      label: '@ncai 패키지 버전 정렬',
      detail: installedNCAIVersions.map(([name, version]) => `${name}@${version}`).join(', '),
      fix: `@ncai design system 패키지를 같은 버전으로 업데이트하세요. 예: npm install ${runtimePackage}@latest ${tokenPackage}@latest`
    });
  }

  return diagnostics;
}

function printDiagnostic(diagnostic: Diagnostic) {
  const icon = diagnostic.status === 'pass' ? 'PASS' : diagnostic.status === 'warn' ? 'WARN' : 'FAIL';
  console.log(`[${icon}] ${diagnostic.label}: ${diagnostic.detail}`);
  if (diagnostic.fix) {
    console.log(`      fix: ${diagnostic.fix}`);
  }
}

async function doctor() {
  const projectRoot = resolve(optionValue('--cwd') ?? process.cwd());
  const packageJsonPath = join(projectRoot, 'package.json');
  const packageJson = await readJson<PackageJson>(packageJsonPath);

  console.log('NC AI Design System temp doctor');
  console.log(`project: ${projectRoot}`);
  console.log(`components: ${componentMetadata.map((item) => item.name).join(', ')}`);

  if (!packageJson) {
    printDiagnostic({
      status: 'fail',
      label: 'package.json',
      detail: `${packageJsonPath}을 읽을 수 없습니다.`,
      fix: '프로젝트 루트에서 doctor를 실행하거나 --cwd <project-root>를 지정하세요.'
    });
    process.exitCode = 1;
    return;
  }

  const diagnostics = [
    ...(await diagnosePackages(projectRoot, packageJson)),
    ...(await diagnoseStyles(projectRoot)),
    ...(await diagnoseMcp(projectRoot))
  ];

  for (const diagnostic of diagnostics) {
    printDiagnostic(diagnostic);
  }

  const failCount = diagnostics.filter((item) => item.status === 'fail').length;
  const warnCount = diagnostics.filter((item) => item.status === 'warn').length;

  console.log(`summary: ${failCount} fail, ${warnCount} warn`);
  if (failCount > 0) {
    process.exitCode = 1;
  }
}

function help() {
  console.log(`NC AI Design System CLI

Commands:
  setup-mcp                    .cursor/mcp.json에 MCP 서버 설정을 추가합니다.
  install-skill                .cursor/skills/ncai-design-system에 Skill을 설치합니다.
  validate --file <path>       코드 파일의 기본 디자인 시스템 위반을 검사합니다.
  doctor                       설치, 버전, 스타일 import, MCP 설정을 진단합니다.

Aliases:
  mcp init                     setup-mcp와 같습니다.
  skills install               install-skill과 같습니다.
`);
}

if (command === 'setup-mcp') await setupMcp();
if (command === 'install-skill') await installSkill();
if (command === 'validate') await validate();
if (command === 'doctor') await doctor();
if (command === 'help') help();
