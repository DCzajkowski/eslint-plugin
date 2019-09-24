import _ from 'lodash';
import { ImportDeclaration, Statement } from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { SourceCode, RuleFixer, RuleFix } from '@typescript-eslint/experimental-utils/dist/ts-eslint';

const isImport = (statement: Statement): statement is ImportDeclaration => statement.type === 'ImportDeclaration';

const sortImportStatements = (importStatements: ImportDeclaration[]): ImportDeclaration[] =>
  _.sortBy(
    importStatements,
    ({ source: { value } }) => {
      const [leadingDots]: RegExpMatchArray =
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
  everythingBefore: string;
  everythingBeforeStripped: string;
  everythingAfterSameLine: string;
} => {
  const nodeBefore = sourceCode.getTokenBefore(node);
  const nodeAfter = sourceCode.getTokenAfter(node);

  const nodeText = sourceCode.getText(node);

  const everythingBeforeAndNode = sourceCode.getText(node, node.range[0] - (nodeBefore ? nodeBefore.range[1] : 0), 0);
  const everythingBefore = everythingBeforeAndNode.substring(0, everythingBeforeAndNode.length - nodeText.length);

  const everythingAfterAndNode = sourceCode.getText(
    node,
    0,
    (nodeAfter ? nodeAfter.range[0] : sourceCode.getText().length - 1) - node.range[1],
  );
  const everythingAfter = everythingAfterAndNode.substring(nodeText.length);

  // Contains source code after the import statement until the newline character
  const everythingAfterSameLine = everythingAfter.substring(0, everythingAfter.indexOf('\n'));

  // Contains source code before the import statement until last newline character
  // (first newline after previous import) stripped off of double empty lines.
  const everythingBeforeStripped = ((everythingBefore.match(/\n/g) || []).length > 1
    ? everythingBefore.substring(everythingBefore.indexOf('\n'))
    : everythingBefore
  ).replace(/\n\n/g, '\n');

  return { nodeText, everythingBefore, everythingBeforeStripped, everythingAfterSameLine };
};

export default ESLintUtils.RuleCreator(name => name)({
  name: 'ordered-imports',
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
        const initialImportStatements = programBody
          .filter(isImport)
          .map((importStatement, i) => ({ ...importStatement, initialPosition: i }));

        const sortedImportStatements = sortImportStatements(_.clone(initialImportStatements));

        const isInitiallySorted = _.isEqual(initialImportStatements, sortedImportStatements);

        if (isInitiallySorted) {
          return;
        }

        interface A extends ImportDeclaration {
          initialPosition: number;
        }

        const unsortedImportStatements = _.zip(initialImportStatements, sortedImportStatements).map(
          ([actual, expected]) => ({
            actual: actual as A,
            expected: expected as A,
          }),
        );

        const sourceCode = context.getSourceCode();

        const importBlockBeginning = 0;

        const importBlockEnd =
          _.last(unsortedImportStatements)!.actual.range[1] +
          details(sourceCode, _.last(unsortedImportStatements)!.actual).everythingAfterSameLine.length;

        const sortedImportStatementsText = unsortedImportStatements
          .map(({ expected }, i) => {
            const { everythingBeforeStripped, nodeText, everythingAfterSameLine } = details(sourceCode, expected);

            const everythingBeforeStrippedWithLeadingNewLine =
              (expected.initialPosition === 0 && !everythingBeforeStripped.startsWith('\n') ? '\n' : '') +
              everythingBeforeStripped;
            const everythingBeforeStrippedWithoutLeadingNewLine =
              i === 0
                ? everythingBeforeStrippedWithLeadingNewLine.replace(/^\n*/, '')
                : everythingBeforeStrippedWithLeadingNewLine;

            return `${everythingBeforeStrippedWithoutLeadingNewLine}${nodeText}${everythingAfterSameLine}`;
          })
          .join('');

        const fileHeaderWithGibberish = details(sourceCode, initialImportStatements[0]).everythingBefore;
        const fileHeader = fileHeaderWithGibberish.substring(0, fileHeaderWithGibberish.lastIndexOf('\n\n'));

        context.report({
          node: unsortedImportStatements[0].actual,
          messageId: 'importsMustBeAlphabetized',
          fix: (fixer: RuleFixer): RuleFix =>
            fixer.replaceTextRange(
              [importBlockBeginning, importBlockEnd],
              (fileHeader ? `${fileHeader}\n\n` : '') + sortedImportStatementsText,
            ),
        });
      },
    };
  },
});
