'use strict'
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
const getGroupNumber = require('./get-group-number.js')
const sortNodes = require('./sort-nodes.js')
let sortNodesByGroups = (nodes, options) => {
  let nodesByGroupNumber = {}
  for (let sortingNode of nodes.values()) {
    let groupNum = getGroupNumber.getGroupNumber(options.groups, sortingNode)
    nodesByGroupNumber[groupNum] = nodesByGroupNumber[groupNum] ?? []
    nodesByGroupNumber[groupNum].push(sortingNode)
  }
  let sortedNodes = []
  for (let groupNumber of Object.keys(nodesByGroupNumber).sort(
    (a, b) => Number(a) - Number(b),
  )) {
    sortedNodes.push(
      ...sortNodes.sortNodes(nodesByGroupNumber[Number(groupNumber)], options),
    )
  }
  return sortedNodes
}
exports.sortNodesByGroups = sortNodesByGroups
