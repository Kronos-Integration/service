export function keyValue2Object(key, value) {
  const path = key.split(/\./);
  const config = {};

  let c = config;

  while (true) {
    const slot = path.shift();

    if (slot === "constructor" || slot === '__proto__') {
      return config;
    }

    if (path.length === 0) {
      c[slot] = value;

      return config;
    }

    c[slot] ??= {};

    c = c[slot];
  }
}
