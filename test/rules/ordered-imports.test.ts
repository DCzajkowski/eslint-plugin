import { orderedImports } from '../../src/rules/ordered-imports';
import { ruleTester } from '../RuleTester';

ruleTester.run('ordered-imports', orderedImports, {
  valid: [
    {
      filename: 'file-with-imports.ts',
      code: ``,
    },
    {
      filename: 'file-with-imports.ts',
      code: `const a: string = '';`,
    },
    {
      filename: 'file-with-imports.ts',
      code: `
import 'a';
import 'b';
import '../../a';
import '../../b';
import '../a';
import '../b';
import './a';
import './b';
`,
    },
    {
      filename: 'file-with-imports.ts',
      code: `
import 'a';
import 'b';
const a: string = ''
`,
    },
    {
      filename: 'file-with-import-specifiers.ts',
      code: `
import { A, X, Y, Z } from 'a';
import { B, C } from 'b';
import { C, D, E } from 'c';
`,
    },
    {
      filename: 'file-with-multiline-import-specifiers.ts',
      code: `import {
  A,
  X,
  Y,
  Z,
} from 'a';
import { B, C } from 'b';
import { C, D, E } from 'c';
`,
    },
  ],

  invalid: [
    {
      filename: 'file-with-imports.ts',
      code: `import B from 'b';
/* comment for a */
import A from 'a'; // comment a
/* comment for c */
import C from 'c';
import D from 'd'; // comment d
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `/* comment for a */
import A from 'a'; // comment a
import B from 'b';
/* comment for c */
import C from 'c';
import D from 'd'; // comment d
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `import A1 from 'a';
import A2 from './a';
import A3 from '../../a';
import A4 from '../a';
import B1 from '../../b';
import B2 from './b';
import B3 from 'b';
import B4 from '../b';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `import A1 from 'a';
import B3 from 'b';
import A3 from '../../a';
import B1 from '../../b';
import A4 from '../a';
import B4 from '../b';
import A2 from './a';
import B2 from './b';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `import A1 from 'a';
import B1 from 'b';
import A2 from '../../a';
import B2 from '../../b';
import A3 from '../a';
import B3 from '../b';
import B4 from './b';
import A4 from'./a';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `import A1 from 'a';
import B1 from 'b';
import A2 from '../../a';
import B2 from '../../b';
import A3 from '../a';
import B3 from '../b';
import A4 from'./a';
import B4 from './b';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `import B1 from 'b';
import A1 from 'a';

const a: string = ''
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `import A1 from 'a';
import B1 from 'b';

const a: string = ''
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `import A1 from 'a';
import A2 from '../../a';
import B1 from '../../b';
import B2 from 'b';
import B3 from '../b';
import A3 from './a';
import A4 from '../a';
import B4 from './b';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `import A1 from 'a';
import B2 from 'b';
import A2 from '../../a';
import B1 from '../../b';
import A4 from '../a';
import B3 from '../b';
import A3 from './a';
import B4 from './b';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `/* comment for b */
import B from 'b';
import A from 'a';
import C from 'c';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 2 }],
      output: `import A from 'a';
/* comment for b */
import B from 'b';
import C from 'c';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `/* comment for file */

import B from 'b';
import A from 'a';
import C from 'c';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 3 }],
      output: `/* comment for file */

import A from 'a';
import B from 'b';
import C from 'c';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `/*
  comment for file
*/

// comment for b
import B from 'b';
import A from 'a';
import C from 'c';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 6 }],
      output: `/*
  comment for file
*/

import A from 'a';
// comment for b
import B from 'b';
import C from 'c';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `/* comment for file */

// 1st multiline comment for d
// 2nd multiline comment for d
import D from 'd'
import E from 'e'

// comment for b
import B from 'b';
// 1st multiline comment for a
// 2nd multiline comment for a
import A from 'a';
import C from 'c';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 9 }],
      output: `/* comment for file */

// 1st multiline comment for d
// 2nd multiline comment for d
import D from 'd'
import E from 'e'

// 1st multiline comment for a
// 2nd multiline comment for a
import A from 'a';
// comment for b
import B from 'b';
import C from 'c';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `import B from 'b';
import A from 'a';

import F from 'f';
import E from 'e';

import D from 'd';
import C from 'c';
      `,
      errors: [
        { messageId: 'importsMustBeAlphabetized', line: 1 },
        { messageId: 'importsMustBeAlphabetized', line: 4 },
        { messageId: 'importsMustBeAlphabetized', line: 7 },
      ],
      output: `import A from 'a';
import B from 'b';

import E from 'e';
import F from 'f';

import C from 'c';
import D from 'd';
      `,
    },
    {
      filename: 'file-with-import-specifiers.ts',
      code: `import { YThing, XThing, ZThing, AThing } from 'a';`,
      errors: [{ messageId: 'importSpecifiersMustBeAlphabetized', line: 1 }],
      output: `import { AThing, XThing, YThing, ZThing } from 'a';`,
    },
    {
      filename: 'file-with-multiline-import-specifiers.ts',
      code: `import {
  YThing,
  XThing,
  ZThing,
  AThing,
} from 'a';`,
      errors: [{ messageId: 'importSpecifiersMustBeAlphabetized', line: 1 }],
      output: `import {
  AThing, XThing, YThing, ZThing,
} from 'a';`,
    },
    {
      filename: 'file-with-import-specifiers.ts',
      code: `import { YThing, XThing, ZThing, AThing } from 'a';
import { B, C } from 'b';
import { C, E, D } from 'c';
`,
      errors: [
        { messageId: 'importSpecifiersMustBeAlphabetized', line: 1 },
        { messageId: 'importSpecifiersMustBeAlphabetized', line: 3 },
      ],
      output: `import { AThing, XThing, YThing, ZThing } from 'a';
import { B, C } from 'b';
import { C, D, E } from 'c';
`,
    },
    {
      filename: 'file-with-multiline-import-specifiers.ts',
      code: `import {
  X,
  Y,
  Z,
  A
} from 'a';
import { B, C } from 'b';
import { E, C, D } from 'c';
`,
      errors: [
        { messageId: 'importSpecifiersMustBeAlphabetized', line: 1 },
        { messageId: 'importSpecifiersMustBeAlphabetized', line: 8 },
      ],
      output: `import {
  A, X, Y, Z
} from 'a';
import { B, C } from 'b';
import { C, D, E } from 'c';
`,
    },
    {
      filename: 'mixed-file.ts',
      code: `import BModule from 'b';
import { B, C as Z, A } from 'z';
import * as all from 'c'
import {
  X,
  Z,
  Y,
  A
} from 'a'
import { E, C, D } from 'd';
`,
      errors: [
        { messageId: 'importsMustBeAlphabetized', line: 1 },
        { messageId: 'importSpecifiersMustBeAlphabetized', line: 2 },
        { messageId: 'importSpecifiersMustBeAlphabetized', line: 4 },
        { messageId: 'importSpecifiersMustBeAlphabetized', line: 10 },
      ],
      output: [
        `import {
  X,
  Z,
  Y,
  A
} from 'a'
import BModule from 'b';
import * as all from 'c'
import { E, C, D } from 'd';
import { B, C as Z, A } from 'z';
`,
        `import {
  A, X, Y, Z
} from 'a'
import BModule from 'b';
import * as all from 'c'
import { C, D, E } from 'd';
import { A, B, C as Z } from 'z';
`,
      ],
    },
    {
      // Test the sort is stable.
      filename: 'mixed-file.ts',
      code: `import { X } from 'z'
import { D, A } from 'b'
import { Y } from 'a'
import { B, C } from 'b'
import YModule from 'y'
import ModuleM from 'module-m'
`,
      errors: [
        { messageId: 'importsMustBeAlphabetized', line: 1 },
        { messageId: 'importSpecifiersMustBeAlphabetized', line: 2 },
      ],
      output: [
        `import { Y } from 'a'
import { D, A } from 'b'
import { B, C } from 'b'
import ModuleM from 'module-m'
import YModule from 'y'
import { X } from 'z'
`,
        `import { Y } from 'a'
import { A, D } from 'b'
import { B, C } from 'b'
import ModuleM from 'module-m'
import YModule from 'y'
import { X } from 'z'
`,
      ],
    },
    {
      code: `import {
  UnknownAction,
  combineReducers,
  createAction,
  createReducer,
  Reducer,
  // In this case we want the base type.
  Store,
} from '@reduxjs/toolkit'`,
      errors: [{ messageId: 'importSpecifiersMustBeAlphabetized', line: 1 }],
      output:
        `import {
  combineReducers, createAction, createReducer, Reducer,` +
        // This trailing space is not ideal, but it's acceptable assuming users have trimTrailingWhitespace enabled or use
        // Prettier.
        ' \n' +
        `// In this case we want the base type.
  Store, UnknownAction,
} from '@reduxjs/toolkit'`,
    },
    {
      filename: 'mixed-with-side-effects-imports.ts',
      code: `import B from 'b'
import 'a-side-effect-import'
import A from 'a'
`,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
    },
    {
      filename: 'mixed-with-side-effects-imports.ts',
      code: `import B from 'b'
import './a-side-effect-import'
import A from 'a'
`,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
    },
    {
      filename: 'mixed-with-side-effects-imports.ts',
      code: `import B from 'b'
import '../a-side-effect-import'
import A from 'a'
`,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
    },
  ],
});
