import _ from 'lodash';
import { ImportDeclaration, Statement } from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';
import { RuleContext, SourceCode, RuleFixer, RuleFix } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import util from 'util';

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

const isImport = (statement: Statement): statement is ImportDeclaration => statement.type === 'ImportDeclaration';

const sortImportStatements = (importStatements: ImportStatement[]): ImportStatement[] =>
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

const importDeclarationToImportStatement = (sourceCode: SourceCode) => (
  importDeclaration: ImportDeclaration,
  initialPosition: number,
  importDeclarations: ImportDeclaration[],
): ImportStatement => ({
  ...importDeclaration,
  initialPosition,
  previousImportDeclaration: _.get(importDeclarations, `[${initialPosition - 1}]`, null),
  details: details(sourceCode, importDeclaration, initialPosition),
});

const groupImportStatements = (importStatements: ImportStatement[]): ImportStatement[][] => {
  const importStatementsGrouped: ImportStatement[][] = [[]];

  for (const importStatement of importStatements) {
    if (importStatement.details.textBefore.includes('\n\n')) {
      importStatementsGrouped.push([]);
    }

    importStatementsGrouped[importStatementsGrouped.length - 1].push(importStatement);
  }

  return importStatementsGrouped;
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
    const sourceCode = context.getSourceCode();

    return {
      Program(program): void {
        const programBody = program.body;
        const importStatements = programBody.filter(isImport).map(importDeclarationToImportStatement(sourceCode));

        // console.log(util.inspect({ importStatements }, false, 5))

        if (importStatements.length < 1) {
          return;
        }

        const importStatementsGrouped = groupImportStatements(importStatements);

        const unsortedGroups = _.zip(
          ...[importStatementsGrouped, importStatementsGrouped].map(group => _.cloneDeep(group)),
        )
          .map(([actual, expected]) => [actual as ImportStatement[], expected as ImportStatement[]])
          .map(([actual, expected]) => [actual, sortImportStatements(expected)])
          .filter(([actual, expected]) => !_.isEqual(actual, expected))
          .map(([, expected]) => expected);

        unsortedGroups.forEach(group => {
          const firstImportStatement = _.first(group)!;
          const lastImportStatement = _.last(group)!;

          // if (firstImportStatement.details.textBefore === '') {
          //   firstImportStatement.details.textBefore = '\n';
          // } else if (firstImportStatement.details.textBefore.startsWith('\n\n')) {
          //   firstImportStatement.details.textBefore = firstImportStatement.details.textBefore.substring(1);
          // }

          // if (lastImportStatement.details.textAfter.endsWith('\n\n')) {
          //   lastImportStatement.details.textAfter = lastImportStatement.details.textAfter.substring(
          //     0,
          //     lastImportStatement.details.textAfter.length - 2,
          //   );
          // }

          const groupFormatted = group.map(importStatement => {
            // console.log('>>>><<<<');

            let textBefore = importStatement.details.textBefore;

            // console.log(JSON.stringify(textBefore), importStatement.previousImportDeclaration);

            if (importStatement.previousImportDeclaration !== null) {
              textBefore = textBefore.replace(/^[^\n]*\n/m, '\n');
            }

            // console.log(JSON.stringify(textBefore));

            if (textBefore.includes('\n\n')) {
              textBefore = textBefore.substring(textBefore.lastIndexOf('\n\n') + 2);
            }

            // console.log(JSON.stringify(textBefore));

            if (!textBefore.startsWith('\n')) {
              textBefore = `\n${textBefore}`;
            }

            // console.log(JSON.stringify(textBefore));

            return {
              ...importStatement,
              details: {
                ...importStatement.details,
                textBefore,
              },
            };
          });

          console.log(groupFormatted.map(({ details }) => details));

          // const groupBeginIndex = firstImportStatement.range[0] - firstImportStatement.details.textBefore.length;
          // const groupEndIndex = lastImportStatement.range[1] + lastImportStatement.details.textAfter.length;

          // context.report({
          //   node: firstImportStatement,
          //   messageId: 'importsMustBeAlphabetized',
          //   fix(fixer: RuleFixer): RuleFix {
          //     console.log(group.map(({ details }) => details));

          //     return fixer.replaceTextRange(
          //       [groupBeginIndex, groupEndIndex],
          //       group
          //         .map(({ details: { text, textAfter, textBefore } }) => `${textBefore}${text}${textAfter}`)
          //         .join(''),
          //     );
          //   },
          // });
        });
      },
      // Program(program): void {
      //   const programBody = program.body;
      //   const initialImportStatements = programBody
      //     .filter(isImport)
      //     .map((importDeclaration, i): ImportStatement => ({ ...importDeclaration, initialPosition: i }));

      //   const sortedImportStatements = sortImportStatements(_.clone(initialImportStatements));

      //   const isInitiallySorted = _.isEqual(initialImportStatements, sortedImportStatements);

      //   console.log({ initialImportStatements });

      //   if (isInitiallySorted) {
      //     return;
      //   }

      //   const unsortedImportStatements = _.zip(initialImportStatements, sortedImportStatements).map(
      //     ([actual, expected]) => ({
      //       actual: actual as ImportStatement,
      //       expected: expected as ImportStatement,
      //     }),
      //   );

      //   const sourceCode = context.getSourceCode();

      //   const importBlockBeginning = 0;

      //   const importBlockEnd =
      //     _.last(unsortedImportStatements)!.actual.range[1] +
      //     details(sourceCode, _.last(unsortedImportStatements)!.actual).everythingAfterSameLine.length;

      //   const sortedImportStatementsText = unsortedImportStatements
      //     .map(({ expected }, i) => {
      //       const { everythingBeforeStripped, nodeText, everythingAfterSameLine } = details(sourceCode, expected);

      //       const everythingBeforeStrippedWithLeadingNewLine =
      //         (expected.initialPosition === 0 && !everythingBeforeStripped.startsWith('\n') ? '\n' : '') +
      //         everythingBeforeStripped;
      //       const everythingBeforeStrippedWithoutLeadingNewLine =
      //         i === 0
      //           ? everythingBeforeStrippedWithLeadingNewLine.replace(/^\n*/, '')
      //           : everythingBeforeStrippedWithLeadingNewLine;

      //       return `${everythingBeforeStrippedWithoutLeadingNewLine}${nodeText}${everythingAfterSameLine}`;
      //     })
      //     .join('');

      //   const fileHeaderWithGibberish = details(sourceCode, initialImportStatements[0]).everythingBefore;
      //   const fileHeader = fileHeaderWithGibberish.substring(0, fileHeaderWithGibberish.lastIndexOf('\n\n'));

      //   context.report({
      //     node: unsortedImportStatements[0].actual,
      //     messageId: 'importsMustBeAlphabetized',
      //     fix: (fixer: RuleFixer): RuleFix =>
      //       fixer.replaceTextRange(
      //         [importBlockBeginning, importBlockEnd],
      //         (fileHeader ? `${fileHeader}\n\n` : '') + sortedImportStatementsText,
      //       ),
      //   });
      // },
    };
  },
});
