export class StateError extends Error {
  name = "StateError";

  constructor(message) {
    super(message);
  }
}
