export default class Str {
  /**
   * Determine if a given string matches a given pattern.
   *
   * @param {string} pattern
   * @param {string} value
   *
   * @returns {boolean}
   */
  public static is(pattern: string, value: string): boolean {
    const segments = pattern.split('*');

    const regexPattern = segments.map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');

    return new RegExp(regexPattern).test(value);
  }

  /**
   * Begin a string with a single instance of a given value.
   *
   * @param {string} value
   * @param {string} prefix
   *
   * @returns {string}
   */
  public static start(value: string, prefix: string): string {
    return prefix + value.replace(new RegExp(`^(?:\\${prefix})+`, 'u'), '');
  }
}
