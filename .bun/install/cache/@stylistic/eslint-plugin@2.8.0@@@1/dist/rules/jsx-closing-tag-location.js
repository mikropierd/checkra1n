'use strict';

var utils = require('../utils.js');
require('eslint-visitor-keys');
require('espree');
require('estraverse');

const messages = {
  onOwnLine: "Closing tag of a multiline JSX expression must be on its own line.",
  matchIndent: "Expected closing tag to match indentation of opening."
};
var jsxClosingTagLocation = utils.createRule({
  name: "jsx-closing-tag-location",
  package: "jsx",
  meta: {
    type: "layout",
    docs: {
      description: "Enforce closing tag location for multiline JSX"
    },
    fixable: "whitespace",
    messages,
    schema: []
  },
  create(context) {
    function handleClosingElement(node) {
      if (!node.parent)
        return;
      let opening;
      if ("openingFragment" in node.parent)
        opening = node.parent.openingFragment;
      if ("openingElement" in node.parent)
        opening = node.parent.openingElement;
      if (opening.loc.start.line === node.loc.start.line)
        return;
      if (opening.loc.start.column === node.loc.start.column)
        return;
      const messageId = utils.isNodeFirstInLine(context, node) ? "matchIndent" : "onOwnLine";
      context.report({
        node,
        messageId,
        loc: node.loc,
        fix(fixer) {
          const indent = new Array(opening.loc.start.column + 1).join(" ");
          if (utils.isNodeFirstInLine(context, node)) {
            return fixer.replaceTextRange(
              [node.range[0] - node.loc.start.column, node.range[0]],
              indent
            );
          }
          return fixer.insertTextBefore(node, `
${indent}`);
        }
      });
    }
    return {
      JSXClosingElement: handleClosingElement,
      JSXClosingFragment: handleClosingElement
    };
  }
});

module.exports = jsxClosingTagLocation;
