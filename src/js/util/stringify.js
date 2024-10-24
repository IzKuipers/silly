export function stringifyObject(obj, indent = 2) {
  const space = " ".repeat(indent);
  const seen = new WeakSet(); // Track visited objects

  const stringify = (value, level) => {
    const currentIndent = space.repeat(level);
    const nextIndent = space.repeat(level + 1);

    if (value === null) {
      return "null";
    } else if (value === undefined) {
      return "undefined";
    } else if (typeof value === "number" || typeof value === "boolean") {
      return value.toString();
    } else if (typeof value === "string") {
      return JSON.stringify(value); // Handles escaping properly
    } else if (typeof value === "function") {
      return value.toString();
    } else if (typeof value === "object") {
      if (seen.has(value)) {
        return '"[Circular]"'; // Handle circular reference
      }
      seen.add(value); // Mark object as seen

      if (Array.isArray(value)) {
        const arrayItems = value
          .map((item) => `${nextIndent}${stringify(item, level + 1)}`)
          .join(",\n");
        return `[\n${arrayItems}\n${currentIndent}]`;
      } else {
        const entries = Object.entries(value)
          .map(([key, val]) => `${nextIndent}${JSON.stringify(key)}: ${stringify(val, level + 1)}`)
          .join(",\n");
        return `{\n${entries}\n${currentIndent}}`;
      }
    }
    throw new TypeError(`Unsupported type: ${typeof value}`);
  };

  return stringify(obj, 0);
}

export function stringifyClassSource(instance) {
  const seen = new WeakMap();

  // Helper to stringify methods and properties as source code
  function getMethods(obj) {
    return Object.getOwnPropertyNames(obj)
      .filter((key) => typeof obj[key] === "function" && key !== "constructor")
      .map((key) => obj[key].toString())
      .join("\n\n");
  }

  // Capture static methods
  function getStaticMethods(cls) {
    return Object.getOwnPropertyNames(cls)
      .filter((key) => typeof cls[key] === "function" && key !== "prototype")
      .map((key) => `static ${cls[key].toString()}`)
      .join("\n\n");
  }

  // Capture instance properties by inspecting the constructor and prototype
  function getInstanceProperties(instance) {
    const props = Object.keys(instance);
    return props
      .map((prop) => {
        let value = instance[prop];

        if (typeof value === "object" && value !== null) {
          // Check for circular references
          if (seen.has(value)) {
            return `this.${prop} = "[Circular]";`;
          }
          seen.set(value, true); // Mark as seen

          // Return serialized object
          try {
            return `this.${prop} = ${JSON.stringify(value)};`;
          } catch {
            return `this.${prop} = ?;`;
          }
        }
        try {
          return `this.${prop} = ${JSON.stringify(value)};`;
        } catch {
          return `this.${prop} = ?;`;
        }
      })
      .join("\n");
  }

  // Get the class name
  const className = instance.constructor.name;

  // Get constructor function as a string
  const constructorSource = instance.constructor.toString();

  // Extract constructor body if the constructor exists
  const constructorBody = constructorSource.includes("constructor")
    ? getInstanceProperties(instance)
    : "";

  // Get prototype methods (non-static)
  const prototypeMethods = getMethods(Object.getPrototypeOf(instance));

  // Get static methods
  const staticMethods = getStaticMethods(instance.constructor);

  // Build the class representation string
  return `
class ${className} {
  constructor() {
    ${constructorBody}
  }
  
  ${prototypeMethods}

  ${staticMethods ? `\n${staticMethods}\n` : ""}
}
`;
}
