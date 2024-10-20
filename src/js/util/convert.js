export function convertToType(value, targetType) {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    // silently error
  }

  switch (targetType) {
    case "number":
      return Number(value);
    case "string":
      return String(value);
    case "boolean":
      if (value === "true") return true;
      if (value === "false") return false;

      return false;
    case "object":
      if (Array.isArray(parsed)) {
        return parsed;
      }
      try {
        return JSON.parse(value);
      } catch (e) {
        return null;
      }
    case "array":
      return Array.isArray(parsed) ? parsed : [value];
    default:
      throw new Error(`Unsupported target type: ${targetType}`);
  }
}
