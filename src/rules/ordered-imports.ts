import _ from 'lodash';
import { ImportDeclaration, Statement } from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { SourceCode, RuleFixer, RuleFix } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

const isImport = (statement: Statement): statement is ImportDeclaration => statement.type === 'ImportDeclaration';

const sortImportStatements = (importStatements: ImportDeclaration[]): ImportDeclaration[] =>
  _.sortBy(
    importStatements,
    ({ source: { value } }) => {
      const [leadingDots] =
        _.toString(value)
          .replace('/', '')
          .match(/^\.+/) || [];

      return leadingDots ? leadingDots.length * -1 : -Infinity;
    },
    ({ source: { value } }) => value,
  );

const details = (
  sourceCode: SourceCode,
  node: ImportDeclaration,
): {
  nodeText: string;
  everythingBeforeExceptFirstLine: string;
  everythingAfterSameLine: string;
} => {
  const tokenBefore = sourceCode.getTokenBefore(node);
  const tokenAfter = sourceCode.getTokenAfter(node);

  const nodeText = sourceCode.getText(node);
  const everythingBefore = sourceCode
    .getText(node, node.range[0] - (tokenBefore ? tokenBefore.range[1] : 0), 0)
    .replace(new RegExp(`${_.escapeRegExp(nodeText)}$`), '');
  const everythingAfter = sourceCode
    .getText(node, 0, (tokenAfter ? tokenAfter.range[0] : 0) - node.range[1])
    .replace(new RegExp(`^${_.escapeRegExp(nodeText)}`), '');

  const everythingAfterSameLine = everythingAfter.substring(0, everythingAfter.indexOf('\n'));
  const everythingBeforeExceptFirstLine = everythingBefore.substring(everythingBefore.indexOf('\n'));

  return { nodeText, everythingBeforeExceptFirstLine, everythingAfterSameLine };
};

export default ESLintUtils.RuleCreator(name => name)({
  name: '@dczajkowski/custom-rules/ordered-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require import statements to be alphabetized.',
      category: 'Stylistic Issues',
      recommended: 'warn',
    },
    messages: {
      importsMustBeAlphabetized: 'Imports must be alphabetized',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Program(program): void {
        const programBody = program.body;
        const initialImportStatements = programBody.filter(isImport);

        const sortedImportStatements = sortImportStatements(_.clone(initialImportStatements));

        const isInitiallySorted = _.isEqual(initialImportStatements, sortedImportStatements);

        if (isInitiallySorted) {
          return;
        }

        const unsortedImportStatements = _.zip(initialImportStatements, sortedImportStatements).map(
          ([actual, expected]) => ({
            actual: actual as ImportDeclaration,
            expected: expected as ImportDeclaration,
          }),
        );

        const sourceCode = context.getSourceCode();

        const importBlockBeginning =
          _.first(unsortedImportStatements)!.actual.range[0] -
          details(sourceCode, unsortedImportStatements[0].actual).everythingBeforeExceptFirstLine.length;

        const importBlockEnd =
          _.last(unsortedImportStatements)!.actual.range[1] +
          details(sourceCode, _.last(unsortedImportStatements)!.actual).everythingAfterSameLine.length;

        const sortedImportStatementsText = unsortedImportStatements
          .map(({ expected }) => {
            const { everythingBeforeExceptFirstLine, nodeText, everythingAfterSameLine } = details(
              sourceCode,
              expected,
            );

            return `${everythingBeforeExceptFirstLine}${nodeText}${everythingAfterSameLine}`;
          })
          .join('');

        context.report({
          node: unsortedImportStatements[0].actual,
          messageId: 'importsMustBeAlphabetized',
          fix: (fixer: RuleFixer): RuleFix =>
            fixer.replaceTextRange([importBlockBeginning, importBlockEnd], sortedImportStatementsText),
        });
      },
    };
  },
});
