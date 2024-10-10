import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import jest from 'eslint-plugin-jest';

/** @type { import("eslint").Linter.Config[] } */
export default [
  {
    ignores: ['dist/*'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['*.ts', '*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    ...prettier,
    rules: {
      ...prettier.rules,
      'prettier/prettier': [
        'warn',
        {
          parser: 'typescript',
          printWidth: 120,
          singleQuote: true,
          semi: true,
          trailingComma: 'all',
        },
      ],
    },
  },
  {
    files: ['test/**'],
    ...jest.configs['flat/recommended'],
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/prefer-expect-assertions': 'off',
    },
  },
];
