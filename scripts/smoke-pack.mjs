import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = resolve(tmpdir(), 'ncai-design-system-pack-smoke');
const tarballDir = resolve(tempRoot, 'tarballs');
const consumerDir = resolve(tempRoot, 'consumer');
const minimalConsumerDir = resolve(tempRoot, 'minimal-consumer');
const npmConsumerDir = resolve(tempRoot, 'npm-consumer');
const exampleSourceDir = resolve(root, 'examples/vite-react');
const exampleConsumerDir = resolve(tempRoot, 'vite-react-example');

const packageDirs = [
  'packages/metadata',
  'packages/tokens',
  'packages/icons',
  'packages/react',
  'packages/mcp',
  'packages/skills',
  'packages/cli'
];

function run(command, args, cwd = root) {
  execFileSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
}

function runQuiet(command, args, cwd = root) {
  return execFileSync(command, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' });
}

await rm(tempRoot, { force: true, recursive: true });
await mkdir(tarballDir, { recursive: true });
await mkdir(consumerDir, { recursive: true });
await mkdir(minimalConsumerDir, { recursive: true });
await mkdir(npmConsumerDir, { recursive: true });

const packages = await Promise.all(
  packageDirs.map(async (packageDir) => {
    const packageJson = JSON.parse(await readFile(resolve(root, packageDir, 'package.json'), 'utf8'));
    const tarball = `${packageJson.name.replace('@', '').replace('/', '-')}-${packageJson.version}.tgz`;
    return { name: packageJson.name, filter: packageJson.name, tarball };
  })
);

for (const item of packages) {
  run('pnpm', ['--filter', item.filter, 'pack', '--pack-destination', tarballDir]);
}

const internalDeps = Object.fromEntries(
  packages.map((item) => {
    const tarballPath = `../tarballs/${item.tarball}`;
    return [item.name, `file:${tarballPath}`];
  })
);

await writeFile(
  resolve(consumerDir, 'package.json'),
  `${JSON.stringify(
    {
      type: 'module',
      dependencies: {
        react: '^19.2.5',
        'react-dom': '^19.2.5',
        ...internalDeps
      },
      pnpm: {
        overrides: internalDeps
      }
    },
    null,
    2
  )}\n`
);

run('pnpm', ['install'], consumerDir);

const smokeScript = `
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const reactPkg = await import('@ncai/design-system-temp');
const metadataPkg = await import('@ncai/design-system-metadata-temp');
const reactMetadata = await import('@ncai/design-system-temp/metadata');
const icons = await import('@ncai/design-icons-temp');
const tokens = await import('@ncai/design-tokens-temp');

if (!reactPkg.Checkbox) throw new Error('Checkbox export is missing');
if (!metadataPkg.componentMetadata.some((item) => item.name === 'Checkbox')) throw new Error('Checkbox metadata is missing');
if (reactMetadata.componentMetadata !== metadataPkg.componentMetadata) throw new Error('React metadata does not re-export shared metadata');
if (!icons.CheckIcon || !icons.PartialIcon) throw new Error('Checkbox icons are missing');
if (tokens.tokenPrefix !== 'ncai') throw new Error('Token prefix mismatch');

const mcpBin = resolve('node_modules/@ncai/design-system-mcp-temp/dist/index.js');
const cliBin = resolve('node_modules/@ncai/design-system-cli-temp/dist/index.js');
const skillFile = resolve('node_modules/@ncai/design-system-skills-temp/company-ui/SKILL.md');
const reactStyles = resolve('node_modules/@ncai/design-system-temp/dist/styles.css');

for (const file of [mcpBin, cliBin, skillFile, reactStyles]) {
  if (!existsSync(file)) throw new Error(file + ' is missing');
}

console.log('pack smoke passed');
`;

await writeFile(resolve(consumerDir, 'smoke.mjs'), smokeScript);
run('node', ['smoke.mjs'], consumerDir);

await writeFile(resolve(consumerDir, 'valid.tsx'), "import { Checkbox } from '@ncai/design-system-temp';\n<Checkbox aria-label=\"항목 선택\" />;\n");
await writeFile(resolve(consumerDir, 'invalid.tsx'), "<div className=\"bg-[#fff]\" style={{ color: '#fff' }} />;\n");
run('pnpm', ['exec', 'ncai-design-system-cli-temp', 'validate', '--file', 'valid.tsx'], consumerDir);

try {
  runQuiet('pnpm', ['exec', 'ncai-design-system-cli-temp', 'validate', '--file', 'invalid.tsx'], consumerDir);
  throw new Error('CLI validate should fail for arbitrary styles');
} catch (error) {
  if (error.status !== 1) throw error;
}

run('pnpm', ['exec', 'ncai-design-system-cli-temp', 'setup-mcp', '--agent', 'cursor'], consumerDir);
run('pnpm', ['exec', 'ncai-design-system-cli-temp', 'install-skill', '--agent', 'cursor'], consumerDir);

const mcpConfig = JSON.parse(await readFile(resolve(consumerDir, '.cursor/mcp.json'), 'utf8'));
if (!mcpConfig.mcpServers?.['ncai-design-system-temp']?.args?.includes('@ncai/design-system-mcp-temp')) {
  throw new Error('setup-mcp did not create the expected MCP config');
}

const installedSkill = await readFile(resolve(consumerDir, '.cursor/skills/ncai-design-system-temp/SKILL.md'), 'utf8');
const packagedSkill = await readFile(resolve(consumerDir, 'node_modules/@ncai/design-system-skills-temp/company-ui/SKILL.md'), 'utf8');
if (installedSkill !== packagedSkill) {
  throw new Error('install-skill did not copy the packaged Skill source');
}

for (const item of packages) {
  const tarballPath = resolve(tarballDir, item.tarball);
  if (!existsSync(tarballPath)) {
    throw new Error(`${basename(tarballPath)} was not created`);
  }
}

const reactPackageJson = JSON.parse(await readFile(resolve(consumerDir, 'node_modules/@ncai/design-system-temp/package.json'), 'utf8'));
if (reactPackageJson.dependencies['@ncai/design-icons-temp']?.startsWith('workspace:')) {
  throw new Error('workspace protocol leaked into packed react package');
}
if (!reactPackageJson.dependencies['@base-ui/react']) {
  throw new Error('@base-ui/react should be a runtime dependency of @ncai/design-system-temp');
}
if (reactPackageJson.peerDependencies?.['@base-ui/react']) {
  throw new Error('@base-ui/react should not be exposed as a peer dependency');
}

console.log('All package tarballs install correctly in an isolated consumer.');

await writeFile(
  resolve(minimalConsumerDir, 'package.json'),
  `${JSON.stringify(
    {
      type: 'module',
      dependencies: {
        react: '^19.2.5',
        'react-dom': '^19.2.5',
        '@ncai/design-system-temp': internalDeps['@ncai/design-system-temp'],
        '@ncai/design-tokens-temp': internalDeps['@ncai/design-tokens-temp']
      },
      pnpm: {
        overrides: internalDeps
      }
    },
    null,
    2
  )}\n`
);

run('pnpm', ['install'], minimalConsumerDir);
await writeFile(
  resolve(minimalConsumerDir, 'minimal.mjs'),
  `
import { Checkbox } from '@ncai/design-system-temp';

if (!Checkbox) throw new Error('Checkbox export is missing in minimal consumer');
console.log('minimal install smoke passed');
`
);
run('node', ['minimal.mjs'], minimalConsumerDir);
const minimalReactPackageJson = JSON.parse(await readFile(resolve(minimalConsumerDir, 'node_modules/@ncai/design-system-temp/package.json'), 'utf8'));
if (minimalReactPackageJson.exports?.['./styles.css'] !== './dist/styles.css') {
  throw new Error('@ncai/design-system-temp/styles.css export is missing');
}

await writeFile(
  resolve(npmConsumerDir, 'package.json'),
  `${JSON.stringify(
    {
      type: 'module',
      dependencies: {
        react: '^19.2.5',
        'react-dom': '^19.2.5'
      },
      devDependencies: {
        '@ncai/design-system-cli-temp': `file:${resolve(tarballDir, packages.find((item) => item.name === '@ncai/design-system-cli-temp')?.tarball ?? '')}`,
        '@ncai/design-system-mcp-temp': `file:${resolve(tarballDir, packages.find((item) => item.name === '@ncai/design-system-mcp-temp')?.tarball ?? '')}`,
        '@ncai/design-system-skills-temp': `file:${resolve(tarballDir, packages.find((item) => item.name === '@ncai/design-system-skills-temp')?.tarball ?? '')}`,
        '@ncai/design-system-metadata-temp': `file:${resolve(tarballDir, packages.find((item) => item.name === '@ncai/design-system-metadata-temp')?.tarball ?? '')}`,
        '@ncai/design-icons-temp': `file:${resolve(tarballDir, packages.find((item) => item.name === '@ncai/design-icons-temp')?.tarball ?? '')}`
      }
    },
    null,
    2
  )}\n`
);

run('npm', ['install', `file:${resolve(tarballDir, packages.find((item) => item.name === '@ncai/design-system-temp')?.tarball ?? '')}`, `file:${resolve(tarballDir, packages.find((item) => item.name === '@ncai/design-tokens-temp')?.tarball ?? '')}`], npmConsumerDir);

await writeFile(resolve(npmConsumerDir, 'App.tsx'), "import '@ncai/design-system-temp/styles.css';\nimport { Checkbox } from '@ncai/design-system-temp';\n<Checkbox aria-label=\"npm 설치 확인\" />;\n");
run('npx', ['ncai-design-system-cli-temp', 'doctor'], npmConsumerDir);
run('npx', ['ncai-design-system-cli-temp', 'setup-mcp', '--agent', 'cursor'], npmConsumerDir);
run('npx', ['ncai-design-system-cli-temp', 'install-skill', '--agent', 'cursor'], npmConsumerDir);
run('npx', ['ncai-design-system-cli-temp', 'setup-mcp', '--agent', 'vscode'], npmConsumerDir);
run('npx', ['ncai-design-system-cli-temp', 'install-skill', '--agent', 'vscode'], npmConsumerDir);
run('npx', ['ncai-design-system-cli-temp', 'setup-mcp', '--agent', 'jetbrains'], npmConsumerDir);
run('npx', ['ncai-design-system-cli-temp', 'install-skill', '--agent', 'jetbrains'], npmConsumerDir);
run('npx', ['ncai-design-system-cli-temp', 'validate', '--file', 'App.tsx'], npmConsumerDir);

const vscodeMcpConfig = JSON.parse(await readFile(resolve(npmConsumerDir, '.vscode/mcp.json'), 'utf8'));
if (vscodeMcpConfig.servers?.['ncai-design-system-temp']?.type !== 'stdio') {
  throw new Error('setup-mcp --agent vscode did not create the expected VS Code MCP config');
}

const jetbrainsMcpConfig = JSON.parse(await readFile(resolve(npmConsumerDir, '.ncai/jetbrains-mcp.json'), 'utf8'));
if (!jetbrainsMcpConfig.mcpServers?.['ncai-design-system-temp']?.args?.includes('@ncai/design-system-mcp-temp')) {
  throw new Error('setup-mcp --agent jetbrains did not create the expected JetBrains MCP snippet');
}

const copilotInstructions = await readFile(resolve(npmConsumerDir, '.github/copilot-instructions.md'), 'utf8');
if (!copilotInstructions.includes('@ncai/design-system-temp')) {
  throw new Error('install-skill --agent vscode did not create useful Copilot instructions');
}

const jetbrainsInstructions = await readFile(resolve(npmConsumerDir, '.ncai/jetbrains-agent-instructions.md'), 'utf8');
if (!jetbrainsInstructions.includes('@ncai/design-system-temp')) {
  throw new Error('install-skill --agent jetbrains did not create useful agent instructions');
}

await cp(exampleSourceDir, exampleConsumerDir, {
  recursive: true,
  filter: (source) => {
    const normalized = source.replaceAll('\\', '/');
    return !normalized.includes('/node_modules') && !normalized.includes('/dist');
  }
});

const examplePackageJson = JSON.parse(await readFile(resolve(exampleConsumerDir, 'package.json'), 'utf8'));
examplePackageJson.dependencies = {
  ...examplePackageJson.dependencies,
  ...internalDeps
};
delete examplePackageJson.dependencies['@base-ui/react'];
examplePackageJson.pnpm = {
  ...(examplePackageJson.pnpm ?? {}),
  overrides: internalDeps
};

await writeFile(resolve(exampleConsumerDir, 'package.json'), `${JSON.stringify(examplePackageJson, null, 2)}\n`);

run('pnpm', ['install'], exampleConsumerDir);
run('pnpm', ['build'], exampleConsumerDir);

console.log('Vite React example builds correctly with packed tarballs.');
