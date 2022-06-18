/**
 * Courtesy of typescript-eslint/typescript-eslint.
 * Original file: https://github.com/typescript-eslint/typescript-eslint/blob/dfb4fd6bde880fb165542ee447baed2463790acf/packages/eslint-plugin/tests/RuleTester.ts
 */

import { TSESLint, ESLintUtils } from '@typescript-eslint/utils';
import * as path from 'path';

const parser = '@typescript-eslint/parser';
const { batchedSingleLineTests } = ESLintUtils;

function getFixturesRootDir(): string {
  return path.join(process.cwd(), 'tests/fixtures/');
}

type RuleTesterConfig = Omit<TSESLint.RuleTesterConfig, 'parser'> & {
  parser: typeof parser;
};

class RuleTester extends TSESLint.RuleTester {
  private filename: string | undefined = undefined;

  // as of eslint 6 you have to provide an absolute path to the parser
  // but that's not as clean to type, this saves us trying to manually enforce
  // that contributors require.resolve everything
  constructor(options: RuleTesterConfig) {
    super({
      ...options,
      parser: require.resolve(options.parser),
    });

    if (options.parserOptions && options.parserOptions.project) {
      this.filename = path.join(getFixturesRootDir(), 'file.ts');
    }
  }

  // as of eslint 6 you have to provide an absolute path to the parser
  // If you don't do that at the test level, the test will fail somewhat cryptically...
  // This is a lot more explicit
  run<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    name: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    tests: TSESLint.RunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage = `Do not set the parser at the test level unless you want to use a parser other than ${parser}`;

    if (this.filename) {
      (tests.valid as (string | TSESLint.ValidTestCase<TOptions>)[]) = tests.valid.map((test) => {
        if (typeof test === 'string') {
          return {
            code: test,
            filename: this.filename,
          };
        }
        return test;
      });
    }

    tests.valid.forEach((test) => {
      if (typeof test !== 'string') {
        if (test.parser === parser) {
          throw new Error(errorMessage);
        }
        if (!test.filename) {
          (test.filename as string | undefined) = this.filename;
        }
      }
    });
    tests.invalid.forEach((test) => {
      if (test.parser === parser) {
        throw new Error(errorMessage);
      }
      if (!test.filename) {
        (test.filename as string | undefined) = this.filename;
      }
    });

    super.run(name, rule, tests);
  }
}

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
});

export { ruleTester, RuleTester, getFixturesRootDir, batchedSingleLineTests };
