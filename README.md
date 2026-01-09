# @dczajkowski/eslint-plugin
This is an [eslint](https://eslint.org/) plugin that provides useful eslint rules.

## Installation
```bash
npm i @dczajkowski/eslint-plugin --save-dev
# or
yarn add -D @dczajkowski/eslint-plugin
# or
pnpm add -D @dczajkowski/eslint-plugin
```

## Setup

> Note: This setup requires ESLint 9 with flat config.

### Recommended config — all rules enabled
In `eslint.config.mjs`:
```js
import { defineConfig } from 'eslint/config';
import dczajkowski from '@dczajkowski/eslint-plugin';

export default defineConfig([
  // ...
  dczajkowski.configs.recommended,
  // ...
]);
```

### Enable only a few rules
In `eslint.config.mjs`:
```js
import { defineConfig } from 'eslint/config';
import dczajkowski from '@dczajkowski/eslint-plugin';

export default defineConfig([
  // ...
  {
    'plugins': {
      '@dczajkowski': dczajkowski,
    },
    'rules': {
      '@dczajkowski/enum-value-name': 'error',
      '@dczajkowski/no-relative-imports': 'warn',
      '@dczajkowski/ordered-imports': 'warn',
    },
  },
  // ...
]);
```

## Available Rules
### @dczajkowski/enum-value-name
This rule forces enum value names to be PascalCase.

#### Example:
```ts
/* Valid */
enum A {
  PascalCase = 0,
  SnakeCase = 1,
  CamelCase = 2,
  CapitalizedWithUnderscores = 3,
}

/* Invalid */
enum A {
  PascalCase = 0,
  snake_case = 1,
  camelCase = 2,
  CAPITALIZED_WITH_UNDERSCORES = 3,
}
```

### @dczajkowski/no-relative-imports
This rule disables relative imports, so you have to use aliases instead.

#### Example:
```ts
/* Valid */
import test1 from '@src/test1'
import test2 from '@module/test2'
import test3, { test4 } from '@src/test'
import { test5 } from '@src/some/dir/test'
import { test6 } from '@src/test6'

/* Invalid */
import test1 from './src/test1'
import test2 from './module/test2'
import test3, { test4 } from './src/test'
import { test5 } from './src/some/dir/test'
import { test6 } from './../src/test6'
```

### @dczajkowski/ordered-imports
This rule enforces alphabetized order for imports. Starting with version 1.1.0, it also sorts import specifiers (that is, the named imports within curly braces).

This rule tries to mimic the behavior of VSCode's `Organize Imports` feature as closely as possible. If you find any differences between the two, please open an issue.

#### Note on side-effect imports

Side-effect imports (like `import 'module-name';`) are not auto-fixed. If they are not sorted, the rule will, report a violation, but it won't fix the order. This is to avoid potential issues with import order affecting runtime behavior.

Example:
```ts
import { X } from 'x';
import 'a-side-effect-import'; // <-- this is breaking the sort order, which will be reported but not auto-fixed.
import { B } from 'b';
```

Manual fix:
```ts
import 'a-side-effect-import'; // <-- move the side-effect import to the top and separate it with a blank line creating a new import group.

import { X } from 'x'; // <-- these now will be auto-sorted, as the group does not contain side-effect imports anymore.
import { B } from 'b';
```

#### Performance

I've run this rule on a large monorepo project. It took 566 ms to lint ~2300 files and fix ~640 of them. Consecutive run with the files fixed took 213 ms. To get the scale, the `prettier/prettier` rule on the same monorepo with files already fixed took 14,471 ms to lint.

## Licence
This project is under [The MIT License (MIT)](https://github.com/DCzajkowski/eslint-plugin/blob/master/LICENSE)
