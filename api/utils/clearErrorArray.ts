export function clearErrorArray<T = never>(array: (T | Error)[]): T[] {
  return array.map(value => {
    if (value instanceof Error) {
      throw value;
    }
    return value;
  });
}
