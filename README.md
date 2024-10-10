# @dczajkowski/eslint-plugin
This is an [eslint](https://eslint.org/) plugin that provides several eslint rules that are not available out of the box.

## Installation
```bash
npm i @dczajkowski/eslint-plugin --save-dev
# or
yarn add -D @dczajkowski/eslint-plugin
# or
pnpm add -D @dczajkowski/eslint-plugin
```

## Setup (ESLint 9+ flat config)
In your `eslint.config.js` config:
```js
import dczajkowski from '@dczajkowski/eslint-plugin'

/** @type {import("eslint").Linter.Config[]} */
export default [
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
];
```

## Setup (ESLint 9 legacy config)
In your `.eslintrc` config:

```json
{
  "plugins": ["@dczajkowski"],
  "rules": {
    "@dczajkowski/enum-value-name": "error",
    "@dczajkowski/no-relative-imports": "warn",
    "@dczajkowski/ordered-imports": "warn"
  }
}
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
This rule enforces alphabetized order for imports. There is an auto-fixer in place that corrects the order if it's wrong.
It checks for order between imports that don't have an empty line between them. Those that have an empty line, are ordered separately.
When auto-fixing to the correct order, it also moves the comments along with the group of imports.

#### Unordered Code Example:
```ts
import 'c' /* comment for c */
/* comment for b */
import 'b'
import '../../c';
import '../../b';
import './b';
import './c';

/* eslint-disable ordered-imports */
import 'z'
// comment for y
import 'y'
import 'x'
/* eslint-enable ordered-imports */

import 'g'
import 'f'

// 1st multiline comment for d
// 2nd multiline comment for d
import 'd'
// 1st multiline comment for a
// 2nd multiline comment for a
import 'a'
```
#### Corrected Code Example
```ts
/* comment for b */
import 'b'
import 'c' /* comment for c */
import '../../b';
import '../../c';
import './b';
import './c';

/* eslint-disable ordered-imports */
import 'z'
// comment for y
import 'y'
import 'x'
/* eslint-enable ordered-imports */

import 'f'
import 'g'

// 1st multiline comment for a
// 2nd multiline comment for a
import 'a'
// 1st multiline comment for d
// 2nd multiline comment for d
import 'd'
```

## Licence
This project is under [The MIT License (MIT)](https://github.com/DCzajkowski/eslint-plugin/blob/master/LICENSE)
