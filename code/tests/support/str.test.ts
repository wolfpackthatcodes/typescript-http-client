import { describe, it, expect } from 'vitest';
import Str from '@/support/str';

describe('Support Str', () => {
  it.each([
    ['https://api.local/*', 'https://api.local/users', true],
    ['users', 'https://api.local/users/', true],
    ['*/admin/users/*', 'https://api.local/admin/users/1', true],
    ['*/user/*', 'https://api.local/users', false],
  ])('Is', (pattern: string, url: string, expected: boolean) => {
    expect(Str.is(pattern, url)).toBe(expected);
  });

  it.each([
    ['test/string', '/', '/test/string'],
    ['/test/string', '/', '/test/string'],
    ['//test/string', '/', '/test/string'],
    ['string', '*', '*string'],
  ])('Start', (value: string, prefix: string, expected: string) => {
    expect(Str.start(value, prefix)).toEqual(expected);
  });
});
