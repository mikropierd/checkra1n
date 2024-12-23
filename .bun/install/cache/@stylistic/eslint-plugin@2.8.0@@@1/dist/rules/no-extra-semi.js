'use strict';

var utils = require('../utils.js');
require('eslint-visitor-keys');
require('espree');
require('estraverse');

var _baseRule = utils.createRule({
  name: "no-extra-semi",
  package: "js",
  meta: {
    type: "layout",
    docs: {
      description: "Disallow unnecessary semicolons"
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected: "Unnecessary semicolon."
    }
  },
  create(context) {
    const sourceCode = context.sourceCode;
    function isFixable(nodeOrToken) {
      const nextToken = sourceCode.getTokenAfter(nodeOrToken);
      if (!nextToken || nextToken.type !== "String")
        return true;
      const stringNode = sourceCode.getNodeByRangeIndex(nextToken.range[0]);
      return !utils.isTopLevelExpressionStatement(stringNode.parent);
    }
    function report(nodeOrToken) {
      context.report({
        node: nodeOrToken,
        messageId: "unexpected",
        fix: isFixable(nodeOrToken) ? (fixer) => new utils.FixTracker(fixer, context.sourceCode).retainSurroundingTokens(nodeOrToken).remove(nodeOrToken) : null
      });
    }
    function checkForPartOfClassBody(firstToken) {
      for (let token = firstToken; token.type === "Punctuator" && !utils.isClosingBraceToken(token); token = sourceCode.getTokenAfter(token)) {
        if (utils.isSemicolonToken(token))
          report(token);
      }
    }
    return {
      /**
       * Reports this empty statement, except if the parent node is a loop.
       * @param node A EmptyStatement node to be reported.
       */
      EmptyStatement(node) {
        const parent = node.parent;
        const allowedParentTypes = [
          "ForStatement",
          "ForInStatement",
          "ForOfStatement",
          "WhileStatement",
          "DoWhileStatement",
          "IfStatement",
          "LabeledStatement",
          "WithStatement"
        ];
        if (!allowedParentTypes.includes(parent.type))
          report(node);
      },
      /**
       * Checks tokens from the head of this class body to the first MethodDefinition or the end of this class body.
       * @param node A ClassBody node to check.
       */
      ClassBody(node) {
        checkForPartOfClassBody(sourceCode.getFirstToken(node, 1));
      },
      /**
       * Checks tokens from this MethodDefinition to the next MethodDefinition or the end of this class body.
       * @param node A MethodDefinition node of the start point.
       */
      "MethodDefinition, PropertyDefinition, StaticBlock": function(node) {
        checkForPartOfClassBody(sourceCode.getTokenAfter(node));
      }
    };
  }
});

const baseRule = /* @__PURE__ */ utils.castRuleModule(_baseRule);
var noExtraSemi = utils.createRule({
  name: "no-extra-semi",
  package: "ts",
  meta: {
    type: "layout",
    docs: {
      description: "Disallow unnecessary semicolons"
    },
    fixable: "code",
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages
  },
  defaultOptions: [],
  create(context) {
    const rules = baseRule.create(context);
    return {
      ...rules,
      "TSAbstractMethodDefinition, TSAbstractPropertyDefinition": function(node) {
        rules["MethodDefinition, PropertyDefinition, StaticBlock"]?.(node);
      }
    };
  }
});

module.exports = noExtraSemi;
