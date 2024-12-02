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

export function range(start: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => start + i);
}

export function zip<T>(...arrays: T[][]): T[][] {
  const result: T[][] = [];
  const len = Math.min(...arrays.map((array) => array.length));
  for (let i = 0; i < len; i++) {
    result.push(arrays.map((array) => array[i]));
  }
  return result;
}

export function lines(input: string): string[] {
  // omit the last line if it's empty
  return input.trimEnd().split("\n");
}

export function words(input: string): string[] {
  return input.split(/\s+/);
}
