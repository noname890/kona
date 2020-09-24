/* eslint-env jest */

import format from '../../src/lib/std/format';

describe('./src/lib/std/format', () => {
	describe('format()', () => {
		test('should return the normal string', () => {
			const STRING = 'this is a test';

			expect(format(STRING)).toBe(STRING);
		});

		test('should return the interpolated string', () => {
			const STRING = 'this is a {}';

			expect(format(STRING, 'test')).toBe('this is a test');
		});

		test('should throw if not enough strings are present', () => {
			const STRING = 'this is a {}';

			expect(() => format(STRING)).toThrow();
		});
	});
});
