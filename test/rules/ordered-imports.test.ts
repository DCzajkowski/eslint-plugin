import rule from '../../src/rules/ordered-imports';
import { ruleTester } from '../RuleTester';

ruleTester.run('ordered-imports', rule, {
  valid: [
    {
      code: ``,
    },
    {
      code: `const a: string = '';`,
    },
    {
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
      code: `
      import 'a';
      import 'b';
      const a: string = ''
      `,
    },
  ],

  invalid: [
    {
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
    //     {
    //       code: `import 'b';
    // import 'a';
    //
    // const a: string = ''
    //       `,
    //       errors: [{ messageId: 'importsMustBeAlphabetized', line: 1 }],
    //       output: `import 'a';
    // import 'b';
    //
    // const a: string = ''
    //       `,
    //     },
    {
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

/* eslint-disable ordered-imports */
import 'z';
import 'y';
/* eslint-enable ordered-imports */
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

/* eslint-disable ordered-imports */
import 'z';
import 'y';
/* eslint-enable ordered-imports */
      `,
    },
  ],
});
