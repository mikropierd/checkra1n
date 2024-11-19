import { getGroupNumber } from './get-group-number.mjs'
import { sortNodes } from './sort-nodes.mjs'
let sortNodesByGroups = (nodes, options) => {
  let nodesByGroupNumber = {}
  for (let sortingNode of nodes.values()) {
    let groupNum = getGroupNumber(options.groups, sortingNode)
    nodesByGroupNumber[groupNum] = nodesByGroupNumber[groupNum] ?? []
    nodesByGroupNumber[groupNum].push(sortingNode)
  }
  let sortedNodes = []
  for (let groupNumber of Object.keys(nodesByGroupNumber).sort(
    (a, b) => Number(a) - Number(b),
  )) {
    sortedNodes.push(
      ...sortNodes(nodesByGroupNumber[Number(groupNumber)], options),
    )
  }
  return sortedNodes
}
export { sortNodesByGroups }
