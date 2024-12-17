import { faker } from '@faker-js/faker';
import { randomBytes } from 'crypto';

/**
 * Generate an array of book records.
 *
 * @param {number} number
 *
 * @returns {Array<object>}
 */
const generateRandomBooks = (number: number): Array<object> => {
  const books = [];

  for (let i = 0; i < number; i++) {
    const book = {
      title: faker.book.title(),
      author: faker.book.author(),
      isbn: faker.string.uuid(),
    };

    books.push(book);
  }

  return books;
};

/**
 * Generate a random number.
 *
 * @param {number} min
 * @param {number} max
 *
 * @returns {number}
 */
const generateRandomNumber = (min: number, max: number): number => {
  const range = max - min + 1;
  const randomBytesBuffer = randomBytes(4); // 4 bytes for a 32-bit integer
  const randomNumber = (Math.abs(randomBytesBuffer.readInt32LE(0)) % range) + min;

  return randomNumber;
};

/**
 * Generate a random user record.
 *
 * @returns {Record<string, string>}
 */
const generateRandomUser = (): Record<string, string> => {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
  };
};

/**
 * Generate a secure password.
 *
 * @param {number} length
 *
 * @returns {string}
 */
const generateSecurePassword = (length: number): string => {
  const randomBytesBuffer = randomBytes(Math.ceil(length / 2));
  const password = randomBytesBuffer.toString('hex').slice(0, length);

  return password;
};

export { generateRandomBooks, generateRandomNumber, generateSecurePassword, generateRandomUser };
