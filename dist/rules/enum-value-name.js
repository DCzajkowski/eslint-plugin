"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var enum_value_name_exports = {};
__export(enum_value_name_exports, {
  default: () => enum_value_name_default
});
module.exports = __toCommonJS(enum_value_name_exports);
var import_lodash = __toESM(require("lodash"));
var import_utils = require("@typescript-eslint/utils");
var enum_value_name_default = import_utils.ESLintUtils.RuleCreator((name) => name)({
  name: "enum-value-name",
  meta: {
    type: "problem",
    docs: {
      description: "Require enum value names to be in PascalCase.",
      recommended: "warn"
    },
    messages: {
      incorrectValueName: "Incorrect enum value casing. Expected PascalCase."
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      TSEnumMember(node) {
        const actual = node.id.name;
        const expected = import_lodash.default.upperFirst(import_lodash.default.camelCase(actual));
        if (actual !== expected) {
          context.report({
            node,
            messageId: "incorrectValueName"
          });
        }
      }
    };
  }
});
