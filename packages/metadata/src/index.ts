export { approvedIcons } from './icons';
export type { ApprovedIcon } from './icons';
export { componentMetadataJsonSchema, validateComponentMetadata } from './schema';
export type {
  ComponentDeprecationMetadata,
  ComponentMetadataDefinition,
  ComponentMigrationMetadata,
  ComponentPropMetadata,
  ComponentStylePolicy,
  ComponentStatus,
  MetadataValidationIssue
} from './schema';
export { approvedTokens } from './tokens';
export type { ApprovedToken } from './tokens';

import { checkboxMetadata } from './components/Checkbox.metadata';

export const componentMetadata = [checkboxMetadata] as const;

export type ComponentMetadata = (typeof componentMetadata)[number];
