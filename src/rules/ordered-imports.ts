import { AST_NODE_TYPES, TSESLint, TSESTree } from '@typescript-eslint/utils';
import _ from 'lodash';
import { createRule, importDeclarationToImportStatement, ImportStatement, isIdentifier, isImport } from '../helpers';

const sortImportStatements = (importStatements: ImportStatement[]): ImportStatement[] =>
  _.sortBy(
    importStatements,
    ({ source: { value } }) => {
      const [leadingDots] = _.toString(value).replace('/', '').match(/^\.+/) || [null];

      return leadingDots ? leadingDots.length * -1 : -Infinity;
    },
    ({ source: { value } }) => value,
  );

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

export const orderedImports = createRule({
  name: 'ordered-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require import statements to be alphabetized.',
    },
    messages: {
      importsMustBeAlphabetized: 'Imports must be alphabetized',
      importSpecifiersMustBeAlphabetized: 'Import specifiers must be alphabetized',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      Program(program): void {
        const programBody = program.body;

        const importStatements = programBody.filter(isImport).map(importDeclarationToImportStatement(sourceCode));
        if (importStatements.length < 1) {
          return;
        }

        const importStatementsGrouped = groupImportStatements(importStatements);

        const groups = _.zip(...[importStatementsGrouped, importStatementsGrouped])
          .map(([actual, expected]) => [actual!, sortImportStatements(expected!)])
          .filter(([actual, expected]) => !_.isEqual(actual, expected))
          .map(([actual, expected]) => [formatActual(actual), formatExpected(expected)]);

        for (const [actualGroup, expectedGroup] of groups) {
          const firstActualImportStatement = _.first(actualGroup)!;

          context.report({
            node: firstActualImportStatement,
            messageId: 'importsMustBeAlphabetized',
            fix: (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
              const lastActualImportStatement = _.last(actualGroup)!;

              const firstExpectedImportStatement = _.first(expectedGroup)!;
              const lastExpectedImportStatement = _.last(expectedGroup)!;

              firstExpectedImportStatement.details.textBefore =
                firstExpectedImportStatement.details.textBefore.trimStart();
              lastExpectedImportStatement.details.textAfter = lastExpectedImportStatement.details.textAfter.trimEnd();

              const importBlockText = expectedGroup
                .map(({ details: { textBefore, text, textAfter } }) => `${textBefore}${text}${textAfter}`)
                .join('');

              const groupBeginIndex =
                firstActualImportStatement.range[0] - firstActualImportStatement.details.textBefore.trimStart().length;
              const groupEndIndex =
                lastActualImportStatement.range[1] + lastActualImportStatement.details.textAfter.trimEnd().length;

              return fixer.replaceTextRange([groupBeginIndex, groupEndIndex], importBlockText);
            },
          });
        }
      },
      ImportDeclaration(node) {
        const specifiers = node.specifiers.filter(
          (importClause): importClause is TSESTree.ImportSpecifier =>
            importClause.type === AST_NODE_TYPES.ImportSpecifier,
        );

        const localIdentifiers = specifiers.map((specifier) => specifier.local);
        const sortedLocalIdentifiers = _.sortBy(localIdentifiers, (identifier) => identifier.name);

        if (!_.isEqual(localIdentifiers, sortedLocalIdentifiers)) {
          context.report({
            node,
            messageId: 'importSpecifiersMustBeAlphabetized',
            fix: (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
              const firstSpecifier = _.first(specifiers)!;
              const lastSpecifier = _.last(specifiers)!;

              const sortedSpecifiersText = sortedLocalIdentifiers
                .map((identifier) => {
                  const imported = specifiers.find((specifier) => specifier.local.name === identifier.name)!
                    .imported as TSESTree.Identifier;

                  return imported.name !== identifier.name ? `${imported.name} as ${identifier.name}` : identifier.name;
                })
                .join(', ');

              const importText = sortedSpecifiersText;

              return fixer.replaceTextRange([firstSpecifier.range[0], lastSpecifier.range[1]], importText);
            },
          });
        }
      },
    };
  },
});
