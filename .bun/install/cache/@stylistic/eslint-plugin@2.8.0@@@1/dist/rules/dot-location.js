'use strict';

var utils = require('../utils.js');
require('eslint-visitor-keys');
require('espree');
require('estraverse');

var dotLocation = utils.createRule({
  name: "dot-location",
  package: "js",
  meta: {
    type: "layout",
    docs: {
      description: "Enforce consistent newlines before and after dots"
    },
    schema: [
      {
        type: "string",
        enum: ["object", "property"]
      }
    ],
    fixable: "code",
    messages: {
      expectedDotAfterObject: "Expected dot to be on same line as object.",
      expectedDotBeforeProperty: "Expected dot to be on same line as property."
    }
  },
  create(context) {
    const config = context.options[0];
    const onObject = config === "object" || !config;
    const sourceCode = context.sourceCode;
    function checkDotLocation(node) {
      const property = node.property;
      const dotToken = sourceCode.getTokenBefore(property);
      if (onObject && dotToken) {
        const tokenBeforeDot = sourceCode.getTokenBefore(dotToken);
        if (tokenBeforeDot && !utils.isTokenOnSameLine(tokenBeforeDot, dotToken)) {
          context.report({
            node,
            loc: dotToken.loc,
            messageId: "expectedDotAfterObject",
            *fix(fixer) {
              if (dotToken.value.startsWith(".") && utils.isDecimalIntegerNumericToken(tokenBeforeDot))
                yield fixer.insertTextAfter(tokenBeforeDot, ` ${dotToken.value}`);
              else
                yield fixer.insertTextAfter(tokenBeforeDot, dotToken.value);
              yield fixer.remove(dotToken);
            }
          });
        }
      } else if (!utils.isTokenOnSameLine(dotToken, property) && dotToken) {
        context.report({
          node,
          loc: dotToken.loc,
          messageId: "expectedDotBeforeProperty",
          *fix(fixer) {
            yield fixer.remove(dotToken);
            yield fixer.insertTextBefore(property, dotToken.value);
          }
        });
      }
    }
    function checkNode(node) {
      if (node.type === "MemberExpression" && !node.computed)
        checkDotLocation(node);
    }
    return {
      MemberExpression: checkNode
    };
  }
});

module.exports = dotLocation;
