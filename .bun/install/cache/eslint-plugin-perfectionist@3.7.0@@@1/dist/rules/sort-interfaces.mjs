import { minimatch } from 'minimatch'
import { validateGroupsConfiguration } from '../utils/validate-groups-configuration.mjs'
import { hasPartitionComment } from '../utils/is-partition-comment.mjs'
import { sortNodesByGroups } from '../utils/sort-nodes-by-groups.mjs'
import { getCommentsBefore } from '../utils/get-comments-before.mjs'
import { createEslintRule } from '../utils/create-eslint-rule.mjs'
import { isMemberOptional } from '../utils/is-member-optional.mjs'
import { getLinesBetween } from '../utils/get-lines-between.mjs'
import { getGroupNumber } from '../utils/get-group-number.mjs'
import { getSourceCode } from '../utils/get-source-code.mjs'
import { toSingleLine } from '../utils/to-single-line.mjs'
import { rangeToDiff } from '../utils/range-to-diff.mjs'
import { getSettings } from '../utils/get-settings.mjs'
import { useGroups } from '../utils/use-groups.mjs'
import { makeFixes } from '../utils/make-fixes.mjs'
import { complete } from '../utils/complete.mjs'
import { pairwise } from '../utils/pairwise.mjs'
const sortInterfaces = createEslintRule({
  name: 'sort-interfaces',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce sorted interface properties.',
    },
    fixable: 'code',
    schema: [
      {
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
            description:
              'Controls whether sorting should be case-sensitive or not.',
            type: 'boolean',
          },
          ignorePattern: {
            description:
              'Specifies names or patterns for nodes that should be ignored by rule.',
            items: {
              type: 'string',
            },
            type: 'array',
          },
          partitionByComment: {
            description:
              'Allows you to use comments to separate the interface properties into logical groups.',
            anyOf: [
              {
                type: 'boolean',
              },
              {
                type: 'string',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            ],
          },
          partitionByNewLine: {
            description:
              'Allows to use spaces to separate the nodes into logical groups.',
            type: 'boolean',
          },
          groupKind: {
            description: 'Specifies the order of optional and required nodes.',
            enum: ['mixed', 'optional-first', 'required-first'],
            type: 'string',
          },
          groups: {
            description: 'Specifies the order of the groups.',
            type: 'array',
            items: {
              oneOf: [
                {
                  type: 'string',
                },
                {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              ],
            },
          },
          customGroups: {
            description: 'Specifies custom groups.',
            type: 'object',
            additionalProperties: {
              oneOf: [
                {
                  type: 'string',
                },
                {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedInterfacePropertiesGroupOrder:
        'Expected "{{right}}" ({{rightGroup}}) to come before "{{left}}" ({{leftGroup}}).',
      unexpectedInterfacePropertiesOrder:
        'Expected "{{right}}" to come before "{{left}}".',
    },
  },
  defaultOptions: [
    {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: true,
      ignorePattern: [],
      partitionByComment: false,
      partitionByNewLine: false,
      groupKind: 'mixed',
      groups: [],
      customGroups: {},
    },
  ],
  create: context => ({
    TSInterfaceDeclaration: node => {
      if (node.body.body.length > 1) {
        let settings = getSettings(context.settings)
        let options = complete(context.options.at(0), settings, {
          partitionByComment: false,
          partitionByNewLine: false,
          type: 'alphabetical',
          groupKind: 'mixed',
          ignorePattern: [],
          ignoreCase: true,
          customGroups: {},
          order: 'asc',
          groups: [],
        })
        validateGroupsConfiguration(
          options.groups,
          ['multiline', 'unknown'],
          Object.keys(options.customGroups),
        )
        let sourceCode = getSourceCode(context)
        let partitionComment = options.partitionByComment
        if (
          !options.ignorePattern.some(pattern =>
            minimatch(node.id.name, pattern, {
              nocomment: true,
            }),
          )
        ) {
          let formattedMembers = node.body.body.reduce(
            (accumulator, element) => {
              var _a, _b, _c, _d
              if (element.type === 'TSCallSignatureDeclaration') {
                accumulator.push([])
                return accumulator
              }
              let lastElement =
                (_a = accumulator.at(-1)) == null ? void 0 : _a.at(-1)
              let name
              let { getGroup, defineGroup, setCustomGroups } = useGroups(
                options.groups,
              )
              if (element.type === 'TSPropertySignature') {
                if (element.key.type === 'Identifier') {
                  ;({ name } = element.key)
                } else if (element.key.type === 'Literal') {
                  name = `${element.key.value}`
                } else {
                  let end =
                    ((_b = element.typeAnnotation) == null
                      ? void 0
                      : _b.range.at(0)) ??
                    element.range.at(1) - (element.optional ? '?'.length : 0)
                  name = sourceCode.text.slice(element.range.at(0), end)
                }
              } else if (element.type === 'TSIndexSignature') {
                let endIndex =
                  ((_c = element.typeAnnotation) == null
                    ? void 0
                    : _c.range.at(0)) ?? element.range.at(1)
                name = sourceCode.text.slice(element.range.at(0), endIndex)
              } else {
                let endIndex =
                  ((_d = element.returnType) == null
                    ? void 0
                    : _d.range.at(0)) ?? element.range.at(1)
                name = sourceCode.text.slice(element.range.at(0), endIndex)
              }
              setCustomGroups(options.customGroups, name)
              if (element.loc.start.line !== element.loc.end.line) {
                defineGroup('multiline')
              }
              let elementSortingNode = {
                size: rangeToDiff(element.range),
                node: element,
                group: getGroup(),
                name,
              }
              if (
                (partitionComment &&
                  hasPartitionComment(
                    partitionComment,
                    getCommentsBefore(element, sourceCode),
                  )) ||
                (options.partitionByNewLine &&
                  lastElement &&
                  getLinesBetween(sourceCode, lastElement, elementSortingNode))
              ) {
                accumulator.push([])
              }
              accumulator.at(-1).push(elementSortingNode)
              return accumulator
            },
            [[]],
          )
          let { groupKind } = options
          for (let nodes of formattedMembers) {
            let sortedNodes
            if (groupKind !== 'mixed') {
              let optionalNodes = nodes.filter(member =>
                isMemberOptional(member.node),
              )
              let requiredNodes = nodes.filter(
                member => !isMemberOptional(member.node),
              )
              sortedNodes =
                groupKind === 'optional-first'
                  ? [
                      ...sortNodesByGroups(optionalNodes, options),
                      ...sortNodesByGroups(requiredNodes, options),
                    ]
                  : [
                      ...sortNodesByGroups(requiredNodes, options),
                      ...sortNodesByGroups(optionalNodes, options),
                    ]
            } else {
              sortedNodes = sortNodesByGroups(nodes, options)
            }
            pairwise(nodes, (left, right) => {
              let indexOfLeft = sortedNodes.indexOf(left)
              let indexOfRight = sortedNodes.indexOf(right)
              if (indexOfLeft > indexOfRight) {
                let leftNum = getGroupNumber(options.groups, left)
                let rightNum = getGroupNumber(options.groups, right)
                context.report({
                  messageId:
                    leftNum !== rightNum
                      ? 'unexpectedInterfacePropertiesGroupOrder'
                      : 'unexpectedInterfacePropertiesOrder',
                  data: {
                    left: toSingleLine(left.name),
                    leftGroup: left.group,
                    right: toSingleLine(right.name),
                    rightGroup: right.group,
                  },
                  node: right.node,
                  fix: fixer =>
                    makeFixes(fixer, nodes, sortedNodes, sourceCode, {
                      partitionComment,
                    }),
                })
              }
            })
          }
        }
      }
    },
  }),
})
export { sortInterfaces as default }
