import _ from 'lodash';
import type { Identifier } from '@typescript-eslint/types/dist/generated/ast-spec';
import { ESLintUtils } from '@typescript-eslint/utils';
import { getDocumentationUrl } from '../helpers';

export default ESLintUtils.RuleCreator(getDocumentationUrl)({
  name: 'enum-value-name',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require enum value names to be in PascalCase.',
      recommended: 'warn',
    },
    messages: {
      incorrectValueName: 'Incorrect enum value casing. Expected PascalCase.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSEnumMember(node): void {
        const actual = (node.id as Identifier).name;
        const expected = _.upperFirst(_.camelCase(actual));

        if (actual !== expected) {
          context.report({
            node,
            messageId: 'incorrectValueName',
          });
        }
      },
    };
  },
});
