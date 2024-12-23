import {
  getOverloadSignatureGroups,
  generateOfficialGroups,
  customGroupMatches,
  getCompareOptions,
} from './sort-classes-utils.mjs'
import {
  customGroupNameJsonSchema,
  customGroupSortJsonSchema,
  singleCustomGroupJsonSchema,
} from './sort-classes.types.mjs'
import {
  sortNodesByDependencies,
  getFirstUnorderedNodeDependentOn,
} from '../utils/sort-nodes-by-dependencies.mjs'
import { hasPartitionComment } from '../utils/is-partition-comment.mjs'
import { getCommentsBefore } from '../utils/get-comments-before.mjs'
import { createEslintRule } from '../utils/create-eslint-rule.mjs'
import { getGroupNumber } from '../utils/get-group-number.mjs'
import { getSourceCode } from '../utils/get-source-code.mjs'
import { toSingleLine } from '../utils/to-single-line.mjs'
import { rangeToDiff } from '../utils/range-to-diff.mjs'
import { getSettings } from '../utils/get-settings.mjs'
import { useGroups } from '../utils/use-groups.mjs'
import { sortNodes } from '../utils/sort-nodes.mjs'
import { makeFixes } from '../utils/make-fixes.mjs'
import { complete } from '../utils/complete.mjs'
import { pairwise } from '../utils/pairwise.mjs'
const sortClasses = createEslintRule({
  name: 'sort-classes',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce sorted classes.',
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
              'Allows to use comments to separate the class members into logical groups.',
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
            oneOf: [
              {
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
              {
                type: 'array',
                items: {
                  description: 'Advanced custom groups.',
                  oneOf: [
                    {
                      description: 'Custom group block.',
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        ...customGroupNameJsonSchema,
                        ...customGroupSortJsonSchema,
                        anyOf: {
                          type: 'array',
                          items: {
                            description: 'Custom group.',
                            type: 'object',
                            additionalProperties: false,
                            properties: {
                              ...singleCustomGroupJsonSchema,
                            },
                          },
                        },
                      },
                    },
                    {
                      description: 'Custom group.',
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        ...customGroupNameJsonSchema,
                        ...customGroupSortJsonSchema,
                        ...singleCustomGroupJsonSchema,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedClassesGroupOrder:
        'Expected "{{right}}" ({{rightGroup}}) to come before "{{left}}" ({{leftGroup}}).',
      unexpectedClassesOrder: 'Expected "{{right}}" to come before "{{left}}".',
      unexpectedClassesDependencyOrder:
        'Expected dependency "{{right}}" to come before "{{nodeDependentOnRight}}".',
    },
  },
  defaultOptions: [
    {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: true,
      partitionByComment: false,
      groups: [
        'index-signature',
        'static-property',
        'static-block',
        ['protected-property', 'protected-accessor-property'],
        ['private-property', 'private-accessor-property'],
        ['property', 'accessor-property'],
        'constructor',
        'static-method',
        'protected-method',
        'private-method',
        'method',
        ['get-method', 'set-method'],
        'unknown',
      ],
      customGroups: [],
    },
  ],
  create: context => ({
    ClassBody: node => {
      var _a
      if (node.body.length > 1) {
        let settings = getSettings(context.settings)
        let options = complete(context.options.at(0), settings, {
          groups: [
            'index-signature',
            'static-property',
            'static-block',
            ['protected-property', 'protected-accessor-property'],
            ['private-property', 'private-accessor-property'],
            ['property', 'accessor-property'],
            'constructor',
            'static-method',
            'protected-method',
            'private-method',
            'method',
            ['get-method', 'set-method'],
            'unknown',
          ],
          partitionByComment: false,
          type: 'alphabetical',
          ignoreCase: true,
          customGroups: [],
          order: 'asc',
        })
        let sourceCode = getSourceCode(context)
        let className = (_a = node.parent.id) == null ? void 0 : _a.name
        let getDependencyName = (nodeName, isStatic) =>
          `${isStatic ? 'static ' : ''}${nodeName}`
        let classMethodsDependencyNames = new Set(
          node.body
            .map(member => {
              if (
                (member.type === 'MethodDefinition' ||
                  member.type === 'TSAbstractMethodDefinition') &&
                'name' in member.key
              ) {
                return getDependencyName(member.key.name, member.static)
              }
              return null
            })
            .filter(m => m !== null),
        )
        let extractDependencies = (expression, isMemberStatic) => {
          let dependencies = []
          let checkNode = nodeValue => {
            if (
              nodeValue.type === 'ArrowFunctionExpression' ||
              nodeValue.type === 'FunctionExpression'
            ) {
              return
            }
            if (
              nodeValue.type === 'MemberExpression' &&
              (nodeValue.object.type === 'ThisExpression' ||
                (nodeValue.object.type === 'Identifier' &&
                  nodeValue.object.name === className)) &&
              nodeValue.property.type === 'Identifier'
            ) {
              let isStaticDependency =
                isMemberStatic || nodeValue.object.type === 'Identifier'
              let dependencyName = getDependencyName(
                nodeValue.property.name,
                isStaticDependency,
              )
              if (!classMethodsDependencyNames.has(dependencyName)) {
                dependencies.push(dependencyName)
              }
            }
            if (nodeValue.type === 'Property') {
              traverseNode(nodeValue.key)
              traverseNode(nodeValue.value)
            }
            if (nodeValue.type === 'ConditionalExpression') {
              traverseNode(nodeValue.test)
              traverseNode(nodeValue.consequent)
              traverseNode(nodeValue.alternate)
            }
            if (
              'expression' in nodeValue &&
              typeof nodeValue.expression !== 'boolean'
            ) {
              traverseNode(nodeValue.expression)
            }
            if ('object' in nodeValue) {
              traverseNode(nodeValue.object)
            }
            if ('callee' in nodeValue) {
              traverseNode(nodeValue.callee)
            }
            if ('init' in nodeValue && nodeValue.init) {
              traverseNode(nodeValue.init)
            }
            if ('body' in nodeValue && nodeValue.body) {
              traverseNode(nodeValue.body)
            }
            if ('left' in nodeValue) {
              traverseNode(nodeValue.left)
            }
            if ('right' in nodeValue) {
              traverseNode(nodeValue.right)
            }
            if ('elements' in nodeValue) {
              nodeValue.elements
                .filter(currentNode => currentNode !== null)
                .forEach(traverseNode)
            }
            if ('argument' in nodeValue && nodeValue.argument) {
              traverseNode(nodeValue.argument)
            }
            if ('arguments' in nodeValue) {
              nodeValue.arguments.forEach(traverseNode)
            }
            if ('declarations' in nodeValue) {
              nodeValue.declarations.forEach(traverseNode)
            }
            if ('properties' in nodeValue) {
              nodeValue.properties.forEach(traverseNode)
            }
            if ('expressions' in nodeValue) {
              nodeValue.expressions.forEach(traverseNode)
            }
          }
          let traverseNode = nodeValue => {
            if (Array.isArray(nodeValue)) {
              nodeValue.forEach(traverseNode)
            } else {
              checkNode(nodeValue)
            }
          }
          traverseNode(expression)
          return dependencies
        }
        let overloadSignatureGroups = getOverloadSignatureGroups(node.body)
        let formattedNodes = node.body.reduce(
          (accumulator, member) => {
            var _a2, _b, _c, _d
            let comments = getCommentsBefore(member, sourceCode)
            if (
              options.partitionByComment &&
              hasPartitionComment(options.partitionByComment, comments)
            ) {
              accumulator.push([])
            }
            let name
            let dependencies = []
            let { getGroup, defineGroup, setCustomGroups } = useGroups(
              options.groups,
            )
            if (member.type === 'StaticBlock') {
              name = 'static'
            } else if (member.type === 'TSIndexSignature') {
              name = sourceCode.text.slice(
                member.range.at(0),
                ((_a2 = member.typeAnnotation) == null
                  ? void 0
                  : _a2.range.at(0)) ?? member.range.at(1),
              )
            } else {
              if (member.key.type === 'Identifier') {
                ;({ name } = member.key)
              } else {
                name = sourceCode.text.slice(...member.key.range)
              }
            }
            let isPrivateHash =
              'key' in member && member.key.type === 'PrivateIdentifier'
            let decorated = false
            let decorators = []
            if ('decorators' in member) {
              decorated = member.decorators.length > 0
              for (let decorator of member.decorators) {
                if (decorator.expression.type === 'Identifier') {
                  decorators.push(decorator.expression.name)
                } else if (
                  decorator.expression.type === 'CallExpression' &&
                  decorator.expression.callee.type === 'Identifier'
                ) {
                  decorators.push(decorator.expression.callee.name)
                }
              }
            }
            let modifiers = []
            let selectors = []
            if (
              member.type === 'MethodDefinition' ||
              member.type === 'TSAbstractMethodDefinition'
            ) {
              if (member.static) {
                modifiers.push('static')
              }
              if (member.type === 'TSAbstractMethodDefinition') {
                modifiers.push('abstract')
              }
              if (decorated) {
                modifiers.push('decorated')
              }
              if (member.override) {
                modifiers.push('override')
              }
              if (member.accessibility === 'protected') {
                modifiers.push('protected')
              } else if (member.accessibility === 'private' || isPrivateHash) {
                modifiers.push('private')
              } else {
                modifiers.push('public')
              }
              if (member.optional) {
                modifiers.push('optional')
              }
              if (member.kind === 'constructor') {
                selectors.push('constructor')
              }
              if (member.kind === 'get') {
                selectors.push('get-method')
              }
              if (member.kind === 'set') {
                selectors.push('set-method')
              }
              selectors.push('method')
            } else if (member.type === 'TSIndexSignature') {
              if (member.static) {
                modifiers.push('static')
              }
              if (member.readonly) {
                modifiers.push('readonly')
              }
              selectors.push('index-signature')
            } else if (member.type === 'StaticBlock') {
              selectors.push('static-block')
              dependencies = extractDependencies(member, true)
            } else if (
              member.type === 'AccessorProperty' ||
              member.type === 'TSAbstractAccessorProperty'
            ) {
              if (member.static) {
                modifiers.push('static')
              }
              if (member.type === 'TSAbstractAccessorProperty') {
                modifiers.push('abstract')
              }
              if (decorated) {
                modifiers.push('decorated')
              }
              if (member.override) {
                modifiers.push('override')
              }
              if (member.accessibility === 'protected') {
                modifiers.push('protected')
              } else if (member.accessibility === 'private' || isPrivateHash) {
                modifiers.push('private')
              } else {
                modifiers.push('public')
              }
              selectors.push('accessor-property')
            } else {
              if (member.static) {
                modifiers.push('static')
              }
              if (member.declare) {
                modifiers.push('declare')
              }
              if (member.type === 'TSAbstractPropertyDefinition') {
                modifiers.push('abstract')
              }
              if (decorated) {
                modifiers.push('decorated')
              }
              if (member.override) {
                modifiers.push('override')
              }
              if (member.readonly) {
                modifiers.push('readonly')
              }
              if (member.accessibility === 'protected') {
                modifiers.push('protected')
              } else if (member.accessibility === 'private' || isPrivateHash) {
                modifiers.push('private')
              } else {
                modifiers.push('public')
              }
              if (member.optional) {
                modifiers.push('optional')
              }
              let isFunctionProperty =
                ((_b = member.value) == null ? void 0 : _b.type) ===
                  'ArrowFunctionExpression' ||
                ((_c = member.value) == null ? void 0 : _c.type) ===
                  'FunctionExpression'
              if (isFunctionProperty) {
                selectors.push('function-property')
              }
              selectors.push('property')
              if (
                member.type === 'PropertyDefinition' &&
                member.value &&
                !isFunctionProperty
              ) {
                dependencies = extractDependencies(member.value, member.static)
              }
            }
            for (let officialGroup of generateOfficialGroups(
              modifiers,
              selectors,
            )) {
              defineGroup(officialGroup)
            }
            if (Array.isArray(options.customGroups)) {
              for (let customGroup of options.customGroups) {
                if (
                  customGroupMatches({
                    customGroup,
                    elementName: name,
                    modifiers,
                    selectors,
                    decorators,
                  })
                ) {
                  defineGroup(customGroup.groupName, true)
                  if (getGroup() === customGroup.groupName) {
                    break
                  }
                }
              }
            } else {
              setCustomGroups(options.customGroups, name, {
                override: true,
              })
            }
            let overloadSignatureGroupMember =
              (_d = overloadSignatureGroups.find(overloadSignatures =>
                overloadSignatures.includes(member),
              )) == null
                ? void 0
                : _d.at(-1)
            let value = {
              size: overloadSignatureGroupMember
                ? rangeToDiff(overloadSignatureGroupMember.range)
                : rangeToDiff(member.range),
              group: getGroup(),
              node: member,
              dependencies,
              name,
              dependencyName: getDependencyName(
                name,
                modifiers.includes('static'),
              ),
            }
            accumulator.at(-1).push(value)
            return accumulator
          },
          [[]],
        )
        let sortedNodes = []
        for (let nodes2 of formattedNodes) {
          let nodesByNonIgnoredGroupNumber = {}
          let ignoredNodeIndices = []
          for (let [index, sortingNode] of nodes2.entries()) {
            let groupNum = getGroupNumber(options.groups, sortingNode)
            if (groupNum === options.groups.length) {
              ignoredNodeIndices.push(index)
              continue
            }
            nodesByNonIgnoredGroupNumber[groupNum] =
              nodesByNonIgnoredGroupNumber[groupNum] ?? []
            nodesByNonIgnoredGroupNumber[groupNum].push(sortingNode)
          }
          for (let groupNumber of Object.keys(
            nodesByNonIgnoredGroupNumber,
          ).sort((a, b) => Number(a) - Number(b))) {
            let compareOptions = getCompareOptions(options, Number(groupNumber))
            if (!compareOptions) {
              sortedNodes.push(
                ...nodesByNonIgnoredGroupNumber[Number(groupNumber)],
              )
            } else {
              sortedNodes.push(
                ...sortNodes(
                  nodesByNonIgnoredGroupNumber[Number(groupNumber)],
                  compareOptions,
                ),
              )
            }
          }
          for (let ignoredIndex of ignoredNodeIndices) {
            sortedNodes.splice(ignoredIndex, 0, nodes2[ignoredIndex])
          }
        }
        sortedNodes = sortNodesByDependencies(sortedNodes)
        let nodes = formattedNodes.flat()
        pairwise(nodes, (left, right) => {
          let leftNum = getGroupNumber(options.groups, left)
          let rightNum = getGroupNumber(options.groups, right)
          let isLeftOrRightIgnored =
            leftNum === options.groups.length ||
            rightNum === options.groups.length
          let indexOfLeft = sortedNodes.indexOf(left)
          let indexOfRight = sortedNodes.indexOf(right)
          let firstUnorderedNodeDependentOnRight =
            getFirstUnorderedNodeDependentOn(right, nodes)
          if (
            firstUnorderedNodeDependentOnRight ||
            (!isLeftOrRightIgnored && indexOfLeft > indexOfRight)
          ) {
            let messageId
            if (firstUnorderedNodeDependentOnRight) {
              messageId = 'unexpectedClassesDependencyOrder'
            } else {
              messageId =
                leftNum !== rightNum
                  ? 'unexpectedClassesGroupOrder'
                  : 'unexpectedClassesOrder'
            }
            context.report({
              messageId,
              data: {
                left: toSingleLine(left.name),
                leftGroup: left.group,
                right: toSingleLine(right.name),
                rightGroup: right.group,
                nodeDependentOnRight:
                  firstUnorderedNodeDependentOnRight == null
                    ? void 0
                    : firstUnorderedNodeDependentOnRight.name,
              },
              node: right.node,
              fix: fixer =>
                makeFixes(fixer, nodes, sortedNodes, sourceCode, {
                  partitionComment: options.partitionByComment,
                }),
            })
          }
        })
      }
    },
  }),
})
export { sortClasses as default }
