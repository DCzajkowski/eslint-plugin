import { enumValueName } from '../../src/rules/enum-value-name';
import { ruleTester } from '../RuleTester';

ruleTester.run('enum-value-name', enumValueName, {
  valid: [
    {
      filename: 'file-with-enum.ts',
      code: `
        /* 1 */ enum A {
        /* 2 */   PascalCase = 0,
        /* 3 */   SnakeCase = 1,
        /* 4 */   CamelCase = 2,
        /* 5 */   CapitalizedWithUnderscores = 3,
        /* 6 */ }
      `,
    },
  ],

  invalid: [
    {
      filename: 'file-with-enum.ts',
      code: `
        /* 1 */ enum A {
        /* 2 */   PascalCase = 0,
        /* 3 */   snake_case = 1,
        /* 4 */   camelCase = 2,
        /* 5 */   CAPITALIZED_WITH_UNDERSCORES = 3,
        /* 6 */ }
      `,
      errors: [
        { messageId: 'incorrectValueName', line: 4 },
        { messageId: 'incorrectValueName', line: 5 },
        { messageId: 'incorrectValueName', line: 6 },
      ],
    },
  ],
});
