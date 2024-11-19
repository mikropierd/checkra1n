import naturalCompare from 'natural-compare-lite'
let compare = (a, b, options) => {
  let orderCoefficient = options.order === 'asc' ? 1 : -1
  let sortingFunction
  let formatString =
    options.type === 'line-length' || !options.ignoreCase
      ? string => string
      : string => string.toLowerCase()
  let nodeValueGetter = options.nodeValueGetter ?? (node => node.name)
  if (options.type === 'alphabetical') {
    sortingFunction = (aNode, bNode) =>
      formatString(nodeValueGetter(aNode)).localeCompare(
        formatString(nodeValueGetter(bNode)),
      )
  } else if (options.type === 'natural') {
    let prepareNumeric = string => {
      let formattedNumberPattern = /^[+-]?[\d ,_]+(\.[\d ,_]+)?$/
      if (formattedNumberPattern.test(string)) {
        return string.replaceAll(/[ ,_]/g, '')
      }
      return string
    }
    sortingFunction = (aNode, bNode) =>
      naturalCompare(
        prepareNumeric(formatString(nodeValueGetter(aNode))),
        prepareNumeric(formatString(nodeValueGetter(bNode))),
      )
  } else {
    sortingFunction = (aNode, bNode) => {
      let aSize = aNode.size
      let bSize = bNode.size
      let { maxLineLength } = options
      if (maxLineLength) {
        let isTooLong = (size, node) =>
          size > maxLineLength && node.hasMultipleImportDeclarations
        if (isTooLong(aSize, aNode)) {
          aSize = nodeValueGetter(aNode).length + 10
        }
        if (isTooLong(bSize, bNode)) {
          bSize = nodeValueGetter(bNode).length + 10
        }
      }
      return aSize - bSize
    }
  }
  return orderCoefficient * sortingFunction(a, b)
}
export { compare }
