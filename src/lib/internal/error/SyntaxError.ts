import { KonaError } from './InternalKonaError';

class SyntaxError extends KonaError {
	public errorType = 'SyntaxError';

	constructor(message: string) {
		super(message);
	}
}

export { SyntaxError };
