module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:jest/recommended',
  ],
  overrides: [
    {
      files: ['.*.js'],
    },
    {
      files: ['test/rules/**'],
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
        trailingComma: 'all',
      },
    ],
    '@typescript-eslint/no-unused-vars': 'off',
  },
};
