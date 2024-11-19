'use strict'
const node_module = require('node:module')
const minimatch = require('minimatch')
const validateGroupsConfiguration = require('../utils/validate-groups-configuration.js')
const getCommentsBefore = require('../utils/get-comments-before.js')
const createEslintRule = require('../utils/create-eslint-rule.js')
const getLinesBetween = require('../utils/get-lines-between.js')
const getGroupNumber = require('../utils/get-group-number.js')
const getSourceCode = require('../utils/get-source-code.js')
const getNodeRange = require('../utils/get-node-range.js')
const rangeToDiff = require('../utils/range-to-diff.js')
const getSettings = require('../utils/get-settings.js')
const isPositive = require('../utils/is-positive.js')
const useGroups = require('../utils/use-groups.js')
const sortNodes = require('../utils/sort-nodes.js')
const complete = require('../utils/complete.js')
const pairwise = require('../utils/pairwise.js')
const compare = require('../utils/compare.js')
const sortImports = createEslintRule.createEslintRule({
  name: 'sort-imports',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce sorted imports.',
    },
    fixable: 'code',
    schema: [
      {
        id: 'sort-imports',
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
          internalPattern: {
            description: 'Specifies the pattern for internal modules.',
            items: {
              type: 'string',
            },
            type: 'array',
          },
          sortSideEffects: {
            description:
              'Controls whether side-effect imports should be sorted.',
            type: 'boolean',
          },
          newlinesBetween: {
            description:
              'Specifies how new lines should be handled between import groups.',
            enum: ['ignore', 'always', 'never'],
            type: 'string',
          },
          maxLineLength: {
            description: 'Specifies the maximum line length.',
            type: 'integer',
            minimum: 0,
            exclusiveMinimum: true,
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
            properties: {
              type: {
                type: 'object',
              },
              value: {
                type: 'object',
              },
            },
            additionalProperties: false,
          },
          environment: {
            description: 'Specifies the environment.',
            enum: ['node', 'bun'],
            type: 'string',
          },
        },
        allOf: [
          {
            $ref: '#/definitions/max-line-length-requires-line-length-type',
          },
        ],
        additionalProperties: false,
        dependencies: {
          maxLineLength: ['type'],
        },
        definitions: {
          'is-line-length': {
            properties: {
              type: { enum: ['line-length'], type: 'string' },
            },
            required: ['type'],
            type: 'object',
          },
          'max-line-length-requires-line-length-type': {
            anyOf: [
              {
                not: {
                  required: ['maxLineLength'],
                  type: 'object',
                },
                type: 'object',
              },
              {
                $ref: '#/definitions/is-line-length',
              },
            ],
          },
        },
      },
    ],
    messages: {
      unexpectedImportsGroupOrder:
        'Expected "{{right}}" ({{rightGroup}}) to come before "{{left}}" ({{leftGroup}}).',
      unexpectedImportsOrder: 'Expected "{{right}}" to come before "{{left}}".',
      missedSpacingBetweenImports:
        'Missed spacing between "{{left}}" and "{{right}}" imports.',
      extraSpacingBetweenImports:
        'Extra spacing between "{{left}}" and "{{right}}" imports.',
    },
  },
  defaultOptions: [
    {
      type: 'alphabetical',
      order: 'asc',
      ignoreCase: true,
      internalPattern: ['~/**'],
      sortSideEffects: false,
      newlinesBetween: 'always',
      maxLineLength: void 0,
      groups: [
        'type',
        ['builtin', 'external'],
        'internal-type',
        'internal',
        ['parent-type', 'sibling-type', 'index-type'],
        ['parent', 'sibling', 'index'],
        'object',
        'unknown',
      ],
      customGroups: { type: {}, value: {} },
      environment: 'node',
    },
  ],
  create: context => {
    let settings = getSettings.getSettings(context.settings)
    let options = complete.complete(context.options.at(0), settings, {
      groups: [
        'type',
        ['builtin', 'external'],
        'internal-type',
        'internal',
        ['parent-type', 'sibling-type', 'index-type'],
        ['parent', 'sibling', 'index'],
        'object',
        'unknown',
      ],
      customGroups: { type: {}, value: {} },
      internalPattern: ['~/**'],
      newlinesBetween: 'always',
      sortSideEffects: false,
      type: 'alphabetical',
      environment: 'node',
      ignoreCase: true,
      order: 'asc',
    })
    let sourceCode = getSourceCode.getSourceCode(context)
    let hasUnknownGroup = false
    for (let group of options.groups) {
      if (Array.isArray(group)) {
        for (let subGroup of group) {
          if (subGroup === 'unknown') {
            hasUnknownGroup = true
          }
        }
      } else {
        if (group === 'unknown') {
          hasUnknownGroup = true
        }
      }
    }
    if (!hasUnknownGroup) {
      options.groups = [...options.groups, 'unknown']
    }
    validateGroupsConfiguration.validateGroupsConfiguration(
      options.groups,
      [
        'side-effect-style',
        'external-type',
        'internal-type',
        'builtin-type',
        'sibling-type',
        'parent-type',
        'side-effect',
        'index-type',
        'internal',
        'external',
        'sibling',
        'unknown',
        'builtin',
        'parent',
        'object',
        'index',
        'style',
        'type',
      ],
      [
        ...Object.keys(options.customGroups.type ?? {}),
        ...Object.keys(options.customGroups.value ?? {}),
      ],
    )
    let nodes = []
    let isSideEffectImport = node =>
      node.type === 'ImportDeclaration' &&
      node.specifiers.length ===
        0 /* Avoid matching on named imports without specifiers */ &&
      !/}\s*from\s+/.test(sourceCode.getText(node))
    let computeGroup = node => {
      let isStyle = value =>
        ['.less', '.scss', '.sass', '.styl', '.pcss', '.css', '.sss'].some(
          extension => value.endsWith(extension),
        )
      let isIndex = value =>
        [
          './index.d.js',
          './index.d.ts',
          './index.js',
          './index.ts',
          './index',
          './',
          '.',
        ].includes(value)
      let isParent = value => value.indexOf('..') === 0
      let isSibling = value => value.indexOf('./') === 0
      let { getGroup, defineGroup, setCustomGroups } = useGroups.useGroups(
        options.groups,
      )
      let isInternal = value =>
        options.internalPattern.length &&
        options.internalPattern.some(pattern =>
          minimatch.minimatch(value, pattern, {
            nocomment: true,
          }),
        )
      let isCoreModule = value => {
        let bunModules = [
          'bun',
          'bun:ffi',
          'bun:jsc',
          'bun:sqlite',
          'bun:test',
          'bun:wrap',
          'detect-libc',
          'undici',
          'ws',
        ]
        let builtinPrefixOnlyModules = ['sea', 'sqlite', 'test']
        return (
          node_module.builtinModules.includes(
            value.startsWith('node:') ? value.split('node:')[1] : value,
          ) ||
          builtinPrefixOnlyModules.some(
            module2 => `node:${module2}` === value,
          ) ||
          (options.environment === 'bun' ? bunModules.includes(value) : false)
        )
      }
      let isExternal = value =>
        !(value.startsWith('.') || value.startsWith('/'))
      if (node.type !== 'VariableDeclaration' && node.importKind === 'type') {
        if (node.type === 'ImportDeclaration') {
          setCustomGroups(options.customGroups.type, node.source.value)
          if (isIndex(node.source.value)) {
            defineGroup('index-type')
          }
          if (isSibling(node.source.value)) {
            defineGroup('sibling-type')
          }
          if (isParent(node.source.value)) {
            defineGroup('parent-type')
          }
          if (isInternal(node.source.value)) {
            defineGroup('internal-type')
          }
          if (isCoreModule(node.source.value)) {
            defineGroup('builtin-type')
          }
          if (isExternal(node.source.value)) {
            defineGroup('external-type')
          }
        }
        defineGroup('type')
      }
      if (
        node.type === 'ImportDeclaration' ||
        node.type === 'VariableDeclaration'
      ) {
        let value
        if (node.type === 'ImportDeclaration') {
          ;({ value } = node.source)
        } else {
          let decl = node.declarations[0].init
          let declValue = decl.arguments[0].value
          value = declValue.toString()
        }
        setCustomGroups(options.customGroups.value, value)
        if (isSideEffectImport(node) && isStyle(value)) {
          defineGroup('side-effect-style')
        }
        if (isSideEffectImport(node)) {
          defineGroup('side-effect')
        }
        if (isStyle(value)) {
          defineGroup('style')
        }
        if (isIndex(value)) {
          defineGroup('index')
        }
        if (isSibling(value)) {
          defineGroup('sibling')
        }
        if (isParent(value)) {
          defineGroup('parent')
        }
        if (isInternal(value)) {
          defineGroup('internal')
        }
        if (isCoreModule(value)) {
          defineGroup('builtin')
        }
        if (isExternal(value)) {
          defineGroup('external')
        }
      }
      return getGroup()
    }
    let hasMultipleImportDeclarations = node => node.specifiers.length > 1
    let registerNode = node => {
      let name
      if (node.type === 'ImportDeclaration') {
        name = node.source.value
      } else if (node.type === 'TSImportEqualsDeclaration') {
        if (node.moduleReference.type === 'TSExternalModuleReference') {
          name = `${node.moduleReference.expression.value}`
        } else {
          name = sourceCode.text.slice(...node.moduleReference.range)
        }
      } else {
        let decl = node.declarations[0].init
        let { value } = decl.arguments[0]
        name = value.toString()
      }
      nodes.push({
        size: rangeToDiff.rangeToDiff(node.range),
        group: computeGroup(node),
        node,
        name,
        ...(options.type === 'line-length' &&
          options.maxLineLength && {
            hasMultipleImportDeclarations: hasMultipleImportDeclarations(node),
          }),
      })
    }
    return {
      TSImportEqualsDeclaration: registerNode,
      ImportDeclaration: registerNode,
      VariableDeclaration: node => {
        var _a
        if (
          node.declarations[0].init &&
          node.declarations[0].init.type === 'CallExpression' &&
          node.declarations[0].init.callee.type === 'Identifier' &&
          node.declarations[0].init.callee.name === 'require' &&
          ((_a = node.declarations[0].init.arguments[0]) == null
            ? void 0
            : _a.type) === 'Literal'
        ) {
          registerNode(node)
        }
      },
      'Program:exit': () => {
        var _a
        let hasContentBetweenNodes = (left, right) =>
          getCommentsBefore.getCommentsBefore(right.node, sourceCode).length >
            0 ||
          !!sourceCode.getTokensBetween(left.node, right.node, {
            includeComments: false,
          }).length
        let fix = (fixer, nodesToFix) => {
          let fixes = []
          let grouped = {}
          for (let node of nodesToFix) {
            let groupNum = getGroupNumber.getGroupNumber(options.groups, node)
            if (!(groupNum in grouped)) {
              grouped[groupNum] = [node]
            } else {
              if (!options.sortSideEffects && isSideEffectImport(node.node)) {
                grouped[groupNum] = [...grouped[groupNum], node]
              } else {
                grouped[groupNum] = sortNodes.sortNodes(
                  [...grouped[groupNum], node],
                  options,
                )
              }
            }
          }
          let formatted = Object.keys(grouped)
            .sort((a, b) => Number(a) - Number(b))
            .reduce(
              (accumulator, group) => [...accumulator, ...grouped[group]],
              [],
            )
          for (let max = formatted.length, i = 0; i < max; i++) {
            let node = formatted.at(i)
            fixes.push(
              fixer.replaceTextRange(
                getNodeRange.getNodeRange(nodesToFix.at(i).node, sourceCode),
                sourceCode.text.slice(
                  ...getNodeRange.getNodeRange(node.node, sourceCode),
                ),
              ),
            )
            if (options.newlinesBetween !== 'ignore') {
              let nextNode = formatted.at(i + 1)
              if (nextNode) {
                let linesBetweenImports = getLinesBetween.getLinesBetween(
                  sourceCode,
                  nodesToFix.at(i),
                  nodesToFix.at(i + 1),
                )
                if (
                  (options.newlinesBetween === 'always' &&
                    getGroupNumber.getGroupNumber(options.groups, node) ===
                      getGroupNumber.getGroupNumber(options.groups, nextNode) &&
                    linesBetweenImports !== 0) ||
                  (options.newlinesBetween === 'never' &&
                    linesBetweenImports > 0)
                ) {
                  fixes.push(
                    fixer.removeRange([
                      getNodeRange
                        .getNodeRange(nodesToFix.at(i).node, sourceCode)
                        .at(1),
                      getNodeRange
                        .getNodeRange(nodesToFix.at(i + 1).node, sourceCode)
                        .at(0) - 1,
                    ]),
                  )
                }
                if (
                  options.newlinesBetween === 'always' &&
                  getGroupNumber.getGroupNumber(options.groups, node) !==
                    getGroupNumber.getGroupNumber(options.groups, nextNode) &&
                  linesBetweenImports > 1
                ) {
                  fixes.push(
                    fixer.replaceTextRange(
                      [
                        getNodeRange
                          .getNodeRange(nodesToFix.at(i).node, sourceCode)
                          .at(1),
                        getNodeRange
                          .getNodeRange(nodesToFix.at(i + 1).node, sourceCode)
                          .at(0) - 1,
                      ],
                      '\n',
                    ),
                  )
                }
                if (
                  options.newlinesBetween === 'always' &&
                  getGroupNumber.getGroupNumber(options.groups, node) !==
                    getGroupNumber.getGroupNumber(options.groups, nextNode) &&
                  linesBetweenImports === 0
                ) {
                  fixes.push(
                    fixer.insertTextAfterRange(
                      getNodeRange.getNodeRange(
                        nodesToFix.at(i).node,
                        sourceCode,
                      ),
                      '\n',
                    ),
                  )
                }
              }
            }
          }
          return fixes
        }
        let splittedNodes = [[]]
        for (let node of nodes) {
          let lastNode =
            (_a = splittedNodes.at(-1)) == null ? void 0 : _a.at(-1)
          if (lastNode && hasContentBetweenNodes(lastNode, node)) {
            splittedNodes.push([node])
          } else {
            splittedNodes.at(-1).push(node)
          }
        }
        for (let nodeList of splittedNodes) {
          pairwise.pairwise(nodeList, (left, right) => {
            let leftNum = getGroupNumber.getGroupNumber(options.groups, left)
            let rightNum = getGroupNumber.getGroupNumber(options.groups, right)
            let numberOfEmptyLinesBetween = getLinesBetween.getLinesBetween(
              sourceCode,
              left,
              right,
            )
            if (
              !(
                !options.sortSideEffects &&
                isSideEffectImport(left.node) &&
                isSideEffectImport(right.node)
              ) &&
              !hasContentBetweenNodes(left, right) &&
              (leftNum > rightNum ||
                (leftNum === rightNum &&
                  isPositive.isPositive(compare.compare(left, right, options))))
            ) {
              context.report({
                messageId:
                  leftNum !== rightNum
                    ? 'unexpectedImportsGroupOrder'
                    : 'unexpectedImportsOrder',
                data: {
                  left: left.name,
                  leftGroup: left.group,
                  right: right.name,
                  rightGroup: right.group,
                },
                node: right.node,
                fix: fixer => fix(fixer, nodeList),
              })
            }
            if (
              options.newlinesBetween === 'never' &&
              numberOfEmptyLinesBetween > 0
            ) {
              context.report({
                messageId: 'extraSpacingBetweenImports',
                data: {
                  left: left.name,
                  right: right.name,
                },
                node: right.node,
                fix: fixer => fix(fixer, nodeList),
              })
            }
            if (options.newlinesBetween === 'always') {
              if (leftNum < rightNum && numberOfEmptyLinesBetween === 0) {
                context.report({
                  messageId: 'missedSpacingBetweenImports',
                  data: {
                    left: left.name,
                    right: right.name,
                  },
                  node: right.node,
                  fix: fixer => fix(fixer, nodeList),
                })
              } else if (
                numberOfEmptyLinesBetween > 1 ||
                (leftNum === rightNum && numberOfEmptyLinesBetween > 0)
              ) {
                context.report({
                  messageId: 'extraSpacingBetweenImports',
                  data: {
                    left: left.name,
                    right: right.name,
                  },
                  node: right.node,
                  fix: fixer => fix(fixer, nodeList),
                })
              }
            }
          })
        }
      },
    }
  },
})
module.exports = sortImports
