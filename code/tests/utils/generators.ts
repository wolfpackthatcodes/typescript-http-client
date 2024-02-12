import { randomBytes } from 'crypto';

/**
 * Generate a random number.
 *
 * @param {number} min
 * @param {number} max
 *
 * @returns {number}
 */
function generateRandomNumber(min: number, max: number): number {
  const range = max - min + 1;
  const randomBytesBuffer = randomBytes(4); // 4 bytes for a 32-bit integer
  const randomNumber = (Math.abs(randomBytesBuffer.readInt32LE(0)) % range) + min;

  return randomNumber;
}

/**
 * Generate a secure password.
 *
 * @param {number} length
 *
 * @returns {string}
 */
function generateSecurePassword(length: number): string {
  const randomBytesBuffer = randomBytes(Math.ceil(length / 2));
  const password = randomBytesBuffer.toString('hex').slice(0, length);

  return password;
}

export { generateRandomNumber, generateSecurePassword };
