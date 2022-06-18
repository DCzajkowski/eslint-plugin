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
var ordered_imports_exports = {};
__export(ordered_imports_exports, {
  default: () => ordered_imports_default
});
module.exports = __toCommonJS(ordered_imports_exports);
var import_lodash = __toESM(require("lodash"));
var import_utils = require("@typescript-eslint/utils");
const isImport = (statement) => statement.type === import_utils.AST_NODE_TYPES.ImportDeclaration;
const sortImportStatements = (importStatements) => import_lodash.default.sortBy(importStatements, ({ source: { value } }) => {
  const [leadingDots] = import_lodash.default.toString(value).replace("/", "").match(/^\.+/) || [];
  return leadingDots ? leadingDots.length * -1 : -Infinity;
}, ({ source: { value } }) => value);
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
const groupImportStatements = (importStatements) => importStatements.reduce((importStatementsGrouped, importStatement) => importStatement.details.textBefore.includes("\n\n") ? [...importStatementsGrouped, [importStatement]] : [...importStatementsGrouped.slice(0, -1), [...import_lodash.default.last(importStatementsGrouped), importStatement]], [[]]);
const formatActual = (group) => group.map((importStatement) => {
  let textBefore = importStatement.details.textBefore;
  if (importStatement.previousImportDeclaration !== null) {
    textBefore = textBefore.replace(/^[^\n]*\n/m, "\n");
  }
  if (textBefore.includes("\n\n")) {
    textBefore = textBefore.substring(textBefore.lastIndexOf("\n\n") + 2);
  }
  if (!textBefore.startsWith("\n")) {
    textBefore = `
${textBefore}`;
  }
  return {
    ...importStatement,
    details: {
      ...importStatement.details,
      textBefore
    }
  };
});
const formatExpected = (group) => formatActual(group).map((importStatement) => ({
  ...importStatement,
  details: {
    ...importStatement.details,
    textAfter: importStatement.details.textAfter.trimEnd()
  }
}));
var ordered_imports_default = import_utils.ESLintUtils.RuleCreator((name) => name)({
  name: "ordered-imports",
  meta: {
    type: "problem",
    docs: {
      description: "Require import statements to be alphabetized.",
      recommended: "warn"
    },
    messages: {
      importsMustBeAlphabetized: "Imports must be alphabetized"
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
        const importStatementsGrouped = groupImportStatements(importStatements);
        const groups = import_lodash.default.zip(...[importStatementsGrouped, importStatementsGrouped].map((group) => import_lodash.default.cloneDeep(group))).map(([actual, expected]) => [actual, expected]).map(([actual, expected]) => [actual, sortImportStatements(expected)]).filter(([actual, expected]) => !import_lodash.default.isEqual(actual, expected)).map(([actual, expected]) => [formatActual(actual), formatExpected(expected)]);
        groups.forEach(([actualGroup, expectedGroup]) => {
          const firstActualImportStatement = import_lodash.default.first(actualGroup);
          const lastActualImportStatement = import_lodash.default.last(actualGroup);
          const firstExpectedImportStatement = import_lodash.default.first(expectedGroup);
          const lastExpectedImportStatement = import_lodash.default.last(expectedGroup);
          firstExpectedImportStatement.details.textBefore = firstExpectedImportStatement.details.textBefore.trimStart();
          lastExpectedImportStatement.details.textAfter = lastExpectedImportStatement.details.textAfter.trimEnd();
          const importBlockText = expectedGroup.map(({ details: { textBefore, text, textAfter } }) => `${textBefore}${text}${textAfter}`).join("");
          const groupBeginIndex = firstActualImportStatement.range[0] - firstActualImportStatement.details.textBefore.trimStart().length;
          const groupEndIndex = lastActualImportStatement.range[1] + lastActualImportStatement.details.textAfter.trimEnd().length;
          context.report({
            node: firstActualImportStatement,
            messageId: "importsMustBeAlphabetized",
            fix: (fixer) => fixer.replaceTextRange([groupBeginIndex, groupEndIndex], importBlockText)
          });
        });
      }
    };
  }
});
