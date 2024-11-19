import { minimatch } from 'minimatch'
let useGroups = groups => {
  let group
  let groupsSet = new Set(groups.flat())
  let defineGroup = (value, override = false) => {
    if ((!group || override) && groupsSet.has(value)) {
      group = value
    }
  }
  let setCustomGroups = (customGroups, name, params = {}) => {
    if (customGroups) {
      for (let [key, pattern] of Object.entries(customGroups)) {
        if (
          Array.isArray(pattern) &&
          pattern.some(patternValue =>
            minimatch(name, patternValue, {
              nocomment: true,
            }),
          )
        ) {
          defineGroup(key, params.override)
        }
        if (
          typeof pattern === 'string' &&
          minimatch(name, pattern, {
            nocomment: true,
          })
        ) {
          defineGroup(key, params.override)
        }
      }
    }
  }
  return {
    getGroup: () => group ?? 'unknown',
    setCustomGroups,
    defineGroup,
  }
}
export { useGroups }
