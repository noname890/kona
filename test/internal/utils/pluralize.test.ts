/* eslint-env jest */

import pluralize from '../../../src/lib/internal/utils/pluralize';

describe('./src/lib/internal/utils/pluralize', () => {
	describe('pluralize()', () => {
		const TEST_STRING = 'test/s';

		test('should not pluralize', () => {
			expect(pluralize(TEST_STRING, 1)).toBe('test');
		});

		test('should pluralize', () => {
			expect(pluralize(TEST_STRING, 0)).toBe('tests');
			expect(pluralize(TEST_STRING, 2)).toBe('tests');
		});

		test('should throw when no separator is found', () => {
			expect(() => pluralize('test', 0)).toThrow();
		});
	});
});
