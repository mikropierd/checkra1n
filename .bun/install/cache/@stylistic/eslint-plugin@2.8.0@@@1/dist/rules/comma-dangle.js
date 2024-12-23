'use strict';

var utils = require('../utils.js');
var utils$1 = require('@typescript-eslint/utils');
var astUtils = require('@typescript-eslint/utils/ast-utils');
require('eslint-visitor-keys');
require('espree');
require('estraverse');

const DEFAULT_OPTIONS = Object.freeze({
  arrays: "never",
  objects: "never",
  imports: "never",
  exports: "never",
  functions: "never"
});
const closeBraces = ["}", "]", ")", ">"];
function isTrailingCommaAllowed(lastItem) {
  return lastItem.type !== "RestElement";
}
function normalizeOptions$1(optionValue, ecmaVersion) {
  if (typeof optionValue === "string") {
    return {
      arrays: optionValue,
      objects: optionValue,
      imports: optionValue,
      exports: optionValue,
      functions: !ecmaVersion || ecmaVersion === "latest" ? optionValue : ecmaVersion < 2017 ? "ignore" : optionValue
    };
  }
  if (typeof optionValue === "object" && optionValue !== null) {
    return {
      arrays: optionValue.arrays || DEFAULT_OPTIONS.arrays,
      objects: optionValue.objects || DEFAULT_OPTIONS.objects,
      imports: optionValue.imports || DEFAULT_OPTIONS.imports,
      exports: optionValue.exports || DEFAULT_OPTIONS.exports,
      functions: optionValue.functions || DEFAULT_OPTIONS.functions
    };
  }
  return DEFAULT_OPTIONS;
}
var _baseRule = utils.createRule({
  name: "comma-dangle",
  package: "js",
  meta: {
    type: "layout",
    docs: {
      description: "Require or disallow trailing commas"
    },
    fixable: "code",
    schema: {
      definitions: {
        value: {
          type: "string",
          enum: [
            "always-multiline",
            "always",
            "never",
            "only-multiline"
          ]
        },
        valueWithIgnore: {
          type: "string",
          enum: [
            "always-multiline",
            "always",
            "ignore",
            "never",
            "only-multiline"
          ]
        }
      },
      type: "array",
      items: [
        {
          oneOf: [
            {
              $ref: "#/definitions/value"
            },
            {
              type: "object",
              properties: {
                arrays: { $ref: "#/definitions/valueWithIgnore" },
                objects: { $ref: "#/definitions/valueWithIgnore" },
                imports: { $ref: "#/definitions/valueWithIgnore" },
                exports: { $ref: "#/definitions/valueWithIgnore" },
                functions: { $ref: "#/definitions/valueWithIgnore" }
              },
              additionalProperties: false
            }
          ]
        }
      ],
      additionalItems: false
    },
    messages: {
      unexpected: "Unexpected trailing comma.",
      missing: "Missing trailing comma."
    }
  },
  create(context) {
    const ecmaVersion = context?.languageOptions?.ecmaVersion ?? context.parserOptions.ecmaVersion;
    const options = normalizeOptions$1(context.options[0], ecmaVersion);
    const sourceCode = context.sourceCode;
    function getLastItem(node) {
      function last(array) {
        return array[array.length - 1];
      }
      switch (node.type) {
        case "ObjectExpression":
        case "ObjectPattern":
          return last(node.properties);
        case "ArrayExpression":
        case "ArrayPattern":
          return last(node.elements);
        case "ImportDeclaration":
        case "ExportNamedDeclaration":
          return last(node.specifiers);
        case "FunctionDeclaration":
        case "FunctionExpression":
        case "ArrowFunctionExpression":
          return last(node.params);
        case "CallExpression":
        case "NewExpression":
          return last(node.arguments);
        default:
          return null;
      }
    }
    function getTrailingToken(node, lastItem) {
      switch (node.type) {
        case "ObjectExpression":
        case "ArrayExpression":
        case "CallExpression":
        case "NewExpression":
          return sourceCode.getLastToken(node, 1);
        default: {
          const nextToken = sourceCode.getTokenAfter(lastItem);
          if (utils.isCommaToken(nextToken))
            return nextToken;
          return sourceCode.getLastToken(lastItem);
        }
      }
    }
    function isMultiline(node) {
      const lastItem = getLastItem(node);
      if (!lastItem)
        return false;
      const penultimateToken = getTrailingToken(node, lastItem);
      if (!penultimateToken)
        return false;
      const lastToken = sourceCode.getTokenAfter(penultimateToken);
      if (!lastToken)
        return false;
      return lastToken.loc.end.line !== penultimateToken.loc.end.line;
    }
    function forbidTrailingComma(node) {
      const lastItem = getLastItem(node);
      if (!lastItem || node.type === "ImportDeclaration" && lastItem.type !== "ImportSpecifier")
        return;
      const trailingToken = getTrailingToken(node, lastItem);
      if (trailingToken && utils.isCommaToken(trailingToken)) {
        context.report({
          node: lastItem,
          loc: trailingToken.loc,
          messageId: "unexpected",
          *fix(fixer) {
            yield fixer.remove(trailingToken);
            yield fixer.insertTextBefore(sourceCode.getTokenBefore(trailingToken), "");
            yield fixer.insertTextAfter(sourceCode.getTokenAfter(trailingToken), "");
          }
        });
      }
    }
    function forceTrailingComma(node) {
      const lastItem = getLastItem(node);
      if (!lastItem || node.type === "ImportDeclaration" && lastItem.type !== "ImportSpecifier")
        return;
      if (!isTrailingCommaAllowed(lastItem)) {
        forbidTrailingComma(node);
        return;
      }
      const trailingToken = getTrailingToken(node, lastItem);
      if (!trailingToken || trailingToken.value === ",")
        return;
      const nextToken = sourceCode.getTokenAfter(trailingToken);
      if (!nextToken || !closeBraces.includes(nextToken.value))
        return;
      context.report({
        node: lastItem,
        loc: {
          start: trailingToken.loc.end,
          end: utils.getNextLocation(sourceCode, trailingToken.loc.end)
        },
        messageId: "missing",
        *fix(fixer) {
          yield fixer.insertTextAfter(trailingToken, ",");
          yield fixer.insertTextBefore(trailingToken, "");
          yield fixer.insertTextAfter(sourceCode.getTokenAfter(trailingToken), "");
        }
      });
    }
    function forceTrailingCommaIfMultiline(node) {
      if (isMultiline(node))
        forceTrailingComma(node);
      else
        forbidTrailingComma(node);
    }
    function allowTrailingCommaIfMultiline(node) {
      if (!isMultiline(node))
        forbidTrailingComma(node);
    }
    const predicate = {
      "always": forceTrailingComma,
      "always-multiline": forceTrailingCommaIfMultiline,
      "only-multiline": allowTrailingCommaIfMultiline,
      "never": forbidTrailingComma,
      ignore() {
      }
    };
    return {
      ObjectExpression: predicate[options.objects],
      ObjectPattern: predicate[options.objects],
      ArrayExpression: predicate[options.arrays],
      ArrayPattern: predicate[options.arrays],
      ImportDeclaration: predicate[options.imports],
      ExportNamedDeclaration: predicate[options.exports],
      FunctionDeclaration: predicate[options.functions],
      FunctionExpression: predicate[options.functions],
      ArrowFunctionExpression: predicate[options.functions],
      CallExpression: predicate[options.functions],
      NewExpression: predicate[options.functions]
    };
  }
});

const baseRule = /* @__PURE__ */ utils.castRuleModule(_baseRule);
const OPTION_VALUE_SCHEME = [
  "always-multiline",
  "always",
  "never",
  "only-multiline"
];
const DEFAULT_OPTION_VALUE = "never";
function normalizeOptions(options = {}) {
  if (typeof options === "string") {
    return {
      enums: options,
      generics: options,
      tuples: options
    };
  }
  return {
    enums: options.enums ?? DEFAULT_OPTION_VALUE,
    generics: options.generics ?? DEFAULT_OPTION_VALUE,
    tuples: options.tuples ?? DEFAULT_OPTION_VALUE
  };
}
var commaDangle = utils.createRule({
  name: "comma-dangle",
  package: "ts",
  meta: {
    type: "layout",
    docs: {
      description: "Require or disallow trailing commas"
    },
    schema: {
      $defs: {
        value: {
          type: "string",
          enum: OPTION_VALUE_SCHEME
        },
        valueWithIgnore: {
          type: "string",
          enum: [...OPTION_VALUE_SCHEME, "ignore"]
        }
      },
      type: "array",
      items: [
        {
          oneOf: [
            {
              $ref: "#/$defs/value"
            },
            {
              type: "object",
              properties: {
                arrays: { $ref: "#/$defs/valueWithIgnore" },
                objects: { $ref: "#/$defs/valueWithIgnore" },
                imports: { $ref: "#/$defs/valueWithIgnore" },
                exports: { $ref: "#/$defs/valueWithIgnore" },
                functions: { $ref: "#/$defs/valueWithIgnore" },
                enums: { $ref: "#/$defs/valueWithIgnore" },
                generics: { $ref: "#/$defs/valueWithIgnore" },
                tuples: { $ref: "#/$defs/valueWithIgnore" }
              },
              additionalProperties: false
            }
          ]
        }
      ],
      additionalItems: false
    },
    fixable: "code",
    hasSuggestions: baseRule.meta.hasSuggestions,
    messages: baseRule.meta.messages
  },
  defaultOptions: ["never"],
  create(context, [options]) {
    const rules = baseRule.create(context);
    const sourceCode = context.sourceCode;
    const normalizedOptions = normalizeOptions(options);
    const isTSX = context.parserOptions?.ecmaFeatures?.jsx && context.filename?.endsWith(".tsx");
    const predicate = {
      "always": forceComma,
      "always-multiline": forceCommaIfMultiline,
      "only-multiline": allowCommaIfMultiline,
      "never": forbidComma,
      // https://github.com/typescript-eslint/typescript-eslint/issues/7220
      "ignore": () => {
      }
    };
    function last(nodes) {
      return nodes[nodes.length - 1] ?? null;
    }
    function getLastItem(node) {
      switch (node.type) {
        case utils$1.AST_NODE_TYPES.TSEnumDeclaration:
          return last(node.body?.members || node.members);
        case utils$1.AST_NODE_TYPES.TSTypeParameterDeclaration:
          return last(node.params);
        case utils$1.AST_NODE_TYPES.TSTupleType:
          return last(node.elementTypes);
        default:
          return null;
      }
    }
    function getTrailingToken(node) {
      const last2 = getLastItem(node);
      const trailing = last2 && sourceCode.getTokenAfter(last2);
      return trailing;
    }
    function isMultiline(node) {
      const last2 = getLastItem(node);
      const lastToken = sourceCode.getLastToken(node);
      return last2?.loc.end.line !== lastToken?.loc.end.line;
    }
    function forbidComma(node) {
      if (isTSX && node.type === utils$1.AST_NODE_TYPES.TSTypeParameterDeclaration && node.params.length === 1)
        return;
      const last2 = getLastItem(node);
      const trailing = getTrailingToken(node);
      if (last2 && trailing && astUtils.isCommaToken(trailing)) {
        context.report({
          node,
          messageId: "unexpected",
          fix(fixer) {
            return fixer.remove(trailing);
          }
        });
      }
    }
    function forceComma(node) {
      const last2 = getLastItem(node);
      const trailing = getTrailingToken(node);
      if (last2 && trailing && !astUtils.isCommaToken(trailing)) {
        context.report({
          node,
          messageId: "missing",
          fix(fixer) {
            return fixer.insertTextAfter(last2, ",");
          }
        });
      }
    }
    function allowCommaIfMultiline(node) {
      if (!isMultiline(node))
        forbidComma(node);
    }
    function forceCommaIfMultiline(node) {
      if (isMultiline(node))
        forceComma(node);
      else
        forbidComma(node);
    }
    return {
      ...rules,
      TSEnumDeclaration: predicate[normalizedOptions.enums],
      TSTypeParameterDeclaration: predicate[normalizedOptions.generics],
      TSTupleType: predicate[normalizedOptions.tuples]
    };
  }
});

module.exports = commaDangle;
