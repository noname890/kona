/**
 * Class that creates an array of type T, that has a limit size of maxLength
 * when other elements are added and the max. size has been reached,
 * discards the first element of the array
 */
export default class FixedArray<T> {
	private array: T[] = [];
	public get length() {
		return this.array.length;
	}

	constructor(private maxLength: number) {}

	/**
     * Pushes a list of items of type T to the array
     * @param items the items to push to the array
     */
	public push(...items: T[]): void {
		for (const i in items) {
			if (this.array.length >= this.maxLength) {
				this.array.shift();
			}
			this.array.push(items[i]);
		}
	}

	/**
     * Returns the last element from the array
     */
	public pop(): T | undefined {
		return this.array.pop();
	}

	/**
     * Gets data from the array, specified by index
     * @param index the index to retrieve data from
     */
	public get(index: number = 0): T | undefined {
		return this.array[index];
	}

	/**
     * Loops through the array and calls the callback function `cb`
     * @param cb the callback function
     */
	public forEach(cb: (value: T, index: number) => void): void {
		this.array.forEach(cb);
	}

	/**
     * Gets the internal array
     */
	public getArray(): T[] {
		return this.array;
	}
}
