import rule from '../../src/rules/no-relative-imports';
import { ruleTester } from '../RuleTester';

ruleTester.run('no-relative-imports', rule, {
  valid: [
    {
      code: `
        import test1 from '@src/test1'
        import test2 from '@module/test2'
        import test3, { test4 } from '@src/test'
        import { test4 } from '@src/some/dir/test'
      `,
    },
  ],

  invalid: [
    {
      code: `
        import test1 from './src/test1'
        import test2 from './module/test2'
        import test3, { test4 } from './src/test'
        import { test5 } from './src/some/dir/test'
        import test6 from './../src/test6'
      `,
      errors: [
        { messageId: 'importsCannotBeRelative', line: 2 },
        { messageId: 'importsCannotBeRelative', line: 3 },
        { messageId: 'importsCannotBeRelative', line: 4 },
        { messageId: 'importsCannotBeRelative', line: 5 },
        { messageId: 'importsCannotBeRelative', line: 6 },
      ],
    },
  ],
});
