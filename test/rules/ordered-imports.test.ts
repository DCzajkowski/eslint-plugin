import rule from '../../src/rules/ordered-imports';
import { ruleTester } from '../RuleTester';

ruleTester.run('ordered-imports', rule, {
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
    // @todo
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
  ],
});
