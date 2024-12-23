'use strict'
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
let getCommentAfter = (node, source) => {
  let token = source.getTokenAfter(node, {
    filter: ({ value, type }) =>
      !(type === 'Punctuator' && [',', ';'].includes(value)),
    includeComments: true,
  })
  if (
    ((token == null ? void 0 : token.type) === 'Block' ||
      (token == null ? void 0 : token.type) === 'Line') &&
    node.loc.end.line === token.loc.end.line
  ) {
    return token
  }
  return null
}
exports.getCommentAfter = getCommentAfter
