export const componentMetadataJsonSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://ncai.dev/schemas/component-metadata.schema.json',
  title: 'NC AI Component Metadata',
  type: 'object',
  required: [
    'name',
    'description',
    'status',
    'baseUi',
    'props',
    'examples',
    'rules',
    'stylePolicy',
    'componentTokens',
    'deprecated',
    'migration'
  ],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    status: { enum: ['mvp', 'experimental', 'stable', 'deprecated'] },
    baseUi: { type: 'array', items: { type: 'string' } },
    props: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['type', 'description'],
        additionalProperties: false,
        properties: {
          type: {
            oneOf: [
              { type: 'string', minLength: 1 },
              { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1 }
            ]
          },
          defaultValue: {},
          description: { type: 'string', minLength: 1 },
          deprecated: { type: 'boolean' },
          migration: { type: 'string' }
        }
      }
    },
    examples: { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1 },
    rules: { type: 'array', items: { type: 'string', minLength: 1 }, minItems: 1 },
    stylePolicy: {
      type: 'object',
      required: ['disallowStyleProp', 'classNameUsage'],
      additionalProperties: false,
      properties: {
        disallowStyleProp: { type: 'boolean' },
        classNameUsage: { enum: ['none', 'layout-only'] }
      }
    },
    componentTokens: {
      type: 'array',
      items: { type: 'string', pattern: '^[a-z][a-z0-9]*\\.[a-z][a-zA-Z0-9]*(\\.[a-z][a-zA-Z0-9]*)*$' }
    },
    deprecated: {
      type: 'object',
      required: ['isDeprecated'],
      additionalProperties: false,
      properties: {
        isDeprecated: { type: 'boolean' },
        since: { type: 'string' },
        replacement: { type: 'string' },
        removalVersion: { type: 'string' },
        reason: { type: 'string' }
      }
    },
    migration: {
      type: 'object',
      required: ['notes'],
      additionalProperties: false,
      properties: {
        notes: { type: 'array', items: { type: 'string' } },
        codemod: { type: 'string' },
        breakingChanges: { type: 'array', items: { type: 'string' } }
      }
    }
  }
} as const;

export type ComponentStatus = 'mvp' | 'experimental' | 'stable' | 'deprecated';

export type ComponentPropMetadata = {
  type: string | readonly string[];
  defaultValue?: unknown;
  description: string;
  deprecated?: boolean;
  migration?: string;
};

export type ComponentDeprecationMetadata = {
  isDeprecated: boolean;
  since?: string;
  replacement?: string;
  removalVersion?: string;
  reason?: string;
};

export type ComponentMigrationMetadata = {
  notes: readonly string[];
  codemod?: string;
  breakingChanges?: readonly string[];
};

export type ComponentStylePolicy = {
  disallowStyleProp: boolean;
  classNameUsage: 'none' | 'layout-only';
};

export type ComponentMetadataDefinition = {
  name: string;
  description: string;
  status: ComponentStatus;
  baseUi: readonly string[];
  props: Record<string, ComponentPropMetadata>;
  examples: readonly string[];
  rules: readonly string[];
  stylePolicy: ComponentStylePolicy;
  componentTokens: readonly string[];
  deprecated: ComponentDeprecationMetadata;
  migration: ComponentMigrationMetadata;
};

export type MetadataValidationIssue = {
  path: string;
  message: string;
};

export function validateComponentMetadata(components: readonly ComponentMetadataDefinition[]) {
  const issues: MetadataValidationIssue[] = [];
  const names = new Set<string>();

  for (const [index, component] of components.entries()) {
    const path = `componentMetadata[${index}]`;

    if (!component.name) {
      issues.push({ path: `${path}.name`, message: 'Component name is required.' });
    }

    if (names.has(component.name)) {
      issues.push({ path: `${path}.name`, message: `Duplicate component name: ${component.name}.` });
    }
    names.add(component.name);

    if (!component.description) {
      issues.push({ path: `${path}.description`, message: 'Component description is required.' });
    }

    if (!['mvp', 'experimental', 'stable', 'deprecated'].includes(component.status)) {
      issues.push({ path: `${path}.status`, message: `Unsupported status: ${component.status}.` });
    }

    if (component.status === 'deprecated' && !component.deprecated.isDeprecated) {
      issues.push({ path: `${path}.deprecated`, message: 'Deprecated components must set deprecated.isDeprecated to true.' });
    }

    if (component.stylePolicy.disallowStyleProp && Object.hasOwn(component.props, 'style')) {
      issues.push({ path: `${path}.props.style`, message: 'style prop must not be exposed by design system components.' });
    }

    const classNameProp = component.props.className;
    if (component.stylePolicy.classNameUsage === 'layout-only' && !classNameProp) {
      issues.push({ path: `${path}.props.className`, message: 'layout-only className policy must document the className prop.' });
    }

    if (component.stylePolicy.classNameUsage === 'layout-only' && classNameProp) {
      const description = classNameProp.description.toLowerCase();
      if (!description.includes('layout') && !description.includes('레이아웃')) {
        issues.push({
          path: `${path}.props.className.description`,
          message: 'layout-only className policy must be explicit in the prop description.'
        });
      }
    }

    const expectedTokenPrefix = `${component.name[0]?.toLowerCase()}${component.name.slice(1)}.`;
    for (const token of component.componentTokens) {
      if (!token.startsWith(expectedTokenPrefix)) {
        issues.push({
          path: `${path}.componentTokens`,
          message: `Component token "${token}" must start with "${expectedTokenPrefix}".`
        });
      }
    }

    if (!Array.isArray(component.examples) || component.examples.length === 0) {
      issues.push({ path: `${path}.examples`, message: 'At least one example is required.' });
    }

    if (!Array.isArray(component.rules) || component.rules.length === 0) {
      issues.push({ path: `${path}.rules`, message: 'At least one usage rule is required.' });
    }

    for (const [propName, prop] of Object.entries(component.props)) {
      if (!prop.description) {
        issues.push({ path: `${path}.props.${propName}.description`, message: 'Prop description is required.' });
      }

      if (Array.isArray(prop.type) && prop.type.length === 0) {
        issues.push({ path: `${path}.props.${propName}.type`, message: 'Prop type array must not be empty.' });
      }

      if (prop.deprecated && !prop.migration) {
        issues.push({ path: `${path}.props.${propName}.migration`, message: 'Deprecated props need a migration note.' });
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
