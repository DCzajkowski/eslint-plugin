import { TSESTree } from '@typescript-eslint/types';
import _ from 'lodash';
import { createRule } from '../helpers';

export const enumValueName = createRule({
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
