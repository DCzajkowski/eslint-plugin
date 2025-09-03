# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-03

### Added
- Full compatibility with ESLint 9
- Support for ESLint flat configuration format
- Modern ES module exports with dual CJS/ESM support
- TypeScript declaration files for better IDE support

### Changed
- **BREAKING**: Migrated to ESLint 9 flat config format
- **BREAKING**: Now requires Typescript 5.x
- Upgraded `@typescript-eslint/utils`

### Migration Guide from 0.6.x to 1.0.0

#### ESLint Configuration Migration

**Old ESLint configuration (`.eslintrc.js` or `.eslintrc.json`):**
```javascript
module.exports = {
  plugins: ['@dczajkowski'],
  rules: {
    '@dczajkowski/enum-value-name': 'error',
    '@dczajkowski/no-relative-imports': 'error',
    '@dczajkowski/ordered-imports': 'error'
  }
};
```

**New ESLint flat config (`eslint.config.js`):**
```javascript
import dczajkowski from '@dczajkowski/eslint-plugin';

export default [
  {
    plugins: {
      '@dczajkowski': dczajkowski
    },
    rules: {
      '@dczajkowski/enum-value-name': 'error',
      '@dczajkowski/no-relative-imports': 'error',
      '@dczajkowski/ordered-imports': 'error'
    }
  }
];
```

---

## [0.6.0] - 2024-12-15

### Added
- Full compatibility with ESLint 8
- Support for legacy ESLint configuration format (`.eslintrc.*`)
- Three core rules:
  - `enum-value-name`: Enforces consistent enum value naming conventions
  - `no-relative-imports`: Prevents usage of relative imports in favor of absolute imports
  - `ordered-imports`: Ensures imports are properly ordered and grouped
