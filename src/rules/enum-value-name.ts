import _ from 'lodash';
import { ESLintUtils } from '@typescript-eslint/utils';
import { getDocumentationUrl } from '../helpers';
import { TSESTree } from '@typescript-eslint/types';

export default ESLintUtils.RuleCreator(getDocumentationUrl)({
  name: 'enum-value-name',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require enum value names to be in PascalCase.',
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
        const actual = (node.id as TSESTree.Identifier).name;
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
