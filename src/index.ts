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
    recommended: {},
  },
  rules: {
    'enum-value-name': enumValueName as unknown as RuleDefinition,
    'no-relative-imports': noRelativeImports as unknown as RuleDefinition,
    'ordered-imports': orderedImports as unknown as RuleDefinition,
  },
  processors: {},
} satisfies ESLint.Plugin;

plugin.configs.recommended = {
  plugins: {
    '@dczajkowski': plugin,
  },
  rules: {
    '@dczajkowski/enum-value-name': 'error',
    '@dczajkowski/no-relative-imports': 'warn',
    '@dczajkowski/ordered-imports': 'warn',
  },
};

export default plugin;
