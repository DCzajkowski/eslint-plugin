module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:jest/recommended',
  ],
  overrides: [
    {
      files: ['.*.js'],
    },
    {
      files: ['test/**/*.test.ts'],
      env: {
        jest: true,
      },
    }
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
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
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
};
