class ParseError extends Error {
	public name: string = 'ParseError';

	constructor(message?: string) {
		super(message);
	}
}

export { ParseError };
