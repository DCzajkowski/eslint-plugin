import { ESLint } from 'eslint';
import { RuleDefinition } from '@eslint/core';
import { enumValueName } from './rules/enum-value-name';
import { noRelativeImports } from './rules/no-relative-imports';
import { orderedImports } from './rules/ordered-imports';
import packageJson from '../package.json' assert { type: 'json' };

const plugin = {
  meta: {
    name: packageJson.name,
    version: packageJson.version,
    // TSESLint.Linter.Plugin['meta'] does not yet have the 'namespace' property in its type.
    ...{ namespace: '@dczajkowski' },
  },
  configs: {
    recommended: {
      plugins: {
        '@dczajkowski': {} as ESLint.Plugin,
      },
      rules: {
        '@dczajkowski/enum-value-name': 'error' as const,
        '@dczajkowski/no-relative-imports': 'warn' as const,
        '@dczajkowski/ordered-imports': 'warn' as const,
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

export default plugin;
