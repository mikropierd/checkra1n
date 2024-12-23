'use strict';

var utils = require('../utils.js');
require('eslint-visitor-keys');
require('espree');
require('estraverse');

var _baseRule = utils.createRule({
  name: "object-property-newline",
  package: "js",
  meta: {
    type: "layout",
    docs: {
      description: "Enforce placing object properties on separate lines"
    },
    schema: [
      {
        type: "object",
        properties: {
          allowAllPropertiesOnSameLine: {
            type: "boolean",
            default: false
          },
          allowMultiplePropertiesPerLine: {
            // Deprecated
            type: "boolean",
            default: false
          }
        },
        additionalProperties: false
      }
    ],
    fixable: "whitespace",
    messages: {
      propertiesOnNewlineAll: "Object properties must go on a new line if they aren't all on the same line.",
      propertiesOnNewline: "Object properties must go on a new line."
    }
  },
  create(context) {
    const allowSameLine = context.options[0] && (context.options[0].allowAllPropertiesOnSameLine || context.options[0].allowMultiplePropertiesPerLine);
    const messageId = allowSameLine ? "propertiesOnNewlineAll" : "propertiesOnNewline";
    const sourceCode = context.sourceCode;
    return {
      ObjectExpression(node) {
        if (allowSameLine) {
          if (node.properties.length > 1) {
            const firstTokenOfFirstProperty = sourceCode.getFirstToken(node.properties[0]);
            const lastTokenOfLastProperty = sourceCode.getLastToken(node.properties[node.properties.length - 1]);
            if (firstTokenOfFirstProperty.loc.end.line === lastTokenOfLastProperty.loc.start.line) {
              return;
            }
          }
        }
        for (let i = 1; i < node.properties.length; i++) {
          const lastTokenOfPreviousProperty = sourceCode.getLastToken(node.properties[i - 1]);
          const firstTokenOfCurrentProperty = sourceCode.getFirstToken(node.properties[i]);
          if (lastTokenOfPreviousProperty.loc.end.line === firstTokenOfCurrentProperty.loc.start.line) {
            context.report({
              node,
              loc: firstTokenOfCurrentProperty.loc,
              messageId,
              fix(fixer) {
                const comma = sourceCode.getTokenBefore(firstTokenOfCurrentProperty);
                const rangeAfterComma = [comma.range[1], firstTokenOfCurrentProperty.range[0]];
                if (sourceCode.text.slice(rangeAfterComma[0], rangeAfterComma[1]).trim())
                  return null;
                return fixer.replaceTextRange(rangeAfterComma, "\n");
              }
            });
          }
        }
      }
    };
  }
});

const baseRule = /* @__PURE__ */ utils.castRuleModule(_baseRule);
var objectPropertyNewline = utils.createRule({
  name: "object-property-newline",
  package: "ts",
  meta: {
    ...baseRule.meta,
    docs: {
      description: "Enforce placing object properties on separate lines"
    }
  },
  defaultOptions: [
    {
      allowAllPropertiesOnSameLine: false,
      allowMultiplePropertiesPerLine: false
    }
  ],
  create(context) {
    const rules = baseRule.create(context);
    return {
      ...rules,
      TSTypeLiteral(node) {
        return rules.ObjectExpression({
          ...node,
          // @ts-expect-error only used to get token and loc
          properties: node.members
        });
      },
      TSInterfaceBody(node) {
        return rules.ObjectExpression({
          ...node,
          // @ts-expect-error only used to get token and loc
          properties: node.body
        });
      }
    };
  }
});

module.exports = objectPropertyNewline;
