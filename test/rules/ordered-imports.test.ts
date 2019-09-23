import rule from '../../src/rules/ordered-imports';
import { ruleTester } from '../RuleTester';

ruleTester.run('ordered-imports', rule, {
  valid: [
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
      output: `
/* comment for a */
import 'a'; // comment a
import 'b';
/* comment for c */
import 'c';
import 'd'; // comment d
      `,
    },
  ],
});
