import { hasPartitionComment } from '../utils/is-partition-comment.mjs'
import { getCommentsBefore } from '../utils/get-comments-before.mjs'
import { createEslintRule } from '../utils/create-eslint-rule.mjs'
import { getLinesBetween } from '../utils/get-lines-between.mjs'
import { getGroupNumber } from '../utils/get-group-number.mjs'
import { getSourceCode } from '../utils/get-source-code.mjs'
import { toSingleLine } from '../utils/to-single-line.mjs'
import { rangeToDiff } from '../utils/range-to-diff.mjs'
import { getSettings } from '../utils/get-settings.mjs'
import { isPositive } from '../utils/is-positive.mjs'
import { sortNodes } from '../utils/sort-nodes.mjs'
import { makeFixes } from '../utils/make-fixes.mjs'
import { complete } from '../utils/complete.mjs'
import { pairwise } from '../utils/pairwise.mjs'
import { compare } from '../utils/compare.mjs'
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
const sortArrayIncludes = createEslintRule({
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
  let settings = getSettings(context.settings)
  if (elements.length > 1) {
    let options = complete(context.options.at(0), settings, {
      groupKind: 'literals-first',
      type: 'alphabetical',
      ignoreCase: true,
      order: 'asc',
      partitionByComment: false,
      partitionByNewLine: false,
    })
    let sourceCode = getSourceCode(context)
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
            size: rangeToDiff(element.range),
            node: element,
            group,
          }
          if (
            (partitionComment &&
              hasPartitionComment(
                partitionComment,
                getCommentsBefore(element, sourceCode),
              )) ||
            (options.partitionByNewLine &&
              lastSortingNode &&
              getLinesBetween(sourceCode, lastSortingNode, sortingNode))
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
      pairwise(nodes, (left, right) => {
        let groupKindOrder = ['unknown']
        if (typeof options.groupKind === 'string') {
          groupKindOrder =
            options.groupKind === 'literals-first'
              ? ['literal', 'spread']
              : ['spread', 'literal']
        }
        let leftNum = getGroupNumber(groupKindOrder, left)
        let rightNum = getGroupNumber(groupKindOrder, right)
        if (
          (options.groupKind !== 'mixed' && leftNum > rightNum) ||
          ((options.groupKind === 'mixed' || leftNum === rightNum) &&
            isPositive(compare(left, right, options)))
        ) {
          context.report({
            messageId,
            data: {
              left: toSingleLine(left.name),
              right: toSingleLine(right.name),
            },
            node: right.node,
            fix: fixer => {
              let sortedNodes =
                options.groupKind !== 'mixed'
                  ? groupKindOrder
                      .map(group => nodes.filter(n => n.group === group))
                      .map(groupedNodes => sortNodes(groupedNodes, options))
                      .flat()
                  : sortNodes(nodes, options)
              return makeFixes(fixer, nodes, sortedNodes, sourceCode, {
                partitionComment,
              })
            },
          })
        }
      })
    }
  }
}
export { sortArrayIncludes as default, jsonSchema, sortArray }