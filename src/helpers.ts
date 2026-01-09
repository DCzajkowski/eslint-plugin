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

interface Details {
  text: string;
  textBefore: string;
  textAfter: string;
}

export interface ImportStatement extends TSESTree.ImportDeclaration {
  initialPosition: number;
  details: Details;
  previousImportDeclaration: TSESTree.ImportDeclaration | null;
}

interface SpecifierStatement extends TSESTree.ImportSpecifier {
  initialPosition: number;
  details: Details;
  previousImportSpecifier: TSESTree.ImportSpecifier | null;
}

export const isImport = (statement: TSESTree.ProgramStatement): statement is TSESTree.ImportDeclaration =>
  statement.type === AST_NODE_TYPES.ImportDeclaration;

export const isImportSpecifier = (importClause: TSESTree.ImportClause): importClause is TSESTree.ImportSpecifier =>
  importClause.type === AST_NODE_TYPES.ImportSpecifier;

export const details = (
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.ImportDeclaration | TSESTree.ImportSpecifier,
  initialPosition: number,
): Details => {
  const tokenBefore = sourceCode.getTokenBefore(node);
  const tokenAfter = sourceCode.getTokenAfter(node);

  const text = sourceCode.getText(node);

  const textBefore = sourceCode
    .getText(node, tokenBefore ? node.range[0] - tokenBefore.range[1] : Infinity)
    .replace(new RegExp(`${_.escapeRegExp(text)}$`, 'gm'), '');

  return {
    text,
    textBefore: initialPosition === 0 && textBefore.length === 0 ? '\n' : textBefore,
    textAfter: sourceCode
      .getText(node, 0, tokenAfter ? tokenAfter.range[0] - node.range[1] : Infinity)
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
    previousImportDeclaration: importDeclarations[initialPosition - 1] ?? null,
    details: details(sourceCode, importDeclaration, initialPosition),
  });

export const importSpecifierToSpecifierStatement =
  (sourceCode: TSESLint.SourceCode) =>
  (
    importSpecifier: TSESTree.ImportSpecifier,
    initialPosition: number,
    importSpecifiers: TSESTree.ImportSpecifier[],
  ): SpecifierStatement => ({
    ...importSpecifier,
    initialPosition,
    previousImportSpecifier: importSpecifiers[initialPosition - 1] ?? null,
    details: details(sourceCode, importSpecifier, initialPosition),
  });
