#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { approvedIcons, approvedTokens, componentMetadata } from '@ncai/design-system-metadata-temp';
import { z } from 'zod';
import { findRecipeCandidates } from './recipe';
import { validateUiCode } from './validation';

function findComponent(name: string) {
  return componentMetadata.find((item) => item.name.toLowerCase() === name.toLowerCase());
}

const server = new McpServer(
  {
    name: 'ncai-design-system',
    version: '0.1.0'
  },
  {
    instructions:
      'Use @ncai/design-system-temp components before raw Base UI. Do not create arbitrary styles, colors, icons, or variants. Query component metadata and validate generated UI code before finishing.'
  }
);

server.registerTool(
  'search_components',
  {
    title: 'Search NC AI components',
    description: 'Search approved NC AI design system components.',
    inputSchema: {
      query: z.string().optional()
    }
  },
  async ({ query }) => {
    const normalizedQuery = query?.toLowerCase() ?? '';
    const components = componentMetadata.filter((component) => {
      if (!normalizedQuery) {
        return true;
      }
      return (
        component.name.toLowerCase().includes(normalizedQuery) ||
        component.description.toLowerCase().includes(normalizedQuery)
      );
    });

    return {
      content: [{ type: 'text', text: JSON.stringify({ components }, null, 2) }],
      structuredContent: { components }
    };
  }
);

server.registerTool(
  'get_component_usage',
  {
    title: 'Get component usage',
    description: 'Return usage rules, props, and examples for an approved component.',
    inputSchema: {
      name: z.string()
    }
  },
  async ({ name }) => {
    const component = findComponent(name);
    const examples = component?.examples ?? [];

    return {
      content: [{ type: 'text', text: JSON.stringify({ component, examples }, null, 2) }],
      structuredContent: { component, examples }
    };
  }
);

server.registerTool(
  'get_component_recipe',
  {
    title: 'Get component recipe',
    description: 'Return an approved composition recipe for a simple UI request.',
    inputSchema: {
      query: z.string()
    }
  },
  async ({ query }) => {
    const candidates = findRecipeCandidates(query);
    const recipe = candidates.length > 0
      ? {
          components: candidates.map((component) => component.name),
          steps: candidates.flatMap((component) => [
            `${component.name}를 @ncai/design-system-temp에서 import한다.`,
            ...component.rules
          ]),
          examples: candidates.flatMap((component) => component.examples)
        }
      : {
          components: [],
          steps: [
            `현재 승인된 컴포넌트는 ${componentMetadata.map((component) => component.name).join(', ')}입니다. 적합한 컴포넌트가 없으면 사용자에게 범위 확장을 확인하세요.`
          ],
          examples: []
        };

    return {
      content: [{ type: 'text', text: JSON.stringify({ recipe }, null, 2) }],
      structuredContent: { recipe }
    };
  }
);

server.registerTool(
  'list_design_tokens',
  {
    title: 'List design tokens',
    description: 'List approved CSS variable tokens for NC AI components.'
  },
  async () => ({
    content: [{ type: 'text', text: JSON.stringify({ tokens: approvedTokens }, null, 2) }],
    structuredContent: { tokens: approvedTokens }
  })
);

server.registerTool(
  'search_tokens',
  {
    title: 'Search design tokens',
    description: 'Search approved NC AI CSS variable tokens.',
    inputSchema: {
      query: z.string().optional()
    }
  },
  async ({ query }) => {
    const normalizedQuery = query?.toLowerCase() ?? '';
    const tokens = approvedTokens.filter((token) => token.toLowerCase().includes(normalizedQuery));

    return {
      content: [{ type: 'text', text: JSON.stringify({ tokens }, null, 2) }],
      structuredContent: { tokens }
    };
  }
);

server.registerTool(
  'list_icons',
  {
    title: 'List approved icons',
    description: 'List approved NC AI icon components.'
  },
  async () => ({
    content: [{ type: 'text', text: JSON.stringify({ icons: approvedIcons }, null, 2) }],
    structuredContent: { icons: approvedIcons }
  })
);

server.registerTool(
  'search_icons',
  {
    title: 'Search icons',
    description: 'Search approved NC AI icon components.',
    inputSchema: {
      query: z.string().optional()
    }
  },
  async ({ query }) => {
    const normalizedQuery = query?.toLowerCase() ?? '';
    const icons = approvedIcons.filter(
      (icon) => icon.name.toLowerCase().includes(normalizedQuery) || icon.usage.toLowerCase().includes(normalizedQuery)
    );

    return {
      content: [{ type: 'text', text: JSON.stringify({ icons }, null, 2) }],
      structuredContent: { icons }
    };
  }
);

server.registerTool(
  'validate_ui_code',
  {
    title: 'Validate NC AI UI code',
    description: 'Detect arbitrary styles, raw Base UI imports, and unapproved icon imports.',
    inputSchema: {
      code: z.string()
    }
  },
  async ({ code }) => {
    const result = validateUiCode(code);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ],
      structuredContent: result
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
