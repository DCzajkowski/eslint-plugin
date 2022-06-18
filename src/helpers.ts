import _ from 'lodash';
import { TSESLint, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { ImportDeclaration, ProgramStatement } from '@typescript-eslint/types/dist/generated/ast-spec';

export const getDocumentationUrl = (name: string): string => {
  return `https://github.com/DCzajkowski/eslint-plugin#dczajkowski${name}`;
};

interface ImportStatementDetails {
  text: string;
  textBefore: string;
  textAfter: string;
}

export interface ImportStatement extends ImportDeclaration {
  initialPosition: number;
  details: ImportStatementDetails;
  previousImportDeclaration: ImportDeclaration | null;
}

export const isImport = (statement: ProgramStatement): statement is ImportDeclaration =>
  statement.type === AST_NODE_TYPES.ImportDeclaration;

export const details = (
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

export const importDeclarationToImportStatement =
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
