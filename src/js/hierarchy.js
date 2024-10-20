export function getJsonHierarchy(object, hierarchy) {
  const parts = hierarchy.split(".");

  let currentObj = object;

  for (const part of parts) {
    if (!currentObj[part]) return null;

    currentObj = currentObj[part];
  }

  return currentObj;
}

export function setJsonHierarchy(object, hierarchy, value) {
  const parts = hierarchy.split(".");
  const lastIndex = parts.length - 1;

  let currentObj = object;

  for (let i = 0; i < lastIndex; i++) {
    const key = parts[i];

    if (currentObj[key] === undefined) {
      currentObj[key] = {};
    }

    currentObj = currentObj[key];
  }

  if (value === undefined || value === null)
    delete currentObj[parts[lastIndex]];
  else currentObj[parts[lastIndex]] = value;

  return getJsonHierarchy(object, hierarchy);
}
