'use strict';

var utils = require('../utils.js');
require('eslint-visitor-keys');
require('espree');
require('estraverse');

const tupleRe = /^([\w$]+)(\s*)(\?\s*)?:(\s*)(.*)$/;
var typeNamedTupleSpacing = utils.createRule({
  name: "type-named-tuple-spacing",
  package: "plus",
  meta: {
    type: "layout",
    docs: {
      description: "Expect space before the type declaration in the named tuple"
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      expectedSpaceAfter: "Expected a space after the ':'.",
      unexpectedSpaceBetween: "Unexpected space between '?' and the ':'.",
      unexpectedSpaceBefore: "Unexpected space before the ':'."
    }
  },
  defaultOptions: [],
  create: (context) => {
    const sourceCode = context.getSourceCode();
    return {
      TSNamedTupleMember: (node) => {
        const code = sourceCode.text.slice(node.range[0], node.range[1]);
        const match = code.match(tupleRe);
        if (!match)
          return;
        const labelName = node.label.name;
        const spaceBeforeColon = match[2];
        const optionalMark = match[3];
        const spacesAfterColon = match[4];
        const elementType = match[5];
        function getReplaceValue() {
          let ret = labelName;
          if (node.optional)
            ret += "?";
          ret += ": ";
          ret += elementType;
          return ret;
        }
        if (optionalMark?.length > 1) {
          context.report({
            node,
            messageId: "unexpectedSpaceBetween",
            *fix(fixer) {
              yield fixer.replaceTextRange(node.range, code.replace(tupleRe, getReplaceValue()));
            }
          });
        }
        if (spaceBeforeColon?.length) {
          context.report({
            node,
            messageId: "unexpectedSpaceBefore",
            *fix(fixer) {
              yield fixer.replaceTextRange(node.range, code.replace(tupleRe, getReplaceValue()));
            }
          });
        }
        if (spacesAfterColon != null && spacesAfterColon.length !== 1) {
          context.report({
            node,
            messageId: "expectedSpaceAfter",
            *fix(fixer) {
              yield fixer.replaceTextRange(node.range, code.replace(tupleRe, getReplaceValue()));
            }
          });
        }
      }
    };
  }
});

module.exports = typeNamedTupleSpacing;
