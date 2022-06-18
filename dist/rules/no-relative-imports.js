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
var no_relative_imports_exports = {};
__export(no_relative_imports_exports, {
  default: () => no_relative_imports_default
});
module.exports = __toCommonJS(no_relative_imports_exports);
var import_lodash = __toESM(require("lodash"));
var import_utils = require("@typescript-eslint/utils");
const isImport = (statement) => statement.type === import_utils.AST_NODE_TYPES.ImportDeclaration;
const details = (sourceCode, importDeclaration, initialPosition) => {
  const tokenBefore = sourceCode.getTokenBefore(importDeclaration);
  const tokenAfter = sourceCode.getTokenAfter(importDeclaration);
  const text = sourceCode.getText(importDeclaration);
  const textBefore = sourceCode.getText(importDeclaration, tokenBefore ? importDeclaration.range[0] - tokenBefore.range[1] : Infinity).replace(new RegExp(`${import_lodash.default.escapeRegExp(text)}$`, "gm"), "");
  return {
    text,
    textBefore: initialPosition === 0 && textBefore.length === 0 ? "\n" : textBefore,
    textAfter: sourceCode.getText(importDeclaration, 0, tokenAfter ? tokenAfter.range[0] - importDeclaration.range[1] : Infinity).replace(new RegExp(`^${import_lodash.default.escapeRegExp(text)}`, "gm"), "").replace(/\n.+$/gm, "").replace(/\n$/, "")
  };
};
const importDeclarationToImportStatement = (sourceCode) => (importDeclaration, initialPosition, importDeclarations) => ({
  ...importDeclaration,
  initialPosition,
  previousImportDeclaration: import_lodash.default.get(importDeclarations, `[${initialPosition - 1}]`, null),
  details: details(sourceCode, importDeclaration, initialPosition)
});
var no_relative_imports_default = import_utils.ESLintUtils.RuleCreator((name) => name)({
  name: "no-relative-imports",
  meta: {
    type: "problem",
    docs: {
      description: "Require import statements not to be relative.",
      recommended: "warn"
    },
    messages: {
      importsCannotBeRelative: "Imports cannot be relative"
    },
    fixable: "code",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      Program(program) {
        const programBody = program.body;
        const importStatements = programBody.filter(isImport).map(importDeclarationToImportStatement(sourceCode));
        if (importStatements.length < 1) {
          return;
        }
        importStatements.forEach((importStatement) => {
          const {
            source: { value }
          } = importStatement;
          if (typeof value !== "string") {
            return;
          }
          if (!value.startsWith(".")) {
            return;
          }
          context.report({
            node: importStatement,
            messageId: "importsCannotBeRelative"
          });
        });
      }
    };
  }
});
