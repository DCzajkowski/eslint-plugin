import _ from 'lodash';
import { ImportDeclaration, Statement, Token } from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';

const isImport = (statement: Statement): statement is ImportDeclaration => {
  return statement.type === 'ImportDeclaration';
};

const getReportNode = (a: ImportDeclaration[], b: ImportDeclaration[]): ImportDeclaration => {
  const [, [, reportNode]] = _.zip(a, b)
    .map(([a, b]): [boolean, ImportDeclaration[]] => [a.source.value === b.source.value, [a, b]])
    .filter(([bool]) => !bool)
    .shift();

  return reportNode;
};

const sortImportStatements = (importStatements: ImportDeclaration[]): ImportDeclaration[] => {
  return _.sortBy(
    importStatements,
    ({ source: { value } }) => {
      const v = _.toString(value);
      const vv = v.replace('/', '');
      const vvv = vv.match(/^\.+/);

      if (vvv) {
        return vvv[0].length * -1;
      }

      return -Infinity;
    },
    ({ source: { value } }) => value,
  );
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

        const unsortedImportStatements = initialImportStatements.reduce<
          { actual: ImportDeclaration; expected: ImportDeclaration }[]
        >((previousValue, currentValue, i) => {
          if (currentValue !== sortedImportStatements[i]) {
            return [
              ...previousValue,
              {
                actual: currentValue,
                expected: sortedImportStatements[i],
              },
            ];
          }

          return previousValue;
        }, []);

        const sourceCode = context.getSourceCode();

        const details = (
          node: ImportDeclaration,
        ): {
          node: ImportDeclaration;
          tokenBefore: Token;
          tokenAfter: Token;
          nodeText: string;
          everythingBefore: string;
          everythingAfter: string;
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

          return {
            node,
            tokenBefore,
            tokenAfter,
            nodeText,
            everythingBefore,
            everythingAfter,
            everythingAfterSameLine,
          };
        };

        const importBlockBeginning =
          unsortedImportStatements[0].actual.range[0] -
          details(unsortedImportStatements[0].actual).everythingBefore.length;
        const importBlockEnd =
          unsortedImportStatements[unsortedImportStatements.length - 1].actual.range[1] +
          details(unsortedImportStatements[unsortedImportStatements.length - 1].actual).everythingAfterSameLine.length;

        context.report({
          node: unsortedImportStatements[0].actual,
          messageId: 'importsMustBeAlphabetized',
          fix(fixer) {
            return fixer.replaceTextRange(
              [importBlockBeginning, importBlockEnd],
              unsortedImportStatements
                .map(({ expected }) => {
                  const { everythingBefore, nodeText, everythingAfterSameLine } = details(expected);

                  return `${everythingBefore}${nodeText}${everythingAfterSameLine}`;
                })
                .join('\n'),
            );
          },
        });
      },
    };
  },
});
