'use strict';

var utils = require('../utils.js');
require('eslint-visitor-keys');
require('espree');
require('estraverse');

const OPTION_VALUE = {
  oneOf: [
    {
      type: "string",
      enum: ["always", "never"]
    },
    {
      type: "object",
      properties: {
        multiline: {
          type: "boolean"
        },
        minProperties: {
          type: "integer",
          minimum: 0
        },
        consistent: {
          type: "boolean"
        }
      },
      additionalProperties: false,
      minProperties: 1
    }
  ]
};
function normalizeOptionValue(value) {
  let multiline = false;
  let minProperties = Number.POSITIVE_INFINITY;
  let consistent = false;
  if (value) {
    if (value === "always") {
      minProperties = 0;
    } else if (value === "never") {
      minProperties = Number.POSITIVE_INFINITY;
    } else {
      multiline = Boolean(value.multiline);
      minProperties = value.minProperties || Number.POSITIVE_INFINITY;
      consistent = Boolean(value.consistent);
    }
  } else {
    consistent = true;
  }
  return { multiline, minProperties, consistent };
}
function isObject(value) {
  return typeof value === "object" && value !== null;
}
function isNodeSpecificOption(option) {
  return isObject(option) || typeof option === "string";
}
function normalizeOptions(options) {
  if (isObject(options) && Object.values(options).some(isNodeSpecificOption)) {
    return {
      ObjectExpression: normalizeOptionValue(options.ObjectExpression),
      ObjectPattern: normalizeOptionValue(options.ObjectPattern),
      ImportDeclaration: normalizeOptionValue(options.ImportDeclaration),
      ExportNamedDeclaration: normalizeOptionValue(options.ExportDeclaration),
      TSTypeLiteral: normalizeOptionValue(options.TSTypeLiteral),
      TSInterfaceBody: normalizeOptionValue(options.TSInterfaceBody)
    };
  }
  const value = normalizeOptionValue(options);
  return { ObjectExpression: value, ObjectPattern: value, ImportDeclaration: value, ExportNamedDeclaration: value, TSTypeLiteral: value, TSInterfaceBody: value };
}
function areLineBreaksRequired(node, options, first, last) {
  let objectProperties;
  if (node.type === "ObjectExpression" || node.type === "ObjectPattern") {
    objectProperties = node.properties;
  } else if (node.type === "TSTypeLiteral") {
    objectProperties = node.members;
  } else if (node.type === "TSInterfaceBody") {
    objectProperties = node.body;
  } else {
    objectProperties = node.specifiers.filter((s) => s.type === "ImportSpecifier" || s.type === "ExportSpecifier");
  }
  return objectProperties.length >= options.minProperties || options.multiline && objectProperties.length > 0 && first.loc.start.line !== last.loc.end.line;
}
var _baseRule = utils.createRule({
  name: "object-curly-newline",
  package: "js",
  meta: {
    type: "layout",
    docs: {
      description: "Enforce consistent line breaks after opening and before closing braces"
    },
    fixable: "whitespace",
    schema: [
      {
        oneOf: [
          OPTION_VALUE,
          {
            type: "object",
            properties: {
              ObjectExpression: OPTION_VALUE,
              ObjectPattern: OPTION_VALUE,
              ImportDeclaration: OPTION_VALUE,
              ExportDeclaration: OPTION_VALUE,
              TSTypeLiteral: OPTION_VALUE,
              TSInterfaceBody: OPTION_VALUE
            },
            additionalProperties: false,
            minProperties: 1
          }
        ]
      }
    ],
    messages: {
      unexpectedLinebreakBeforeClosingBrace: "Unexpected line break before this closing brace.",
      unexpectedLinebreakAfterOpeningBrace: "Unexpected line break after this opening brace.",
      expectedLinebreakBeforeClosingBrace: "Expected a line break before this closing brace.",
      expectedLinebreakAfterOpeningBrace: "Expected a line break after this opening brace."
    }
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const normalizedOptions = normalizeOptions(context.options[0]);
    function check(node) {
      const options = normalizedOptions[node.type];
      if (node.type === "ImportDeclaration" && !node.specifiers.some((specifier) => specifier.type === "ImportSpecifier") || node.type === "ExportNamedDeclaration" && !node.specifiers.some((specifier) => specifier.type === "ExportSpecifier")) {
        return;
      }
      const openBrace = sourceCode.getFirstToken(node, (token) => token.value === "{");
      let closeBrace;
      if (node.type === "ObjectPattern" && node.typeAnnotation)
        closeBrace = sourceCode.getTokenBefore(node.typeAnnotation);
      else
        closeBrace = sourceCode.getLastToken(node, (token) => token.value === "}");
      let first = sourceCode.getTokenAfter(openBrace, { includeComments: true });
      let last = sourceCode.getTokenBefore(closeBrace, { includeComments: true });
      const needsLineBreaks = areLineBreaksRequired(node, options, first, last);
      const hasCommentsFirstToken = utils.isCommentToken(first);
      const hasCommentsLastToken = utils.isCommentToken(last);
      first = sourceCode.getTokenAfter(openBrace);
      last = sourceCode.getTokenBefore(closeBrace);
      if (needsLineBreaks) {
        if (utils.isTokenOnSameLine(openBrace, first)) {
          context.report({
            messageId: "expectedLinebreakAfterOpeningBrace",
            node,
            loc: openBrace.loc,
            fix(fixer) {
              if (hasCommentsFirstToken)
                return null;
              return fixer.insertTextAfter(openBrace, "\n");
            }
          });
        }
        if (utils.isTokenOnSameLine(last, closeBrace)) {
          context.report({
            messageId: "expectedLinebreakBeforeClosingBrace",
            node,
            loc: closeBrace.loc,
            fix(fixer) {
              if (hasCommentsLastToken)
                return null;
              return fixer.insertTextBefore(closeBrace, "\n");
            }
          });
        }
      } else {
        const consistent = options.consistent;
        const hasLineBreakBetweenOpenBraceAndFirst = !utils.isTokenOnSameLine(openBrace, first);
        const hasLineBreakBetweenCloseBraceAndLast = !utils.isTokenOnSameLine(last, closeBrace);
        if (!consistent && hasLineBreakBetweenOpenBraceAndFirst || consistent && hasLineBreakBetweenOpenBraceAndFirst && !hasLineBreakBetweenCloseBraceAndLast) {
          context.report({
            messageId: "unexpectedLinebreakAfterOpeningBrace",
            node,
            loc: openBrace.loc,
            fix(fixer) {
              if (hasCommentsFirstToken)
                return null;
              return fixer.removeRange([
                openBrace.range[1],
                first.range[0]
              ]);
            }
          });
        }
        if (!consistent && hasLineBreakBetweenCloseBraceAndLast || consistent && !hasLineBreakBetweenOpenBraceAndFirst && hasLineBreakBetweenCloseBraceAndLast) {
          context.report({
            messageId: "unexpectedLinebreakBeforeClosingBrace",
            node,
            loc: closeBrace.loc,
            fix(fixer) {
              if (hasCommentsLastToken)
                return null;
              return fixer.removeRange([
                last.range[1],
                closeBrace.range[0]
              ]);
            }
          });
        }
      }
    }
    return {
      ObjectExpression: check,
      ObjectPattern: check,
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      TSTypeLiteral: check,
      TSInterfaceBody: check
    };
  }
});

const baseRule = /* @__PURE__ */ utils.castRuleModule(_baseRule);
const defaultOptionValue = { multiline: false, minProperties: Number.POSITIVE_INFINITY, consistent: true };
var objectCurlyNewline = utils.createRule({
  name: "object-curly-newline",
  package: "ts",
  meta: {
    ...baseRule.meta,
    docs: {
      description: "Enforce consistent line breaks after opening and before closing braces"
    }
  },
  defaultOptions: [
    {
      ObjectExpression: defaultOptionValue,
      ObjectPattern: defaultOptionValue,
      ImportDeclaration: defaultOptionValue,
      ExportDeclaration: defaultOptionValue,
      TSTypeLiteral: defaultOptionValue,
      TSInterfaceBody: defaultOptionValue
    }
  ],
  create(context) {
    const rules = baseRule.create(context);
    return rules;
  }
});

module.exports = objectCurlyNewline;