/**
 * check data is not undefined
 * @param data any
 * @returns
 */
export function isNotUndefined<T = any>(data: T) {
  return typeof data !== 'undefined';
}
