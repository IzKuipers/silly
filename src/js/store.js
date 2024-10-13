export function Store(value) {
  let _value = value;
  let _subs = [];

  const get = () => _value;

  function set(value) {
    _value = value;

    update();
  }

  function update() {
    for (const sub of _subs) {
      sub(_value);
    }
  }

  function clear() {
    _value = undefined;

    update();
  }

  function subscribe(cb) {
    _subs.push(cb);

    cb(_value);
  }

  function destroy() {
    _subs = [];
    _value = undefined;
    get = null;
    set = null;
    update = null;
    clear = null;
    subscribe = null;
  }

  return { get, set, update, clear, subscribe, destroy };
}
