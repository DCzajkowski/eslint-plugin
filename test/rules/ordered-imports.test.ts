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
      code: `
      import 'b';
      /* comment for a */
      import 'a'; // comment a
      /* comment for c */
      import 'c';
      import 'd'; // comment d
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 2 }],
      output: `
      /* comment for a */
      import 'a'; // comment a
      import 'b';
      /* comment for c */
      import 'c';
      import 'd'; // comment d
      `,
    },
    {
      code: `
      import 'a';
      import './a';
      import '../../a';
      import '../a';
      import '../../b';
      import './b';
      import 'b';
      import '../b';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 2 }],
      output: `
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

      import './b';
      import './a';
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 2 }],
      output: `
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
      import 'b';
      import 'a';

      const a: string = ''
      `,
      errors: [{ messageId: 'importsMustBeAlphabetized', line: 2 }],
      output: `
      import 'a';
      import 'b';

      const a: string = ''
      `,
    },
  ],
});
