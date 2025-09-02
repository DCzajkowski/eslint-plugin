import _ from 'lodash';
import { TSESLint, AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { TSESTree } from '@typescript-eslint/types';

type ExamplePluginDocs = {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
};

export const createRule = ESLintUtils.RuleCreator<ExamplePluginDocs>((name) => {
  return `https://github.com/DCzajkowski/eslint-plugin#dczajkowski${name}`;
});

interface ImportStatementDetails {
  text: string;
  textBefore: string;
  textAfter: string;
}

export interface ImportStatement extends TSESTree.ImportDeclaration {
  initialPosition: number;
  details: ImportStatementDetails;
  previousImportDeclaration: TSESTree.ImportDeclaration | null;
}

export const isImport = (statement: TSESTree.ProgramStatement): statement is TSESTree.ImportDeclaration =>
  statement.type === AST_NODE_TYPES.ImportDeclaration;

export const details = (
  sourceCode: TSESLint.SourceCode,
  importDeclaration: TSESTree.ImportDeclaration,
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

export const importDeclarationToImportStatement =
  (sourceCode: TSESLint.SourceCode) =>
  (
    importDeclaration: TSESTree.ImportDeclaration,
    initialPosition: number,
    importDeclarations: TSESTree.ImportDeclaration[],
  ): ImportStatement => ({
    ...importDeclaration,
    initialPosition,
    previousImportDeclaration: _.get(importDeclarations, `[${initialPosition - 1}]`, null),
    details: details(sourceCode, importDeclaration, initialPosition),
  });
