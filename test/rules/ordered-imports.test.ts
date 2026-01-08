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
      code: `
import {
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
      code: `import 'b';
/* comment for a */
import 'a'; // comment a
/* comment for c */
import 'c';
import 'd'; // comment d
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `/* comment for a */
import 'a'; // comment a
import 'b';
/* comment for c */
import 'c';
import 'd'; // comment d
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `import 'a';
import './a';
import '../../a';
import '../a';
import '../../b';
import './b';
import 'b';
import '../b';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `import 'a';
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
      code: `import 'a';
import 'b';
import '../../a';
import '../../b';
import '../a';
import '../b';
import './b';
import './a';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `import 'a';
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
      code: `import 'b';
import 'a';

const a: string = ''
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `import 'a';
import 'b';

const a: string = ''
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `import 'a';
import '../../a';
import '../../b';
import 'b';
import '../b';
import './a';
import '../a';
import './b';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
      output: `import 'a';
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
      code: `/* comment for b */
import 'b';
import 'a';
import 'c';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 2 }],
      output: `import 'a';
/* comment for b */
import 'b';
import 'c';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `/* comment for file */

import 'b';
import 'a';
import 'c';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 3 }],
      output: `/* comment for file */

import 'a';
import 'b';
import 'c';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `/*
  comment for file
*/

// comment for b
import 'b';
import 'a';
import 'c';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 6 }],
      output: `/*
  comment for file
*/

import 'a';
// comment for b
import 'b';
import 'c';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `/* comment for file */

// 1st multiline comment for d
// 2nd multiline comment for d
import 'd'
import 'e'

// comment for b
import 'b';
// 1st multiline comment for a
// 2nd multiline comment for a
import 'a';
import 'c';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 9 }],
      output: `/* comment for file */

// 1st multiline comment for d
// 2nd multiline comment for d
import 'd'
import 'e'

// 1st multiline comment for a
// 2nd multiline comment for a
import 'a';
// comment for b
import 'b';
import 'c';
      `,
    },
    {
      filename: 'file-with-imports.ts',
      code: `import 'b';
import 'a';

import 'f';
import 'e';

import 'd';
import 'c';
      `,
      errors: [
        { messageId: 'importsMustBeAlphabetized', line: 1 },
        { messageId: 'importsMustBeAlphabetized', line: 4 },
        { messageId: 'importsMustBeAlphabetized', line: 7 },
      ],
      output: `import 'a';
import 'b';

import 'e';
import 'f';

import 'c';
import 'd';
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
import 'module-m'
`,
      errors: [
        { messageId: 'importsMustBeAlphabetized', line: 1 },
        { messageId: 'importSpecifiersMustBeAlphabetized', line: 2 },
      ],
      output: [
        `import { Y } from 'a'
import { D, A } from 'b'
import { B, C } from 'b'
import 'module-m'
import YModule from 'y'
import { X } from 'z'
`,
        `import { Y } from 'a'
import { A, D } from 'b'
import { B, C } from 'b'
import 'module-m'
import YModule from 'y'
import { X } from 'z'
`,
      ],
    },
  ],
});
