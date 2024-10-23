// Function to get the value of a multidimensional object by a JSON hierarchy (foo.bar.baz)
export function getJsonHierarchy(object, hierarchy) {
  const parts = hierarchy.split("."); // Split the hierarchy

  let currentObj = object; // The resulting value

  // For every part of the hierarchy...
  for (const part of parts) {
    // Doesn't it exist? Return null, path not valid
    if (!currentObj[part]) return null;

    // Set the result to the value
    currentObj = currentObj[part];
  }

  // Return the result
  return currentObj;
}

// Function to set the value of a multidimensional object by a JSON hierarchy (foo.bar.baz)
export function setJsonHierarchy(object, hierarchy, value) {
  const parts = hierarchy.split("."); // Split the hierarchy
  const lastIndex = parts.length - 1; // Get the length of the parts

  // The target object to eventually add the value to
  let currentObj = object;

  // For every part of the hierarchy...
  for (let i = 0; i < lastIndex; i++) {
    // Get the part
    const key = parts[i];

    // If the part object doesn't exist, set it
    if (currentObj[key] === undefined) {
      currentObj[key] = {};
    }

    // Set the target object
    currentObj = currentObj[key];
  }

  // If the value is either null or undefined, delete the value in the target object
  if (value === undefined || value === null)
    delete currentObj[parts[lastIndex]];
  // Otherwise, set the value in the target object
  else currentObj[parts[lastIndex]] = value;

  // Return the value by calling getJsonHierarchy
  return getJsonHierarchy(object, hierarchy);
}
