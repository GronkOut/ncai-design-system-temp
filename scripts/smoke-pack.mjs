import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = resolve(tmpdir(), 'ncai-design-system-pack-smoke');
const tarballDir = resolve(tempRoot, 'tarballs');
const consumerDir = resolve(tempRoot, 'consumer');
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

await rm(tempRoot, { force: true, recursive: true });
await mkdir(tarballDir, { recursive: true });
await mkdir(consumerDir, { recursive: true });

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
        '@base-ui/react': '^1.4.1',
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

console.log('All package tarballs install correctly in an isolated consumer.');

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
examplePackageJson.pnpm = {
  ...(examplePackageJson.pnpm ?? {}),
  overrides: internalDeps
};

await writeFile(resolve(exampleConsumerDir, 'package.json'), `${JSON.stringify(examplePackageJson, null, 2)}\n`);

run('pnpm', ['install'], exampleConsumerDir);
run('pnpm', ['build'], exampleConsumerDir);

console.log('Vite React example builds correctly with packed tarballs.');
