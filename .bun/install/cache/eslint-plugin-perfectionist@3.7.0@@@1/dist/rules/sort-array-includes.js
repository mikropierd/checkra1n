'use strict'
Object.defineProperties(exports, {
  __esModule: { value: true },
  [Symbol.toStringTag]: { value: 'Module' },
})
const isPartitionComment = require('../utils/is-partition-comment.js')
const getCommentsBefore = require('../utils/get-comments-before.js')
const createEslintRule = require('../utils/create-eslint-rule.js')
const getLinesBetween = require('../utils/get-lines-between.js')
const getGroupNumber = require('../utils/get-group-number.js')
const getSourceCode = require('../utils/get-source-code.js')
const toSingleLine = require('../utils/to-single-line.js')
const rangeToDiff = require('../utils/range-to-diff.js')
const getSettings = require('../utils/get-settings.js')
const isPositive = require('../utils/is-positive.js')
const sortNodes = require('../utils/sort-nodes.js')
const makeFixes = require('../utils/make-fixes.js')
const complete = require('../utils/complete.js')
const pairwise = require('../utils/pairwise.js')
const compare = require('../utils/compare.js')
let jsonSchema = {
  type: 'object',
  properties: {
    type: {
      description: 'Specifies the sorting method.',
      type: 'string',
      enum: ['alphabetical', 'natural', 'line-length'],
    },
    order: {
      description:
        'Determines whether the sorted items should be in ascending or descending order.',
      type: 'string',
      enum: ['asc', 'desc'],
    },
    ignoreCase: {
      description: 'Controls whether sorting should be case-sensitive or not.',
      type: 'boolean',
    },
    groupKind: {
      description: 'Specifies top-level groups.',
      enum: ['mixed', 'literals-first', 'spreads-first'],
      type: 'string',
    },
    partitionByComment: {
      description:
        'Allows you to use comments to separate the array members into logical groups.',
      anyOf: [
        {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        {
          type: 'boolean',
        },
        {
          type: 'string',
        },
      ],
    },
    partitionByNewLine: {
      description:
        'Allows to use spaces to separate the nodes into logical groups.',
      type: 'boolean',
    },
  },
  additionalProperties: false,
}
const sortArrayIncludes = createEslintRule.createEslintRule({
  name: 'sort-array-includes',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce sorted arrays before include method.',
    },
    fixable: 'code',
    schema: [jsonSchema],
    messages: {
      unexpectedArrayIncludesOrder:
        'Expected "{{right}}" to come before "{{left}}".',
    },
  },
  defaultOptions: [
    {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: true,
      groupKind: 'literals-first',
      partitionByComment: false,
      partitionByNewLine: false,
    },
  ],
  create: context => ({
    MemberExpression: node => {
      if (
        (node.object.type === 'ArrayExpression' ||
          node.object.type === 'NewExpression') &&
        node.property.type === 'Identifier' &&
        node.property.name === 'includes'
      ) {
        let elements =
          node.object.type === 'ArrayExpression'
            ? node.object.elements
            : node.object.arguments
        sortArray(context, 'unexpectedArrayIncludesOrder', elements)
      }
    },
  }),
})
let sortArray = (context, messageId, elements) => {
  let settings = getSettings.getSettings(context.settings)
  if (elements.length > 1) {
    let options = complete.complete(context.options.at(0), settings, {
      groupKind: 'literals-first',
      type: 'alphabetical',
      ignoreCase: true,
      order: 'asc',
      partitionByComment: false,
      partitionByNewLine: false,
    })
    let sourceCode = getSourceCode.getSourceCode(context)
    let partitionComment = options.partitionByComment
    let formattedMembers = elements.reduce(
      (accumulator, element) => {
        var _a
        if (element !== null) {
          let group = 'unknown'
          if (typeof options.groupKind === 'string') {
            group = element.type === 'SpreadElement' ? 'spread' : 'literal'
          }
          let lastSortingNode =
            (_a = accumulator.at(-1)) == null ? void 0 : _a.at(-1)
          let sortingNode = {
            name:
              element.type === 'Literal'
                ? `${element.value}`
                : sourceCode.text.slice(...element.range),
            size: rangeToDiff.rangeToDiff(element.range),
            node: element,
            group,
          }
          if (
            (partitionComment &&
              isPartitionComment.hasPartitionComment(
                partitionComment,
                getCommentsBefore.getCommentsBefore(element, sourceCode),
              )) ||
            (options.partitionByNewLine &&
              lastSortingNode &&
              getLinesBetween.getLinesBetween(
                sourceCode,
                lastSortingNode,
                sortingNode,
              ))
          ) {
            accumulator.push([])
          }
          accumulator.at(-1).push(sortingNode)
        }
        return accumulator
      },
      [[]],
    )
    for (let nodes of formattedMembers) {
      pairwise.pairwise(nodes, (left, right) => {
        let groupKindOrder = ['unknown']
        if (typeof options.groupKind === 'string') {
          groupKindOrder =
            options.groupKind === 'literals-first'
              ? ['literal', 'spread']
              : ['spread', 'literal']
        }
        let leftNum = getGroupNumber.getGroupNumber(groupKindOrder, left)
        let rightNum = getGroupNumber.getGroupNumber(groupKindOrder, right)
        if (
          (options.groupKind !== 'mixed' && leftNum > rightNum) ||
          ((options.groupKind === 'mixed' || leftNum === rightNum) &&
            isPositive.isPositive(compare.compare(left, right, options)))
        ) {
          context.report({
            messageId,
            data: {
              left: toSingleLine.toSingleLine(left.name),
              right: toSingleLine.toSingleLine(right.name),
            },
            node: right.node,
            fix: fixer => {
              let sortedNodes =
                options.groupKind !== 'mixed'
                  ? groupKindOrder
                      .map(group => nodes.filter(n => n.group === group))
                      .map(groupedNodes =>
                        sortNodes.sortNodes(groupedNodes, options),
                      )
                      .flat()
                  : sortNodes.sortNodes(nodes, options)
              return makeFixes.makeFixes(
                fixer,
                nodes,
                sortedNodes,
                sourceCode,
                {
                  partitionComment,
                },
              )
            },
          })
        }
      })
    }
  }
}
exports.default = sortArrayIncludes
exports.jsonSchema = jsonSchema
exports.sortArray = sortArray
