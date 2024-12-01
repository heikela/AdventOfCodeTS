export function getOrElse<K, V>(map: Map<K, V>, key: K, defaultValue: V): V {
  return map.has(key) ? map.get(key)! : defaultValue;
}

export function mapMap<K, V, V2>(map: Map<K, V>, f: (v: V) => V2): Map<K, V2> {
  const result = new Map<K, V2>();
  for (const [k, v] of map) {
    result.set(k, f(v));
  }
  return result;
}
