import _ from 'lodash';
import { ESLintUtils, TSESLint, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { ImportDeclaration, ProgramStatement } from '@typescript-eslint/types/dist/generated/ast-spec';

const isImport = (statement: ProgramStatement): statement is ImportDeclaration =>
  statement.type === AST_NODE_TYPES.ImportDeclaration;

const details = (sourceCode: TSESLint.SourceCode, importDeclaration: ImportDeclaration, initialPosition: number) => {
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
  (importDeclaration: ImportDeclaration, initialPosition: number, importDeclarations: ImportDeclaration[]) => ({
    ...importDeclaration,
    initialPosition,
    previousImportDeclaration: _.get(importDeclarations, `[${initialPosition - 1}]`, null),
    details: details(sourceCode, importDeclaration, initialPosition),
  });

export default ESLintUtils.RuleCreator((name) => name)({
  name: 'no-relative-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require import statements not to be relative.',
      recommended: 'warn',
    },
    messages: {
      importsCannotBeRelative: 'Imports cannot be relative',
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

        importStatements.forEach((importStatement) => {
          const {
            source: { value },
          } = importStatement;

          if (typeof value !== 'string') {
            return;
          }

          if (!value.startsWith('.')) {
            return;
          }

          context.report({
            node: importStatement,
            messageId: 'importsCannotBeRelative',
          });
        });
      },
    };
  },
});
