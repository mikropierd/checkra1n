'use strict';

var utils = require('../utils.js');
require('eslint-visitor-keys');
require('espree');
require('estraverse');

const QUOTE_SETTINGS = {
  "prefer-double": {
    quote: '"',
    description: "singlequote",
    convert(str) {
      return str.replace(/'/gu, '"');
    }
  },
  "prefer-single": {
    quote: "'",
    description: "doublequote",
    convert(str) {
      return str.replace(/"/gu, "'");
    }
  }
};
var jsxQuotes = utils.createRule({
  name: "jsx-quotes",
  package: "js",
  meta: {
    type: "layout",
    docs: {
      description: "Enforce the consistent use of either double or single quotes in JSX attributes"
    },
    fixable: "whitespace",
    schema: [
      {
        type: "string",
        enum: ["prefer-single", "prefer-double"]
      }
    ],
    messages: {
      unexpected: "Unexpected usage of {{description}}."
    }
  },
  create(context) {
    const quoteOption = context.options[0] || "prefer-double";
    const setting = QUOTE_SETTINGS[quoteOption];
    function usesExpectedQuotes(node) {
      return node.value.includes(setting.quote) || utils.isSurroundedBy(node.raw, setting.quote);
    }
    return {
      JSXAttribute(node) {
        const attributeValue = node.value;
        if (attributeValue && utils.isStringLiteral(attributeValue) && !usesExpectedQuotes(attributeValue)) {
          context.report({
            node: attributeValue,
            messageId: "unexpected",
            data: {
              description: setting.description
            },
            fix(fixer) {
              return fixer.replaceText(attributeValue, setting.convert(attributeValue.raw));
            }
          });
        }
      }
    };
  }
});

module.exports = jsxQuotes;
