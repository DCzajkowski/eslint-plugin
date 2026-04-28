import { ESLint } from 'eslint';
import { RuleDefinition } from '@eslint/core';
import { enumValueName } from './rules/enum-value-name';
import { noRelativeImports } from './rules/no-relative-imports';
import { orderedImports } from './rules/ordered-imports';
import packageJson from '../package.json' with { type: 'json' };

// Reference: https://github.com/typescript-eslint/typescript-eslint/blob/52457932e5507b5ca01e720a541f3f8d01e09b9d/packages/typescript-eslint/src/compatibility-types.ts#L14
type CompatibleConfig = {
  name?: string;
  rules?: object;
};

// Reference: https://github.com/typescript-eslint/typescript-eslint/blob/52457932e5507b5ca01e720a541f3f8d01e09b9d/packages/typescript-eslint/src/compatibility-types.ts#L21
type CompatiblePlugin = {
  meta: {
    name: string;
  };
  configs: {
    recommended: CompatibleConfig;
  };
};

const plugin = {
  meta: {
    name: '@dczajkowski/eslint-plugin' as const,
    version: packageJson.version,
    namespace: '@dczajkowski' as const,
  },
  configs: {
    recommended: {
      plugins: {
        '@dczajkowski': {} as CompatiblePlugin,
      },
      rules: {
        '@dczajkowski/enum-value-name': 'error',
        '@dczajkowski/no-relative-imports': 'warn',
        '@dczajkowski/ordered-imports': 'warn',
      },
    },
  },
  rules: {
    'enum-value-name': enumValueName as unknown as RuleDefinition,
    'no-relative-imports': noRelativeImports as unknown as RuleDefinition,
    'ordered-imports': orderedImports as unknown as RuleDefinition,
  },
  processors: {},
} satisfies ESLint.Plugin;

// Set the plugin object in the recommended config to enable usage with ESLint flat config.
plugin.configs.recommended.plugins['@dczajkowski'] = plugin;

export default plugin as CompatiblePlugin;
