export class AppLoadError extends Error {
  name = "AppLoadError";

  constructor(message) {
    super(message);
  }
}

export class AppRuntimeError extends Error {
  name = "AppRuntimeError";

  constructor(message) {
    super(message);
  }
}
