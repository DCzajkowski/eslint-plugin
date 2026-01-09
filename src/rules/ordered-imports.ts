import { TSESLint } from '@typescript-eslint/utils';
import _ from 'lodash';
import {
  createRule,
  importDeclarationToImportStatement,
  importSpecifierToSpecifierStatement,
  ImportStatement,
  isImport,
  isImportSpecifier,
} from '../helpers';

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
      description: 'Require import statements to be sorted alphabetically.',
    },
    messages: {
      importsMustBeAlphabetized: 'Imports must be sorted alphabetically',
      importsMustBeAlphabetizedNoFix:
        'Imports must be sorted alphabetically (cannot be auto-fixed due to side-effect imports)',
      importSpecifiersMustBeAlphabetized: 'Import specifiers must be sorted alphabetically',
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

          // If contains side-effect imports, do not attempt to auto-fix.
          if (actualGroup.some((importStatement) => importStatement.specifiers.length === 0)) {
            context.report({
              node: firstActualImportStatement,
              messageId: 'importsMustBeAlphabetizedNoFix',
            });

            return;
          }

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
        const specifiers = node.specifiers
          .filter(isImportSpecifier)
          .map(importSpecifierToSpecifierStatement(sourceCode));

        const sortedSpecifiers = _.sortBy(specifiers, (specifier) => specifier.local.name.toLowerCase());

        if (!_.isEqual(specifiers, sortedSpecifiers)) {
          context.report({
            node,
            messageId: 'importSpecifiersMustBeAlphabetized',
            fix: (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
              const firstSpecifier = _.first(specifiers)!;
              const lastSpecifier = _.last(specifiers)!;

              const sortedSpecifiersText = sortedSpecifiers
                .map(({ details: { textBefore, text, textAfter } }) => {
                  const specifierText = `${textBefore}${text}${textAfter}`.trim();

                  return specifierText.startsWith('//') ? `\n${specifierText}` : specifierText;
                })
                .join(', ');

              return fixer.replaceTextRange([firstSpecifier.range[0], lastSpecifier.range[1]], sortedSpecifiersText);
            },
          });
        }
      },
    };
  },
});
