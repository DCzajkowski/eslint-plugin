import _ from 'lodash';
import { ESLintUtils, TSESLint, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { ImportDeclaration, ProgramStatement } from '@typescript-eslint/types/dist/generated/ast-spec';

interface ImportStatementDetails {
  text: string;
  textBefore: string;
  textAfter: string;
}

interface ImportStatement extends ImportDeclaration {
  initialPosition: number;
  details: ImportStatementDetails;
  previousImportDeclaration: ImportDeclaration | null;
}

const isImport = (statement: ProgramStatement): statement is ImportDeclaration =>
  statement.type === AST_NODE_TYPES.ImportDeclaration;

const sortImportStatements = (importStatements: ImportStatement[]): ImportStatement[] =>
  _.sortBy(
    importStatements,
    ({ source: { value } }) => {
      const [leadingDots]: RegExpMatchArray = _.toString(value).replace('/', '').match(/^\.+/) || [];

      return leadingDots ? leadingDots.length * -1 : -Infinity;
    },
    ({ source: { value } }) => value,
  );

const details = (
  sourceCode: TSESLint.SourceCode,
  importDeclaration: ImportDeclaration,
  initialPosition: number,
): ImportStatementDetails => {
  const tokenBefore = sourceCode.getTokenBefore(importDeclaration);
  const tokenAfter = sourceCode.getTokenAfter(importDeclaration);

  const text = sourceCode.getText(importDeclaration);

  const textBefore = sourceCode
    .getText(importDeclaration, tokenBefore ? importDeclaration.range[0] - tokenBefore.range[1] : Infinity)
    .replace(new RegExp(`${_.escapeRegExp(text)}$`, 'gm'), '');

  return {
    text,
    textBefore: initialPosition === 0 && textBefore.length === 0 ? '\n' : textBefore,
    textAfter: sourceCode
      .getText(importDeclaration, 0, tokenAfter ? tokenAfter.range[0] - importDeclaration.range[1] : Infinity)
      .replace(new RegExp(`^${_.escapeRegExp(text)}`, 'gm'), '')
      .replace(/\n.+$/gm, '')
      .replace(/\n$/, ''),
  };
};

const importDeclarationToImportStatement =
  (sourceCode: TSESLint.SourceCode) =>
  (
    importDeclaration: ImportDeclaration,
    initialPosition: number,
    importDeclarations: ImportDeclaration[],
  ): ImportStatement => ({
    ...importDeclaration,
    initialPosition,
    previousImportDeclaration: _.get(importDeclarations, `[${initialPosition - 1}]`, null),
    details: details(sourceCode, importDeclaration, initialPosition),
  });

const groupImportStatements = (importStatements: ImportStatement[]): ImportStatement[][] =>
  importStatements.reduce<ImportStatement[][]>(
    (importStatementsGrouped, importStatement) =>
      importStatement.details.textBefore.includes('\n\n')
        ? [...importStatementsGrouped, [importStatement]]
        : [...importStatementsGrouped.slice(0, -1), [..._.last(importStatementsGrouped)!, importStatement]],
    [[]],
  );

const formatActual = (group: ImportStatement[]): ImportStatement[] =>
  group.map((importStatement) => {
    let textBefore = importStatement.details.textBefore;

    if (importStatement.previousImportDeclaration !== null) {
      textBefore = textBefore.replace(/^[^\n]*\n/m, '\n');
    }

    if (textBefore.includes('\n\n')) {
      textBefore = textBefore.substring(textBefore.lastIndexOf('\n\n') + 2);
    }

    if (!textBefore.startsWith('\n')) {
      textBefore = `\n${textBefore}`;
    }

    return {
      ...importStatement,
      details: {
        ...importStatement.details,
        textBefore,
      },
    };
  });

const formatExpected = (group: ImportStatement[]): ImportStatement[] =>
  formatActual(group).map((importStatement) => ({
    ...importStatement,
    details: {
      ...importStatement.details,
      textAfter: importStatement.details.textAfter.trimEnd(),
    },
  }));

export default ESLintUtils.RuleCreator((name) => name)({
  name: 'ordered-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require import statements to be alphabetized.',
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
    const sourceCode = context.getSourceCode();

    return {
      Program(program): void {
        const programBody = program.body;

        const importStatements = programBody.filter(isImport).map(importDeclarationToImportStatement(sourceCode));

        if (importStatements.length < 1) {
          return;
        }

        const importStatementsGrouped = groupImportStatements(importStatements);

        const groups = _.zip(...[importStatementsGrouped, importStatementsGrouped].map((group) => _.cloneDeep(group)))
          .map(([actual, expected]) => [actual as ImportStatement[], expected as ImportStatement[]])
          .map(([actual, expected]) => [actual, sortImportStatements(expected)])
          .filter(([actual, expected]) => !_.isEqual(actual, expected))
          .map(([actual, expected]) => [formatActual(actual), formatExpected(expected)]);

        groups.forEach(([actualGroup, expectedGroup]) => {
          const firstActualImportStatement = _.first(actualGroup)!;
          const lastActualImportStatement = _.last(actualGroup)!;

          const firstExpectedImportStatement = _.first(expectedGroup)!;
          const lastExpectedImportStatement = _.last(expectedGroup)!;

          firstExpectedImportStatement.details.textBefore = firstExpectedImportStatement.details.textBefore.trimStart();
          lastExpectedImportStatement.details.textAfter = lastExpectedImportStatement.details.textAfter.trimEnd();

          const importBlockText = expectedGroup
            .map(({ details: { textBefore, text, textAfter } }) => `${textBefore}${text}${textAfter}`)
            .join('');

          const groupBeginIndex =
            firstActualImportStatement.range[0] - firstActualImportStatement.details.textBefore.trimStart().length;
          const groupEndIndex =
            lastActualImportStatement.range[1] + lastActualImportStatement.details.textAfter.trimEnd().length;

          context.report({
            node: firstActualImportStatement,
            messageId: 'importsMustBeAlphabetized',
            fix: (fixer: TSESLint.RuleFixer): TSESLint.RuleFix =>
              fixer.replaceTextRange([groupBeginIndex, groupEndIndex], importBlockText),
          });
        });
      },
    };
  },
});
