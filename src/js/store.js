// Reactive stores, inspired by Svelte writables
export function Store(value) {
  let _value = value; // The value of the store
  let _subs = []; // Store subscribers

  // GET: returns the store value
  const get = () => _value;

  // SET
  function set(value) {
    _value = value; // Set the store value

    update(); // Update subscribers
  }

  // UPDATE
  function update() {
    for (const sub of _subs) {
      sub(_value); // Call the subscriber with the new value
    }
  }

  // CLEAR
  function clear() {
    _value = undefined; // Set the store value to nothingness

    update(); // Update subscribers
  }

  // SUBSCRIBE
  function subscribe(cb) {
    _subs.push(cb); // Append the subscriber to the subscribers

    cb(_value); // Call the subscriber with the current store value
  }

  function destroy() {
    _subs = []; // No more subscribers
    _value = undefined; // Reset store value
    get = null; // Get rid of get()
    set = null; // Get rid of set()
    update = null; // Get rid of update()
    clear = null; // Get rid of clear()
    subscribe = null; // Get rid of subscribe()
  }

  // Return the whole bunch
  return { get, set, update, clear, subscribe, destroy };
}
