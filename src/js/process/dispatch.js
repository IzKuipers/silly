import { Log } from "../logging.js";

export class ProcessDispatch {
  store = {}; // {[id: string]: Callback[]}

  constructor(process) {
    this.parent = process;
    this.kernel = process.kernel;
  }

  subscribe(event, callback) {
    Log(`ProcessDispatch::'${this.parent.name}'`, `Subscribing to event "${event}"`);

    if (!this.store[event]) this.store[event] = [];

    this.store[event].push(callback);
  }

  dispatch(event, ...data) {
    Log(`ProcessDispatch::'${this.parent.name}'`, `Dispatching event "${event}"`);

    const callbacks = this.store[event];

    if (!callbacks) return false;

    for (const callback of callbacks) {
      callback(...data);
    }
  }
}
