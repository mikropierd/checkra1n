import { ESLintUtils, AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import * as path from 'node:path';
import { isAbsolute, posix } from 'node:path';
import ts from 'typescript';
import { createRequire } from 'node:module';

const version = "1.1.3";

function createEslintRule(rule) {
  const createRule = ESLintUtils.RuleCreator(
    (ruleName) => `https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/${ruleName}.md`
  );
  return createRule(rule);
}
const joinNames = (a, b) => a && b ? `${a}.${b}` : null;
const isFunction = (node) => node.type === AST_NODE_TYPES.FunctionExpression || node.type === AST_NODE_TYPES.ArrowFunctionExpression;
function getNodeName(node) {
  if (isSupportedAccessor(node))
    return getAccessorValue(node);
  switch (node.type) {
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return getNodeName(node.tag);
    case AST_NODE_TYPES.MemberExpression:
      return joinNames(getNodeName(node.object), getNodeName(node.property));
    case AST_NODE_TYPES.NewExpression:
    case AST_NODE_TYPES.CallExpression:
      return getNodeName(node.callee);
  }
  return null;
}
const isSupportedAccessor = (node, value) => {
  return isIdentifier(node, value) || isStringNode(node, value);
};
const isIdentifier = (node, name) => {
  return node.type === AST_NODE_TYPES.Identifier && (name === void 0 || node.name === name);
};
const isTemplateLiteral = (node, value) => {
  return node.type === AST_NODE_TYPES.TemplateLiteral && node.quasis.length === 1 && (value === void 0 || node.quasis[0].value.raw === value);
};
const isStringLiteral = (node, value) => node.type === AST_NODE_TYPES.Literal && typeof node.value === "string" && (value === void 0 || node.value === value);
const isStringNode = (node, specifics) => isStringLiteral(node, specifics) || isTemplateLiteral(node, specifics);
const getAccessorValue = (accessor) => accessor.type === AST_NODE_TYPES.Identifier ? accessor.name : getStringValue(accessor);
const getStringValue = (node) => node?.type === AST_NODE_TYPES.TemplateLiteral ? node.quasis[0].value.raw : node?.value;
const replaceAccessorFixer = (fixer, node, text) => {
  return fixer.replaceText(
    node,
    node.type === AST_NODE_TYPES.Identifier ? text : `'${text}'`
  );
};
const removeExtraArgumentsFixer = (fixer, context, func, from) => {
  const firstArg = func.arguments[from];
  const lastArg = func.arguments[func.arguments.length - 1];
  const { sourceCode } = context;
  let tokenAfterLastParam = sourceCode.getTokenAfter(lastArg);
  if (tokenAfterLastParam.value === ",")
    tokenAfterLastParam = sourceCode.getTokenAfter(tokenAfterLastParam);
  return fixer.removeRange([firstArg.range[0], tokenAfterLastParam.range[0]]);
};
const isParsedInstanceOfMatcherCall = (expectFnCall, classArg) => {
  return getAccessorValue(expectFnCall.matcher) === "toBeInstanceOf" && expectFnCall.args.length === 1 && isSupportedAccessor(expectFnCall.args[0], classArg);
};

var DescribeAlias = /* @__PURE__ */ ((DescribeAlias2) => {
  DescribeAlias2["describe"] = "describe";
  DescribeAlias2["fdescribe"] = "fdescribe";
  DescribeAlias2["xdescribe"] = "xdescribe";
  return DescribeAlias2;
})(DescribeAlias || {});
var TestCaseName = /* @__PURE__ */ ((TestCaseName2) => {
  TestCaseName2["fit"] = "fit";
  TestCaseName2["it"] = "it";
  TestCaseName2["test"] = "test";
  TestCaseName2["xit"] = "xit";
  TestCaseName2["xtest"] = "xtest";
  TestCaseName2["bench"] = "bench";
  return TestCaseName2;
})(TestCaseName || {});
var HookName = /* @__PURE__ */ ((HookName2) => {
  HookName2["beforeAll"] = "beforeAll";
  HookName2["beforeEach"] = "beforeEach";
  HookName2["afterAll"] = "afterAll";
  HookName2["afterEach"] = "afterEach";
  return HookName2;
})(HookName || {});
var ModifierName = /* @__PURE__ */ ((ModifierName2) => {
  ModifierName2["not"] = "not";
  ModifierName2["rejects"] = "rejects";
  ModifierName2["resolves"] = "resolves";
  return ModifierName2;
})(ModifierName || {});
var EqualityMatcher = /* @__PURE__ */ ((EqualityMatcher2) => {
  EqualityMatcher2["toBe"] = "toBe";
  EqualityMatcher2["toEqual"] = "toEqual";
  EqualityMatcher2["toStrictEqual"] = "toStrictEqual";
  return EqualityMatcher2;
})(EqualityMatcher || {});

const ValidVitestFnCallChains = /* @__PURE__ */ new Set(["beforeEach", "beforeAll", "afterEach", "afterAll", "it", "it.skip", "it.only", "it.concurrent", "it.sequential", "it.todo", "it.fails", "it.extend", "it.skipIf", "it.runIf", "it.each", "it.skip.only", "it.skip.concurrent", "it.skip.sequential", "it.skip.todo", "it.skip.fails", "it.only.skip", "it.only.concurrent", "it.only.sequential", "it.only.todo", "it.only.fails", "it.concurrent.skip", "it.concurrent.only", "it.concurrent.sequential", "it.concurrent.todo", "it.concurrent.fails", "it.sequential.skip", "it.sequential.only", "it.sequential.concurrent", "it.sequential.todo", "it.sequential.fails", "it.todo.skip", "it.todo.only", "it.todo.concurrent", "it.todo.sequential", "it.todo.fails", "it.fails.skip", "it.fails.only", "it.fails.concurrent", "it.fails.sequential", "it.fails.todo", "it.extend.skip", "it.extend.only", "it.extend.concurrent", "it.extend.sequential", "it.extend.todo", "it.extend.fails", "it.skipIf.skip", "it.skipIf.only", "it.skipIf.concurrent", "it.skipIf.sequential", "it.skipIf.todo", "it.skipIf.fails", "it.runIf.skip", "it.runIf.only", "it.runIf.concurrent", "it.runIf.sequential", "it.runIf.todo", "it.runIf.fails", "it.skip.each", "it.only.each", "it.concurrent.each", "it.sequential.each", "it.todo.each", "it.fails.each", "it.extend.skipIf", "it.extend.runIf", "it.extend.each", "it.skipIf.each", "it.runIf.each", "it.skip.only.concurrent", "it.skip.only.sequential", "it.skip.only.todo", "it.skip.only.fails", "it.skip.concurrent.only", "it.skip.concurrent.sequential", "it.skip.concurrent.todo", "it.skip.concurrent.fails", "it.skip.sequential.only", "it.skip.sequential.concurrent", "it.skip.sequential.todo", "it.skip.sequential.fails", "it.skip.todo.only", "it.skip.todo.concurrent", "it.skip.todo.sequential", "it.skip.todo.fails", "it.skip.fails.only", "it.skip.fails.concurrent", "it.skip.fails.sequential", "it.skip.fails.todo", "it.only.skip.concurrent", "it.only.skip.sequential", "it.only.skip.todo", "it.only.skip.fails", "it.only.concurrent.skip", "it.only.concurrent.sequential", "it.only.concurrent.todo", "it.only.concurrent.fails", "it.only.sequential.skip", "it.only.sequential.concurrent", "it.only.sequential.todo", "it.only.sequential.fails", "it.only.todo.skip", "it.only.todo.concurrent", "it.only.todo.sequential", "it.only.todo.fails", "it.only.fails.skip", "it.only.fails.concurrent", "it.only.fails.sequential", "it.only.fails.todo", "it.concurrent.skip.only", "it.concurrent.skip.sequential", "it.concurrent.skip.todo", "it.concurrent.skip.fails", "it.concurrent.only.skip", "it.concurrent.only.sequential", "it.concurrent.only.todo", "it.concurrent.only.fails", "it.concurrent.sequential.skip", "it.concurrent.sequential.only", "it.concurrent.sequential.todo", "it.concurrent.sequential.fails", "it.concurrent.todo.skip", "it.concurrent.todo.only", "it.concurrent.todo.sequential", "it.concurrent.todo.fails", "it.concurrent.fails.skip", "it.concurrent.fails.only", "it.concurrent.fails.sequential", "it.concurrent.fails.todo", "it.sequential.skip.only", "it.sequential.skip.concurrent", "it.sequential.skip.todo", "it.sequential.skip.fails", "it.sequential.only.skip", "it.sequential.only.concurrent", "it.sequential.only.todo", "it.sequential.only.fails", "it.sequential.concurrent.skip", "it.sequential.concurrent.only", "it.sequential.concurrent.todo", "it.sequential.concurrent.fails", "it.sequential.todo.skip", "it.sequential.todo.only", "it.sequential.todo.concurrent", "it.sequential.todo.fails", "it.sequential.fails.skip", "it.sequential.fails.only", "it.sequential.fails.concurrent", "it.sequential.fails.todo", "it.todo.skip.only", "it.todo.skip.concurrent", "it.todo.skip.sequential", "it.todo.skip.fails", "it.todo.only.skip", "it.todo.only.concurrent", "it.todo.only.sequential", "it.todo.only.fails", "it.todo.concurrent.skip", "it.todo.concurrent.only", "it.todo.concurrent.sequential", "it.todo.concurrent.fails", "it.todo.sequential.skip", "it.todo.sequential.only", "it.todo.sequential.concurrent", "it.todo.sequential.fails", "it.todo.fails.skip", "it.todo.fails.only", "it.todo.fails.concurrent", "it.todo.fails.sequential", "it.fails.skip.only", "it.fails.skip.concurrent", "it.fails.skip.sequential", "it.fails.skip.todo", "it.fails.only.skip", "it.fails.only.concurrent", "it.fails.only.sequential", "it.fails.only.todo", "it.fails.concurrent.skip", "it.fails.concurrent.only", "it.fails.concurrent.sequential", "it.fails.concurrent.todo", "it.fails.sequential.skip", "it.fails.sequential.only", "it.fails.sequential.concurrent", "it.fails.sequential.todo", "it.fails.todo.skip", "it.fails.todo.only", "it.fails.todo.concurrent", "it.fails.todo.sequential", "it.extend.skip.only", "it.extend.skip.concurrent", "it.extend.skip.sequential", "it.extend.skip.todo", "it.extend.skip.fails", "it.extend.only.skip", "it.extend.only.concurrent", "it.extend.only.sequential", "it.extend.only.todo", "it.extend.only.fails", "it.extend.concurrent.skip", "it.extend.concurrent.only", "it.extend.concurrent.sequential", "it.extend.concurrent.todo", "it.extend.concurrent.fails", "it.extend.sequential.skip", "it.extend.sequential.only", "it.extend.sequential.concurrent", "it.extend.sequential.todo", "it.extend.sequential.fails", "it.extend.todo.skip", "it.extend.todo.only", "it.extend.todo.concurrent", "it.extend.todo.sequential", "it.extend.todo.fails", "it.extend.fails.skip", "it.extend.fails.only", "it.extend.fails.concurrent", "it.extend.fails.sequential", "it.extend.fails.todo", "it.skipIf.skip.only", "it.skipIf.skip.concurrent", "it.skipIf.skip.sequential", "it.skipIf.skip.todo", "it.skipIf.skip.fails", "it.skipIf.only.skip", "it.skipIf.only.concurrent", "it.skipIf.only.sequential", "it.skipIf.only.todo", "it.skipIf.only.fails", "it.skipIf.concurrent.skip", "it.skipIf.concurrent.only", "it.skipIf.concurrent.sequential", "it.skipIf.concurrent.todo", "it.skipIf.concurrent.fails", "it.skipIf.sequential.skip", "it.skipIf.sequential.only", "it.skipIf.sequential.concurrent", "it.skipIf.sequential.todo", "it.skipIf.sequential.fails", "it.skipIf.todo.skip", "it.skipIf.todo.only", "it.skipIf.todo.concurrent", "it.skipIf.todo.sequential", "it.skipIf.todo.fails", "it.skipIf.fails.skip", "it.skipIf.fails.only", "it.skipIf.fails.concurrent", "it.skipIf.fails.sequential", "it.skipIf.fails.todo", "it.runIf.skip.only", "it.runIf.skip.concurrent", "it.runIf.skip.sequential", "it.runIf.skip.todo", "it.runIf.skip.fails", "it.runIf.only.skip", "it.runIf.only.concurrent", "it.runIf.only.sequential", "it.runIf.only.todo", "it.runIf.only.fails", "it.runIf.concurrent.skip", "it.runIf.concurrent.only", "it.runIf.concurrent.sequential", "it.runIf.concurrent.todo", "it.runIf.concurrent.fails", "it.runIf.sequential.skip", "it.runIf.sequential.only", "it.runIf.sequential.concurrent", "it.runIf.sequential.todo", "it.runIf.sequential.fails", "it.runIf.todo.skip", "it.runIf.todo.only", "it.runIf.todo.concurrent", "it.runIf.todo.sequential", "it.runIf.todo.fails", "it.runIf.fails.skip", "it.runIf.fails.only", "it.runIf.fails.concurrent", "it.runIf.fails.sequential", "it.runIf.fails.todo", "it.skip.only.each", "it.skip.concurrent.each", "it.skip.sequential.each", "it.skip.todo.each", "it.skip.fails.each", "it.only.skip.each", "it.only.concurrent.each", "it.only.sequential.each", "it.only.todo.each", "it.only.fails.each", "it.concurrent.skip.each", "it.concurrent.only.each", "it.concurrent.sequential.each", "it.concurrent.todo.each", "it.concurrent.fails.each", "it.sequential.skip.each", "it.sequential.only.each", "it.sequential.concurrent.each", "it.sequential.todo.each", "it.sequential.fails.each", "it.todo.skip.each", "it.todo.only.each", "it.todo.concurrent.each", "it.todo.sequential.each", "it.todo.fails.each", "it.fails.skip.each", "it.fails.only.each", "it.fails.concurrent.each", "it.fails.sequential.each", "it.fails.todo.each", "it.extend.skipIf.skip", "it.extend.skipIf.only", "it.extend.skipIf.concurrent", "it.extend.skipIf.sequential", "it.extend.skipIf.todo", "it.extend.skipIf.fails", "it.extend.runIf.skip", "it.extend.runIf.only", "it.extend.runIf.concurrent", "it.extend.runIf.sequential", "it.extend.runIf.todo", "it.extend.runIf.fails", "it.extend.skip.each", "it.extend.only.each", "it.extend.concurrent.each", "it.extend.sequential.each", "it.extend.todo.each", "it.extend.fails.each", "it.skipIf.skip.each", "it.skipIf.only.each", "it.skipIf.concurrent.each", "it.skipIf.sequential.each", "it.skipIf.todo.each", "it.skipIf.fails.each", "it.runIf.skip.each", "it.runIf.only.each", "it.runIf.concurrent.each", "it.runIf.sequential.each", "it.runIf.todo.each", "it.runIf.fails.each", "it.extend.skipIf.each", "it.extend.runIf.each", "test", "test.skip", "test.only", "test.concurrent", "test.sequential", "test.todo", "test.fails", "test.extend", "test.skipIf", "test.runIf", "test.each", "test.skip.only", "test.skip.concurrent", "test.skip.sequential", "test.skip.todo", "test.skip.fails", "test.only.skip", "test.only.concurrent", "test.only.sequential", "test.only.todo", "test.only.fails", "test.concurrent.skip", "test.concurrent.only", "test.concurrent.sequential", "test.concurrent.todo", "test.concurrent.fails", "test.sequential.skip", "test.sequential.only", "test.sequential.concurrent", "test.sequential.todo", "test.sequential.fails", "test.todo.skip", "test.todo.only", "test.todo.concurrent", "test.todo.sequential", "test.todo.fails", "test.fails.skip", "test.fails.only", "test.fails.concurrent", "test.fails.sequential", "test.fails.todo", "test.extend.skip", "test.extend.only", "test.extend.concurrent", "test.extend.sequential", "test.extend.todo", "test.extend.fails", "test.skipIf.skip", "test.skipIf.only", "test.skipIf.concurrent", "test.skipIf.sequential", "test.skipIf.todo", "test.skipIf.fails", "test.runIf.skip", "test.runIf.only", "test.runIf.concurrent", "test.runIf.sequential", "test.runIf.todo", "test.runIf.fails", "test.skip.each", "test.only.each", "test.concurrent.each", "test.sequential.each", "test.todo.each", "test.fails.each", "test.extend.skipIf", "test.extend.runIf", "test.extend.each", "test.skipIf.each", "test.runIf.each", "test.skip.only.concurrent", "test.skip.only.sequential", "test.skip.only.todo", "test.skip.only.fails", "test.skip.concurrent.only", "test.skip.concurrent.sequential", "test.skip.concurrent.todo", "test.skip.concurrent.fails", "test.skip.sequential.only", "test.skip.sequential.concurrent", "test.skip.sequential.todo", "test.skip.sequential.fails", "test.skip.todo.only", "test.skip.todo.concurrent", "test.skip.todo.sequential", "test.skip.todo.fails", "test.skip.fails.only", "test.skip.fails.concurrent", "test.skip.fails.sequential", "test.skip.fails.todo", "test.only.skip.concurrent", "test.only.skip.sequential", "test.only.skip.todo", "test.only.skip.fails", "test.only.concurrent.skip", "test.only.concurrent.sequential", "test.only.concurrent.todo", "test.only.concurrent.fails", "test.only.sequential.skip", "test.only.sequential.concurrent", "test.only.sequential.todo", "test.only.sequential.fails", "test.only.todo.skip", "test.only.todo.concurrent", "test.only.todo.sequential", "test.only.todo.fails", "test.only.fails.skip", "test.only.fails.concurrent", "test.only.fails.sequential", "test.only.fails.todo", "test.concurrent.skip.only", "test.concurrent.skip.sequential", "test.concurrent.skip.todo", "test.concurrent.skip.fails", "test.concurrent.only.skip", "test.concurrent.only.sequential", "test.concurrent.only.todo", "test.concurrent.only.fails", "test.concurrent.sequential.skip", "test.concurrent.sequential.only", "test.concurrent.sequential.todo", "test.concurrent.sequential.fails", "test.concurrent.todo.skip", "test.concurrent.todo.only", "test.concurrent.todo.sequential", "test.concurrent.todo.fails", "test.concurrent.fails.skip", "test.concurrent.fails.only", "test.concurrent.fails.sequential", "test.concurrent.fails.todo", "test.sequential.skip.only", "test.sequential.skip.concurrent", "test.sequential.skip.todo", "test.sequential.skip.fails", "test.sequential.only.skip", "test.sequential.only.concurrent", "test.sequential.only.todo", "test.sequential.only.fails", "test.sequential.concurrent.skip", "test.sequential.concurrent.only", "test.sequential.concurrent.todo", "test.sequential.concurrent.fails", "test.sequential.todo.skip", "test.sequential.todo.only", "test.sequential.todo.concurrent", "test.sequential.todo.fails", "test.sequential.fails.skip", "test.sequential.fails.only", "test.sequential.fails.concurrent", "test.sequential.fails.todo", "test.todo.skip.only", "test.todo.skip.concurrent", "test.todo.skip.sequential", "test.todo.skip.fails", "test.todo.only.skip", "test.todo.only.concurrent", "test.todo.only.sequential", "test.todo.only.fails", "test.todo.concurrent.skip", "test.todo.concurrent.only", "test.todo.concurrent.sequential", "test.todo.concurrent.fails", "test.todo.sequential.skip", "test.todo.sequential.only", "test.todo.sequential.concurrent", "test.todo.sequential.fails", "test.todo.fails.skip", "test.todo.fails.only", "test.todo.fails.concurrent", "test.todo.fails.sequential", "test.fails.skip.only", "test.fails.skip.concurrent", "test.fails.skip.sequential", "test.fails.skip.todo", "test.fails.only.skip", "test.fails.only.concurrent", "test.fails.only.sequential", "test.fails.only.todo", "test.fails.concurrent.skip", "test.fails.concurrent.only", "test.fails.concurrent.sequential", "test.fails.concurrent.todo", "test.fails.sequential.skip", "test.fails.sequential.only", "test.fails.sequential.concurrent", "test.fails.sequential.todo", "test.fails.todo.skip", "test.fails.todo.only", "test.fails.todo.concurrent", "test.fails.todo.sequential", "test.extend.skip.only", "test.extend.skip.concurrent", "test.extend.skip.sequential", "test.extend.skip.todo", "test.extend.skip.fails", "test.extend.only.skip", "test.extend.only.concurrent", "test.extend.only.sequential", "test.extend.only.todo", "test.extend.only.fails", "test.extend.concurrent.skip", "test.extend.concurrent.only", "test.extend.concurrent.sequential", "test.extend.concurrent.todo", "test.extend.concurrent.fails", "test.extend.sequential.skip", "test.extend.sequential.only", "test.extend.sequential.concurrent", "test.extend.sequential.todo", "test.extend.sequential.fails", "test.extend.todo.skip", "test.extend.todo.only", "test.extend.todo.concurrent", "test.extend.todo.sequential", "test.extend.todo.fails", "test.extend.fails.skip", "test.extend.fails.only", "test.extend.fails.concurrent", "test.extend.fails.sequential", "test.extend.fails.todo", "test.skipIf.skip.only", "test.skipIf.skip.concurrent", "test.skipIf.skip.sequential", "test.skipIf.skip.todo", "test.skipIf.skip.fails", "test.skipIf.only.skip", "test.skipIf.only.concurrent", "test.skipIf.only.sequential", "test.skipIf.only.todo", "test.skipIf.only.fails", "test.skipIf.concurrent.skip", "test.skipIf.concurrent.only", "test.skipIf.concurrent.sequential", "test.skipIf.concurrent.todo", "test.skipIf.concurrent.fails", "test.skipIf.sequential.skip", "test.skipIf.sequential.only", "test.skipIf.sequential.concurrent", "test.skipIf.sequential.todo", "test.skipIf.sequential.fails", "test.skipIf.todo.skip", "test.skipIf.todo.only", "test.skipIf.todo.concurrent", "test.skipIf.todo.sequential", "test.skipIf.todo.fails", "test.skipIf.fails.skip", "test.skipIf.fails.only", "test.skipIf.fails.concurrent", "test.skipIf.fails.sequential", "test.skipIf.fails.todo", "test.runIf.skip.only", "test.runIf.skip.concurrent", "test.runIf.skip.sequential", "test.runIf.skip.todo", "test.runIf.skip.fails", "test.runIf.only.skip", "test.runIf.only.concurrent", "test.runIf.only.sequential", "test.runIf.only.todo", "test.runIf.only.fails", "test.runIf.concurrent.skip", "test.runIf.concurrent.only", "test.runIf.concurrent.sequential", "test.runIf.concurrent.todo", "test.runIf.concurrent.fails", "test.runIf.sequential.skip", "test.runIf.sequential.only", "test.runIf.sequential.concurrent", "test.runIf.sequential.todo", "test.runIf.sequential.fails", "test.runIf.todo.skip", "test.runIf.todo.only", "test.runIf.todo.concurrent", "test.runIf.todo.sequential", "test.runIf.todo.fails", "test.runIf.fails.skip", "test.runIf.fails.only", "test.runIf.fails.concurrent", "test.runIf.fails.sequential", "test.runIf.fails.todo", "test.skip.only.each", "test.skip.concurrent.each", "test.skip.sequential.each", "test.skip.todo.each", "test.skip.fails.each", "test.only.skip.each", "test.only.concurrent.each", "test.only.sequential.each", "test.only.todo.each", "test.only.fails.each", "test.concurrent.skip.each", "test.concurrent.only.each", "test.concurrent.sequential.each", "test.concurrent.todo.each", "test.concurrent.fails.each", "test.sequential.skip.each", "test.sequential.only.each", "test.sequential.concurrent.each", "test.sequential.todo.each", "test.sequential.fails.each", "test.todo.skip.each", "test.todo.only.each", "test.todo.concurrent.each", "test.todo.sequential.each", "test.todo.fails.each", "test.fails.skip.each", "test.fails.only.each", "test.fails.concurrent.each", "test.fails.sequential.each", "test.fails.todo.each", "test.extend.skipIf.skip", "test.extend.skipIf.only", "test.extend.skipIf.concurrent", "test.extend.skipIf.sequential", "test.extend.skipIf.todo", "test.extend.skipIf.fails", "test.extend.runIf.skip", "test.extend.runIf.only", "test.extend.runIf.concurrent", "test.extend.runIf.sequential", "test.extend.runIf.todo", "test.extend.runIf.fails", "test.extend.skip.each", "test.extend.only.each", "test.extend.concurrent.each", "test.extend.sequential.each", "test.extend.todo.each", "test.extend.fails.each", "test.skipIf.skip.each", "test.skipIf.only.each", "test.skipIf.concurrent.each", "test.skipIf.sequential.each", "test.skipIf.todo.each", "test.skipIf.fails.each", "test.runIf.skip.each", "test.runIf.only.each", "test.runIf.concurrent.each", "test.runIf.sequential.each", "test.runIf.todo.each", "test.runIf.fails.each", "test.extend.skipIf.each", "test.extend.runIf.each", "bench", "bench.skip", "bench.only", "bench.todo", "bench.skipIf", "bench.runIf", "bench.skip.only", "bench.skip.todo", "bench.only.skip", "bench.only.todo", "bench.todo.skip", "bench.todo.only", "bench.skipIf.skip", "bench.skipIf.only", "bench.skipIf.todo", "bench.runIf.skip", "bench.runIf.only", "bench.runIf.todo", "bench.skip.only.todo", "bench.skip.todo.only", "bench.only.skip.todo", "bench.only.todo.skip", "bench.todo.skip.only", "bench.todo.only.skip", "bench.skipIf.skip.only", "bench.skipIf.skip.todo", "bench.skipIf.only.skip", "bench.skipIf.only.todo", "bench.skipIf.todo.skip", "bench.skipIf.todo.only", "bench.runIf.skip.only", "bench.runIf.skip.todo", "bench.runIf.only.skip", "bench.runIf.only.todo", "bench.runIf.todo.skip", "bench.runIf.todo.only", "describe", "describe.skip", "describe.only", "describe.concurrent", "describe.sequential", "describe.shuffle", "describe.todo", "describe.skipIf", "describe.runIf", "describe.each", "describe.skip.only", "describe.skip.concurrent", "describe.skip.sequential", "describe.skip.shuffle", "describe.skip.todo", "describe.only.skip", "describe.only.concurrent", "describe.only.sequential", "describe.only.shuffle", "describe.only.todo", "describe.concurrent.skip", "describe.concurrent.only", "describe.concurrent.sequential", "describe.concurrent.shuffle", "describe.concurrent.todo", "describe.sequential.skip", "describe.sequential.only", "describe.sequential.concurrent", "describe.sequential.shuffle", "describe.sequential.todo", "describe.shuffle.skip", "describe.shuffle.only", "describe.shuffle.concurrent", "describe.shuffle.sequential", "describe.shuffle.todo", "describe.todo.skip", "describe.todo.only", "describe.todo.concurrent", "describe.todo.sequential", "describe.todo.shuffle", "describe.skipIf.skip", "describe.skipIf.only", "describe.skipIf.concurrent", "describe.skipIf.sequential", "describe.skipIf.shuffle", "describe.skipIf.todo", "describe.runIf.skip", "describe.runIf.only", "describe.runIf.concurrent", "describe.runIf.sequential", "describe.runIf.shuffle", "describe.runIf.todo", "describe.skip.each", "describe.only.each", "describe.concurrent.each", "describe.sequential.each", "describe.shuffle.each", "describe.todo.each", "describe.skipIf.each", "describe.runIf.each", "describe.skip.only.concurrent", "describe.skip.only.sequential", "describe.skip.only.shuffle", "describe.skip.only.todo", "describe.skip.concurrent.only", "describe.skip.concurrent.sequential", "describe.skip.concurrent.shuffle", "describe.skip.concurrent.todo", "describe.skip.sequential.only", "describe.skip.sequential.concurrent", "describe.skip.sequential.shuffle", "describe.skip.sequential.todo", "describe.skip.shuffle.only", "describe.skip.shuffle.concurrent", "describe.skip.shuffle.sequential", "describe.skip.shuffle.todo", "describe.skip.todo.only", "describe.skip.todo.concurrent", "describe.skip.todo.sequential", "describe.skip.todo.shuffle", "describe.only.skip.concurrent", "describe.only.skip.sequential", "describe.only.skip.shuffle", "describe.only.skip.todo", "describe.only.concurrent.skip", "describe.only.concurrent.sequential", "describe.only.concurrent.shuffle", "describe.only.concurrent.todo", "describe.only.sequential.skip", "describe.only.sequential.concurrent", "describe.only.sequential.shuffle", "describe.only.sequential.todo", "describe.only.shuffle.skip", "describe.only.shuffle.concurrent", "describe.only.shuffle.sequential", "describe.only.shuffle.todo", "describe.only.todo.skip", "describe.only.todo.concurrent", "describe.only.todo.sequential", "describe.only.todo.shuffle", "describe.concurrent.skip.only", "describe.concurrent.skip.sequential", "describe.concurrent.skip.shuffle", "describe.concurrent.skip.todo", "describe.concurrent.only.skip", "describe.concurrent.only.sequential", "describe.concurrent.only.shuffle", "describe.concurrent.only.todo", "describe.concurrent.sequential.skip", "describe.concurrent.sequential.only", "describe.concurrent.sequential.shuffle", "describe.concurrent.sequential.todo", "describe.concurrent.shuffle.skip", "describe.concurrent.shuffle.only", "describe.concurrent.shuffle.sequential", "describe.concurrent.shuffle.todo", "describe.concurrent.todo.skip", "describe.concurrent.todo.only", "describe.concurrent.todo.sequential", "describe.concurrent.todo.shuffle", "describe.sequential.skip.only", "describe.sequential.skip.concurrent", "describe.sequential.skip.shuffle", "describe.sequential.skip.todo", "describe.sequential.only.skip", "describe.sequential.only.concurrent", "describe.sequential.only.shuffle", "describe.sequential.only.todo", "describe.sequential.concurrent.skip", "describe.sequential.concurrent.only", "describe.sequential.concurrent.shuffle", "describe.sequential.concurrent.todo", "describe.sequential.shuffle.skip", "describe.sequential.shuffle.only", "describe.sequential.shuffle.concurrent", "describe.sequential.shuffle.todo", "describe.sequential.todo.skip", "describe.sequential.todo.only", "describe.sequential.todo.concurrent", "describe.sequential.todo.shuffle", "describe.shuffle.skip.only", "describe.shuffle.skip.concurrent", "describe.shuffle.skip.sequential", "describe.shuffle.skip.todo", "describe.shuffle.only.skip", "describe.shuffle.only.concurrent", "describe.shuffle.only.sequential", "describe.shuffle.only.todo", "describe.shuffle.concurrent.skip", "describe.shuffle.concurrent.only", "describe.shuffle.concurrent.sequential", "describe.shuffle.concurrent.todo", "describe.shuffle.sequential.skip", "describe.shuffle.sequential.only", "describe.shuffle.sequential.concurrent", "describe.shuffle.sequential.todo", "describe.shuffle.todo.skip", "describe.shuffle.todo.only", "describe.shuffle.todo.concurrent", "describe.shuffle.todo.sequential", "describe.todo.skip.only", "describe.todo.skip.concurrent", "describe.todo.skip.sequential", "describe.todo.skip.shuffle", "describe.todo.only.skip", "describe.todo.only.concurrent", "describe.todo.only.sequential", "describe.todo.only.shuffle", "describe.todo.concurrent.skip", "describe.todo.concurrent.only", "describe.todo.concurrent.sequential", "describe.todo.concurrent.shuffle", "describe.todo.sequential.skip", "describe.todo.sequential.only", "describe.todo.sequential.concurrent", "describe.todo.sequential.shuffle", "describe.todo.shuffle.skip", "describe.todo.shuffle.only", "describe.todo.shuffle.concurrent", "describe.todo.shuffle.sequential", "describe.skipIf.skip.only", "describe.skipIf.skip.concurrent", "describe.skipIf.skip.sequential", "describe.skipIf.skip.shuffle", "describe.skipIf.skip.todo", "describe.skipIf.only.skip", "describe.skipIf.only.concurrent", "describe.skipIf.only.sequential", "describe.skipIf.only.shuffle", "describe.skipIf.only.todo", "describe.skipIf.concurrent.skip", "describe.skipIf.concurrent.only", "describe.skipIf.concurrent.sequential", "describe.skipIf.concurrent.shuffle", "describe.skipIf.concurrent.todo", "describe.skipIf.sequential.skip", "describe.skipIf.sequential.only", "describe.skipIf.sequential.concurrent", "describe.skipIf.sequential.shuffle", "describe.skipIf.sequential.todo", "describe.skipIf.shuffle.skip", "describe.skipIf.shuffle.only", "describe.skipIf.shuffle.concurrent", "describe.skipIf.shuffle.sequential", "describe.skipIf.shuffle.todo", "describe.skipIf.todo.skip", "describe.skipIf.todo.only", "describe.skipIf.todo.concurrent", "describe.skipIf.todo.sequential", "describe.skipIf.todo.shuffle", "describe.runIf.skip.only", "describe.runIf.skip.concurrent", "describe.runIf.skip.sequential", "describe.runIf.skip.shuffle", "describe.runIf.skip.todo", "describe.runIf.only.skip", "describe.runIf.only.concurrent", "describe.runIf.only.sequential", "describe.runIf.only.shuffle", "describe.runIf.only.todo", "describe.runIf.concurrent.skip", "describe.runIf.concurrent.only", "describe.runIf.concurrent.sequential", "describe.runIf.concurrent.shuffle", "describe.runIf.concurrent.todo", "describe.runIf.sequential.skip", "describe.runIf.sequential.only", "describe.runIf.sequential.concurrent", "describe.runIf.sequential.shuffle", "describe.runIf.sequential.todo", "describe.runIf.shuffle.skip", "describe.runIf.shuffle.only", "describe.runIf.shuffle.concurrent", "describe.runIf.shuffle.sequential", "describe.runIf.shuffle.todo", "describe.runIf.todo.skip", "describe.runIf.todo.only", "describe.runIf.todo.concurrent", "describe.runIf.todo.sequential", "describe.runIf.todo.shuffle", "describe.skip.only.each", "describe.skip.concurrent.each", "describe.skip.sequential.each", "describe.skip.shuffle.each", "describe.skip.todo.each", "describe.only.skip.each", "describe.only.concurrent.each", "describe.only.sequential.each", "describe.only.shuffle.each", "describe.only.todo.each", "describe.concurrent.skip.each", "describe.concurrent.only.each", "describe.concurrent.sequential.each", "describe.concurrent.shuffle.each", "describe.concurrent.todo.each", "describe.sequential.skip.each", "describe.sequential.only.each", "describe.sequential.concurrent.each", "describe.sequential.shuffle.each", "describe.sequential.todo.each", "describe.shuffle.skip.each", "describe.shuffle.only.each", "describe.shuffle.concurrent.each", "describe.shuffle.sequential.each", "describe.shuffle.todo.each", "describe.todo.skip.each", "describe.todo.only.each", "describe.todo.concurrent.each", "describe.todo.sequential.each", "describe.todo.shuffle.each", "describe.skipIf.skip.each", "describe.skipIf.only.each", "describe.skipIf.concurrent.each", "describe.skipIf.sequential.each", "describe.skipIf.shuffle.each", "describe.skipIf.todo.each", "describe.runIf.skip.each", "describe.runIf.only.each", "describe.runIf.concurrent.each", "describe.runIf.sequential.each", "describe.runIf.shuffle.each", "describe.runIf.todo.each", "suite", "suite.skip", "suite.only", "suite.concurrent", "suite.sequential", "suite.shuffle", "suite.todo", "suite.skipIf", "suite.runIf", "suite.each", "suite.skip.only", "suite.skip.concurrent", "suite.skip.sequential", "suite.skip.shuffle", "suite.skip.todo", "suite.only.skip", "suite.only.concurrent", "suite.only.sequential", "suite.only.shuffle", "suite.only.todo", "suite.concurrent.skip", "suite.concurrent.only", "suite.concurrent.sequential", "suite.concurrent.shuffle", "suite.concurrent.todo", "suite.sequential.skip", "suite.sequential.only", "suite.sequential.concurrent", "suite.sequential.shuffle", "suite.sequential.todo", "suite.shuffle.skip", "suite.shuffle.only", "suite.shuffle.concurrent", "suite.shuffle.sequential", "suite.shuffle.todo", "suite.todo.skip", "suite.todo.only", "suite.todo.concurrent", "suite.todo.sequential", "suite.todo.shuffle", "suite.skipIf.skip", "suite.skipIf.only", "suite.skipIf.concurrent", "suite.skipIf.sequential", "suite.skipIf.shuffle", "suite.skipIf.todo", "suite.runIf.skip", "suite.runIf.only", "suite.runIf.concurrent", "suite.runIf.sequential", "suite.runIf.shuffle", "suite.runIf.todo", "suite.skip.each", "suite.only.each", "suite.concurrent.each", "suite.sequential.each", "suite.shuffle.each", "suite.todo.each", "suite.skipIf.each", "suite.runIf.each", "suite.skip.only.concurrent", "suite.skip.only.sequential", "suite.skip.only.shuffle", "suite.skip.only.todo", "suite.skip.concurrent.only", "suite.skip.concurrent.sequential", "suite.skip.concurrent.shuffle", "suite.skip.concurrent.todo", "suite.skip.sequential.only", "suite.skip.sequential.concurrent", "suite.skip.sequential.shuffle", "suite.skip.sequential.todo", "suite.skip.shuffle.only", "suite.skip.shuffle.concurrent", "suite.skip.shuffle.sequential", "suite.skip.shuffle.todo", "suite.skip.todo.only", "suite.skip.todo.concurrent", "suite.skip.todo.sequential", "suite.skip.todo.shuffle", "suite.only.skip.concurrent", "suite.only.skip.sequential", "suite.only.skip.shuffle", "suite.only.skip.todo", "suite.only.concurrent.skip", "suite.only.concurrent.sequential", "suite.only.concurrent.shuffle", "suite.only.concurrent.todo", "suite.only.sequential.skip", "suite.only.sequential.concurrent", "suite.only.sequential.shuffle", "suite.only.sequential.todo", "suite.only.shuffle.skip", "suite.only.shuffle.concurrent", "suite.only.shuffle.sequential", "suite.only.shuffle.todo", "suite.only.todo.skip", "suite.only.todo.concurrent", "suite.only.todo.sequential", "suite.only.todo.shuffle", "suite.concurrent.skip.only", "suite.concurrent.skip.sequential", "suite.concurrent.skip.shuffle", "suite.concurrent.skip.todo", "suite.concurrent.only.skip", "suite.concurrent.only.sequential", "suite.concurrent.only.shuffle", "suite.concurrent.only.todo", "suite.concurrent.sequential.skip", "suite.concurrent.sequential.only", "suite.concurrent.sequential.shuffle", "suite.concurrent.sequential.todo", "suite.concurrent.shuffle.skip", "suite.concurrent.shuffle.only", "suite.concurrent.shuffle.sequential", "suite.concurrent.shuffle.todo", "suite.concurrent.todo.skip", "suite.concurrent.todo.only", "suite.concurrent.todo.sequential", "suite.concurrent.todo.shuffle", "suite.sequential.skip.only", "suite.sequential.skip.concurrent", "suite.sequential.skip.shuffle", "suite.sequential.skip.todo", "suite.sequential.only.skip", "suite.sequential.only.concurrent", "suite.sequential.only.shuffle", "suite.sequential.only.todo", "suite.sequential.concurrent.skip", "suite.sequential.concurrent.only", "suite.sequential.concurrent.shuffle", "suite.sequential.concurrent.todo", "suite.sequential.shuffle.skip", "suite.sequential.shuffle.only", "suite.sequential.shuffle.concurrent", "suite.sequential.shuffle.todo", "suite.sequential.todo.skip", "suite.sequential.todo.only", "suite.sequential.todo.concurrent", "suite.sequential.todo.shuffle", "suite.shuffle.skip.only", "suite.shuffle.skip.concurrent", "suite.shuffle.skip.sequential", "suite.shuffle.skip.todo", "suite.shuffle.only.skip", "suite.shuffle.only.concurrent", "suite.shuffle.only.sequential", "suite.shuffle.only.todo", "suite.shuffle.concurrent.skip", "suite.shuffle.concurrent.only", "suite.shuffle.concurrent.sequential", "suite.shuffle.concurrent.todo", "suite.shuffle.sequential.skip", "suite.shuffle.sequential.only", "suite.shuffle.sequential.concurrent", "suite.shuffle.sequential.todo", "suite.shuffle.todo.skip", "suite.shuffle.todo.only", "suite.shuffle.todo.concurrent", "suite.shuffle.todo.sequential", "suite.todo.skip.only", "suite.todo.skip.concurrent", "suite.todo.skip.sequential", "suite.todo.skip.shuffle", "suite.todo.only.skip", "suite.todo.only.concurrent", "suite.todo.only.sequential", "suite.todo.only.shuffle", "suite.todo.concurrent.skip", "suite.todo.concurrent.only", "suite.todo.concurrent.sequential", "suite.todo.concurrent.shuffle", "suite.todo.sequential.skip", "suite.todo.sequential.only", "suite.todo.sequential.concurrent", "suite.todo.sequential.shuffle", "suite.todo.shuffle.skip", "suite.todo.shuffle.only", "suite.todo.shuffle.concurrent", "suite.todo.shuffle.sequential", "suite.skipIf.skip.only", "suite.skipIf.skip.concurrent", "suite.skipIf.skip.sequential", "suite.skipIf.skip.shuffle", "suite.skipIf.skip.todo", "suite.skipIf.only.skip", "suite.skipIf.only.concurrent", "suite.skipIf.only.sequential", "suite.skipIf.only.shuffle", "suite.skipIf.only.todo", "suite.skipIf.concurrent.skip", "suite.skipIf.concurrent.only", "suite.skipIf.concurrent.sequential", "suite.skipIf.concurrent.shuffle", "suite.skipIf.concurrent.todo", "suite.skipIf.sequential.skip", "suite.skipIf.sequential.only", "suite.skipIf.sequential.concurrent", "suite.skipIf.sequential.shuffle", "suite.skipIf.sequential.todo", "suite.skipIf.shuffle.skip", "suite.skipIf.shuffle.only", "suite.skipIf.shuffle.concurrent", "suite.skipIf.shuffle.sequential", "suite.skipIf.shuffle.todo", "suite.skipIf.todo.skip", "suite.skipIf.todo.only", "suite.skipIf.todo.concurrent", "suite.skipIf.todo.sequential", "suite.skipIf.todo.shuffle", "suite.runIf.skip.only", "suite.runIf.skip.concurrent", "suite.runIf.skip.sequential", "suite.runIf.skip.shuffle", "suite.runIf.skip.todo", "suite.runIf.only.skip", "suite.runIf.only.concurrent", "suite.runIf.only.sequential", "suite.runIf.only.shuffle", "suite.runIf.only.todo", "suite.runIf.concurrent.skip", "suite.runIf.concurrent.only", "suite.runIf.concurrent.sequential", "suite.runIf.concurrent.shuffle", "suite.runIf.concurrent.todo", "suite.runIf.sequential.skip", "suite.runIf.sequential.only", "suite.runIf.sequential.concurrent", "suite.runIf.sequential.shuffle", "suite.runIf.sequential.todo", "suite.runIf.shuffle.skip", "suite.runIf.shuffle.only", "suite.runIf.shuffle.concurrent", "suite.runIf.shuffle.sequential", "suite.runIf.shuffle.todo", "suite.runIf.todo.skip", "suite.runIf.todo.only", "suite.runIf.todo.concurrent", "suite.runIf.todo.sequential", "suite.runIf.todo.shuffle", "suite.skip.only.each", "suite.skip.concurrent.each", "suite.skip.sequential.each", "suite.skip.shuffle.each", "suite.skip.todo.each", "suite.only.skip.each", "suite.only.concurrent.each", "suite.only.sequential.each", "suite.only.shuffle.each", "suite.only.todo.each", "suite.concurrent.skip.each", "suite.concurrent.only.each", "suite.concurrent.sequential.each", "suite.concurrent.shuffle.each", "suite.concurrent.todo.each", "suite.sequential.skip.each", "suite.sequential.only.each", "suite.sequential.concurrent.each", "suite.sequential.shuffle.each", "suite.sequential.todo.each", "suite.shuffle.skip.each", "suite.shuffle.only.each", "suite.shuffle.concurrent.each", "suite.shuffle.sequential.each", "suite.shuffle.todo.each", "suite.todo.skip.each", "suite.todo.only.each", "suite.todo.concurrent.each", "suite.todo.sequential.each", "suite.todo.shuffle.each", "suite.skipIf.skip.each", "suite.skipIf.only.each", "suite.skipIf.concurrent.each", "suite.skipIf.sequential.each", "suite.skipIf.shuffle.each", "suite.skipIf.todo.each", "suite.runIf.skip.each", "suite.runIf.only.each", "suite.runIf.concurrent.each", "suite.runIf.sequential.each", "suite.runIf.shuffle.each", "suite.runIf.todo.each", "xtest", "xtest.each", "xit", "xit.each", "fit", "xdescribe", "xdescribe.each", "fdescribe"]);

const isTypeOfVitestFnCall = (node, context, types) => {
  const vitestFnCall = parseVitestFnCall(node, context);
  return vitestFnCall !== null && types.includes(vitestFnCall.type);
};
const parseVitestFnCall = (node, context) => {
  const vitestFnCall = parseVitestFnCallWithReason(node, context);
  if (typeof vitestFnCall === "string")
    return null;
  return vitestFnCall;
};
const parseVitestFnCallCache = /* @__PURE__ */ new WeakMap();
const parseVitestFnCallWithReason = (node, context) => {
  let parsedVitestFnCall = parseVitestFnCallCache.get(node);
  if (parsedVitestFnCall)
    return parsedVitestFnCall;
  parsedVitestFnCall = parseVitestFnCallWithReasonInner(node, context);
  parseVitestFnCallCache.set(node, parsedVitestFnCall);
  return parsedVitestFnCall;
};
const determineVitestFnType = (name) => {
  if (name === "expect")
    return "expect";
  if (name === "expectTypeOf")
    return "expectTypeOf";
  if (name === "vi")
    return "vi";
  if (DescribeAlias.hasOwnProperty(name))
    return "describe";
  if (TestCaseName.hasOwnProperty(name))
    return "test";
  if (HookName.hasOwnProperty(name))
    return "hook";
  return "unknown";
};
const findModifiersAndMatcher = (members) => {
  const modifiers = [];
  for (const member of members) {
    if (member.parent?.type === AST_NODE_TYPES.MemberExpression && member.parent.parent?.type === AST_NODE_TYPES.CallExpression) {
      return {
        matcher: member,
        args: member.parent.parent.arguments,
        modifiers
      };
    }
    const name = getAccessorValue(member);
    if (modifiers.length === 0) {
      if (!ModifierName.hasOwnProperty(name))
        return "modifier-unknown";
    } else if (modifiers.length === 1) {
      if (name !== ModifierName.not)
        return "modifier-unknown";
      const firstModifier = getAccessorValue(modifiers[0]);
      if (firstModifier !== ModifierName.resolves && firstModifier !== ModifierName.rejects)
        return "modifier-unknown";
    } else {
      return "modifier-unknown";
    }
    modifiers.push(member);
  }
  return "matcher-not-found";
};
const parseVitestExpectCall = (typelessParsedVitestFnCall, type) => {
  const modifiersMatcher = findModifiersAndMatcher(typelessParsedVitestFnCall.members);
  if (typeof modifiersMatcher === "string")
    return modifiersMatcher;
  return {
    ...typelessParsedVitestFnCall,
    type,
    ...modifiersMatcher
  };
};
const findTopMostCallExpression = (node) => {
  let topMostCallExpression = node;
  let { parent } = node;
  while (parent) {
    if (parent.type === AST_NODE_TYPES.CallExpression) {
      topMostCallExpression = parent;
      parent = parent.parent;
      continue;
    }
    if (parent.type !== AST_NODE_TYPES.MemberExpression)
      break;
    parent = parent.parent;
  }
  return topMostCallExpression;
};
const parseVitestFnCallWithReasonInner = (node, context) => {
  const chain = getNodeChain(node);
  if (!chain?.length)
    return null;
  const [first, ...rest] = chain;
  const lastLink = getAccessorValue(chain[chain.length - 1]);
  if (lastLink === "each") {
    if (node.callee.type !== AST_NODE_TYPES.CallExpression && node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression)
      return null;
  }
  if (node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression && lastLink !== "each")
    return null;
  const resolved = resolveVitestFn(context, node, getAccessorValue(first));
  if (!resolved)
    return null;
  const name = resolved.original ?? resolved.local;
  const links = [name, ...rest.map(getAccessorValue)];
  if (name !== "vi" && name !== "expect" && name !== "expectTypeOf" && !ValidVitestFnCallChains.has(links.join(".")))
    return null;
  const parsedVitestFnCall = {
    name,
    head: { ...resolved, node: first },
    members: rest
  };
  const type = determineVitestFnType(name);
  if (type === "expect" || type === "expectTypeOf") {
    const result = parseVitestExpectCall(parsedVitestFnCall, type);
    if (typeof result === "string" && findTopMostCallExpression(node) !== node)
      return null;
    if (result === "matcher-not-found") {
      if (node.parent?.type === AST_NODE_TYPES.MemberExpression)
        return "matcher-not-called";
    }
    return result;
  }
  if (chain.slice(0, chain.length - 1).some((node2) => node2.parent?.type !== AST_NODE_TYPES.MemberExpression))
    return null;
  if (node.parent?.type === AST_NODE_TYPES.CallExpression || node.parent?.type === AST_NODE_TYPES.MemberExpression)
    return null;
  return { ...parsedVitestFnCall, type };
};
const joinChains = (a, b) => a && b ? [...a, ...b] : null;
function getNodeChain(node) {
  if (isSupportedAccessor(node))
    return [node];
  switch (node.type) {
    case AST_NODE_TYPES.TaggedTemplateExpression:
      return getNodeChain(node.tag);
    case AST_NODE_TYPES.MemberExpression:
      return joinChains(getNodeChain(node.object), getNodeChain(node.property));
    case AST_NODE_TYPES.CallExpression:
      return getNodeChain(node.callee);
  }
  return null;
}
const resolveVitestFn = (context, node, identifier) => {
  const scope = context.sourceCode.getScope ? context.sourceCode.getScope(node) : context.getScope();
  const maybeImport = resolveScope(scope, identifier);
  if (maybeImport === "local")
    return null;
  if (maybeImport) {
    if (maybeImport.source === "vitest") {
      return {
        original: maybeImport.imported,
        local: maybeImport.local,
        type: "import"
      };
    }
    return null;
  }
  return {
    original: resolvePossibleAliasedGlobal(identifier, context),
    local: identifier,
    type: "global"
  };
};
const resolvePossibleAliasedGlobal = (global, context) => {
  const globalAliases = context.settings.vitest?.globalAliases ?? {};
  const alias = Object.entries(globalAliases).find(([_, aliases]) => aliases.includes(global));
  if (alias)
    return alias[0];
  return null;
};
const resolveScope = (scope, identifier) => {
  let currentScope = scope;
  while (currentScope !== null) {
    const ref = currentScope.set.get(identifier);
    if (ref && ref.defs.length > 0) {
      const def = ref.defs[ref.defs.length - 1];
      const importDetails = describePossibleImportDef(def);
      if (importDetails?.local === identifier)
        return importDetails;
      return "local";
    }
    currentScope = currentScope.upper;
  }
  return null;
};
const findImportSourceNode = (node) => {
  if (node.type === AST_NODE_TYPES.AwaitExpression) {
    if (node.argument.type === AST_NODE_TYPES.ImportExpression)
      return node.argument.source;
    return null;
  }
  if (node.type === AST_NODE_TYPES.CallExpression && isIdentifier(node.callee, "require"))
    return node.arguments[0] ?? null;
  return null;
};
const describeImportDefAsImport = (def) => {
  if (def.parent.type === AST_NODE_TYPES.TSImportEqualsDeclaration)
    return null;
  if (def.node.type !== AST_NODE_TYPES.ImportSpecifier)
    return null;
  if (def.parent.importKind === "type")
    return null;
  return {
    source: def.parent.source.value,
    imported: def.node.imported.name,
    local: def.node.local.name
  };
};
const describePossibleImportDef = (def) => {
  if (def.type === "Variable")
    return describeVariableDefAsImport(def);
  if (def.type === "ImportBinding")
    return describeImportDefAsImport(def);
  return null;
};
const describeVariableDefAsImport = (def) => {
  if (!def.node.init)
    return null;
  const sourceNode = findImportSourceNode(def.node.init);
  if (!sourceNode || !isStringNode(sourceNode))
    return null;
  if (def.name.parent?.type !== AST_NODE_TYPES.Property)
    return null;
  if (!isSupportedAccessor(def.name.parent.key))
    return null;
  return {
    source: getStringValue(sourceNode),
    imported: getAccessorValue(def.name.parent.key),
    local: def.name.name
  };
};
const getTestCallExpressionsFromDeclaredVariables = (declaredVariables, context) => {
  return declaredVariables.reduce(
    (acc, { references }) => acc.concat(
      references.map(({ identifier }) => identifier.parent).filter(
        (node) => node?.type === AST_NODE_TYPES.CallExpression && isTypeOfVitestFnCall(node, context, ["test"])
      )
    ),
    []
  );
};
const getFirstMatcherArg = (expectFnCall) => {
  const [firstArg] = expectFnCall.args;
  if (firstArg.type === AST_NODE_TYPES.SpreadElement)
    return firstArg;
  return followTypeAssertionChain(firstArg);
};
const isTypeCastExpression = (node) => node.type === AST_NODE_TYPES.TSAsExpression || node.type === AST_NODE_TYPES.TSTypeAssertion;
const followTypeAssertionChain = (expression) => isTypeCastExpression(expression) ? followTypeAssertionChain(expression.expression) : expression;

const RULE_NAME$X = "prefer-lowercase-title";
const hasStringAsFirstArgument = (node) => node.arguments[0] && isStringNode(node.arguments[0]);
const populateIgnores = (ignore) => {
  const ignores = [];
  if (ignore.includes(DescribeAlias.describe))
    ignores.push(...Object.keys(DescribeAlias));
  if (ignore.includes(TestCaseName.test)) {
    ignores.push(
      ...Object.keys(TestCaseName).filter((k) => k.endsWith(TestCaseName.test))
    );
  }
  if (ignore.includes(TestCaseName.it)) {
    ignores.push(
      ...Object.keys(TestCaseName).filter((k) => k.endsWith(TestCaseName.it))
    );
  }
  return ignores;
};
const lowerCaseTitle = createEslintRule({
  name: RULE_NAME$X,
  meta: {
    type: "problem",
    docs: {
      description: "enforce lowercase titles",
      recommended: false
    },
    fixable: "code",
    messages: {
      lowerCaseTitle: "`{{ method }}`s should begin with lowercase",
      fullyLowerCaseTitle: "`{{ method }}`s should be lowercase"
    },
    schema: [
      {
        type: "object",
        properties: {
          ignore: {
            type: "array",
            items: {
              type: "string",
              enum: [
                DescribeAlias.describe,
                TestCaseName.test,
                TestCaseName.it
              ]
            }
          },
          allowedPrefixes: {
            type: "array",
            items: { type: "string" },
            additionalItems: false
          },
          ignoreTopLevelDescribe: {
            type: "boolean",
            default: false
          },
          lowercaseFirstCharacterOnly: {
            type: "boolean",
            default: true
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [
    { ignore: [], allowedPrefixes: [], ignoreTopLevelDescribe: false, lowercaseFirstCharacterOnly: true }
  ],
  create: (context, [{ ignore = [], allowedPrefixes = [], ignoreTopLevelDescribe = false, lowercaseFirstCharacterOnly = false }]) => {
    const ignores = populateIgnores(ignore);
    let numberOfDescribeBlocks = 0;
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (!vitestFnCall || !hasStringAsFirstArgument)
          return;
        if (vitestFnCall?.type === "describe") {
          numberOfDescribeBlocks++;
          if (ignoreTopLevelDescribe && numberOfDescribeBlocks === 1)
            return;
        } else if (vitestFnCall?.type !== "test") {
          return;
        }
        const [firstArgument] = node.arguments;
        const description = getStringValue(firstArgument);
        if (typeof description !== "string")
          return;
        if (allowedPrefixes.some((prefix) => description.startsWith(prefix)))
          return;
        const firstCharacter = description.charAt(0);
        if (ignores.includes(vitestFnCall.name) || lowercaseFirstCharacterOnly && (!firstCharacter || firstCharacter === firstCharacter.toLowerCase()) || !lowercaseFirstCharacterOnly && description === description.toLowerCase())
          return;
        context.report({
          messageId: lowercaseFirstCharacterOnly ? "lowerCaseTitle" : "fullyLowerCaseTitle",
          node: node.arguments[0],
          data: {
            method: vitestFnCall.name
          },
          fix: (fixer) => {
            const description2 = getStringValue(firstArgument);
            const rangeIgnoreQuotes = [
              firstArgument.range[0] + 1,
              firstArgument.range[1] - 1
            ];
            const newDescription = lowercaseFirstCharacterOnly ? description2.substring(0, 1).toLowerCase() + description2.substring(1) : description2.toLowerCase();
            return [fixer.replaceTextRange(rangeIgnoreQuotes, newDescription)];
          }
        });
      },
      "CallExpression:exit"(node) {
        if (isTypeOfVitestFnCall(node, context, ["describe"]))
          numberOfDescribeBlocks--;
      }
    };
  }
});

const RULE_NAME$W = "max-nested-describe";
const maxNestedDescribe = createEslintRule({
  name: RULE_NAME$W,
  meta: {
    type: "problem",
    docs: {
      description: "require describe block to be less than set max value or default value",
      recommended: false
    },
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "number"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      maxNestedDescribe: "Nested describe block should be less than set max value."
    }
  },
  defaultOptions: [
    {
      max: 5
    }
  ],
  create(context, [{ max }]) {
    const stack = [];
    function pushStack(node) {
      if (node.parent?.type !== "CallExpression")
        return;
      if (node.parent.callee.type !== "Identifier" || node.parent.callee.name !== "describe")
        return;
      stack.push(0);
      if (stack.length > max) {
        context.report({
          node: node.parent,
          messageId: "maxNestedDescribe"
        });
      }
    }
    function popStack(node) {
      if (node.parent?.type !== "CallExpression")
        return;
      if (node.parent.callee.type !== "Identifier" || node.parent.callee.name !== "describe")
        return;
      stack.pop();
    }
    return {
      "FunctionExpression": pushStack,
      "FunctionExpression:exit": popStack,
      "ArrowFunctionExpression": pushStack,
      "ArrowFunctionExpression:exit": popStack
    };
  }
});

const RULE_NAME$V = "no-identical-title";
const newDescribeContext = () => ({
  describeTitles: [],
  testTitles: []
});
const noIdenticalTitle = createEslintRule({
  name: RULE_NAME$V,
  meta: {
    type: "problem",
    docs: {
      description: "disallow identical titles",
      recommended: false
    },
    fixable: "code",
    schema: [],
    messages: {
      multipleTestTitle: "Test is used multiple times in the same describe(suite) block",
      multipleDescribeTitle: "Describe is used multiple times in the same describe(suite) block"
    }
  },
  defaultOptions: [],
  create(context) {
    const stack = [newDescribeContext()];
    return {
      CallExpression(node) {
        const currentStack = stack[stack.length - 1];
        const vitestFnCall = parseVitestFnCall(node, context);
        if (!vitestFnCall)
          return;
        if (vitestFnCall.name === "describe" || vitestFnCall.name === "suite")
          stack.push(newDescribeContext());
        if (vitestFnCall.members.find((s) => isSupportedAccessor(s, "each")))
          return;
        const [argument] = node.arguments;
        if (!argument || !isStringNode(argument))
          return;
        const title = getStringValue(argument);
        if (vitestFnCall.type === "test") {
          if (currentStack?.testTitles.includes(title)) {
            context.report({
              node,
              messageId: "multipleTestTitle"
            });
          }
          currentStack?.testTitles.push(title);
        }
        if (vitestFnCall.type !== "describe")
          return;
        if (currentStack?.describeTitles.includes(title)) {
          context.report({
            node,
            messageId: "multipleDescribeTitle"
          });
        }
        currentStack?.describeTitles.push(title);
      },
      "CallExpression:exit"(node) {
        if (isTypeOfVitestFnCall(node, context, ["describe"]))
          stack.pop();
      }
    };
  }
});

const RULE_NAME$U = "no-focused-tests";
const isTestOrDescribe = (node) => {
  return node.type === "Identifier" && ["it", "test", "describe"].includes(node.name);
};
const isOnly = (node) => {
  return node.type === "Identifier" && node.name === "only";
};
const noFocusedTests = createEslintRule({
  name: RULE_NAME$U,
  meta: {
    type: "problem",
    docs: {
      description: "disallow focused tests",
      recommended: false
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          fixable: {
            type: "boolean",
            default: true
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      noFocusedTests: "Focused tests are not allowed."
    }
  },
  defaultOptions: [{ fixable: true }],
  create: (context) => {
    const fixable = context.options[0]?.fixable;
    return {
      ExpressionStatement(node) {
        if (node.expression.type === "CallExpression") {
          const { callee } = node.expression;
          if (callee.type === "MemberExpression" && isTestOrDescribe(callee.object) && isOnly(callee.property)) {
            context.report({
              node: callee.property,
              messageId: "noFocusedTests",
              fix: (fixer) => fixable ? fixer.removeRange([callee.property.range[0] - 1, callee.property.range[1]]) : null
            });
          }
          if (callee.type === "TaggedTemplateExpression") {
            const tagCall = callee.tag.type === "MemberExpression" ? callee.tag.object : null;
            if (!tagCall)
              return;
            if (tagCall.type === "MemberExpression" && isTestOrDescribe(tagCall.object) && isOnly(tagCall.property)) {
              context.report({
                node: tagCall.property,
                messageId: "noFocusedTests",
                fix: (fixer) => fixable ? fixer.removeRange([tagCall.property.range[0] - 1, tagCall.property.range[1]]) : null
              });
            }
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type === "CallExpression") {
          const { callee } = node.callee;
          if (callee.type === "MemberExpression" && callee.object.type === "MemberExpression" && isTestOrDescribe(callee.object.object) && isOnly(callee.object.property) && callee.property.type === "Identifier" && callee.property.name === "each") {
            const onlyCallee = callee.object.property;
            context.report({
              node: callee.object.property,
              messageId: "noFocusedTests",
              fix: (fixer) => fixable ? fixer.removeRange([
                onlyCallee.range[0] - 1,
                onlyCallee.range[1]
              ]) : null
            });
          }
        }
      }
    };
  }
});

const RULE_NAME$T = "no-conditional-tests";
const noConditionalTest = createEslintRule({
  name: RULE_NAME$T,
  meta: {
    type: "problem",
    docs: {
      description: "disallow conditional tests",
      recommended: false
    },
    schema: [],
    messages: {
      noConditionalTests: "Avoid using if conditions in a test."
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      Identifier: function(node) {
        if (["test", "it", "describe"].includes(node.name)) {
          if (node.parent?.parent?.parent?.parent?.type === "IfStatement") {
            context.report({
              node,
              messageId: "noConditionalTests"
            });
          }
        }
      }
    };
  }
});

const DEFAULTS = {
  typecheck: false
};
function parsePluginSettings(settings) {
  const pluginSettings = typeof settings.vitest !== "object" || settings.vitest === null ? {} : settings.vitest;
  return {
    ...DEFAULTS,
    ...pluginSettings
  };
}

const RULE_NAME$S = "expect-expect";
function matchesAssertFunctionName(nodeName, patterns) {
  return patterns.some(
    (p) => new RegExp(
      `^${p.split(".").map((x) => {
        if (x === "**")
          return "[a-z\\d\\.]*";
        return x.replace(/\*/gu, "[a-z\\d]*");
      }).join("\\.")}(\\.|$)`,
      "ui"
    ).test(nodeName)
  );
}
const expectExpect = createEslintRule({
  name: RULE_NAME$S,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce having expectation in test body",
      recommended: false
    },
    schema: [
      {
        type: "object",
        properties: {
          assertFunctionNames: {
            type: "array",
            items: [{ type: "string" }]
          },
          additionalTestBlockFunctions: {
            type: "array",
            items: { type: "string" }
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      noAssertions: "Test has no assertions"
    }
  },
  defaultOptions: [{ assertFunctionNames: ["expect", "assert"], additionalTestBlockFunctions: [] }],
  create(context, [{ assertFunctionNames = ["expect"], additionalTestBlockFunctions = [] }]) {
    const unchecked = [];
    const settings = parsePluginSettings(context.settings);
    if (settings.typecheck)
      assertFunctionNames.push("expectTypeOf", "assertType");
    function checkCallExpression(nodes) {
      for (const node of nodes) {
        const index = node.type === AST_NODE_TYPES.CallExpression ? unchecked.indexOf(node) : -1;
        if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
          const declaredVariables = context.sourceCode.getDeclaredVariables(node);
          const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(declaredVariables, context);
          checkCallExpression(testCallExpressions);
        }
        if (index !== -1) {
          unchecked.splice(index, 1);
          break;
        }
      }
    }
    return {
      CallExpression(node) {
        if (node.callee.type === AST_NODE_TYPES.Identifier && node.callee.name === "bench")
          return;
        if (node?.callee?.type === AST_NODE_TYPES.MemberExpression && node.callee.property.type === AST_NODE_TYPES.Identifier && node.callee.property.name === "extend")
          return;
        if (node?.callee?.type === AST_NODE_TYPES.MemberExpression && node.callee.property.type === AST_NODE_TYPES.Identifier && node.callee.property.name === "skip")
          return;
        const name = getNodeName(node) ?? "";
        if (isTypeOfVitestFnCall(node, context, ["test"]) || additionalTestBlockFunctions.includes(name)) {
          if (node.callee.type === AST_NODE_TYPES.MemberExpression && isSupportedAccessor(node.callee.property, "todo"))
            return;
          unchecked.push(node);
        } else if (matchesAssertFunctionName(name, assertFunctionNames)) {
          checkCallExpression(context.sourceCode.getAncestors(node));
        }
      },
      "Program:exit"() {
        unchecked.forEach((node) => {
          context.report({
            node: node.callee,
            messageId: "noAssertions"
          });
        });
      }
    };
  }
});

const RULE_NAME$R = "consistent-test-it";
const buildFixer = (callee, nodeName, preferredTestKeyword) => (fixer) => [
  fixer.replaceText(
    callee.type === AST_NODE_TYPES.MemberExpression ? callee.object : callee,
    getPreferredNodeName(nodeName, preferredTestKeyword)
  )
];
function getPreferredNodeName(nodeName, preferredTestKeyword) {
  if (nodeName === TestCaseName.fit)
    return "test.only";
  return nodeName.startsWith("f") || nodeName.startsWith("x") ? nodeName.charAt(0) + preferredTestKeyword : preferredTestKeyword;
}
function getOppositeTestKeyword(test) {
  if (test === TestCaseName.test)
    return TestCaseName.it;
  return TestCaseName.test;
}
const consistentTestIt = createEslintRule({
  name: RULE_NAME$R,
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description: "enforce using test or it but not both",
      recommended: false
    },
    messages: {
      consistentMethod: "Prefer using {{ testFnKeyWork }} instead of {{ oppositeTestKeyword }}",
      consistentMethodWithinDescribe: "Prefer using {{ testKeywordWithinDescribe }} instead of {{ oppositeTestKeyword }} within describe"
    },
    schema: [
      {
        type: "object",
        properties: {
          fn: {
            type: "string",
            enum: [TestCaseName.test, TestCaseName.it]
          },
          withinDescribe: {
            type: "string",
            enum: [TestCaseName.test, TestCaseName.it]
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [{ fn: TestCaseName.test, withinDescribe: TestCaseName.it }],
  create(context) {
    const config = context.options[0] ?? {};
    const testFnKeyWork = config.fn || TestCaseName.test;
    const testKeywordWithinDescribe = config?.withinDescribe || config?.fn || TestCaseName?.it;
    const testFnDisabled = testFnKeyWork === testKeywordWithinDescribe ? testFnKeyWork : void 0;
    let describeNestingLevel = 0;
    return {
      ImportDeclaration(node) {
        if (testFnDisabled == null)
          return;
        if (node.source.type !== "Literal" || node.source.value !== "vitest")
          return;
        const oppositeTestKeyword = getOppositeTestKeyword(testFnDisabled);
        for (const specifier of node.specifiers) {
          if (specifier.type !== "ImportSpecifier")
            continue;
          if (specifier.local.name !== specifier.imported.name)
            continue;
          if (specifier.local.name === oppositeTestKeyword) {
            context.report({
              node: specifier,
              data: { testFnKeyWork, oppositeTestKeyword },
              messageId: "consistentMethod",
              fix: (fixer) => fixer.replaceText(
                specifier.local,
                testFnDisabled
              )
            });
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type === AST_NODE_TYPES.Identifier && node.callee.name === "bench")
          return;
        const vitestFnCall = parseVitestFnCall(node, context);
        if (!vitestFnCall)
          return;
        if (vitestFnCall.type === "describe") {
          describeNestingLevel++;
          return;
        }
        const funcNode = node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression ? node.callee.tag : node.callee.type === AST_NODE_TYPES.CallExpression ? node.callee.callee : node.callee;
        if (vitestFnCall.type === "test" && describeNestingLevel === 0 && !vitestFnCall.name.endsWith(testFnKeyWork)) {
          const oppositeTestKeyword = getOppositeTestKeyword(testFnKeyWork);
          context.report({
            node: node.callee,
            data: { testFnKeyWork, oppositeTestKeyword },
            messageId: "consistentMethod",
            fix: buildFixer(funcNode, vitestFnCall.name, testFnKeyWork)
          });
        } else if (vitestFnCall.type === "test" && describeNestingLevel > 0 && !vitestFnCall.name.endsWith(testKeywordWithinDescribe)) {
          const oppositeTestKeyword = getOppositeTestKeyword(testKeywordWithinDescribe);
          context.report({
            messageId: "consistentMethodWithinDescribe",
            node: node.callee,
            data: { testKeywordWithinDescribe, oppositeTestKeyword },
            fix: buildFixer(funcNode, vitestFnCall.name, testKeywordWithinDescribe)
          });
        }
      },
      "CallExpression:exit"(node) {
        if (isTypeOfVitestFnCall(node, context, ["describe"]))
          describeNestingLevel--;
      }
    };
  }
});

const RULE_NAME$Q = "prefer-to-be";
const isNullLiteral = (node) => node.type === AST_NODE_TYPES.Literal && node.value === null;
const isNullEqualityMatcher = (expectFnCall) => isNullLiteral(getFirstMatcherArg(expectFnCall));
const isFirstArgumentIdentifier = (expectFnCall, name) => isIdentifier(getFirstMatcherArg(expectFnCall), name);
const isFloat = (v) => Math.floor(v) !== Math.ceil(v);
const shouldUseToBe = (expectFnCall) => {
  let firstArg = getFirstMatcherArg(expectFnCall);
  if (firstArg.type === AST_NODE_TYPES.Literal && typeof firstArg.value === "number" && isFloat(firstArg.value))
    return false;
  if (firstArg.type === AST_NODE_TYPES.UnaryExpression && firstArg.operator === "-")
    firstArg = firstArg.argument;
  if (firstArg.type === AST_NODE_TYPES.Literal) {
    return !("regex" in firstArg);
  }
  return firstArg.type === AST_NODE_TYPES.TemplateLiteral;
};
const reportPreferToBe = (context, whatToBe, expectFnCall, func, modifierNode) => {
  context.report({
    messageId: `useToBe${whatToBe}`,
    fix(fixer) {
      const fixes = [
        replaceAccessorFixer(fixer, expectFnCall.matcher, `toBe${whatToBe}`)
      ];
      if (expectFnCall.args?.length && whatToBe !== "")
        fixes.push(removeExtraArgumentsFixer(fixer, context, func, 0));
      if (modifierNode) {
        fixes.push(
          fixer.removeRange([modifierNode.range[0] - 1, modifierNode.range[1]])
        );
      }
      return fixes;
    },
    node: expectFnCall.matcher
  });
};
const preferToBe = createEslintRule({
  name: RULE_NAME$Q,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using toBe()",
      recommended: false
    },
    schema: [],
    fixable: "code",
    messages: {
      useToBe: "Use `toBe` instead",
      useToBeUndefined: "Use `toBeUndefined()` instead",
      useToBeDefined: "Use `toBeDefined()` instead",
      useToBeNull: "Use `toBeNull()` instead",
      useToBeNaN: "Use `toBeNaN()` instead"
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect")
          return;
        const matcherName = getAccessorValue(vitestFnCall.matcher);
        const notModifier = vitestFnCall.modifiers.find((node2) => getAccessorValue(node2) === "not");
        if (notModifier && ["toBeUndefined", "toBeDefined"].includes(matcherName)) {
          reportPreferToBe(context, matcherName === "toBeDefined" ? "Undefined" : "Defined", vitestFnCall, node, notModifier);
          return;
        }
        if (!EqualityMatcher.hasOwnProperty(matcherName) || vitestFnCall.args.length === 0)
          return;
        if (isNullEqualityMatcher(vitestFnCall)) {
          reportPreferToBe(context, "Null", vitestFnCall, node);
          return;
        }
        if (isFirstArgumentIdentifier(vitestFnCall, "undefined")) {
          const name = notModifier ? "Defined" : "Undefined";
          reportPreferToBe(context, name, vitestFnCall, node);
          return;
        }
        if (isFirstArgumentIdentifier(vitestFnCall, "NaN")) {
          reportPreferToBe(context, "NaN", vitestFnCall, node);
          return;
        }
        if (shouldUseToBe(vitestFnCall) && matcherName !== EqualityMatcher.toBe)
          reportPreferToBe(context, "", vitestFnCall, node);
      }
    };
  }
});

const RULE_NAME$P = "no-hooks";
const noHooks = createEslintRule({
  name: RULE_NAME$P,
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow setup and teardown hooks",
      recommended: false
    },
    schema: [{
      type: "object",
      properties: {
        allow: {
          type: "array",
          //@ts-ignore
          contains: ["beforeAll", "beforeEach", "afterAll", "afterEach"]
        }
      },
      additionalProperties: false
    }],
    messages: {
      unexpectedHook: "Unexpected '{{ hookName }}' hook"
    }
  },
  defaultOptions: [{ allow: [] }],
  create(context, [{ allow = [] }]) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type === "hook" && !allow.includes(vitestFnCall.name)) {
          context.report({
            node,
            messageId: "unexpectedHook",
            data: { hookName: vitestFnCall.name }
          });
        }
      }
    };
  }
});

const RULE_NAME$O = "no-restricted-vi-methods";
const noRestrictedViMethods = createEslintRule({
  name: RULE_NAME$O,
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow specific `vi.` methods",
      recommended: false
    },
    schema: [{
      type: "object",
      additionalProperties: { type: ["string", "null"] }
    }],
    messages: {
      restrictedViMethod: "Use of `{{ restriction }}` is disallowed",
      restrictedViMethodWithMessage: "{{ message }}"
    }
  },
  defaultOptions: [{}],
  create(context, [restrictedMethods]) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "vi" || vitestFnCall.members.length === 0)
          return;
        const method = getAccessorValue(vitestFnCall.members[0]);
        if (method in restrictedMethods) {
          const message = restrictedMethods[method];
          context.report({
            messageId: message ? "restrictedViMethodWithMessage" : "restrictedViMethod",
            data: { message, restriction: method },
            loc: {
              start: vitestFnCall.members[0].loc.start,
              end: vitestFnCall.members[vitestFnCall.members.length - 1].loc.end
            }
          });
        }
      }
    };
  }
});

const RULE_NAME$N = "consistent-test-filename";
const defaultPattern = /.*\.test\.[tj]sx?$/;
const defaultTestsPattern = /.*\.(test|spec)\.[tj]sx?$/;
const consistentTestFilename = createEslintRule({
  name: RULE_NAME$N,
  meta: {
    type: "problem",
    docs: {
      recommended: false,
      requiresTypeChecking: false,
      description: "require .spec test file pattern"
    },
    messages: {
      consistentTestFilename: "use test file name pattern {{pattern}}"
    },
    schema: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          pattern: {
            //@ts-ignore
            format: "regex",
            default: defaultPattern.source
          },
          allTestPattern: {
            //@ts-ignore
            format: "regex",
            default: defaultTestsPattern.source
          }
        }
      }
    ]
  },
  defaultOptions: [{ pattern: defaultTestsPattern.source, allTestPattern: defaultTestsPattern.source }],
  create: (context) => {
    const config = context.options[0] ?? {};
    const { pattern: patternRaw = defaultPattern, allTestPattern: allTestPatternRaw = defaultTestsPattern } = config;
    const pattern = typeof patternRaw === "string" ? new RegExp(patternRaw) : patternRaw;
    const testPattern = typeof allTestPatternRaw === "string" ? new RegExp(allTestPatternRaw) : allTestPatternRaw;
    const filename = path.basename(context.filename);
    if (!testPattern.test(filename))
      return {};
    return {
      Program: (p) => {
        if (!pattern.test(filename)) {
          context.report({
            node: p,
            messageId: "consistentTestFilename",
            data: {
              pattern: pattern.source
            }
          });
        }
      }
    };
  }
});

const RULE_NAME$M = "max-expects";
const maxExpect = createEslintRule({
  name: RULE_NAME$M,
  meta: {
    docs: {
      requiresTypeChecking: false,
      recommended: false,
      description: "enforce a maximum number of expect per test"
    },
    messages: {
      maxExpect: "Too many assertion calls ({{count}}). Maximum is {{max}}."
    },
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "number"
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [{ max: 5 }],
  create(context, [{ max }]) {
    let assertsCount = 0;
    const resetAssertCount = (node) => {
      const isFunctionTest = node.parent?.type !== AST_NODE_TYPES.CallExpression || isTypeOfVitestFnCall(node.parent, context, ["test"]);
      if (isFunctionTest)
        assertsCount = 0;
    };
    return {
      "FunctionExpression": resetAssertCount,
      "FunctionExpression:exit": resetAssertCount,
      "ArrowFunctionExpression": resetAssertCount,
      "ArrowFunctionExpression:exit": resetAssertCount,
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect" || vitestFnCall.head.node.parent?.type === AST_NODE_TYPES.MemberExpression)
          return;
        assertsCount += 1;
        if (assertsCount > max) {
          context.report({
            node,
            messageId: "maxExpect",
            data: {
              count: assertsCount,
              max
            }
          });
        }
      }
    };
  }
});

const RULE_NAME$L = "no-alias-methods";
const noAliasMethod = createEslintRule({
  name: RULE_NAME$L,
  meta: {
    docs: {
      description: "disallow alias methods",
      requiresTypeChecking: false,
      recommended: false
    },
    messages: {
      noAliasMethods: "Replace {{ alias }}() with its canonical name {{ canonical }}()"
    },
    type: "suggestion",
    fixable: "code",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    const methodNames = {
      toBeCalled: "toHaveBeenCalled",
      toBeCalledTimes: "toHaveBeenCalledTimes",
      toBeCalledWith: "toHaveBeenCalledWith",
      lastCalledWith: "toHaveBeenLastCalledWith",
      nthCalledWith: "toHaveBeenNthCalledWith",
      toReturn: "toHaveReturned",
      toReturnTimes: "toHaveReturnedTimes",
      toReturnWith: "toHaveReturnedWith",
      lastReturnedWith: "toHaveLastReturnedWith",
      nthReturnedWith: "toHaveNthReturnedWith",
      toThrowError: "toThrow"
    };
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect")
          return;
        const { matcher } = vitestFnCall;
        const alias = getAccessorValue(matcher);
        if (alias in methodNames) {
          const canonical = methodNames[alias];
          context.report({
            messageId: "noAliasMethods",
            data: { alias, canonical },
            node: matcher,
            fix: (fixer) => [replaceAccessorFixer(fixer, matcher, canonical)]
          });
        }
      }
    };
  }
});

const RULE_NAME$K = "no-commented-out-tests";
function hasTests(node) {
  return /^\s*[xf]?(test|it|describe)(\.\w+|\[['"]\w+['"]\])?\s*\(/mu.test(node.value);
}
const noCommentedOutTests = createEslintRule({
  name: RULE_NAME$K,
  meta: {
    docs: {
      description: "disallow commented out tests",
      requiresTypeChecking: false,
      recommended: false
    },
    messages: {
      noCommentedOutTests: "Remove commented out tests. You may want to use `skip` or `only` instead."
    },
    schema: [],
    type: "suggestion"
  },
  defaultOptions: [],
  create(context) {
    const { sourceCode } = context;
    function checkNodeForCommentedOutTests(node) {
      if (!hasTests(node))
        return;
      context.report({ messageId: "noCommentedOutTests", node });
    }
    return {
      Program() {
        const comments = sourceCode.getAllComments();
        comments.forEach(checkNodeForCommentedOutTests);
      }
    };
  }
});

const RULE_NAME$J = "no-conditional-expect";
const isCatchCall = (node) => node.callee.type === AST_NODE_TYPES.MemberExpression && isSupportedAccessor(node.callee.property, "catch");
const noConditionalExpect = createEslintRule({
  name: RULE_NAME$J,
  meta: {
    type: "problem",
    docs: {
      description: "disallow conditional expects",
      requiresTypeChecking: false,
      recommended: false
    },
    messages: {
      noConditionalExpect: "Avoid calling `expect` inside conditional statements"
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    let conditionalDepth = 0;
    let inTestCase = false;
    let inPromiseCatch = false;
    const increaseConditionalDepth = () => inTestCase && conditionalDepth++;
    const decreaseConditionalDepth = () => inTestCase && conditionalDepth--;
    return {
      FunctionDeclaration(node) {
        const declaredVariables = context.sourceCode.getDeclaredVariables(node);
        const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(declaredVariables, context);
        if (testCallExpressions.length > 0)
          inTestCase = true;
      },
      CallExpression(node) {
        const { type: vitestFnCallType } = parseVitestFnCall(node, context) ?? {};
        if (vitestFnCallType === "test")
          inTestCase = true;
        if (isCatchCall(node))
          inPromiseCatch = true;
        if (inTestCase && vitestFnCallType === "expect" && conditionalDepth > 0) {
          context.report({
            messageId: "noConditionalExpect",
            node
          });
        }
        if (inPromiseCatch && vitestFnCallType === "expect") {
          context.report({
            messageId: "noConditionalExpect",
            node
          });
        }
      },
      "CallExpression:exit"(node) {
        if (isTypeOfVitestFnCall(node, context, ["test"]))
          inTestCase = false;
        if (isCatchCall(node))
          inPromiseCatch = false;
      },
      "CatchClause": increaseConditionalDepth,
      "CatchClause:exit": decreaseConditionalDepth,
      "IfStatement": increaseConditionalDepth,
      "IfStatement:exit": decreaseConditionalDepth,
      "SwitchStatement": increaseConditionalDepth,
      "SwitchStatement:exit": decreaseConditionalDepth,
      "ConditionalExpression": increaseConditionalDepth,
      "ConditionalExpression:exit": decreaseConditionalDepth,
      "LogicalExpression": increaseConditionalDepth,
      "LogicalExpression:exit": decreaseConditionalDepth
    };
  }
});

const RULE_NAME$I = "no-import-node-test";
const noImportNodeTest = createEslintRule({
  name: RULE_NAME$I,
  meta: {
    docs: {
      description: "disallow importing `node:test`",
      recommended: false
    },
    type: "suggestion",
    messages: {
      noImportNodeTest: "Import from `vitest` instead of `node:test`"
    },
    fixable: "code",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value === "node:test") {
          context.report({
            messageId: "noImportNodeTest",
            node,
            fix: (fixer) => fixer.replaceText(
              node.source,
              node.source.raw.replace("node:test", "vitest")
            )
          });
        }
      }
    };
  }
});

const RULE_NAME$H = "no-conditional-in-test";
const noConditionalInTest = createEslintRule({
  name: RULE_NAME$H,
  meta: {
    docs: {
      description: "disallow conditional tests",
      requiresTypeChecking: false,
      recommended: false
    },
    messages: {
      noConditionalInTest: "Remove conditional tests"
    },
    schema: [],
    type: "problem"
  },
  defaultOptions: [],
  create(context) {
    return {
      IfStatement(node) {
        if (node.parent?.parent?.parent?.type === "CallExpression" && isTypeOfVitestFnCall(node.parent?.parent?.parent, context, ["test", "it"])) {
          context.report({
            messageId: "noConditionalInTest",
            node
          });
        }
      }
    };
  }
});

const RULE_NAME$G = "no-disabled-tests";
const noDisabledTests = createEslintRule({
  name: RULE_NAME$G,
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow disabled tests",
      recommended: false
    },
    messages: {
      missingFunction: "Test is missing function argument",
      pending: "Call to pending()",
      pendingSuite: "Call to pending() within test suite",
      pendingTest: "Call to pending() within test",
      disabledSuite: "Disabled test suite. If you want to skip a test suite temporarily, use .todo() instead.",
      disabledTest: "Disabled test. If you want to skip a test temporarily, use .todo() instead."
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    let suiteDepth = 0;
    let testDepth = 0;
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (!vitestFnCall)
          return;
        if (vitestFnCall.type === "describe")
          suiteDepth++;
        if (vitestFnCall.type === "test") {
          testDepth++;
          if (node.arguments.length < 2 && vitestFnCall.members.every((s) => getAccessorValue(s) === "skip")) {
            context.report({
              messageId: "missingFunction",
              node
            });
          }
        }
        const skipMember = vitestFnCall.members.find((s) => getAccessorValue(s) === "skip");
        if (vitestFnCall.name.startsWith("x") || skipMember !== void 0) {
          context.report({
            messageId: vitestFnCall.type === "describe" ? "disabledSuite" : "disabledTest",
            node: skipMember ?? vitestFnCall.head.node
          });
        }
      },
      "CallExpression:exit"(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (!vitestFnCall)
          return;
        if (vitestFnCall.type === "describe")
          suiteDepth--;
        if (vitestFnCall.type === "test")
          testDepth--;
      },
      'CallExpression[callee.name="pending"]'(node) {
        const scope = context.sourceCode.getScope ? context.sourceCode.getScope(node) : context.getScope();
        if (resolveScope(scope, "pending"))
          return;
        if (testDepth > 0)
          context.report({ messageId: "pendingTest", node });
        else if (suiteDepth > 0)
          context.report({ messageId: "pendingSuite", node });
        else
          context.report({ messageId: "pending", node });
      }
    };
  }
});

const RULE_NAME$F = "no-done-callback";
const findCallbackArg = (node, isVitestEach, context) => {
  if (isVitestEach)
    return node.arguments[1];
  const vitestFnCall = parseVitestFnCall(node, context);
  if (vitestFnCall?.type === "hook" && node.arguments.length >= 1)
    return node.arguments[0];
  if (vitestFnCall?.type === "test" && node.arguments.length >= 2)
    return node.arguments[1];
  return null;
};
const noDoneCallback = createEslintRule({
  name: RULE_NAME$F,
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow using a callback in asynchronous tests and hooks",
      recommended: false
    },
    deprecated: true,
    schema: [],
    messages: {
      noDoneCallback: "Return a promise instead of relying on callback parameter",
      suggestWrappingInPromise: "Wrap in `new Promise({{ callback }} => ...`",
      useAwaitInsteadOfCallback: "Use `await` instead of callback in async function"
    },
    hasSuggestions: true
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const isVitestEach = /\.each$|\.concurrent$/.test(getNodeName(node.callee) ?? "");
        if (isVitestEach && node.callee.type !== AST_NODE_TYPES.TaggedTemplateExpression)
          return;
        const isInsideConcurrentTestOrDescribe = context.sourceCode.getAncestors(node).some((ancestor) => {
          if (ancestor.type !== AST_NODE_TYPES.CallExpression)
            return false;
          const isNotInsideDescribeOrTest = !isTypeOfVitestFnCall(ancestor, context, ["describe", "test"]);
          if (isNotInsideDescribeOrTest)
            return false;
          const isTestRunningConcurrently = ancestor.callee.type === AST_NODE_TYPES.MemberExpression && isSupportedAccessor(ancestor.callee.property, "concurrent");
          return isTestRunningConcurrently;
        });
        if (isInsideConcurrentTestOrDescribe)
          return;
        const callback = findCallbackArg(node, isVitestEach, context);
        const callbackArgIndex = Number(isVitestEach);
        if (!callback || !isFunction(callback) || callback.params.length !== 1 + callbackArgIndex)
          return;
        const argument = callback.params[callbackArgIndex];
        if (argument.type !== AST_NODE_TYPES.Identifier) {
          context.report({
            node: argument,
            messageId: "noDoneCallback"
          });
          return;
        }
        if (callback.async) {
          context.report({
            node: argument,
            messageId: "useAwaitInsteadOfCallback"
          });
          return;
        }
        context.report({
          node,
          messageId: "noDoneCallback",
          suggest: [
            {
              messageId: "suggestWrappingInPromise",
              data: { callback: argument.name },
              fix(fixer) {
                const { body, params } = callback;
                const { sourceCode } = context;
                const firstBodyToken = sourceCode.getFirstToken(body);
                const lastBodyToken = sourceCode.getLastToken(body);
                const [firstParam] = params;
                const lastParam = params[params.length - 1];
                const tokenBeforeFirstParam = sourceCode.getTokenBefore(firstParam);
                let tokenAfterLastParam = sourceCode.getTokenAfter(lastParam);
                if (tokenAfterLastParam?.value === ",")
                  tokenAfterLastParam = sourceCode.getTokenAfter(tokenAfterLastParam);
                if (!firstBodyToken || !lastBodyToken || !tokenBeforeFirstParam || !tokenAfterLastParam)
                  throw new Error(`Unexpected null when attempting to fix ${context.filename} - please file an issue at https://github/veritem/eslint-plugin-vitest`);
                let argumentFix = fixer.replaceText(firstParam, "()");
                if (tokenBeforeFirstParam.value === "(" && tokenAfterLastParam.value === ")")
                  argumentFix = fixer.removeRange([tokenBeforeFirstParam.range[1], tokenAfterLastParam.range[0]]);
                const newCallBack = argument.name;
                let beforeReplacement = `new Promise(${newCallBack} => `;
                let afterReplacement = ")";
                let replaceBefore = true;
                if (body.type === AST_NODE_TYPES.BlockStatement) {
                  const keyword = "return";
                  beforeReplacement = `${keyword} ${beforeReplacement}{`;
                  afterReplacement += "}";
                  replaceBefore = false;
                }
                return [
                  argumentFix,
                  replaceBefore ? fixer.insertTextBefore(firstBodyToken, beforeReplacement) : fixer.insertTextAfter(firstBodyToken, beforeReplacement),
                  fixer.insertTextAfter(lastBodyToken, afterReplacement)
                ];
              }
            }
          ]
        });
      }
    };
  }
});

const RULE_NAME$E = "no-duplicate-hooks";
const noDuplicateHooks = createEslintRule({
  name: RULE_NAME$E,
  meta: {
    docs: {
      recommended: false,
      description: "disallow duplicate hooks and teardown hooks",
      requiresTypeChecking: false
    },
    messages: {
      noDuplicateHooks: "Duplicate {{hook}} in describe block."
    },
    schema: [],
    type: "suggestion"
  },
  defaultOptions: [],
  create(context) {
    const hooksContexts = [{}];
    return {
      CallExpression(node) {
        var _a;
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type === "describe")
          hooksContexts.push({});
        if (vitestFnCall?.type !== "hook")
          return;
        const currentLayer = hooksContexts[hooksContexts.length - 1];
        currentLayer[_a = vitestFnCall.name] || (currentLayer[_a] = 0);
        currentLayer[vitestFnCall.name] += 1;
        if (currentLayer[vitestFnCall.name] > 1) {
          context.report({
            messageId: "noDuplicateHooks",
            data: { hook: vitestFnCall.name },
            node
          });
        }
      },
      "CallExpression:exit"(node) {
        if (isTypeOfVitestFnCall(node, context, ["describe"]))
          hooksContexts.pop();
      }
    };
  }
});

const RULE_NAME$D = "no-large-snapshots";
const reportOnViolation = (context, node, { maxSize: lineLimit = 50, allowedSnapshots = {} }) => {
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  const lineCount = endLine - startLine;
  const allPathsAreAbsolute = Object.keys(allowedSnapshots).every(isAbsolute);
  if (!allPathsAreAbsolute)
    throw new Error("All paths for allowedSnapshots must be absolute. You can use JS config and `path.resolve`");
  let isAllowed = false;
  if (node.type === AST_NODE_TYPES.ExpressionStatement && "left" in node.expression && node.expression.left.type === AST_NODE_TYPES.MemberExpression && isSupportedAccessor(node.expression.left.property)) {
    const fileName = context.filename;
    const allowedSnapshotsInFile = allowedSnapshots[fileName];
    if (allowedSnapshotsInFile) {
      const snapshotName = getAccessorValue(node.expression.left.property);
      isAllowed = allowedSnapshotsInFile.some((name) => {
        if (name instanceof RegExp)
          return name.test(snapshotName);
        return snapshotName === name;
      });
    }
  }
  if (!isAllowed && lineCount > lineLimit) {
    context.report({
      node,
      messageId: lineLimit === 0 ? "noSnapShot" : "tooLongSnapShot",
      data: {
        lineCount,
        lineLimit
      }
    });
  }
};
const noLargeSnapshots = createEslintRule({
  name: RULE_NAME$D,
  meta: {
    docs: {
      description: "disallow large snapshots",
      recommended: false
    },
    messages: {
      noSnapShot: "`{{ lineCount }}`s should begin with lowercase",
      tooLongSnapShot: "Expected vitest snapshot to be smaller than {{ lineLimit }} lines but was {{ lineCount }} lines long"
    },
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: {
          maxSize: {
            type: "number"
          },
          inlineMaxSize: {
            type: "number"
          },
          allowedSnapshots: {
            type: "object",
            additionalProperties: { type: "array" }
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [{}],
  create(context, [options]) {
    if (context.filename.endsWith(".snap")) {
      return {
        ExpressionStatement(node) {
          reportOnViolation(context, node, options);
        }
      };
    }
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect")
          return;
        if ([
          "toMatchInlineSnapshot",
          "toThrowErrorMatchingInlineSnapshot"
        ].includes(getAccessorValue(vitestFnCall.matcher)) && vitestFnCall.args.length) {
          reportOnViolation(context, vitestFnCall.args[0], {
            ...options,
            maxSize: options.inlineMaxSize ?? options.maxSize
          });
        }
      }
    };
  }
});

const RULE_NAME$C = "no-interpolation-in-snapshots";
const nonInterpolationInSnapShots = createEslintRule({
  name: RULE_NAME$C,
  meta: {
    type: "problem",
    docs: {
      description: "disallow string interpolation in snapshots",
      recommended: false
    },
    fixable: "code",
    schema: [],
    messages: {
      noInterpolationInSnapshots: "Do not use string interpolation in snapshots"
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect")
          return;
        if ([
          "toMatchInlineSnapshot",
          "toThrowErrorMatchingInlineSnapshot"
        ].includes(getAccessorValue(vitestFnCall.matcher))) {
          vitestFnCall.args.forEach((argument) => {
            if (argument.type === AST_NODE_TYPES.TemplateLiteral && argument.expressions.length > 0) {
              context.report({
                messageId: "noInterpolationInSnapshots",
                node: argument
              });
            }
          });
        }
      }
    };
  }
});

const mocksDirName = "__mocks__";
const isMockPath = (path) => path.split(posix.sep).includes(mocksDirName);
const isMockImportLiteral = (expression) => isStringNode(expression) && isMockPath(getStringValue(expression));
const RULE_NAME$B = "no-mocks-import";
const noMocksImport = createEslintRule({
  name: RULE_NAME$B,
  meta: {
    type: "problem",
    docs: {
      description: "disallow importing from __mocks__ directory",
      recommended: false
    },
    messages: {
      noMocksImport: `Mocks should not be manually imported from a ${mocksDirName} directory. Instead use \`jest.mock\` and import from the original module path.`
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        if (isMockImportLiteral(node.source))
          context.report({ node, messageId: "noMocksImport" });
      },
      'CallExpression[callee.name="require"]'(node) {
        const [args] = node.arguments;
        if (args && isMockImportLiteral(args))
          context.report({ node: args, messageId: "noMocksImport" });
      }
    };
  }
});

const RULE_NAME$A = "no-restricted-matchers";
const isChainRestricted = (chain, restriction) => {
  if (ModifierName.hasOwnProperty(restriction) || restriction.endsWith(".not"))
    return chain.startsWith(restriction);
  return chain === restriction;
};
const noRestrictedMatchers = createEslintRule({
  name: RULE_NAME$A,
  meta: {
    docs: {
      description: "disallow the use of certain matchers",
      recommended: false
    },
    type: "suggestion",
    schema: [
      {
        type: "object",
        additionalProperties: {
          type: ["string", "null"]
        }
      }
    ],
    messages: {
      restrictedChain: "use of {{ restriction }} is disallowed",
      restrictedChainWithMessage: "{{ message }}"
    }
  },
  defaultOptions: [{}],
  create(context, [restrictedChains]) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect")
          return;
        const chain = vitestFnCall.members.map((node2) => getAccessorValue(node2)).join(".");
        for (const [restriction, message] of Object.entries(restrictedChains)) {
          if (isChainRestricted(chain, restriction)) {
            context.report({
              messageId: message ? "restrictedChainWithMessage" : "restrictedChain",
              data: { message, restriction },
              loc: {
                start: vitestFnCall.members[0].loc.start,
                end: vitestFnCall.members[vitestFnCall.members.length - 1].loc.end
              }
            });
            break;
          }
        }
      }
    };
  }
});

const RULE_NAME$z = "no-standalone-expect";
const getBlockType = (statement, context) => {
  const func = statement.parent;
  if (!func)
    throw new Error("Unexpected block statement. If you feel like this is a bug report https://github.com/veritem/eslint-plugin-vitest/issues/new");
  if (func.type === AST_NODE_TYPES.FunctionDeclaration)
    return "function";
  if (isFunction(func) && func.parent) {
    const expr = func.parent;
    if (expr.type === AST_NODE_TYPES.VariableDeclarator)
      return "function";
    if (expr.type === AST_NODE_TYPES.CallExpression && isTypeOfVitestFnCall(expr, context, ["describe"]))
      return "describe";
  }
  return null;
};
const noStandaloneExpect = createEslintRule({
  name: RULE_NAME$z,
  meta: {
    docs: {
      description: "disallow using `expect` outside of `it` or `test` blocks",
      recommended: false
    },
    type: "suggestion",
    messages: {
      noStandaloneExpect: "Expect must be called inside a test block"
    },
    schema: [
      {
        properties: {
          additionaltestblockfunctions: {
            //@ts-ignore
            type: "array",
            //@ts-ignore
            items: { type: `string` }
          }
        },
        additionalproperties: false
      }
    ]
  },
  defaultOptions: [{ additionalTestBlockFunctions: [] }],
  create(context, [{ additionalTestBlockFunctions = [] }]) {
    const callStack = [];
    const isCustomTestBlockFunction = (node) => additionalTestBlockFunctions.includes(getNodeName(node) || "");
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type === "expect") {
          if (vitestFnCall.head.node.parent?.type === AST_NODE_TYPES.MemberExpression && vitestFnCall.members.length === 1 && !["assertions", "hasAssertions"].includes(
            getAccessorValue(vitestFnCall.members[0])
          ))
            return;
          const parent = callStack[callStack.length - 1];
          if (!parent || parent === DescribeAlias.describe)
            context.report({ node, messageId: "noStandaloneExpect" });
          return;
        }
        if (vitestFnCall?.type === "test" || isCustomTestBlockFunction(node))
          callStack.push("test");
        if (node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression)
          callStack.push("template");
      },
      "CallExpression:exit"(node) {
        const top = callStack[callStack.length - 1];
        if (top === "test" && (isTypeOfVitestFnCall(node, context, ["test"]) || isCustomTestBlockFunction(node)) && node.callee.type !== AST_NODE_TYPES.MemberExpression || top === "template" && node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression)
          callStack.pop();
      },
      BlockStatement(statement) {
        const blockType = getBlockType(statement, context);
        if (blockType)
          callStack.push(blockType);
      },
      "BlockStatement:exit"(statement) {
        const blockType = getBlockType(statement, context);
        if (blockType)
          callStack.pop();
      },
      ArrowFunctionExpression(node) {
        if (node.parent?.type !== AST_NODE_TYPES.CallExpression)
          callStack.push("arrow");
      },
      "ArrowFunctionExpression:exit"() {
        if (callStack[callStack.length - 1] === "arrow")
          callStack.pop();
      }
    };
  }
});

const RULE_NAME$y = "no-test-prefixes";
const noTestPrefixes = createEslintRule({
  name: RULE_NAME$y,
  meta: {
    docs: {
      description: "disallow using `test` as a prefix",
      recommended: false
    },
    type: "suggestion",
    messages: {
      usePreferredName: 'Use "{{preferredNodeName}}" instead'
    },
    fixable: "code",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "describe" && vitestFnCall?.type !== "test")
          return;
        if (vitestFnCall.name[0] !== "f" && vitestFnCall.name[0] !== "x")
          return;
        const preferredNodeName = [
          vitestFnCall.name.slice(1),
          vitestFnCall.name[0] === "f" ? "only" : "skip",
          ...vitestFnCall.members.map((m) => getAccessorValue(m))
        ].join(".");
        const funcNode = node.callee.type === AST_NODE_TYPES.TaggedTemplateExpression ? node.callee.tag : node.callee.type === AST_NODE_TYPES.CallExpression ? node.callee.callee : node.callee;
        context.report({
          messageId: "usePreferredName",
          node: node.callee,
          data: { preferredNodeName },
          fix: (fixer) => [fixer.replaceText(funcNode, preferredNodeName)]
        });
      }
    };
  }
});

const RULE_NAME$x = "no-test-return-statement";
const getBody = (args) => {
  const [, secondArg] = args;
  if (secondArg && isFunction(secondArg) && secondArg.body.type === AST_NODE_TYPES.BlockStatement)
    return secondArg.body.body;
  return [];
};
const noTestReturnStatement = createEslintRule({
  name: RULE_NAME$x,
  meta: {
    type: "problem",
    docs: {
      description: "disallow return statements in tests",
      recommended: false
    },
    schema: [],
    messages: {
      noTestReturnStatement: "Return statements are not allowed in tests"
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (!isTypeOfVitestFnCall(node, context, ["test"]))
          return;
        const body = getBody(node.arguments);
        const returnStmt = body.find((stmt) => stmt.type === AST_NODE_TYPES.ReturnStatement);
        if (!returnStmt)
          return;
        context.report({ messageId: "noTestReturnStatement", node: returnStmt });
      },
      FunctionDeclaration(node) {
        const declaredVariables = context.sourceCode.getDeclaredVariables(node);
        const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(declaredVariables, context);
        if (testCallExpressions.length === 0)
          return;
        const returnStmt = node.body.body.find((stmt) => stmt.type === AST_NODE_TYPES.ReturnStatement);
        if (!returnStmt)
          return;
        context.report({ messageId: "noTestReturnStatement", node: returnStmt });
      }
    };
  }
});

const RULE_NAME$w = "prefer-called-with";
const preferCalledWith = createEslintRule({
  name: RULE_NAME$w,
  meta: {
    docs: {
      description: "enforce using `toBeCalledWith()` or `toHaveBeenCalledWith()`",
      recommended: false
    },
    messages: {
      preferCalledWith: "Prefer {{ matcherName }}With(/* expected args */)"
    },
    type: "suggestion",
    fixable: "code",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect")
          return;
        if (vitestFnCall.modifiers.some(
          (node2) => getAccessorValue(node2) === "not"
        ))
          return;
        const { matcher } = vitestFnCall;
        const matcherName = getAccessorValue(matcher);
        if (["toBeCalled", "toHaveBeenCalled"].includes(matcherName)) {
          context.report({
            data: { matcherName },
            messageId: "preferCalledWith",
            node: matcher,
            fix: (fixer) => [fixer.replaceText(matcher, `${matcherName}With`)]
          });
        }
      }
    };
  }
});

const RULE_NAME$v = "valid-title";
const trimFXPrefix = (word) => ["f", "x"].includes(word.charAt(0)) ? word.substring(1) : word;
const quoteStringValue = (node) => node.type === AST_NODE_TYPES.TemplateLiteral ? `\`${node.quasis[0].value.raw}\`` : node.raw;
const MatcherAndMessageSchema = {
  type: "array",
  items: { type: "string" },
  minItems: 1,
  maxItems: 2,
  additionalItems: false
};
const compileMatcherPattern = (matcherMaybeWithMessage) => {
  const [matcher, message] = Array.isArray(matcherMaybeWithMessage) ? matcherMaybeWithMessage : [matcherMaybeWithMessage];
  return [new RegExp(matcher, "u"), message];
};
function isFunctionType(type) {
  const symbol = type.getSymbol();
  if (!symbol) {
    return false;
  }
  return symbol.getDeclarations()?.some((declaration) => ts.isFunctionDeclaration(declaration) || ts.isMethodDeclaration(declaration) || ts.isFunctionExpression(declaration) || ts.isArrowFunction(declaration)) ?? false;
}
function isClassType(type) {
  const symbol = type.getSymbol();
  if (!symbol)
    return false;
  return symbol.getDeclarations()?.some((declaration) => ts.isClassDeclaration(declaration) || ts.isClassExpression(declaration)) ?? false;
}
const compileMatcherPatterns = (matchers) => {
  if (typeof matchers === "string" || Array.isArray(matchers)) {
    const compiledMatcher = compileMatcherPattern(matchers);
    return {
      describe: compiledMatcher,
      test: compiledMatcher,
      it: compiledMatcher
    };
  }
  return {
    describe: matchers.describe ? compileMatcherPattern(matchers.describe) : null,
    test: matchers.test ? compileMatcherPattern(matchers.test) : null,
    it: matchers.it ? compileMatcherPattern(matchers.it) : null
  };
};
const doesBinaryExpressionContainStringNode = (binaryExp) => {
  if (isStringNode(binaryExp.right))
    return true;
  if (binaryExp.left.type === AST_NODE_TYPES.BinaryExpression)
    return doesBinaryExpressionContainStringNode(binaryExp.left);
  return isStringNode(binaryExp.left);
};
const validTitle = createEslintRule({
  name: RULE_NAME$v,
  meta: {
    docs: {
      description: "enforce valid titles",
      recommended: false
    },
    messages: {
      titleMustBeString: "Test title must be a string, a function or class name",
      emptyTitle: "{{functionName}} should not have an empty title",
      duplicatePrefix: "should not have duplicate prefix",
      accidentalSpace: "should not have leading or trailing spaces",
      disallowedWord: '"{{word}}" is not allowed in test title',
      mustNotMatch: "{{functionName}} should not match {{pattern}}",
      mustMatch: "{{functionName}} should match {{pattern}}",
      mustNotMatchCustom: "{{message}}",
      mustMatchCustom: "{{message}}"
    },
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: {
          ignoreTypeOfDescribeName: {
            type: "boolean",
            default: false
          },
          allowArguments: {
            type: "boolean",
            default: false
          },
          disallowedWords: {
            type: "array",
            items: { type: "string" }
          }
        },
        patternProperties: {
          [/^must(?:Not)?Match$/u.source]: {
            oneOf: [
              { type: "string" },
              MatcherAndMessageSchema,
              {
                type: "object",
                //@ts-ignore
                propertyNames: { type: "string", enum: ["describe", "test", "it"] },
                additionalProperties: {
                  oneOf: [{ type: "string" }, MatcherAndMessageSchema]
                }
              }
            ]
          }
        },
        additionalProperties: false
      }
    ],
    fixable: "code"
  },
  defaultOptions: [{ ignoreTypeOfDescribeName: false, allowArguments: false, disallowedWords: [] }],
  create(context, [
    {
      ignoreTypeOfDescribeName,
      allowArguments,
      disallowedWords = [],
      mustNotMatch,
      mustMatch
    }
  ]) {
    const disallowedWordsRegexp = new RegExp(`\\b(${disallowedWords.join("|")})\\b`, "iu");
    const mustNotMatchPatterns = compileMatcherPatterns(mustNotMatch ?? {});
    const mustMatchPatterns = compileMatcherPatterns(mustMatch ?? {});
    const settings = parsePluginSettings(context.settings);
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "describe" && vitestFnCall?.type !== "test" && vitestFnCall?.type !== "it")
          return;
        const [argument] = node.arguments;
        if (settings.typecheck) {
          const services = ESLintUtils.getParserServices(context);
          const type = services.getTypeAtLocation(argument);
          if (isFunctionType(type) || isClassType(type))
            return;
        }
        if (!argument || allowArguments && argument.type === AST_NODE_TYPES.Identifier)
          return;
        if (!isStringNode(argument)) {
          if (argument.type === AST_NODE_TYPES.BinaryExpression && doesBinaryExpressionContainStringNode(argument))
            return;
          if (argument.type !== AST_NODE_TYPES.TemplateLiteral && !(ignoreTypeOfDescribeName && vitestFnCall.type === "describe")) {
            context.report({
              messageId: "titleMustBeString",
              loc: argument.loc
            });
          }
          return;
        }
        const title = getStringValue(argument);
        if (!title) {
          context.report({
            messageId: "emptyTitle",
            data: {
              functionName: vitestFnCall.type === "describe" ? DescribeAlias.describe : TestCaseName.test
            },
            node
          });
          return;
        }
        if (disallowedWords.length > 0) {
          const disallowedMatch = disallowedWordsRegexp.exec(title);
          if (disallowedMatch) {
            context.report({
              messageId: "disallowedWord",
              data: {
                word: disallowedMatch[1]
              },
              node: argument
            });
            return;
          }
        }
        if (title.trim().length !== title.length) {
          context.report({
            messageId: "accidentalSpace",
            node: argument,
            fix: (fixer) => [
              fixer.replaceTextRange(
                argument.range,
                quoteStringValue(argument).replace(/^([`'"]) +?/u, "$1").replace(/ +?([`'"])$/u, "$1")
              )
            ]
          });
        }
        const unPrefixedName = trimFXPrefix(vitestFnCall.name);
        const [firstWord] = title.split(" ");
        if (firstWord.toLowerCase() === unPrefixedName) {
          context.report({
            messageId: "duplicatePrefix",
            node: argument,
            fix: (fixer) => [
              fixer.replaceTextRange(
                argument.range,
                quoteStringValue(argument).replace(/^([`'"]).+? /u, "$1")
              )
            ]
          });
        }
        const vitestFnName = unPrefixedName;
        const [mustNotMatchPattern, mustNotMatchMessage] = mustNotMatchPatterns[vitestFnName] ?? [];
        if (mustNotMatchPattern) {
          if (mustNotMatchPattern.test(title)) {
            context.report({
              messageId: mustNotMatchMessage ? "mustNotMatchCustom" : "mustNotMatch",
              node: argument,
              data: {
                functionName: vitestFnName,
                pattern: mustNotMatchPattern,
                message: mustNotMatchMessage
              }
            });
            return;
          }
        }
        const [mustMatchPattern, mustMatchMessage] = mustMatchPatterns[vitestFnName] ?? [];
        if (mustMatchPattern) {
          if (!mustMatchPattern.test(title)) {
            context.report({
              messageId: mustMatchMessage ? "mustMatchCustom" : "mustMatch",
              node: argument,
              data: {
                functionName: vitestFnName,
                pattern: mustMatchPattern,
                message: mustMatchMessage
              }
            });
          }
        }
      }
    };
  }
});

const RULE_NAME$u = "valid-expect";
const defaultAsyncMatchers = ["toReject", "toResolve"];
const getPromiseCallExpressionNode = (node) => {
  if (node.type === AST_NODE_TYPES.ArrayExpression && node.parent && node.parent.type === AST_NODE_TYPES.CallExpression)
    node = node.parent;
  if (node.type === AST_NODE_TYPES.CallExpression && node.callee.type === AST_NODE_TYPES.MemberExpression && isSupportedAccessor(node.callee.object, "Promise") && node.parent)
    return node;
  return null;
};
const promiseArrayExceptionKey = ({ start, end }) => `${start.line}:${start.column}-${end.line}:${end.column}`;
function getParentIfThenified(node) {
  const grandParentNode = node.parent?.parent;
  if (grandParentNode && grandParentNode.type === AST_NODE_TYPES.CallExpression && grandParentNode.callee.type === AST_NODE_TYPES.MemberExpression && isSupportedAccessor(grandParentNode.callee.property) && ["then", "catch"].includes(getAccessorValue(grandParentNode.callee.property)) && grandParentNode.parent)
    return getParentIfThenified(grandParentNode);
  return node;
}
const findPromiseCallExpressionNode = (node) => node.parent?.parent && [AST_NODE_TYPES.CallExpression, AST_NODE_TYPES.ArrayExpression].includes(
  node.parent.type
) ? getPromiseCallExpressionNode(node.parent) : null;
const isAcceptableReturnNode = (node, allowReturn) => {
  if (allowReturn && node.type === AST_NODE_TYPES.ReturnStatement)
    return true;
  if (node.type === AST_NODE_TYPES.ConditionalExpression && node.parent)
    return isAcceptableReturnNode(node.parent, allowReturn);
  return [
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.AwaitExpression
  ].includes(node.type);
};
const validExpect = createEslintRule({
  name: RULE_NAME$u,
  meta: {
    docs: {
      description: "enforce valid `expect()` usage",
      recommended: false
    },
    messages: {
      tooManyArgs: "Expect takes most {{ amount}} argument{{s}}",
      notEnoughArgs: "Expect requires atleast {{ amount }} argument{{s}}",
      modifierUnknown: "Expect has unknown modifier",
      matcherNotFound: "Expect must have a corresponding matcher call.",
      matcherNotCalled: "Matchers must be called to assert.",
      asyncMustBeAwaited: "Async assertions must be awaited{{orReturned}}",
      promisesWithAsyncAssertionsMustBeAwaited: "Promises which return async assertions must be awaited{{orReturned}}"
    },
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: {
          alwaysAwait: {
            type: "boolean",
            default: false
          },
          asyncMatchers: {
            type: "array",
            items: { type: "string" }
          },
          minArgs: {
            type: "number",
            minimum: 1
          },
          maxArgs: {
            type: "number",
            minimum: 1
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [{
    alwaysAwait: false,
    asyncMatchers: defaultAsyncMatchers,
    minArgs: 1,
    maxArgs: 1
  }],
  create: (context, [{ alwaysAwait, asyncMatchers = defaultAsyncMatchers, minArgs = 1, maxArgs = 1 }]) => {
    const arrayExceptions = /* @__PURE__ */ new Set();
    const pushPromiseArrayException = (loc) => arrayExceptions.add(promiseArrayExceptionKey(loc));
    const promiseArrayExceptionExists = (loc) => arrayExceptions.has(promiseArrayExceptionKey(loc));
    const findTopMostMemberExpression = (node) => {
      let topMostMemberExpression = node;
      let { parent } = node;
      while (parent) {
        if (parent.type !== AST_NODE_TYPES.MemberExpression)
          break;
        topMostMemberExpression = parent;
        parent = parent.parent;
      }
      return topMostMemberExpression;
    };
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCallWithReason(node, context);
        if (typeof vitestFnCall === "string") {
          const reportingNode = node.parent?.type === AST_NODE_TYPES.MemberExpression ? findTopMostMemberExpression(node.parent).property : node;
          if (vitestFnCall === "matcher-not-found") {
            context.report({
              messageId: "matcherNotFound",
              node: reportingNode
            });
            return;
          }
          if (vitestFnCall === "matcher-not-called") {
            context.report({
              messageId: isSupportedAccessor(reportingNode) && ModifierName.hasOwnProperty(getAccessorValue(reportingNode)) ? "matcherNotFound" : "matcherNotCalled",
              node: reportingNode
            });
          }
          if (vitestFnCall === "modifier-unknown") {
            context.report({
              messageId: "modifierUnknown",
              node: reportingNode
            });
            return;
          }
          return;
        } else if (vitestFnCall?.type !== "expect") {
          return;
        }
        const { parent: expect } = vitestFnCall.head.node;
        if (expect?.type !== AST_NODE_TYPES.CallExpression)
          return;
        if (expect.arguments.length < minArgs) {
          const expectLength = getAccessorValue(vitestFnCall.head.node).length;
          const loc = {
            start: {
              column: expect.loc.start.column + expectLength,
              line: expect.loc.start.line
            },
            end: {
              column: expect.loc.start.column + expectLength + 1,
              line: expect.loc.start.line
            }
          };
          context.report({
            messageId: "notEnoughArgs",
            data: { amount: minArgs, s: minArgs === 1 ? "" : "s" },
            node: expect,
            loc
          });
        }
        if (expect.arguments.length > maxArgs) {
          if (expect.arguments.length === 2) {
            const isSecondArgString = expect.arguments[1].type === AST_NODE_TYPES.Literal && typeof expect.arguments[1].value === "string";
            const isSecondArgTemplateLiteral = expect.arguments[1].type === AST_NODE_TYPES.TemplateLiteral;
            if (isSecondArgString || isSecondArgTemplateLiteral) {
              return;
            }
          }
          const { start } = expect.arguments[maxArgs].loc;
          const { end } = expect.arguments[expect.arguments.length - 1].loc;
          const loc = {
            start,
            end: {
              column: end.column + 1,
              line: end.line
            }
          };
          context.report({
            messageId: "tooManyArgs",
            data: { amount: maxArgs, s: maxArgs === 1 ? "" : "s" },
            node: expect,
            loc
          });
        }
        const { matcher } = vitestFnCall;
        const parentNode = matcher.parent.parent;
        const shouldBeAwaited = vitestFnCall.modifiers.some((nod) => getAccessorValue(nod) !== "not") || asyncMatchers.includes(getAccessorValue(matcher));
        if (!parentNode?.parent || !shouldBeAwaited)
          return;
        const isParentArrayExpression = parentNode.parent.type === AST_NODE_TYPES.ArrayExpression;
        const orReturned = alwaysAwait ? "" : " or returned";
        const targetNode = getParentIfThenified(parentNode);
        const finalNode = findPromiseCallExpressionNode(targetNode) || targetNode;
        if (finalNode.parent && !isAcceptableReturnNode(finalNode.parent, !alwaysAwait) && !promiseArrayExceptionExists(finalNode.loc)) {
          context.report({
            loc: finalNode.loc,
            data: { orReturned },
            messageId: finalNode === targetNode ? "asyncMustBeAwaited" : "promisesWithAsyncAssertionsMustBeAwaited",
            node
          });
          if (isParentArrayExpression)
            pushPromiseArrayException(finalNode.loc);
        }
      }
    };
  }
});

const isBooleanLiteral = (node) => node.type === AST_NODE_TYPES.Literal && typeof node.value === "boolean";
const isBooleanEqualityMatcher = (expectFnCall) => {
  const matcherName = getAccessorValue(expectFnCall.matcher);
  if (["toBeTruthy", "toBeFalsy"].includes(matcherName))
    return true;
  if (expectFnCall.args.length !== 1)
    return false;
  const arg = getFirstMatcherArg(expectFnCall);
  return EqualityMatcher.hasOwnProperty(matcherName) && isBooleanLiteral(arg);
};
const isInstanceOfBinaryExpression = (node, className) => node.type === AST_NODE_TYPES.BinaryExpression && node.operator === "instanceof" && isSupportedAccessor(node.right, className);
const hasOnlyOneArgument = (call) => call.arguments.length === 1;

const RULE_NAME$t = "prefer-to-be-object";
const preferToBeObject = createEslintRule({
  name: RULE_NAME$t,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using toBeObject()",
      recommended: false
    },
    fixable: "code",
    messages: {
      preferToBeObject: "Prefer toBeObject() to test if a value is an object."
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expectTypeOf")
          return;
        if (isParsedInstanceOfMatcherCall(vitestFnCall, "Object")) {
          context.report({
            node: vitestFnCall.matcher,
            messageId: "preferToBeObject",
            fix: (fixer) => [
              fixer.replaceTextRange(
                [
                  vitestFnCall.matcher.range[0],
                  vitestFnCall.matcher.range[1] + "(Object)".length
                ],
                "toBeObject()"
              )
            ]
          });
          return;
        }
        const { parent: expectTypeOf } = vitestFnCall.head.node;
        if (expectTypeOf?.type !== AST_NODE_TYPES.CallExpression)
          return;
        const [expectTypeOfArgs] = expectTypeOf.arguments;
        if (!expectTypeOfArgs || !isBooleanEqualityMatcher(vitestFnCall) || !isInstanceOfBinaryExpression(expectTypeOfArgs, "Object"))
          return;
        context.report({
          node: vitestFnCall.matcher,
          messageId: "preferToBeObject",
          fix(fixer) {
            const fixes = [
              fixer.replaceText(vitestFnCall.matcher, "toBeObject"),
              fixer.removeRange([expectTypeOfArgs.left.range[1], expectTypeOfArgs.range[1]])
            ];
            let invertCondition = getAccessorValue(vitestFnCall.matcher) === "toBeFalsy";
            if (vitestFnCall.args.length) {
              const [matcherArg] = vitestFnCall.args;
              fixes.push(fixer.remove(matcherArg));
              invertCondition = matcherArg.type === AST_NODE_TYPES.Literal && followTypeAssertionChain(matcherArg).value === false;
            }
            if (invertCondition) {
              const notModifier = vitestFnCall.modifiers.find((node2) => getAccessorValue(node2) === "not");
              fixes.push(
                notModifier ? fixer.removeRange([
                  notModifier.range[0] - 1,
                  notModifier.range[1]
                ]) : fixer.insertTextBefore(vitestFnCall.matcher, "not.")
              );
            }
            return fixes;
          }
        });
      }
    };
  }
});

const RULE_NAME$s = "prefer-to-be-truthy";
const isTrueLiteral = (node) => node.type === AST_NODE_TYPES.Literal && node.value === true;
const preferToBeTruthy = createEslintRule({
  name: RULE_NAME$s,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using `toBeTruthy`",
      recommended: false
    },
    messages: {
      preferToBeTruthy: "Prefer using `toBeTruthy` to test value is `true`"
    },
    fixable: "code",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (!(vitestFnCall?.type === "expect" || vitestFnCall?.type === "expectTypeOf"))
          return;
        if (vitestFnCall.args.length === 1 && isTrueLiteral(getFirstMatcherArg(vitestFnCall)) && EqualityMatcher.hasOwnProperty(getAccessorValue(vitestFnCall.matcher))) {
          context.report({
            node: vitestFnCall.matcher,
            messageId: "preferToBeTruthy",
            fix: (fixer) => [
              fixer.replaceText(vitestFnCall.matcher, "toBeTruthy"),
              fixer.remove(vitestFnCall.args[0])
            ]
          });
        }
      }
    };
  }
});

const RULE_NAME$r = "prefer-to-be-falsy";
const isFalseLiteral = (node) => node.type === AST_NODE_TYPES.Literal && node.value === false;
const preferToBeFalsy = createEslintRule({
  name: RULE_NAME$r,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using toBeFalsy()",
      recommended: false
    },
    fixable: "code",
    schema: [],
    messages: {
      preferToBeFalsy: "Prefer using toBeFalsy()"
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (!(vitestFnCall?.type === "expect" || vitestFnCall?.type === "expectTypeOf"))
          return;
        if (vitestFnCall.args.length === 1 && isFalseLiteral(getFirstMatcherArg(vitestFnCall)) && EqualityMatcher.hasOwnProperty(getAccessorValue(vitestFnCall.matcher))) {
          context.report({
            node: vitestFnCall.matcher,
            messageId: "preferToBeFalsy",
            fix: (fixer) => [
              fixer.replaceText(vitestFnCall.matcher, "toBeFalsy"),
              fixer.remove(vitestFnCall.args[0])
            ]
          });
        }
      }
    };
  }
});

const RULE_NAME$q = "prefer-to-have-length";
const preferToHaveLength = createEslintRule({
  name: RULE_NAME$q,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using toHaveLength()",
      recommended: false
    },
    fixable: "code",
    messages: {
      preferToHaveLength: "Prefer toHaveLength()"
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect")
          return;
        const { parent: expect } = vitestFnCall.head.node;
        if (expect?.type !== AST_NODE_TYPES.CallExpression)
          return;
        const [argument] = expect.arguments;
        const { matcher } = vitestFnCall;
        if (!EqualityMatcher.hasOwnProperty(getAccessorValue(matcher)) || argument?.type !== AST_NODE_TYPES.MemberExpression || !isSupportedAccessor(argument.property, "length"))
          return;
        context.report({
          node: matcher,
          messageId: "preferToHaveLength",
          fix(fixer) {
            return [
              fixer.removeRange([
                argument.property.range[0] - 1,
                argument.range[1]
              ]),
              fixer.replaceTextRange(
                [matcher.parent.object.range[1], matcher.parent.range[1]],
                ".toHaveLength"
              )
            ];
          }
        });
      }
    };
  }
});

const RULE_NAME$p = "prefer-equality-matcher";
const preferEqualityMatcher = createEslintRule({
  name: RULE_NAME$p,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using the built-in quality matchers",
      recommended: false
    },
    messages: {
      useEqualityMatcher: "Prefer using one of the equality matchers instead",
      suggestEqualityMatcher: "Use `{{ equalityMatcher }}`"
    },
    hasSuggestions: true,
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect" || vitestFnCall.args.length === 0)
          return;
        const { parent: expect } = vitestFnCall.head.node;
        if (expect?.type !== AST_NODE_TYPES.CallExpression)
          return;
        const {
          arguments: [comparison],
          range: [, expectCallEnd]
        } = expect;
        const { matcher } = vitestFnCall;
        const matcherArg = getFirstMatcherArg(vitestFnCall);
        if (comparison?.type !== AST_NODE_TYPES.BinaryExpression || comparison.operator !== "===" && comparison.operator !== "!==" || !EqualityMatcher.hasOwnProperty(getAccessorValue(matcher)) || !isBooleanLiteral(matcherArg))
          return;
        const matcherValue = matcherArg.value;
        const [modifier] = vitestFnCall.modifiers;
        const hasNot = vitestFnCall.modifiers.some(
          (nod) => getAccessorValue(nod) === "not"
        );
        const addNotModifier = (comparison.operator === "!==" ? !matcherValue : matcherValue) === hasNot;
        const buildFixer = (equalityMatcher) => (fixer) => {
          const { sourceCode } = context;
          let modifierText = modifier && getAccessorValue(modifier) !== "not" ? `.${getAccessorValue(modifier)}` : "";
          if (addNotModifier)
            modifierText += `.${ModifierName.not}`;
          return [
            fixer.replaceText(
              comparison,
              sourceCode.getText(comparison.left)
            ),
            fixer.replaceTextRange(
              [expectCallEnd, matcher.parent.range[1]],
              `${modifierText}.${equalityMatcher}`
            ),
            fixer.replaceText(
              matcherArg,
              sourceCode.getText(comparison.right)
            )
          ];
        };
        context.report({
          messageId: "useEqualityMatcher",
          suggest: ["toBe", "toEqual", "toStrictEqual"].map((equalityMatcher) => ({
            messageId: "suggestEqualityMatcher",
            data: { equalityMatcher },
            fix: buildFixer(equalityMatcher)
          })),
          node: matcher
        });
      }
    };
  }
});

const RULE_NAME$o = "prefer-strict-equal";
const preferStrictEqual = createEslintRule({
  name: RULE_NAME$o,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce strict equal over equal",
      recommended: false
    },
    messages: {
      useToStrictEqual: "Use `toStrictEqual()` instead",
      suggestReplaceWithStrictEqual: "Replace with `toStrictEqual()`"
    },
    schema: [],
    hasSuggestions: true
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect")
          return;
        const { matcher } = vitestFnCall;
        if (isSupportedAccessor(matcher, "toEqual")) {
          context.report({
            messageId: "useToStrictEqual",
            node: matcher,
            suggest: [
              {
                messageId: "suggestReplaceWithStrictEqual",
                fix: (fixer) => [
                  replaceAccessorFixer(fixer, matcher, EqualityMatcher.toStrictEqual)
                ]
              }
            ]
          });
        }
      }
    };
  }
});

const RULE_NAME$n = "prefer-expect-resolves";
const preferExpectResolves = createEslintRule({
  name: RULE_NAME$n,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using `expect().resolves` over `expect(await ...)` syntax",
      recommended: false
    },
    fixable: "code",
    messages: {
      expectResolves: "Use `expect().resolves` instead"
    },
    schema: []
  },
  defaultOptions: [],
  create: (context) => ({
    CallExpression(node) {
      const vitestFnCall = parseVitestFnCall(node, context);
      if (vitestFnCall?.type !== "expect")
        return;
      const { parent } = vitestFnCall.head.node;
      if (parent?.type !== AST_NODE_TYPES.CallExpression)
        return;
      const [awaitNode] = parent.arguments;
      if (awaitNode?.type === AST_NODE_TYPES.AwaitExpression) {
        context.report({
          node: awaitNode,
          messageId: "expectResolves",
          fix(fixer) {
            return [
              fixer.insertTextBefore(parent, "await "),
              fixer.removeRange([
                awaitNode.range[0],
                awaitNode.argument.range[0]
              ]),
              fixer.insertTextAfter(parent, ".resolves")
            ];
          }
        });
      }
    }
  })
});

const RULE_NAME$m = "prefer-each";
const preferEach = createEslintRule({
  name: RULE_NAME$m,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using `each` rather than manual loops",
      recommended: false
    },
    schema: [],
    messages: {
      preferEach: "Prefer using `{{ fn }}.each` rather than a manual loop"
    }
  },
  defaultOptions: [],
  create(context) {
    const vitestFnCalls = [];
    let inTestCaseCall = false;
    const recommendFn = () => {
      if (vitestFnCalls.length === 1 && vitestFnCalls[0] === "test")
        return "it";
      return "describe";
    };
    const enterForLoop = () => {
      if (vitestFnCalls.length === 0 || inTestCaseCall)
        return;
      vitestFnCalls.length = 0;
    };
    const exitForLoop = (node) => {
      if (vitestFnCalls.length === 0 || inTestCaseCall)
        return;
      context.report({
        node,
        messageId: "preferEach",
        data: { fn: recommendFn() }
      });
      vitestFnCalls.length = 0;
    };
    return {
      "ForStatement": enterForLoop,
      "ForStatement:exit": exitForLoop,
      "ForInStatement": enterForLoop,
      "ForInStatement:exit": exitForLoop,
      "ForOfStatement": enterForLoop,
      "ForOfStatement:exit": exitForLoop,
      CallExpression(node) {
        const { type: vitestFnCallType } = parseVitestFnCall(node, context) ?? {};
        if (vitestFnCallType === "hook" || vitestFnCallType === "describe" || vitestFnCallType === "test")
          vitestFnCalls.push(vitestFnCallType);
        if (vitestFnCallType === "test")
          inTestCaseCall = true;
      },
      "CallExpression:exit"(node) {
        const { type: vitestFnCallType } = parseVitestFnCall(node, context) ?? {};
        if (vitestFnCallType === "test")
          inTestCaseCall = false;
      }
    };
  }
});

const RULE_NAME$l = "prefer-hooks-on-top";
const preferHooksOnTop = createEslintRule({
  name: RULE_NAME$l,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce having hooks before any test cases",
      recommended: false
    },
    messages: {
      noHookOnTop: "Hooks should come before test cases"
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    const hooksContext = [false];
    return {
      CallExpression(node) {
        if (isTypeOfVitestFnCall(node, context, ["test"]))
          hooksContext[hooksContext.length - 1] = true;
        if (hooksContext[hooksContext.length - 1] && isTypeOfVitestFnCall(node, context, ["hook"])) {
          context.report({
            messageId: "noHookOnTop",
            node
          });
        }
        hooksContext.push(false);
      },
      "CallExpression:exit"() {
        hooksContext.pop();
      }
    };
  }
});

const RULE_NAME$k = "prefer-hooks-in-order";
const HooksOrder = ["beforeAll", "beforeEach", "afterEach", "afterAll"];
const preferHooksInOrder = createEslintRule({
  name: RULE_NAME$k,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce having hooks in consistent order",
      recommended: false
    },
    messages: {
      reorderHooks: "`{{ currentHook }}` hooks should be before any `{{ previousHook }}` hooks"
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    let previousHookIndex = -1;
    let inHook = false;
    return {
      CallExpression(node) {
        if (inHook)
          return;
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "hook") {
          previousHookIndex = -1;
          return;
        }
        inHook = true;
        const currentHook = vitestFnCall.name;
        const currentHookIndex = HooksOrder.indexOf(currentHook);
        if (currentHookIndex < previousHookIndex) {
          context.report({
            messageId: "reorderHooks",
            data: {
              previousHook: HooksOrder[previousHookIndex],
              currentHook
            },
            node
          });
          inHook = false;
          return;
        }
        previousHookIndex = currentHookIndex;
      },
      "CallExpression:exit"(node) {
        if (isTypeOfVitestFnCall(node, context, ["hook"])) {
          inHook = false;
          return;
        }
        if (inHook)
          return;
        previousHookIndex = -1;
      }
    };
  }
});

const RULE_NAME$j = "prefer-mock-promise-shorthand";
const withOnce = (name, addOnce) => {
  return `${name}${addOnce ? "Once" : ""}`;
};
const findSingleReturnArgumentNode = (fnNode) => {
  if (fnNode.body.type !== AST_NODE_TYPES.BlockStatement)
    return fnNode.body;
  if (fnNode.body.body[0]?.type === AST_NODE_TYPES.ReturnStatement)
    return fnNode.body.body[0].argument;
  return null;
};
const preferMockPromiseShorthand = createEslintRule({
  name: RULE_NAME$j,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce mock resolved/rejected shorthands for promises",
      recommended: false
    },
    messages: {
      useMockShorthand: "Prefer {{ replacement }}"
    },
    schema: [],
    fixable: "code"
  },
  defaultOptions: [],
  create(context) {
    const report = (property, isOnce, outerArgNode, innerArgNode = outerArgNode) => {
      if (innerArgNode?.type !== AST_NODE_TYPES.CallExpression)
        return;
      const argName = getNodeName(innerArgNode);
      if (argName !== "Promise.resolve" && argName !== "Promise.reject")
        return;
      const replacement = withOnce(argName.endsWith("reject") ? "mockRejectedValue" : "mockResolvedValue", isOnce);
      context.report({
        node: property,
        messageId: "useMockShorthand",
        data: { replacement },
        fix(fixer) {
          const { sourceCode } = context;
          if (innerArgNode.arguments.length > 1)
            return null;
          return [
            fixer.replaceText(property, replacement),
            fixer.replaceText(outerArgNode, innerArgNode.arguments.length === 1 ? sourceCode.getText(innerArgNode.arguments[0]) : "undefined")
          ];
        }
      });
    };
    return {
      CallExpression(node) {
        if (node.callee.type !== AST_NODE_TYPES.MemberExpression || !isSupportedAccessor(node.callee.property) || node.arguments.length === 0)
          return;
        const mockFnName = getAccessorValue(node.callee.property);
        const isOnce = mockFnName.endsWith("Once");
        if (mockFnName === withOnce("mockReturnValue", isOnce)) {
          report(node.callee.property, isOnce, node.arguments[0]);
        } else if (mockFnName === withOnce("mockImplementation", isOnce)) {
          const [arg] = node.arguments;
          if (!isFunction(arg) || arg.params.length !== 0)
            return;
          report(
            node.callee.property,
            isOnce,
            arg,
            findSingleReturnArgumentNode(arg)
          );
        }
      }
    };
  }
});

const RULE_NAME$i = "prefer-snapshot-hint";
const snapshotMatchers = ["toMatchSnapshot", "toThrowErrorMatchingSnapshot"];
const snapshotMatcherNames = snapshotMatchers;
const isSnapshotMatcherWithoutHint = (expectFnCall) => {
  if (expectFnCall.args.length === 0)
    return true;
  if (!isSupportedAccessor(expectFnCall.matcher, "toMatchSnapshot"))
    return expectFnCall.args.length !== 1;
  if (expectFnCall.args.length === 2)
    return false;
  const [arg] = expectFnCall.args;
  return !isStringNode(arg);
};
const preferSnapshotHint = createEslintRule({
  name: RULE_NAME$i,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce including a hint with external snapshots",
      recommended: false
    },
    messages: {
      missingHint: "You should provide a hint for this snapshot"
    },
    schema: [
      {
        type: "string",
        enum: ["always", "multi"]
      }
    ]
  },
  defaultOptions: ["multi"],
  create(context, [mode]) {
    const snapshotMatchers2 = [];
    let expressionDepth = 0;
    const depths = [];
    const reportSnapshotMatchersWithoutHints = () => {
      for (const snapshotMatcher of snapshotMatchers2) {
        if (isSnapshotMatcherWithoutHint(snapshotMatcher)) {
          context.report({
            messageId: "missingHint",
            node: snapshotMatcher.matcher
          });
        }
      }
    };
    const enterExpression = () => {
      expressionDepth++;
    };
    const exitExpression = () => {
      expressionDepth--;
      if (mode === "always") {
        reportSnapshotMatchersWithoutHints();
        snapshotMatchers2.length = 0;
      }
      if (mode === "multi" && expressionDepth === 0) {
        if (snapshotMatchers2.length > 1)
          reportSnapshotMatchersWithoutHints();
        snapshotMatchers2.length = 0;
      }
    };
    return {
      "Program:exit"() {
        enterExpression();
        exitExpression();
      },
      "FunctionExpression": enterExpression,
      "FunctionExpression:exit": exitExpression,
      "ArrowFunctionExpression": enterExpression,
      "ArrowFunctionExpression:exit": exitExpression,
      "CallExpression:exit"(node) {
        if (isTypeOfVitestFnCall(node, context, ["describe", "test"]))
          expressionDepth = depths.pop() ?? 0;
      },
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect") {
          if (vitestFnCall?.type === "describe" || vitestFnCall?.type === "test") {
            depths.push(expressionDepth);
            expressionDepth = 0;
          }
          return;
        }
        const matcherName = getAccessorValue(vitestFnCall.matcher);
        if (!snapshotMatcherNames.includes(matcherName))
          return;
        snapshotMatchers2.push(vitestFnCall);
      }
    };
  }
});

const RULE_NAME$h = "valid-describe-callback";
const paramsLocation = (params) => {
  const [first] = params;
  const last = params[params.length - 1];
  return {
    start: first.loc.start,
    end: last.loc.end
  };
};
const validDescribeCallback = createEslintRule({
  name: RULE_NAME$h,
  meta: {
    type: "problem",
    docs: {
      description: "enforce valid describe callback",
      recommended: false
    },
    messages: {
      nameAndCallback: "Describe requires a name and callback arguments",
      secondArgumentMustBeFunction: "Second argument must be a function",
      unexpectedDescribeArgument: "Unexpected argument in describe callback",
      unexpectedReturnInDescribe: "Unexpected return statement in describe callback"
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "describe")
          return;
        if (vitestFnCall?.members[0]?.type === AST_NODE_TYPES.Identifier && vitestFnCall.members[0].name === "todo")
          return;
        if (node.arguments.length < 1) {
          return context.report({
            messageId: "nameAndCallback",
            loc: node.loc
          });
        }
        const [, callback] = node.arguments;
        if (!callback) {
          context.report({
            messageId: "nameAndCallback",
            loc: paramsLocation(node.arguments)
          });
          return;
        }
        if (!isFunction(callback)) {
          context.report({
            messageId: "secondArgumentMustBeFunction",
            loc: paramsLocation(node.arguments)
          });
          return;
        }
        if (vitestFnCall.members.every((s) => getAccessorValue(s) !== "each") && callback.params.length) {
          context.report({
            messageId: "unexpectedDescribeArgument",
            node: callback
          });
        }
        if (callback.body.type === AST_NODE_TYPES.CallExpression) {
          context.report({
            messageId: "unexpectedReturnInDescribe",
            node: callback
          });
        }
        if (callback.body.type === AST_NODE_TYPES.BlockStatement) {
          callback.body.body.forEach((node2) => {
            if (node2.type === AST_NODE_TYPES.ReturnStatement) {
              context.report({
                messageId: "unexpectedReturnInDescribe",
                node: node2
              });
            }
          });
        }
      }
    };
  }
});

const RULE_NAME$g = "require-top-level-describe";
const requireTopLevelDescribe = createEslintRule({
  name: RULE_NAME$g,
  meta: {
    docs: {
      description: "enforce that all tests are in a top-level describe",
      recommended: false
    },
    messages: {
      tooManyDescribes: "There should not be more than {{ max }} describe{{ s }} at the top level",
      unexpectedTestCase: "All test cases must be wrapped in a describe block.",
      unexpectedHook: "All hooks must be wrapped in a describe block."
    },
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: {
          maxNumberOfTopLevelDescribes: {
            type: "number",
            minimum: 1
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [{}],
  create(context) {
    const { maxNumberOfTopLevelDescribes = Infinity } = context.options[0] ?? {};
    let numberOfTopLevelDescribeBlocks = 0;
    let numberOfDescribeBlocks = 0;
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (!vitestFnCall)
          return;
        if (vitestFnCall.type === "describe") {
          numberOfDescribeBlocks++;
          if (numberOfDescribeBlocks === 1) {
            numberOfTopLevelDescribeBlocks++;
            if (numberOfTopLevelDescribeBlocks > maxNumberOfTopLevelDescribes) {
              context.report({
                node,
                messageId: "tooManyDescribes",
                data: {
                  max: maxNumberOfTopLevelDescribes,
                  s: maxNumberOfTopLevelDescribes === 1 ? "" : "s"
                }
              });
            }
          }
          return;
        }
        if (numberOfDescribeBlocks === 0) {
          if (vitestFnCall.type === "test") {
            context.report({ node, messageId: "unexpectedTestCase" });
            return;
          }
          if (vitestFnCall.type === "hook")
            context.report({ node, messageId: "unexpectedHook" });
        }
      },
      "CallExpression:exit"(node) {
        if (isTypeOfVitestFnCall(node, context, ["describe"]))
          numberOfDescribeBlocks--;
      }
    };
  }
});

const RULE_NAME$f = "require-to-throw-message";
const requireToThrowMessage = createEslintRule({
  name: RULE_NAME$f,
  meta: {
    type: "suggestion",
    docs: {
      description: "require toThrow() to be called with an error message",
      recommended: false
    },
    schema: [],
    messages: {
      addErrorMessage: "Add an error message to {{ matcherName }}()"
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect")
          return;
        const { matcher } = vitestFnCall;
        const matcherName = getAccessorValue(matcher);
        if (vitestFnCall.args.length === 0 && ["toThrow", "toThrowError"].includes(matcherName) && !vitestFnCall.modifiers.some((nod) => getAccessorValue(nod) === "not")) {
          context.report({
            messageId: "addErrorMessage",
            data: { matcherName },
            node: matcher
          });
        }
      }
    };
  }
});

const RULE_NAME$e = "require-hook";
const isVitestFnCall = (node, context) => {
  if (parseVitestFnCall(node, context))
    return true;
  return !!getNodeName(node)?.startsWith("vi");
};
const isNullOrUndefined = (node) => {
  return node.type === AST_NODE_TYPES.Literal && node.value === null || isIdentifier(node, "undefined");
};
const shouldBeInHook = (node, context, allowedFunctionCalls = []) => {
  switch (node.type) {
    case AST_NODE_TYPES.ExpressionStatement:
      return shouldBeInHook(node.expression, context, allowedFunctionCalls);
    case AST_NODE_TYPES.CallExpression:
      return !(isVitestFnCall(node, context) || allowedFunctionCalls.includes(getNodeName(node)));
    case AST_NODE_TYPES.VariableDeclaration: {
      if (node.kind === "const")
        return false;
      return node.declarations.some(
        ({ init }) => init !== null && !isNullOrUndefined(init)
      );
    }
    default:
      return false;
  }
};
const requireHook = createEslintRule({
  name: RULE_NAME$e,
  meta: {
    docs: {
      description: "require setup and teardown to be within a hook",
      recommended: false
    },
    messages: {
      useHook: "This should be done within a hook"
    },
    type: "suggestion",
    schema: [
      {
        type: "object",
        properties: {
          allowedFunctionCalls: {
            type: "array",
            items: { type: "string" }
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [
    {
      allowedFunctionCalls: []
    }
  ],
  create(context) {
    const { allowedFunctionCalls } = context.options[0] ?? {};
    const checkBlockBody = (body) => {
      for (const statement of body) {
        if (shouldBeInHook(statement, context, allowedFunctionCalls)) {
          context.report({
            node: statement,
            messageId: "useHook"
          });
        }
      }
    };
    return {
      Program(program) {
        checkBlockBody(program.body);
      },
      CallExpression(node) {
        if (!isTypeOfVitestFnCall(node, context, ["describe"]) || node.arguments.length < 2)
          return;
        const [, testFn] = node.arguments;
        if (!isFunction(testFn) || testFn.body.type !== AST_NODE_TYPES.BlockStatement)
          return;
        checkBlockBody(testFn.body.body);
      }
    };
  }
});

const RULE_NAME$d = "require-local-test-context-for-concurrent-snapshots";
const requireLocalTestContextForConcurrentSnapshots = createEslintRule({
  name: RULE_NAME$d,
  meta: {
    docs: {
      description: "require local Test Context for concurrent snapshot tests",
      recommended: false
    },
    messages: {
      requireLocalTestContext: "Use local Test Context instead"
    },
    type: "problem",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const isNotAnAssertion = !isTypeOfVitestFnCall(node, context, ["expect"]);
        if (isNotAnAssertion)
          return;
        const isNotASnapshotAssertion = ![
          "toMatchSnapshot",
          "toMatchInlineSnapshot",
          "toMatchFileSnapshot",
          "toThrowErrorMatchingSnapshot",
          "toThrowErrorMatchingInlineSnapshot"
          //@ts-ignore
        ].includes(node.callee?.property.name);
        if (isNotASnapshotAssertion)
          return;
        const isInsideSequentialDescribeOrTest = !context.sourceCode.getAncestors(node).some((ancestor) => {
          if (ancestor.type !== AST_NODE_TYPES.CallExpression)
            return false;
          const isNotInsideDescribeOrTest = !isTypeOfVitestFnCall(ancestor, context, ["describe", "test"]);
          if (isNotInsideDescribeOrTest)
            return false;
          const isTestRunningConcurrently = ancestor.callee.type === AST_NODE_TYPES.MemberExpression && isSupportedAccessor(ancestor.callee.property, "concurrent");
          return isTestRunningConcurrently;
        });
        if (isInsideSequentialDescribeOrTest)
          return;
        context.report({
          node,
          messageId: "requireLocalTestContext"
        });
      }
    };
  }
});

const RULE_NAME$c = "prefer-todo";
const isTargetedTestCase = (vitestFnCall) => {
  if (vitestFnCall.members.some((s) => getAccessorValue(s) !== "skip"))
    return false;
  if (vitestFnCall.name.startsWith("x"))
    return false;
  return !vitestFnCall.name.startsWith("f");
};
function isEmptyFunction(node) {
  if (!isFunction(node))
    return false;
  return node.body.type === AST_NODE_TYPES.BlockStatement && !node.body.body.length;
}
function createTodoFixer(vitestFnCall, fixer) {
  if (vitestFnCall.members.length)
    return replaceAccessorFixer(fixer, vitestFnCall.members[0], "todo");
  return fixer.replaceText(vitestFnCall.head.node, `${vitestFnCall.head.local}.todo`);
}
const preferTodo = createEslintRule({
  name: RULE_NAME$c,
  meta: {
    type: "layout",
    docs: {
      description: "enforce using `test.todo`",
      recommended: false
    },
    messages: {
      emptyTest: "Prefer todo test case over empty test case",
      unimplementedTest: "Prefer todo test case over unimplemented test case"
    },
    fixable: "code",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const [title, callback] = node.arguments;
        const vitestFnCall = parseVitestFnCall(node, context);
        if (!title || vitestFnCall?.type !== "test" || !isTargetedTestCase(vitestFnCall) || !isStringNode(title))
          return;
        if (callback && isEmptyFunction(callback)) {
          context.report({
            messageId: "emptyTest",
            node,
            fix: (fixer) => [
              fixer.removeRange([title.range[1], callback.range[1]]),
              createTodoFixer(vitestFnCall, fixer)
            ]
          });
        }
        if (hasOnlyOneArgument(node)) {
          context.report({
            messageId: "unimplementedTest",
            node,
            fix: (fixer) => createTodoFixer(vitestFnCall, fixer)
          });
        }
      }
    };
  }
});

const RULE_NAME$b = "prefer-spy-on";
const findNodeObject = (node) => {
  if ("object" in node)
    return node.object;
  if (node.callee.type === AST_NODE_TYPES.MemberExpression)
    return node.callee.object;
  return null;
};
const getVitestFnCall = (node) => {
  if (node.type !== AST_NODE_TYPES.CallExpression && node.type !== AST_NODE_TYPES.MemberExpression)
    return null;
  const obj = findNodeObject(node);
  if (!obj)
    return null;
  if (obj.type === AST_NODE_TYPES.Identifier) {
    return node.type === AST_NODE_TYPES.CallExpression && getNodeName(node.callee) === "vi.fn" ? node : null;
  }
  return getVitestFnCall(obj);
};
const getAutoFixMockImplementation = (vitestFnCall, context) => {
  const hasMockImplementationAlready = vitestFnCall.parent?.type === AST_NODE_TYPES.MemberExpression && vitestFnCall.parent.property.type === AST_NODE_TYPES.Identifier && vitestFnCall.parent.property.name === "mockImplementation";
  if (hasMockImplementationAlready)
    return "";
  const [arg] = vitestFnCall.arguments;
  const argSource = arg && context.sourceCode.getText(arg);
  return argSource ? `.mockImplementation(${argSource})` : ".mockImplementation()";
};
const preferSpyOn = createEslintRule({
  name: RULE_NAME$b,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using `vi.spyOn`",
      recommended: false
    },
    messages: {
      useViSpayOn: "Use `vi.spyOn` instead"
    },
    fixable: "code",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      AssignmentExpression(node) {
        const { left, right } = node;
        if (left.type !== AST_NODE_TYPES.MemberExpression)
          return;
        const vitestFnCall = getVitestFnCall(right);
        if (!vitestFnCall)
          return;
        context.report({
          node,
          messageId: "useViSpayOn",
          fix(fixer) {
            const lefPropQuote = left.property.type === AST_NODE_TYPES.Identifier && !left.computed ? "'" : "";
            const mockImplementation = getAutoFixMockImplementation(vitestFnCall, context);
            return [
              fixer.insertTextBefore(left, "vi.spyOn("),
              fixer.replaceTextRange(
                [left.object.range[1], left.property.range[0]],
                `, ${lefPropQuote}`
              ),
              fixer.replaceTextRange(
                [left.property.range[1], vitestFnCall.range[1]],
                `${lefPropQuote})${mockImplementation}`
              )
            ];
          }
        });
      }
    };
  }
});

const RULE_NAME$a = "prefer-comparison-matcher";
const isString = (node) => {
  return isStringNode(node) || node?.type === AST_NODE_TYPES.TemplateLiteral;
};
const isComparingToString = (expression) => {
  return isString(expression.left) || isString(expression.right);
};
const invertOperator = (operator) => {
  switch (operator) {
    case ">":
      return "<=";
    case "<":
      return ">=";
    case ">=":
      return "<";
    case "<=":
      return ">";
  }
  return null;
};
const determineMatcher = (operator, negated) => {
  const op = negated ? invertOperator(operator) : operator;
  switch (op) {
    case ">":
      return "toBeGreaterThan";
    case "<":
      return "toBeLessThan";
    case ">=":
      return "toBeGreaterThanOrEqual";
    case "<=":
      return "toBeLessThanOrEqual";
  }
  return null;
};
const preferComparisonMatcher = createEslintRule({
  name: RULE_NAME$a,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce using the built-in comparison matchers",
      recommended: false
    },
    schema: [],
    fixable: "code",
    messages: {
      useToBeComparison: "Prefer using `{{ preferredMatcher }}` instead"
    }
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect" || vitestFnCall.args.length === 0)
          return;
        const { parent: expect } = vitestFnCall.head.node;
        if (expect?.type !== AST_NODE_TYPES.CallExpression)
          return;
        const {
          arguments: [comparison],
          range: [, expectCallEnd]
        } = expect;
        const { matcher } = vitestFnCall;
        const matcherArg = getFirstMatcherArg(vitestFnCall);
        if (comparison?.type !== AST_NODE_TYPES.BinaryExpression || isComparingToString(comparison) || !EqualityMatcher.hasOwnProperty(getAccessorValue(matcher)) || !isBooleanLiteral(matcherArg))
          return;
        const [modifier] = vitestFnCall.modifiers;
        const hasNot = vitestFnCall.modifiers.some((nod) => getAccessorValue(nod) === "not");
        const preferredMatcher = determineMatcher(comparison.operator, matcherArg.value === hasNot);
        if (!preferredMatcher)
          return;
        context.report({
          fix(fixer) {
            const { sourceCode } = context;
            const modifierText = modifier && getAccessorValue(modifier) !== "not" ? `.${getAccessorValue(modifier)}` : "";
            return [
              fixer.replaceText(
                comparison,
                sourceCode.getText(comparison.left)
              ),
              fixer.replaceTextRange(
                [expectCallEnd, matcher.parent.range[1]],
                `${modifierText}.${preferredMatcher}`
              ),
              fixer.replaceText(
                matcherArg,
                sourceCode.getText(comparison.right)
              )
            ];
          },
          messageId: "useToBeComparison",
          data: { preferredMatcher },
          node: matcher
        });
      }
    };
  }
});

const RULE_NAME$9 = "prefer-to-contain";
const isFixableIncludesCallExpression = (node) => node.type === AST_NODE_TYPES.CallExpression && node.callee.type === AST_NODE_TYPES.MemberExpression && isSupportedAccessor(node.callee.property, "includes") && hasOnlyOneArgument(node) && node.arguments[0].type !== AST_NODE_TYPES.SpreadElement;
const preferToContain = createEslintRule({
  name: RULE_NAME$9,
  meta: {
    docs: {
      description: "enforce using toContain()",
      recommended: false
    },
    messages: {
      useToContain: "Use toContain() instead"
    },
    fixable: "code",
    type: "suggestion",
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type !== "expect" || vitestFnCall.args.length === 0)
          return;
        const { parent: expect } = vitestFnCall.head.node;
        if (expect?.type !== AST_NODE_TYPES.CallExpression)
          return;
        const {
          arguments: [includesCall],
          range: [, expectCallEnd]
        } = expect;
        const { matcher } = vitestFnCall;
        const matcherArg = getFirstMatcherArg(vitestFnCall);
        if (!includesCall || matcherArg.type === AST_NODE_TYPES.SpreadElement || !EqualityMatcher.hasOwnProperty(getAccessorValue(matcher)) || !isBooleanLiteral(matcherArg) || !isFixableIncludesCallExpression(includesCall))
          return;
        const hasNot = vitestFnCall.modifiers.some((nod) => getAccessorValue(nod) === "not");
        context.report({
          fix(fixer) {
            const { sourceCode } = context;
            const addNotModifier = matcherArg.value === hasNot;
            return [
              fixer.removeRange([
                includesCall.callee.property.range[0] - 1,
                includesCall.range[1]
              ]),
              fixer.replaceTextRange(
                [expectCallEnd, matcher.parent.range[1]],
                addNotModifier ? `.${ModifierName.not}.toContain` : ".toContain"
              ),
              fixer.replaceText(
                vitestFnCall.args[0],
                sourceCode.getText(includesCall.arguments[0])
              )
            ];
          },
          messageId: "useToContain",
          node: matcher
        });
      }
    };
  }
});

const RULE_NAME$8 = "prefer-expect-assertions";
const isFirstStatement = (node) => {
  let parent = node;
  while (parent) {
    if (parent.parent?.type === AST_NODE_TYPES.BlockStatement)
      return parent.parent.body[0] === parent;
    if (parent.parent?.type === AST_NODE_TYPES.ArrowFunctionExpression)
      return true;
    parent = parent.parent;
  }
  throw new Error("Could not find parent block statement");
};
const suggestRemovingExtraArguments = (context, func, from) => ({
  messageId: "suggestRemovingExtraArguments",
  fix: (fixer) => removeExtraArgumentsFixer(fixer, context, func, from)
});
const preferExpectAssertions = createEslintRule({
  name: "prefer-expect-assertions",
  meta: {
    docs: {
      description: "enforce using expect assertions instead of callbacks",
      recommended: false
    },
    messages: {
      hasAssertionsTakesNoArguments: "`expect.hasAssertions` expects no arguments",
      assertionsRequiresOneArgument: "`expect.assertions` excepts a single argument of type number",
      assertionsRequiresNumberArgument: "This argument should be a number",
      haveExpectAssertions: "Every test should have either `expect.assertions(<number of assertions>)` or `expect.hasAssertions()` as its first expression",
      suggestAddingHasAssertions: "Add `expect.hasAssertions()`",
      suggestAddingAssertions: "Add `expect.assertions(<number of assertions>)`",
      suggestRemovingExtraArguments: "Remove extra arguments"
    },
    type: "suggestion",
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          onlyFunctionsWithAsyncKeyword: { type: "boolean" },
          onlyFunctionsWithExpectInLoop: { type: "boolean" },
          onlyFunctionsWithExpectInCallback: { type: "boolean" }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [
    {
      onlyFunctionsWithAsyncKeyword: false,
      onlyFunctionsWithExpectInCallback: false,
      onlyFunctionsWithExpectInLoop: false
    }
  ],
  create(context, [options]) {
    let expressionDepth = 0;
    let hasExpectInCallBack = false;
    let hasExpectInLoop = false;
    let hasExpectAssertAsFirstStatement = false;
    let inTestCaseCall = false;
    let inForLoop = false;
    const shouldCheckFunction = (testFunction) => {
      if (!options.onlyFunctionsWithAsyncKeyword && !options.onlyFunctionsWithExpectInCallback && !options.onlyFunctionsWithExpectInLoop)
        return true;
      if (options.onlyFunctionsWithAsyncKeyword) {
        if (testFunction.async)
          return true;
      }
      if (options.onlyFunctionsWithExpectInCallback) {
        if (hasExpectInCallBack)
          return true;
      }
      if (options.onlyFunctionsWithExpectInLoop) {
        if (hasExpectInLoop)
          return true;
      }
      return false;
    };
    function checkExpectHasAssertions(expectFnCall, func) {
      if (getAccessorValue(expectFnCall.members[0]) === "hasAssertions") {
        if (expectFnCall.args.length) {
          context.report({
            messageId: "hasAssertionsTakesNoArguments",
            node: expectFnCall.matcher,
            suggest: [suggestRemovingExtraArguments(context, func, 0)]
          });
        }
        return;
      }
      if (expectFnCall.args.length !== 1) {
        let { loc } = expectFnCall.matcher;
        const suggestions = [];
        if (expectFnCall.args.length) {
          loc = expectFnCall.args[1].loc;
          suggestions.push(suggestRemovingExtraArguments(context, func, 1));
        }
        context.report({
          messageId: "assertionsRequiresOneArgument",
          suggest: suggestions,
          loc
        });
        return;
      }
      const [arg] = expectFnCall.args;
      if (arg.type === AST_NODE_TYPES.Literal && typeof arg.value === "number" && Number.isInteger(arg.value))
        return;
      context.report({
        messageId: "assertionsRequiresNumberArgument",
        node: arg
      });
    }
    const enterExpression = () => inTestCaseCall && expressionDepth++;
    const exitExpression = () => inTestCaseCall && expressionDepth--;
    const enterForLoop = () => inForLoop = true;
    const exitForLoop = () => inForLoop = false;
    return {
      "FunctionExpression": enterExpression,
      "FunctionExpression:exit": exitExpression,
      "ArrowFunctionExpression": enterExpression,
      "ArrowFunctionExpression:exit": exitExpression,
      "ForStatement": enterForLoop,
      "ForStatement:exit": exitForLoop,
      "ForInStatement": enterForLoop,
      "ForInStatement:exit": exitForLoop,
      "ForOfStatement": enterForLoop,
      "ForOfStatement:exit": exitForLoop,
      CallExpression(node) {
        const vitestFnCall = parseVitestFnCall(node, context);
        if (vitestFnCall?.type === "test") {
          inTestCaseCall = true;
          return;
        }
        if (vitestFnCall?.type === "expect" && inTestCaseCall) {
          if (expressionDepth === 1 && isFirstStatement(node) && vitestFnCall.head.node.parent?.type === AST_NODE_TYPES.MemberExpression && vitestFnCall.members.length === 1 && ["assertions", "hasAssertions"].includes(getAccessorValue(vitestFnCall.members[0]))) {
            checkExpectHasAssertions(vitestFnCall, node);
            hasExpectAssertAsFirstStatement = true;
          }
          if (inForLoop)
            hasExpectInLoop = true;
          if (expressionDepth > 1)
            hasExpectInCallBack = true;
        }
      },
      "CallExpression:exit"(node) {
        if (!isTypeOfVitestFnCall(node, context, ["test"]))
          return;
        inTestCaseCall = false;
        if (node.arguments.length < 2)
          return;
        const [, secondArg] = node.arguments;
        if (secondArg?.type === AST_NODE_TYPES.ArrowFunctionExpression && secondArg.params.length) {
          if (secondArg?.params[0].type === AST_NODE_TYPES.ObjectPattern) {
            if (secondArg.params[0].properties[0].type === AST_NODE_TYPES.Property && secondArg.params[0].properties[0].key.type === AST_NODE_TYPES.Identifier && secondArg.params[0].properties[0].key.name === "expect")
              return;
          }
        }
        if (!isFunction(secondArg) || !shouldCheckFunction(secondArg))
          return;
        hasExpectInLoop = false;
        hasExpectInCallBack = false;
        if (hasExpectAssertAsFirstStatement) {
          hasExpectAssertAsFirstStatement = false;
          return;
        }
        const suggestions = [];
        if (secondArg.body.type === AST_NODE_TYPES.BlockStatement) {
          suggestions.push(
            ["suggestAddingHasAssertions", "expect.hasAssertions();"],
            ["suggestAddingAssertions", "expect.assertions();"]
          );
        }
        context.report({
          messageId: "haveExpectAssertions",
          node,
          suggest: suggestions.map(([messageId, text]) => ({
            messageId,
            fix: (fixer) => fixer.insertTextBeforeRange(
              [secondArg.body.range[0] + 1, secondArg.body.range[1]],
              text
            )
          }))
        });
      }
    };
  }
});

const require = createRequire(import.meta.url);
const eslintRequire = createRequire(require.resolve("eslint"));
eslintRequire.resolve("espree");
const STATEMENT_LIST_PARENTS = /* @__PURE__ */ new Set([
  AST_NODE_TYPES.Program,
  AST_NODE_TYPES.BlockStatement,
  AST_NODE_TYPES.SwitchCase,
  AST_NODE_TYPES.SwitchStatement
]);
const isValidParent = (parentType) => {
  return STATEMENT_LIST_PARENTS.has(parentType);
};
const isTokenASemicolon = (token) => token.value === ";" && token.type === AST_TOKEN_TYPES.Punctuator;
const getActualLastToken = (sourceCode, node) => {
  const semiToken = sourceCode.getLastToken(node);
  const prevToken = sourceCode.getTokenBefore(semiToken);
  const nextToken = sourceCode.getTokenAfter(semiToken);
  const isSemicolonLessStyle = Boolean(
    prevToken && nextToken && prevToken.range[0] >= node.range[0] && isTokenASemicolon(semiToken) && semiToken.loc.start.line !== prevToken.loc.end.line && semiToken.loc.end.line === nextToken.loc.start.line
  );
  return isSemicolonLessStyle ? prevToken : semiToken;
};
const getPaddingLineSequences = (prevNode, nextNode, sourceCode) => {
  const pairs = [];
  const includeComments = true;
  let prevToken = getActualLastToken(sourceCode, prevNode);
  if (nextNode.loc.start.line - prevNode.loc.end.line >= 2) {
    do {
      const token = sourceCode.getTokenAfter(prevToken, { includeComments });
      if (token.loc.start.line - prevToken.loc.end.line >= 2) {
        pairs.push([prevToken, token]);
      }
      prevToken = token;
    } while (prevToken.range[0] < nextNode.range[0]);
  }
  return pairs;
};
const areTokensOnSameLine = (left, right) => left.loc.end.line === right.loc.start.line;

var PaddingType = /* @__PURE__ */ ((PaddingType2) => {
  PaddingType2[PaddingType2["Any"] = 0] = "Any";
  PaddingType2[PaddingType2["Always"] = 1] = "Always";
  return PaddingType2;
})(PaddingType || {});
var StatementType = /* @__PURE__ */ ((StatementType2) => {
  StatementType2[StatementType2["Any"] = 0] = "Any";
  StatementType2[StatementType2["AfterAllToken"] = 1] = "AfterAllToken";
  StatementType2[StatementType2["AfterEachToken"] = 2] = "AfterEachToken";
  StatementType2[StatementType2["BeforeAllToken"] = 3] = "BeforeAllToken";
  StatementType2[StatementType2["BeforeEachToken"] = 4] = "BeforeEachToken";
  StatementType2[StatementType2["DescribeToken"] = 5] = "DescribeToken";
  StatementType2[StatementType2["ExpectToken"] = 6] = "ExpectToken";
  StatementType2[StatementType2["FdescribeToken"] = 7] = "FdescribeToken";
  StatementType2[StatementType2["FitToken"] = 8] = "FitToken";
  StatementType2[StatementType2["ItToken"] = 9] = "ItToken";
  StatementType2[StatementType2["TestToken"] = 10] = "TestToken";
  StatementType2[StatementType2["XdescribeToken"] = 11] = "XdescribeToken";
  StatementType2[StatementType2["XitToken"] = 12] = "XitToken";
  StatementType2[StatementType2["XtestToken"] = 13] = "XtestToken";
  return StatementType2;
})(StatementType || {});
const paddingAlwaysTester = (prevNode, nextNode, paddingContext) => {
  const { sourceCode, ruleContext } = paddingContext;
  const paddingLines = getPaddingLineSequences(prevNode, nextNode, sourceCode);
  if (paddingLines.length > 0)
    return;
  ruleContext.report({
    node: nextNode,
    messageId: "missingPadding",
    fix(fixer) {
      let prevToken = getActualLastToken(sourceCode, prevNode);
      const nextToken = sourceCode.getFirstTokenBetween(prevToken, nextNode, {
        includeComments: true,
        /**
         * Skip the trailing comments of the previous node.
         * This inserts a blank line after the last trailing comment.
         *
         * For example:
         *
         *     foo(); // trailing comment.
         *     // comment.
         *     bar();
         *
         * Get fixed to:
         *
         *     foo(); // trailing comment.
         *
         *     // comment.
         *     bar();
         */
        filter(token) {
          if (areTokensOnSameLine(prevToken, token)) {
            prevToken = token;
            return false;
          }
          return true;
        }
      }) || nextNode;
      const insertText = areTokensOnSameLine(prevToken, nextToken) ? "\n\n" : "\n";
      return fixer.insertTextAfter(prevToken, insertText);
    }
  });
};
const paddingTesters = {
  [0 /* Any */]: () => true,
  [1 /* Always */]: paddingAlwaysTester
};
const createScopeInfo = () => {
  let scope = null;
  return {
    get prevNode() {
      return scope.prevNode;
    },
    set prevNode(node) {
      scope.prevNode = node;
    },
    enter() {
      scope = { upper: scope, prevNode: null };
    },
    exit() {
      scope = scope.upper;
    }
  };
};
const createTokenTester = (tokenName) => {
  return (node, sourceCode) => {
    let activeNode = node;
    if (activeNode.type === AST_NODE_TYPES.ExpressionStatement) {
      if (activeNode.expression.type === AST_NODE_TYPES.AwaitExpression) {
        activeNode = activeNode.expression.argument;
      }
      const token = sourceCode.getFirstToken(activeNode);
      return token?.type === AST_TOKEN_TYPES.Identifier && token.value === tokenName;
    }
    return false;
  };
};
const statementTesters = {
  [0 /* Any */]: () => true,
  [1 /* AfterAllToken */]: createTokenTester("afterAll"),
  [2 /* AfterEachToken */]: createTokenTester("afterEach"),
  [3 /* BeforeAllToken */]: createTokenTester("beforeAll"),
  [4 /* BeforeEachToken */]: createTokenTester("beforeEach"),
  [5 /* DescribeToken */]: createTokenTester("describe"),
  [6 /* ExpectToken */]: createTokenTester("expect"),
  [7 /* FdescribeToken */]: createTokenTester("fdescribe"),
  [8 /* FitToken */]: createTokenTester("fit"),
  [9 /* ItToken */]: createTokenTester("it"),
  [10 /* TestToken */]: createTokenTester("test"),
  [11 /* XdescribeToken */]: createTokenTester("xdescribe"),
  [12 /* XitToken */]: createTokenTester("xit"),
  [13 /* XtestToken */]: createTokenTester("xtest")
};
const nodeMatchesType = (node, statementType, paddingContext) => {
  let innerStatementNode = node;
  const { sourceCode } = paddingContext;
  while (innerStatementNode.type === AST_NODE_TYPES.LabeledStatement) {
    innerStatementNode = innerStatementNode.body;
  }
  if (Array.isArray(statementType)) {
    return statementType.some(
      (type) => nodeMatchesType(innerStatementNode, type, paddingContext)
    );
  }
  return statementTesters[statementType](innerStatementNode, sourceCode);
};
const testPadding = (prevNode, nextNode, paddingContext) => {
  const { configs } = paddingContext;
  const testType = (type) => paddingTesters[type](prevNode, nextNode, paddingContext);
  for (let i = configs.length - 1; i >= 0; --i) {
    const { prevStatementType: prevType, nextStatementType: nextType, paddingType } = configs[i];
    if (nodeMatchesType(prevNode, prevType, paddingContext) && nodeMatchesType(nextNode, nextType, paddingContext)) {
      return testType(paddingType);
    }
  }
  return testType(0 /* Any */);
};
const verifyNode = (node, paddingContext) => {
  const { scopeInfo } = paddingContext;
  if (!isValidParent(node?.parent.type))
    return;
  if (scopeInfo.prevNode) {
    testPadding(scopeInfo.prevNode, node, paddingContext);
  }
  scopeInfo.prevNode = node;
};
const createPaddingRule = (name, description, configs, deprecated = false) => {
  return createEslintRule({
    name,
    meta: {
      docs: { description },
      fixable: "whitespace",
      deprecated,
      messages: {
        missingPadding: "expect blank line before this statement"
      },
      schema: [],
      type: "suggestion"
    },
    defaultOptions: [],
    create(context) {
      const paddingContext = {
        ruleContext: context,
        sourceCode: context.sourceCode ?? context.getSourceCode(),
        scopeInfo: createScopeInfo(),
        configs
      };
      const { scopeInfo } = paddingContext;
      return {
        Program: scopeInfo.enter,
        "Program:exit": scopeInfo.exit,
        BlockStatement: scopeInfo.enter,
        "BlockStatement:exit": scopeInfo.exit,
        SwitchStatement: scopeInfo.enter,
        "SwitchStatement:exit": scopeInfo.exit,
        ":statement": (node) => verifyNode(node, paddingContext),
        SwitchCase(node) {
          verifyNode(node, paddingContext);
          scopeInfo.enter();
        },
        "SwitchCase:exit": scopeInfo.exit
      };
    }
  });
};

const RULE_NAME$7 = "padding-around-after-all-blocks";
const config$6 = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.AfterAllToken
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.AfterAllToken,
    nextStatementType: StatementType.Any
  }
];
const paddingAroundAfterAllBlocks = createPaddingRule(RULE_NAME$7, "Enforce padding around `afterAll` blocks", config$6);

const RULE_NAME$6 = "padding-around-after-each-blocks";
const config$5 = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.AfterEachToken
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.AfterEachToken,
    nextStatementType: StatementType.Any
  }
];
const paddingAroundAfterEachBlocks = createPaddingRule(RULE_NAME$6, "Enforce padding around `afterEach` blocks", config$5);

const RULE_NAME$5 = "padding-around-before-all-blocks";
const config$4 = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.BeforeAllToken
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.BeforeAllToken,
    nextStatementType: StatementType.Any
  }
];
const paddingAroundBeforeAllBlocks = createPaddingRule(RULE_NAME$5, "Enforce padding around `beforeAll` blocks", config$4);

const RULE_NAME$4 = "padding-around-before-each-blocks";
const config$3 = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.BeforeEachToken
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.BeforeEachToken,
    nextStatementType: StatementType.Any
  }
];
const paddingAroundBeforeEachBlocks = createPaddingRule(
  RULE_NAME$4,
  "Enforce padding around `beforeEach` blocks",
  config$3
);

const RULE_NAME$3 = "padding-around-describe-blocks";
const config$2 = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: [
      StatementType.DescribeToken,
      StatementType.FdescribeToken,
      StatementType.XdescribeToken
    ]
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: [
      StatementType.DescribeToken,
      StatementType.FdescribeToken,
      StatementType.XdescribeToken
    ],
    nextStatementType: StatementType.Any
  }
];
const paddingAroundDescribeBlocks = createPaddingRule(
  RULE_NAME$3,
  "Enforce padding around `describe` blocks",
  config$2
);

const RULE_NAME$2 = "padding-around-expect-groups";
const config$1 = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: StatementType.ExpectToken
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.ExpectToken,
    nextStatementType: StatementType.Any
  },
  {
    paddingType: PaddingType.Any,
    prevStatementType: StatementType.ExpectToken,
    nextStatementType: StatementType.ExpectToken
  }
];
const paddingAroundExpectGroups = createPaddingRule(
  RULE_NAME$2,
  "Enforce padding around `expect` groups",
  config$1
);

const RULE_NAME$1 = "padding-around-test-blocks";
const config = [
  {
    paddingType: PaddingType.Always,
    prevStatementType: StatementType.Any,
    nextStatementType: [
      StatementType.TestToken,
      StatementType.ItToken,
      StatementType.FitToken,
      StatementType.XitToken,
      StatementType.XtestToken
    ]
  },
  {
    paddingType: PaddingType.Always,
    prevStatementType: [
      StatementType.TestToken,
      StatementType.ItToken,
      StatementType.FitToken,
      StatementType.XitToken,
      StatementType.XtestToken
    ],
    nextStatementType: StatementType.Any
  }
];
const paddingAroundTestBlocks = createPaddingRule(
  RULE_NAME$1,
  "Enforce padding around afterAll blocks",
  config
);

const RULE_NAME = "padding-around-all";
const paddingAroundAll = createPaddingRule(
  RULE_NAME,
  "Enforce padding around vitest functions",
  [
    ...config$6,
    ...config$5,
    ...config$4,
    ...config$3,
    ...config$2,
    ...config$1,
    ...config
  ]
);

const createConfig = (rules) => Object.keys(rules).reduce((acc, ruleName) => {
  return {
    ...acc,
    [`vitest/${ruleName}`]: rules[ruleName]
  };
}, {});
const createConfigLegacy = (rules) => ({
  plugins: ["@vitest"],
  rules: Object.keys(rules).reduce((acc, ruleName) => {
    return {
      ...acc,
      [`@vitest/${ruleName}`]: rules[ruleName]
    };
  }, {})
});
const allRules = {
  [RULE_NAME$X]: "warn",
  [RULE_NAME$W]: "warn",
  [RULE_NAME$U]: "warn",
  [RULE_NAME$T]: "warn",
  [RULE_NAME$R]: "warn",
  [RULE_NAME$P]: "warn",
  [RULE_NAME$O]: "warn",
  [RULE_NAME$N]: "warn",
  [RULE_NAME$M]: "warn",
  [RULE_NAME$L]: "warn",
  [RULE_NAME$J]: "warn",
  [RULE_NAME$H]: "warn",
  [RULE_NAME$G]: "warn",
  [RULE_NAME$F]: "warn",
  [RULE_NAME$E]: "warn",
  [RULE_NAME$D]: "warn",
  [RULE_NAME$C]: "warn",
  [RULE_NAME$B]: "warn",
  [RULE_NAME$A]: "warn",
  [RULE_NAME$z]: "warn",
  [RULE_NAME$y]: "warn",
  [RULE_NAME$x]: "warn",
  [RULE_NAME$w]: "warn",
  [RULE_NAME$r]: "warn",
  [RULE_NAME$t]: "warn",
  [RULE_NAME$s]: "warn",
  [RULE_NAME$q]: "warn",
  [RULE_NAME$p]: "warn",
  [RULE_NAME$o]: "warn",
  [RULE_NAME$n]: "warn",
  [RULE_NAME$m]: "warn",
  [RULE_NAME$l]: "warn",
  [RULE_NAME$k]: "warn",
  [RULE_NAME$j]: "warn",
  [RULE_NAME$i]: "warn",
  [RULE_NAME$g]: "warn",
  [RULE_NAME$f]: "warn",
  [RULE_NAME$e]: "warn",
  [RULE_NAME$c]: "warn",
  [RULE_NAME$b]: "warn",
  [RULE_NAME$a]: "warn",
  [RULE_NAME$9]: "warn",
  [RULE_NAME$8]: "warn",
  [RULE_NAME$Q]: "warn",
  [RULE_NAME$7]: "warn",
  [RULE_NAME$6]: "warn",
  [RULE_NAME]: "warn",
  [RULE_NAME$5]: "warn",
  [RULE_NAME$4]: "warn",
  [RULE_NAME$3]: "warn",
  [RULE_NAME$2]: "warn",
  [RULE_NAME$1]: "warn"
};
const recommended = {
  [RULE_NAME$S]: "error",
  [RULE_NAME$V]: "error",
  [RULE_NAME$K]: "error",
  [RULE_NAME$v]: "error",
  [RULE_NAME$u]: "error",
  [RULE_NAME$h]: "error",
  [RULE_NAME$d]: "error",
  [RULE_NAME$I]: "error"
};
const plugin = {
  meta: {
    name: "vitest",
    version
  },
  rules: {
    [RULE_NAME$X]: lowerCaseTitle,
    [RULE_NAME$W]: maxNestedDescribe,
    [RULE_NAME$V]: noIdenticalTitle,
    [RULE_NAME$U]: noFocusedTests,
    [RULE_NAME$T]: noConditionalTest,
    [RULE_NAME$S]: expectExpect,
    [RULE_NAME$R]: consistentTestIt,
    [RULE_NAME$Q]: preferToBe,
    [RULE_NAME$P]: noHooks,
    [RULE_NAME$O]: noRestrictedViMethods,
    [RULE_NAME$N]: consistentTestFilename,
    [RULE_NAME$M]: maxExpect,
    [RULE_NAME$L]: noAliasMethod,
    [RULE_NAME$K]: noCommentedOutTests,
    [RULE_NAME$J]: noConditionalExpect,
    [RULE_NAME$H]: noConditionalInTest,
    [RULE_NAME$G]: noDisabledTests,
    [RULE_NAME$F]: noDoneCallback,
    [RULE_NAME$E]: noDuplicateHooks,
    [RULE_NAME$D]: noLargeSnapshots,
    [RULE_NAME$C]: nonInterpolationInSnapShots,
    [RULE_NAME$B]: noMocksImport,
    [RULE_NAME$A]: noRestrictedMatchers,
    [RULE_NAME$z]: noStandaloneExpect,
    [RULE_NAME$y]: noTestPrefixes,
    [RULE_NAME$x]: noTestReturnStatement,
    [RULE_NAME$I]: noImportNodeTest,
    [RULE_NAME$w]: preferCalledWith,
    [RULE_NAME$v]: validTitle,
    [RULE_NAME$u]: validExpect,
    [RULE_NAME$r]: preferToBeFalsy,
    [RULE_NAME$t]: preferToBeObject,
    [RULE_NAME$s]: preferToBeTruthy,
    [RULE_NAME$q]: preferToHaveLength,
    [RULE_NAME$p]: preferEqualityMatcher,
    [RULE_NAME$o]: preferStrictEqual,
    [RULE_NAME$n]: preferExpectResolves,
    [RULE_NAME$m]: preferEach,
    [RULE_NAME$l]: preferHooksOnTop,
    [RULE_NAME$k]: preferHooksInOrder,
    [RULE_NAME$d]: requireLocalTestContextForConcurrentSnapshots,
    [RULE_NAME$j]: preferMockPromiseShorthand,
    [RULE_NAME$i]: preferSnapshotHint,
    [RULE_NAME$h]: validDescribeCallback,
    [RULE_NAME$g]: requireTopLevelDescribe,
    [RULE_NAME$f]: requireToThrowMessage,
    [RULE_NAME$e]: requireHook,
    [RULE_NAME$c]: preferTodo,
    [RULE_NAME$b]: preferSpyOn,
    [RULE_NAME$a]: preferComparisonMatcher,
    [RULE_NAME$9]: preferToContain,
    [RULE_NAME$8]: preferExpectAssertions,
    [RULE_NAME$7]: paddingAroundAfterAllBlocks,
    [RULE_NAME$6]: paddingAroundAfterEachBlocks,
    [RULE_NAME]: paddingAroundAll,
    [RULE_NAME$5]: paddingAroundBeforeAllBlocks,
    [RULE_NAME$4]: paddingAroundBeforeEachBlocks,
    [RULE_NAME$3]: paddingAroundDescribeBlocks,
    [RULE_NAME$2]: paddingAroundExpectGroups,
    [RULE_NAME$1]: paddingAroundTestBlocks
  },
  configs: {
    "legacy-recommended": createConfigLegacy(recommended),
    "legacy-all": createConfigLegacy(allRules),
    "recommended": {
      plugins: {
        get vitest() {
          return plugin;
        }
      },
      rules: createConfig(recommended)
    },
    "all": {
      plugins: {
        get vitest() {
          return plugin;
        }
      },
      rules: createConfig(allRules)
    },
    "env": {
      languageOptions: {
        globals: {
          suite: "writable",
          test: "writable",
          describe: "writable",
          it: "writable",
          expect: "writable",
          assert: "writable",
          vitest: "writable",
          vi: "writable",
          beforeAll: "writable",
          afterAll: "writable",
          beforeEach: "writable",
          afterEach: "writable"
        }
      }
    }
  },
  environments: {
    env: {
      globals: {
        suite: true,
        test: true,
        describe: true,
        it: true,
        expect: true,
        assert: true,
        vitest: true,
        vi: true,
        beforeAll: true,
        afterAll: true,
        beforeEach: true,
        afterEach: true
      }
    }
  }
};

export { plugin as default };