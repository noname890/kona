/* eslint-env jest */
import FixedArray from '../../../src/lib/internal/utils/FixedArray';

describe('./src/lib/internal/utils/FixedArray', () => {
	describe('FixedArray<T>.push()', () => {
		test('length should not grow past 2', () => {
			const array: FixedArray<string> = new FixedArray(2);

			array.push('string 1', 'string 2', 'string 3', 'string 4', 'string 5');

			expect(array.length).toBe(2);
		});

		test('array should shift the elements when it grows past max', () => {
			const array: FixedArray<string> = new FixedArray(2);

			array.push('string 1');
			array.push('string 2');
			array.push('string 3');

			expect(array.get(0)).toBe('string 2');
		});

		test('should increase the length', () => {
			const array: FixedArray<any> = new FixedArray(4);
			const oldLength = array.length;

			array.push(1);

			expect(oldLength).toBeLessThan(array.length);
		});

		test('should push the items', () => {
			const array: FixedArray<number> = new FixedArray(2);

			array.push(1, 2);
			expect(array.get(array.length - 1)).toBe(2);
			expect(array.get(array.length - 2)).toBe(1);
		});
	});

	describe('FixedArray<T>.pop()', () => {
		test('should return the last element', () => {
			const array: FixedArray<number> = new FixedArray(2);
			array.push(1, 2);

			expect(array.pop()).toBe(2);
		});
	});

	describe('FixedArray<T>.get()', () => {
		test('should get the first index', () => {
			const array: FixedArray<number> = new FixedArray(2);
			array.push(1, 2);

			expect(array.get()).toBe(1);
		});
	});

	describe('FixedArray<T>.getArray()', () => {
		test('should return the raw array', () => {
			const array = new FixedArray<number>(2);
			array.push(1, 2, 3, 4, 5);

			expect(array.getArray()).toStrictEqual([ 4, 5 ]);
		});
	});
});
