let validateGroupsConfiguration = (
  groups,
  allowedPredefinedGroups,
  allowedCustomGroups,
) => {
  let allowedGroupsSet = /* @__PURE__ */ new Set([
    ...allowedPredefinedGroups,
    ...allowedCustomGroups,
  ])
  let invalidGroups = groups
    .flat()
    .filter(group => !allowedGroupsSet.has(group))
  if (invalidGroups.length) {
    throw new Error('Invalid group(s): ' + invalidGroups.join(', '))
  }
}
export { validateGroupsConfiguration }