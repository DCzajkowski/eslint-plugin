import _ from 'lodash';
import { ESLintUtils } from '@typescript-eslint/utils';
import { getDocumentationUrl, importDeclarationToImportStatement, isImport } from '../helpers';

export default ESLintUtils.RuleCreator(getDocumentationUrl)({
  name: 'no-relative-imports',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require import statements not to be relative.',
    },
    messages: {
      importsCannotBeRelative: 'Imports cannot be relative',
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
