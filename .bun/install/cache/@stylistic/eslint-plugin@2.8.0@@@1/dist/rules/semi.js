'use strict';

var utils = require('../utils.js');
var utils$1 = require('@typescript-eslint/utils');
require('eslint-visitor-keys');
require('espree');
require('estraverse');

var _baseRule = utils.createRule({
  name: "semi",
  package: "js",
  meta: {
    type: "layout",
    docs: {
      description: "Require or disallow semicolons instead of ASI"
    },
    fixable: "code",
    schema: {
      anyOf: [
        {
          type: "array",
          items: [
            {
              type: "string",
              enum: ["never"]
            },
            {
              type: "object",
              properties: {
                beforeStatementContinuationChars: {
                  type: "string",
                  enum: ["always", "any", "never"]
                }
              },
              additionalProperties: false
            }
          ],
          minItems: 0,
          maxItems: 2
        },
        {
          type: "array",
          items: [
            {
              type: "string",
              enum: ["always"]
            },
            {
              type: "object",
              properties: {
                omitLastInOneLineBlock: { type: "boolean" },
                omitLastInOneLineClassBody: { type: "boolean" }
              },
              additionalProperties: false
            }
          ],
          minItems: 0,
          maxItems: 2
        }
      ]
    },
    messages: {
      missingSemi: "Missing semicolon.",
      extraSemi: "Extra semicolon."
    }
  },
  create(context) {
    const OPT_OUT_PATTERN = /^[-[(/+`]/u;
    const unsafeClassFieldNames = /* @__PURE__ */ new Set(["get", "set", "static"]);
    const unsafeClassFieldFollowers = /* @__PURE__ */ new Set(["*", "in", "instanceof"]);
    const options = context.options[1];
    const never = context.options[0] === "never";
    const exceptOneLine = Boolean(options && "omitLastInOneLineBlock" in options && options.omitLastInOneLineBlock);
    const exceptOneLineClassBody = Boolean(options && "omitLastInOneLineClassBody" in options && options.omitLastInOneLineClassBody);
    const beforeStatementContinuationChars = options && "beforeStatementContinuationChars" in options && options.beforeStatementContinuationChars || "any";
    const sourceCode = context.sourceCode;
    function report(node, missing = false) {
      const lastToken = sourceCode.getLastToken(node);
      let messageId = "missingSemi";
      let fix, loc;
      if (!missing) {
        loc = {
          start: lastToken.loc.end,
          end: utils.getNextLocation(sourceCode, lastToken.loc.end)
        };
        fix = function(fixer) {
          return fixer.insertTextAfter(lastToken, ";");
        };
      } else {
        messageId = "extraSemi";
        loc = lastToken.loc;
        fix = function(fixer) {
          return new utils.FixTracker(fixer, sourceCode).retainSurroundingTokens(lastToken).remove(lastToken);
        };
      }
      context.report({
        node,
        loc,
        messageId,
        fix
      });
    }
    function isRedundantSemi(semiToken) {
      const nextToken = sourceCode.getTokenAfter(semiToken);
      return !nextToken || utils.isClosingBraceToken(nextToken) || utils.isSemicolonToken(nextToken);
    }
    function isEndOfArrowBlock(lastToken) {
      if (!utils.isClosingBraceToken(lastToken))
        return false;
      const node = sourceCode.getNodeByRangeIndex(lastToken.range[0]);
      return node.type === "BlockStatement" && node.parent.type === "ArrowFunctionExpression";
    }
    function maybeClassFieldAsiHazard(node) {
      if (node.type !== "PropertyDefinition")
        return false;
      const needsNameCheck = !node.computed && node.key.type === "Identifier";
      if (needsNameCheck && "name" in node.key && unsafeClassFieldNames.has(node.key.name)) {
        const isStaticStatic = node.static && node.key.name === "static";
        if (!isStaticStatic && !node.value)
          return true;
      }
      const followingToken = sourceCode.getTokenAfter(node);
      return unsafeClassFieldFollowers.has(followingToken.value);
    }
    function isOnSameLineWithNextToken(node) {
      const prevToken = sourceCode.getLastToken(node, 1);
      const nextToken = sourceCode.getTokenAfter(node);
      return !!nextToken && utils.isTokenOnSameLine(prevToken, nextToken);
    }
    function maybeAsiHazardAfter(node) {
      const t = node.type;
      if (t === "DoWhileStatement" || t === "BreakStatement" || t === "ContinueStatement" || t === "DebuggerStatement" || t === "ImportDeclaration" || t === "ExportAllDeclaration") {
        return false;
      }
      if (t === "ReturnStatement")
        return Boolean(node.argument);
      if (t === "ExportNamedDeclaration")
        return Boolean(node.declaration);
      const lastToken = sourceCode.getLastToken(node, 1);
      if (isEndOfArrowBlock(lastToken))
        return false;
      return true;
    }
    function maybeAsiHazardBefore(token) {
      return Boolean(token) && OPT_OUT_PATTERN.test(token.value) && token.value !== "++" && token.value !== "--";
    }
    function canRemoveSemicolon(node) {
      const lastToken = sourceCode.getLastToken(node);
      if (isRedundantSemi(lastToken))
        return true;
      if (maybeClassFieldAsiHazard(node))
        return false;
      if (isOnSameLineWithNextToken(node))
        return false;
      if (node.type !== "PropertyDefinition" && beforeStatementContinuationChars === "never" && !maybeAsiHazardAfter(node)) {
        return true;
      }
      const nextToken = sourceCode.getTokenAfter(node);
      if (!maybeAsiHazardBefore(nextToken))
        return true;
      return false;
    }
    function isLastInOneLinerBlock(node) {
      const parent = node.parent;
      const nextToken = sourceCode.getTokenAfter(node);
      if (!nextToken || nextToken.value !== "}")
        return false;
      if (parent.type === "BlockStatement")
        return parent.loc.start.line === parent.loc.end.line;
      if (parent.type === "StaticBlock") {
        const openingBrace = sourceCode.getFirstToken(parent, { skip: 1 });
        return openingBrace.loc.start.line === parent.loc.end.line;
      }
      return false;
    }
    function isLastInOneLinerClassBody(node) {
      const parent = node.parent;
      const nextToken = sourceCode.getTokenAfter(node);
      if (!nextToken || nextToken.value !== "}")
        return false;
      if (parent.type === "ClassBody")
        return parent.loc.start.line === parent.loc.end.line;
      return false;
    }
    function checkForSemicolon(node) {
      const lastToken = sourceCode.getLastToken(node);
      const isSemi = utils.isSemicolonToken(lastToken);
      if (never) {
        const nextToken = sourceCode.getTokenAfter(node);
        if (isSemi && canRemoveSemicolon(node)) {
          report(node, true);
        } else if (!isSemi && beforeStatementContinuationChars === "always" && node.type !== "PropertyDefinition" && maybeAsiHazardBefore(nextToken)) {
          report(node);
        }
      } else {
        const oneLinerBlock = exceptOneLine && isLastInOneLinerBlock(node);
        const oneLinerClassBody = exceptOneLineClassBody && isLastInOneLinerClassBody(node);
        const oneLinerBlockOrClassBody = oneLinerBlock || oneLinerClassBody;
        if (isSemi && oneLinerBlockOrClassBody)
          report(node, true);
        else if (!isSemi && !oneLinerBlockOrClassBody)
          report(node);
      }
    }
    function checkForSemicolonForVariableDeclaration(node) {
      const parent = node.parent;
      if ((parent.type !== "ForStatement" || parent.init !== node) && (!/^For(?:In|Of)Statement/u.test(parent.type) || parent.left !== node)) {
        checkForSemicolon(node);
      }
    }
    return {
      VariableDeclaration: checkForSemicolonForVariableDeclaration,
      ExpressionStatement: checkForSemicolon,
      ReturnStatement: checkForSemicolon,
      ThrowStatement: checkForSemicolon,
      DoWhileStatement: checkForSemicolon,
      DebuggerStatement: checkForSemicolon,
      BreakStatement: checkForSemicolon,
      ContinueStatement: checkForSemicolon,
      ImportDeclaration: checkForSemicolon,
      ExportAllDeclaration: checkForSemicolon,
      ExportNamedDeclaration(node) {
        if (!node.declaration)
          checkForSemicolon(node);
      },
      ExportDefaultDeclaration(node) {
        if (!/(?:Class|Function)Declaration/u.test(node.declaration.type))
          checkForSemicolon(node);
      },
      PropertyDefinition: checkForSemicolon
    };
  }
});

const baseRule = /* @__PURE__ */ utils.castRuleModule(_baseRule);
var semi = utils.createRule({
  name: "semi",
  package: "ts",
  meta: {
    type: "layout",
    docs: {
      description: "Require or disallow semicolons instead of ASI"
      // too opinionated to be recommended
    },
    fixable: "code",
    hasSuggestions: baseRule.meta.hasSuggestions,
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages
  },
  defaultOptions: [
    "always",
    {
      omitLastInOneLineBlock: false,
      beforeStatementContinuationChars: "any"
    }
  ],
  create(context) {
    const rules = baseRule.create(context);
    const checkForSemicolon = rules.ExpressionStatement;
    const nodesToCheck = [
      utils$1.AST_NODE_TYPES.PropertyDefinition,
      utils$1.AST_NODE_TYPES.TSAbstractPropertyDefinition,
      utils$1.AST_NODE_TYPES.TSDeclareFunction,
      utils$1.AST_NODE_TYPES.TSExportAssignment,
      utils$1.AST_NODE_TYPES.TSImportEqualsDeclaration,
      utils$1.AST_NODE_TYPES.TSTypeAliasDeclaration,
      utils$1.AST_NODE_TYPES.TSEmptyBodyFunctionExpression
    ].reduce((acc, node) => {
      acc[node] = checkForSemicolon;
      return acc;
    }, {});
    return {
      ...rules,
      ...nodesToCheck,
      ExportDefaultDeclaration(node) {
        if (node.declaration.type !== utils$1.AST_NODE_TYPES.TSInterfaceDeclaration)
          rules.ExportDefaultDeclaration(node);
      }
    };
  }
});

module.exports = semi;
