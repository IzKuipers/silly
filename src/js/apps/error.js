// Error class used during app loads
export class AppLoadError extends Error {
  name = "AppLoadError";

  constructor(message) {
    super(message);
  }
}

// Error class used during app code execution
export class AppRuntimeError extends Error {
  name = "AppRuntimeError";

  constructor(message) {
    super(message);
  }
}

// Error class used in AppRenderer
export class AppRendererError extends Error {
  name = "AppRendererError";

  constructor(message) {
    super(message);
  }
}
