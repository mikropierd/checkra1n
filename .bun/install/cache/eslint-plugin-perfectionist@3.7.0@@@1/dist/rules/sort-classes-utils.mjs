import { minimatch } from 'minimatch'
const cachedGroupsByModifiersAndSelectors = /* @__PURE__ */ new Map()
const generateOfficialGroups = (modifiers, selectors) => {
  let modifiersAndSelectorsKey = modifiers.join('&') + '/' + selectors.join('&')
  let cachedValue = cachedGroupsByModifiersAndSelectors.get(
    modifiersAndSelectorsKey,
  )
  if (cachedValue) {
    return cachedValue
  }
  let allModifiersCombinations = []
  for (let i = modifiers.length; i > 0; i--) {
    allModifiersCombinations = [
      ...allModifiersCombinations,
      ...getCombinations(modifiers, i),
    ]
  }
  let allModifiersCombinationPermutations = allModifiersCombinations.flatMap(
    result => getPermutations(result),
  )
  let returnValue = []
  for (let selector of selectors) {
    returnValue = [
      ...returnValue,
      ...allModifiersCombinationPermutations.map(
        modifiersCombinationPermutation =>
          [...modifiersCombinationPermutation, selector].join('-'),
      ),
      selector,
    ]
  }
  cachedGroupsByModifiersAndSelectors.set(modifiersAndSelectorsKey, returnValue)
  return returnValue
}
const getCombinations = (array, n) => {
  let result = []
  let backtrack = (start, comb) => {
    if (comb.length === n) {
      result.push([...comb])
      return
    }
    for (let i = start; i < array.length; i++) {
      comb.push(array[i])
      backtrack(i + 1, comb)
      comb.pop()
    }
  }
  backtrack(0, [])
  return result
}
const getPermutations = elements => {
  let result = []
  let backtrack = first => {
    if (first === elements.length) {
      result.push([...elements])
      return
    }
    for (let i = first; i < elements.length; i++) {
      ;[elements[first], elements[i]] = [elements[i], elements[first]]
      backtrack(first + 1)
      ;[elements[first], elements[i]] = [elements[i], elements[first]]
    }
  }
  backtrack(0)
  return result
}
const getOverloadSignatureGroups = members => {
  let methods = members
    .filter(
      member =>
        member.type === 'MethodDefinition' ||
        member.type === 'TSAbstractMethodDefinition',
    )
    .filter(member => member.kind === 'method')
  let staticOverloadSignaturesByName = /* @__PURE__ */ new Map()
  let overloadSignaturesByName = /* @__PURE__ */ new Map()
  for (let method of methods) {
    if (method.key.type !== 'Identifier') {
      continue
    }
    let { name } = method.key
    let mapToUse = method.static
      ? staticOverloadSignaturesByName
      : overloadSignaturesByName
    let signatureOverloadsGroup = mapToUse.get(name)
    if (!signatureOverloadsGroup) {
      signatureOverloadsGroup = []
      mapToUse.set(name, signatureOverloadsGroup)
    }
    signatureOverloadsGroup.push(method)
  }
  return [
    ...overloadSignaturesByName.values(),
    ...staticOverloadSignaturesByName.values(),
  ].filter(group => group.length > 1)
}
const customGroupMatches = props => {
  if ('anyOf' in props.customGroup) {
    return props.customGroup.anyOf.some(subgroup =>
      customGroupMatches({ ...props, customGroup: subgroup }),
    )
  }
  if (
    props.customGroup.selector &&
    !props.selectors.includes(props.customGroup.selector)
  ) {
    return false
  }
  if (props.customGroup.modifiers) {
    for (let modifier of props.customGroup.modifiers) {
      if (!props.modifiers.includes(modifier)) {
        return false
      }
    }
  }
  if (
    'elementNamePattern' in props.customGroup &&
    props.customGroup.elementNamePattern
  ) {
    let matchesElementNamePattern = minimatch(
      props.elementName,
      props.customGroup.elementNamePattern,
      {
        nocomment: true,
      },
    )
    if (!matchesElementNamePattern) {
      return false
    }
  }
  if (
    'decoratorNamePattern' in props.customGroup &&
    props.customGroup.decoratorNamePattern
  ) {
    let decoratorPattern = props.customGroup.decoratorNamePattern
    let matchesDecoratorNamePattern = props.decorators.some(decorator =>
      minimatch(decorator, decoratorPattern, {
        nocomment: true,
      }),
    )
    if (!matchesDecoratorNamePattern) {
      return false
    }
  }
  return true
}
const getCompareOptions = (options, groupNumber) => {
  let group = options.groups[groupNumber]
  let customGroup =
    typeof group === 'string' && Array.isArray(options.customGroups)
      ? options.customGroups.find(g => group === g.groupName)
      : null
  if ((customGroup == null ? void 0 : customGroup.type) === 'unsorted') {
    return null
  }
  return {
    type: (customGroup == null ? void 0 : customGroup.type) ?? options.type,
    order:
      customGroup && 'order' in customGroup && customGroup.order
        ? customGroup.order
        : options.order,
    ignoreCase: options.ignoreCase,
  }
}
export {
  customGroupMatches,
  generateOfficialGroups,
  getCompareOptions,
  getOverloadSignatureGroups,
}
