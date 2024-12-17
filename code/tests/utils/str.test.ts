import Str from '@/utils/str';
import { describe, expect, it } from 'vitest';

describe('Support Str', () => {
  it.each([
    ['https://api.local/*', 'https://api.local/users'],
    ['users', 'https://api.local/users/'],
    ['users/*', 'https://api.local/users/'],
    ['*/admin/users/*', 'https://api.local/admin/users/1'],
  ])('The string matches the pattern', (pattern: string, url: string) => {
    expect(Str.is(pattern, url)).toBeTruthy();
  });

  it('The string does not match the pattern', () => {
    expect(Str.is('*/user/*', 'https://api.local/users')).toBeFalsy();
  });

  it.each([
    ['test/string', '/', '/test/string'],
    ['/test/string', '/', '/test/string'],
    ['//test/string', '/', '/test/string'],
    ['string', '*', '*string'],
  ])('The string begins with given prefix', (value: string, prefix: string, expected: string) => {
    expect(Str.start(value, prefix)).toEqual(expected);
  });
});
