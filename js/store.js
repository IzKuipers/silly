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

  return { get, set, update, clear };
}
