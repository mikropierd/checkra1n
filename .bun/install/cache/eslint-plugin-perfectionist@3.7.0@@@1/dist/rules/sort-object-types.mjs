import { validateGroupsConfiguration } from '../utils/validate-groups-configuration.mjs'
import { hasPartitionComment } from '../utils/is-partition-comment.mjs'
import { sortNodesByGroups } from '../utils/sort-nodes-by-groups.mjs'
import { getCommentsBefore } from '../utils/get-comments-before.mjs'
import { createEslintRule } from '../utils/create-eslint-rule.mjs'
import { getLinesBetween } from '../utils/get-lines-between.mjs'
import { getGroupNumber } from '../utils/get-group-number.mjs'
import { getSourceCode } from '../utils/get-source-code.mjs'
import { toSingleLine } from '../utils/to-single-line.mjs'
import { rangeToDiff } from '../utils/range-to-diff.mjs'
import { getSettings } from '../utils/get-settings.mjs'
import { makeFixes } from '../utils/make-fixes.mjs'
import { useGroups } from '../utils/use-groups.mjs'
import { complete } from '../utils/complete.mjs'
import { pairwise } from '../utils/pairwise.mjs'
const sortObjectTypes = createEslintRule({
  name: 'sort-object-types',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce sorted object types.',
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
          partitionByComment: {
            description:
              'Allows you to use comments to separate the type members into logical groups.',
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
          groupKind: {
            description: 'Specifies top-level groups.',
            type: 'string',
            enum: ['mixed', 'required-first', 'optional-first'],
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
      unexpectedObjectTypesGroupOrder:
        'Expected "{{right}}" ({{rightGroup}}) to come before "{{left}}" ({{leftGroup}}).',
      unexpectedObjectTypesOrder:
        'Expected "{{right}}" to come before "{{left}}".',
    },
  },
  defaultOptions: [
    {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: true,
      partitionByComment: false,
      partitionByNewLine: false,
      groupKind: 'mixed',
      groups: [],
      customGroups: {},
    },
  ],
  create: context => ({
    TSTypeLiteral: node => {
      if (node.members.length > 1) {
        let settings = getSettings(context.settings)
        let options = complete(context.options.at(0), settings, {
          partitionByComment: false,
          partitionByNewLine: false,
          type: 'alphabetical',
          groupKind: 'mixed',
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
        let formattedMembers = node.members.reduce(
          (accumulator, member) => {
            var _a, _b, _c, _d
            let name
            let raw = sourceCode.text.slice(
              member.range.at(0),
              member.range.at(1),
            )
            let lastSortingNode =
              (_a = accumulator.at(-1)) == null ? void 0 : _a.at(-1)
            let { getGroup, defineGroup, setCustomGroups } = useGroups(
              options.groups,
            )
            let formatName = value => value.replace(/(,|;)$/, '')
            if (member.type === 'TSPropertySignature') {
              if (member.key.type === 'Identifier') {
                ;({ name } = member.key)
              } else if (member.key.type === 'Literal') {
                name = `${member.key.value}`
              } else {
                name = sourceCode.text.slice(
                  member.range.at(0),
                  (_b = member.typeAnnotation) == null
                    ? void 0
                    : _b.range.at(0),
                )
              }
            } else if (member.type === 'TSIndexSignature') {
              let endIndex =
                ((_c = member.typeAnnotation) == null
                  ? void 0
                  : _c.range.at(0)) ?? member.range.at(1)
              name = formatName(
                sourceCode.text.slice(member.range.at(0), endIndex),
              )
            } else {
              name = formatName(
                sourceCode.text.slice(member.range.at(0), member.range.at(1)),
              )
            }
            setCustomGroups(options.customGroups, name)
            if (member.loc.start.line !== member.loc.end.line) {
              defineGroup('multiline')
            }
            let endsWithComma = raw.endsWith(';') || raw.endsWith(',')
            let endSize = endsWithComma ? 1 : 0
            let sortingNode = {
              size: rangeToDiff(member.range) - endSize,
              group: getGroup(),
              node: member,
              name,
            }
            if (
              (partitionComment &&
                hasPartitionComment(
                  partitionComment,
                  getCommentsBefore(member, sourceCode),
                )) ||
              (options.partitionByNewLine &&
                lastSortingNode &&
                getLinesBetween(sourceCode, lastSortingNode, sortingNode))
            ) {
              accumulator.push([])
            }
            ;(_d = accumulator.at(-1)) == null ? void 0 : _d.push(sortingNode)
            return accumulator
          },
          [[]],
        )
        for (let nodes of formattedMembers) {
          let groupedByKind
          if (options.groupKind !== 'mixed') {
            groupedByKind = nodes.reduce(
              (accumulator, currentNode) => {
                let requiredIndex =
                  options.groupKind === 'required-first' ? 0 : 1
                let optionalIndex =
                  options.groupKind === 'required-first' ? 1 : 0
                if (
                  'optional' in currentNode.node &&
                  currentNode.node.optional
                ) {
                  accumulator[optionalIndex].push(currentNode)
                } else {
                  accumulator[requiredIndex].push(currentNode)
                }
                return accumulator
              },
              [[], []],
            )
          } else {
            groupedByKind = [nodes]
          }
          let sortedNodes = []
          for (let nodesByKind of groupedByKind) {
            sortedNodes.push(...sortNodesByGroups(nodesByKind, options))
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
                    ? 'unexpectedObjectTypesGroupOrder'
                    : 'unexpectedObjectTypesOrder',
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
    },
  }),
})
export { sortObjectTypes as default }
