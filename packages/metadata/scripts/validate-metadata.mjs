import { componentMetadata, validateComponentMetadata } from '../dist/index.js';

const result = validateComponentMetadata(componentMetadata);

if (!result.valid) {
  console.error('Component metadata validation failed.');
  for (const issue of result.issues) {
    console.error(`- ${issue.path}: ${issue.message}`);
  }
  process.exit(1);
}

console.log(`Component metadata validation passed for ${componentMetadata.length} component(s).`);
