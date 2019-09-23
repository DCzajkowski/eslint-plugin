import _ from 'lodash';
import { Identifier } from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree';
import { ESLintUtils } from '@typescript-eslint/experimental-utils';

export default ESLintUtils.RuleCreator(name => name)({
  name: '@dczajkowski/custom-rules/enum-value-name',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require enum value names to be in PascalCase.',
      category: 'Stylistic Issues',
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
