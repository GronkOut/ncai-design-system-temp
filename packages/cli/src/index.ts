#!/usr/bin/env node
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { componentMetadata, validateUiCode } from '@ncai/design-system-metadata-temp';

type Command = 'setup-mcp' | 'install-skill' | 'validate' | 'doctor' | 'help';

const args = process.argv.slice(2);
const command = normalizeCommand(args[0]);
const require = createRequire(import.meta.url);

const runtimePackage = '@ncai/design-system-temp';
const tokenPackage = '@ncai/design-tokens-temp';
const iconPackage = '@ncai/design-icons-temp';
const mcpPackage = '@ncai/design-system-mcp-temp';
const skillsPackage = '@ncai/design-system-skills-temp';
const cliPackage = '@ncai/design-system-cli-temp';
const mcpServerName = 'ncai-design-system-temp';
const skillName = 'ncai-design-system-temp';

const ncaiPackages = [runtimePackage, tokenPackage, iconPackage, mcpPackage, skillsPackage, cliPackage] as const;
const agentChoices = ['cursor', 'vscode', 'jetbrains', 'manual'] as const;

type AgentChoice = (typeof agentChoices)[number];

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
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function normalizeAgent(value: string | undefined): AgentChoice | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'vs-code' || normalized === 'visual-studio-code') return 'vscode';
  if (normalized === 'intellij' || normalized === 'idea' || normalized === 'jetbrains-ai') return 'jetbrains';
  return agentChoices.includes(normalized as AgentChoice) ? (normalized as AgentChoice) : undefined;
}

async function selectAgent(action: 'MCP 설정' | 'Agent Skill 설치'): Promise<AgentChoice | undefined> {
  const requested = optionValue('--agent') ?? optionValue('--ide');
  const agent = normalizeAgent(requested);

  if (agent) return agent;
  if (requested) {
    console.error(`지원하지 않는 에이전트입니다: ${requested}`);
    console.error(`지원 값: ${agentChoices.join(', ')}`);
    process.exitCode = 1;
    return undefined;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error(`${action} 대상 에이전트를 명시하세요.`);
    console.error(`예: npx ${cliPackage} ${action === 'MCP 설정' ? 'setup-mcp' : 'install-skill'} --agent cursor`);
    console.error(`지원 값: ${agentChoices.join(', ')}`);
    process.exitCode = 1;
    return undefined;
  }

  const rl = createInterface({ input, output });
  try {
    console.log(`${action}에 사용할 에이전트를 선택하세요.`);
    console.log('1) Cursor');
    console.log('2) VS Code / GitHub Copilot');
    console.log('3) JetBrains AI Assistant / IntelliJ');
    console.log('4) Manual / 기타');
    const answer = (await rl.question('번호 또는 이름 입력: ')).trim().toLowerCase();
    const agent = normalizeAgent(answer) ?? ({ '1': 'cursor', '2': 'vscode', '3': 'jetbrains', '4': 'manual' } as Record<string, AgentChoice>)[answer];
    if (!agent) {
      console.error(`지원하지 않는 에이전트입니다: ${answer || '(empty)'}`);
      console.error(`지원 값: ${agentChoices.join(', ')}`);
      process.exitCode = 1;
    }
    return agent;
  } finally {
    rl.close();
  }
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

function ncaiMcpServerConfig() {
  return {
    command: 'npx',
    args: ['-y', mcpPackage]
  };
}

function ncaiMcpSnippet() {
  return {
    mcpServers: {
      [mcpServerName]: ncaiMcpServerConfig()
    }
  };
}

async function writeMarkdown(path: string, content: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

function agentInstructions() {
  return `# NC AI Design System Agent Instructions

- Use ${runtimePackage} for approved React components.
- Import ${runtimePackage}/styles.css once in the app entry.
- Do not import Base UI directly from app code.
- Prefer approved NC AI tokens and icons exposed by ${tokenPackage}, ${iconPackage}, and ${runtimePackage}.
- When MCP is available, query ${mcpServerName} before adding or changing design system UI.
- Validate UI code with: npx ${cliPackage} validate --file <path>
`;
}

async function setupMcp() {
  const agent = await selectAgent('MCP 설정');
  if (!agent) return;

  if (agent === 'cursor') {
    const target = resolve(optionValue('--target') ?? '.cursor/mcp.json');
    const existing = (await pathExists(target)) ? JSON.parse(await readFile(target, 'utf8')) : {};
    const next = {
      ...existing,
      mcpServers: {
        ...(existing.mcpServers ?? {}),
        [mcpServerName]: ncaiMcpServerConfig()
      }
    };

    await writeJson(target, next);
    console.log(`NC AI MCP 설정을 작성했습니다: ${target}`);
    return;
  }

  if (agent === 'vscode') {
    const target = resolve(optionValue('--target') ?? '.vscode/mcp.json');
    const existing = (await pathExists(target)) ? JSON.parse(await readFile(target, 'utf8')) : {};
    const next = {
      ...existing,
      servers: {
        ...(existing.servers ?? {}),
        [mcpServerName]: {
          type: 'stdio',
          ...ncaiMcpServerConfig()
        }
      }
    };

    await writeJson(target, next);
    console.log(`NC AI MCP 설정을 작성했습니다: ${target}`);
    return;
  }

  if (agent === 'jetbrains') {
    const target = resolve(optionValue('--target') ?? '.ncai/jetbrains-mcp.json');
    await writeJson(target, ncaiMcpSnippet());
    console.log(`JetBrains AI Assistant에서 가져다 쓸 MCP 설정을 작성했습니다: ${target}`);
    console.log('IntelliJ Settings | Tools | AI Assistant | Model Context Protocol (MCP)에서 이 JSON 내용을 추가하세요.');
    return;
  }

  console.log('아래 MCP 설정을 사용 중인 에이전트의 MCP 설정 화면이나 파일에 추가하세요.');
  console.log(JSON.stringify(ncaiMcpSnippet(), null, 2));
}

async function installSkill() {
  const agent = await selectAgent('Agent Skill 설치');
  if (!agent) return;

  const skillSource = require.resolve(`${skillsPackage}/company-ui/SKILL.md`);
  const skill = await readFile(skillSource, 'utf8');

  if (agent === 'cursor') {
    const target =
      optionValue('--target') === 'cursor-user'
        ? join(homedir(), '.cursor', 'skills', skillName)
        : resolve(optionValue('--path') ?? `.cursor/skills/${skillName}`);

    await mkdir(target, { recursive: true });
    await writeFile(join(target, 'SKILL.md'), skill, 'utf8');
    console.log(`NC AI Skill을 설치했습니다: ${target}`);
    return;
  }

  if (agent === 'vscode') {
    const target = resolve(optionValue('--path') ?? '.github/copilot-instructions.md');
    await writeMarkdown(target, agentInstructions());
    console.log(`VS Code/GitHub Copilot용 지침을 작성했습니다: ${target}`);
    return;
  }

  if (agent === 'jetbrains') {
    const target = resolve(optionValue('--path') ?? '.ncai/jetbrains-agent-instructions.md');
    await writeMarkdown(target, `${agentInstructions()}\n\n---\n\n${skill}`);
    console.log(`JetBrains AI Assistant에 붙여넣을 지침을 작성했습니다: ${target}`);
    return;
  }

  const target = resolve(optionValue('--path') ?? '.ncai/agent-instructions.md');
  await writeMarkdown(target, `${agentInstructions()}\n\n---\n\n${skill}`);
  console.log(`에이전트 공통 지침을 작성했습니다: ${target}`);
}

async function validate() {
  const file = optionValue('--file');
  if (!file) {
    console.log('현재 CLI validate는 --file <path> 코드 문자열 검증을 지원합니다.');
    console.log('예: npx @ncai/design-system-cli-temp validate --file src/App.tsx');
    return;
  }

  const code = await readFile(resolve(file), 'utf8');
  const result = validateUiCode(code);

  if (!result.valid) {
    for (const finding of result.findings) {
      console.error(`[${finding.severity}] ${finding.message}`);
    }
    console.error(result.disclaimer);
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
  const componentImport = await fileContainsAny(sourceFiles, [
    /@ncai\/design-system-temp\/styles\.css/,
    /@import\s+['"]@ncai\/design-system-temp\/styles\.css['"]/
  ]);

  return [
    componentImport
      ? {
          status: 'pass',
          label: '디자인 시스템 스타일 import',
          detail: `발견됨: ${componentImport}. 이 스타일은 ${tokenPackage}/styles.css를 포함합니다.`
        }
      : {
          status: 'warn',
          label: '디자인 시스템 스타일 import',
          detail: `${runtimePackage}/styles.css import를 찾지 못했습니다.`,
          fix: `앱 entry에 import '${runtimePackage}/styles.css'; 를 추가하세요.`
        }
  ];
}

async function diagnoseMcp(projectRoot: string): Promise<Diagnostic[]> {
  const requested = optionValue('--agent') ?? optionValue('--ide');
  const agent = normalizeAgent(requested);
  if (requested && !agent) {
    return [
      {
        status: 'fail',
        label: 'Agent 설정',
        detail: `지원하지 않는 에이전트입니다: ${requested}`,
        fix: `지원 값: ${agentChoices.join(', ')}`
      }
    ];
  }

  if (!agent) {
    return [
      {
        status: 'pass',
        label: 'Agent 설정',
        detail: `에이전트별 MCP/Skill 진단은 선택 사항입니다. 필요하면 doctor --agent ${agentChoices.join('|')}를 사용하세요.`
      }
    ];
  }

  if (agent === 'vscode') {
    const mcpConfigPath = join(projectRoot, '.vscode', 'mcp.json');
    const mcpConfig = await readJson<{ servers?: Record<string, { command?: string; args?: string[] }> }>(mcpConfigPath);
    const server = mcpConfig?.servers?.[mcpServerName];
    const hasMcpPackage = server?.args?.some((arg) => arg.includes(mcpPackage));
    const instructionPath = join(projectRoot, '.github', 'copilot-instructions.md');

    return [
      server && hasMcpPackage
        ? {
            status: 'pass',
            label: 'VS Code MCP 설정',
            detail: `${mcpConfigPath}에 ${mcpServerName} 서버가 등록되어 있습니다.`
          }
        : {
            status: 'warn',
            label: 'VS Code MCP 설정',
            detail: 'VS Code MCP 설정을 찾지 못했거나 MCP 패키지명이 다릅니다.',
            fix: `npx ${cliPackage} setup-mcp --agent vscode`
          },
      (await pathExists(instructionPath))
        ? {
            status: 'pass',
            label: 'VS Code Copilot 지침',
            detail: `발견됨: ${instructionPath}`
          }
        : {
            status: 'warn',
            label: 'VS Code Copilot 지침',
            detail: '프로젝트 Copilot 지침을 찾지 못했습니다.',
            fix: `npx ${cliPackage} install-skill --agent vscode`
          }
    ];
  }

  if (agent === 'jetbrains') {
    const mcpSnippetPath = join(projectRoot, '.ncai', 'jetbrains-mcp.json');
    const instructionPath = join(projectRoot, '.ncai', 'jetbrains-agent-instructions.md');

    return [
      (await pathExists(mcpSnippetPath))
        ? {
            status: 'pass',
            label: 'JetBrains MCP 설정 스니펫',
            detail: `발견됨: ${mcpSnippetPath}`
          }
        : {
            status: 'warn',
            label: 'JetBrains MCP 설정 스니펫',
            detail: 'JetBrains AI Assistant에 추가할 MCP JSON 스니펫을 찾지 못했습니다.',
            fix: `npx ${cliPackage} setup-mcp --agent jetbrains`
          },
      (await pathExists(instructionPath))
        ? {
            status: 'pass',
            label: 'JetBrains 에이전트 지침',
            detail: `발견됨: ${instructionPath}`
          }
        : {
            status: 'warn',
            label: 'JetBrains 에이전트 지침',
            detail: 'JetBrains AI Assistant에 붙여넣을 지침 파일을 찾지 못했습니다.',
            fix: `npx ${cliPackage} install-skill --agent jetbrains`
          }
    ];
  }

  if (agent === 'manual') {
    const instructionPath = join(projectRoot, '.ncai', 'agent-instructions.md');
    return [
      (await pathExists(instructionPath))
        ? {
            status: 'pass',
            label: '공통 에이전트 지침',
            detail: `발견됨: ${instructionPath}`
          }
        : {
            status: 'warn',
            label: '공통 에이전트 지침',
            detail: '기타 에이전트에 붙여넣을 공통 지침 파일을 찾지 못했습니다.',
            fix: `npx ${cliPackage} install-skill --agent manual`
          }
    ];
  }

  const mcpConfigPath = join(projectRoot, '.cursor', 'mcp.json');
  const mcpConfig = await readJson<{ mcpServers?: Record<string, { command?: string; args?: string[] }> }>(mcpConfigPath);
  const server = mcpConfig?.mcpServers?.[mcpServerName];
  const hasMcpPackage = server?.args?.some((arg) => arg.includes(mcpPackage));

  const skillPath = join(projectRoot, '.cursor', 'skills', skillName, 'SKILL.md');

  return [
    server && hasMcpPackage
      ? {
          status: 'pass',
          label: 'Cursor MCP 설정',
          detail: `${mcpConfigPath}에 ${mcpServerName} 서버가 등록되어 있습니다.`
        }
      : {
          status: 'warn',
          label: 'Cursor MCP 설정',
          detail: 'Cursor MCP 설정을 찾지 못했거나 MCP 패키지명이 다릅니다.',
          fix: `npx ${cliPackage} setup-mcp --agent cursor`
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
          fix: `npx ${cliPackage} install-skill --agent cursor`
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
  setup-mcp --agent <agent>     선택한 에이전트의 MCP 설정을 추가하거나 안내 파일을 만듭니다.
  install-skill --agent <agent> 선택한 에이전트의 지침/Skill을 설치합니다.
  validate --file <path>       코드 파일의 기본 디자인 시스템 위반을 검사합니다.
  doctor [--agent <agent>]     설치, 버전, 스타일 import, 선택한 에이전트 설정을 진단합니다.

Agents:
  cursor                       .cursor/mcp.json과 Cursor Skill을 설정합니다.
  vscode                       .vscode/mcp.json과 GitHub Copilot 지침을 설정합니다.
  jetbrains                    JetBrains AI Assistant에 붙여넣을 MCP/지침 파일을 만듭니다.
  manual                       기타 에이전트용 MCP JSON과 공통 지침을 출력/생성합니다.

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
