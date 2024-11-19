'use strict'
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
let getSettings = (settings = {}) => {
  if (!settings.perfectionist) {
    return {}
  }
  let validateOptions = object => {
    let allowedOptions = [
      'partitionByComment',
      'partitionByNewLine',
      'ignorePattern',
      'ignoreCase',
      'order',
      'type',
    ]
    let keys = Object.keys(object)
    for (let key of keys) {
      if (!allowedOptions.includes(key)) {
        return false
      }
    }
    return true
  }
  let perfectionistSettings = settings.perfectionist
  if (!validateOptions(perfectionistSettings)) {
    throw new Error('Invalid Perfectionist settings')
  }
  return settings.perfectionist
}
exports.getSettings = getSettings
