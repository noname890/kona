import { KonaError } from './InternalKonaError';

class SyntaxError extends KonaError {
	public errorType = 'SyntaxError';

	constructor(message: string, hint?: string) {
		super(message, hint);
	}
}

export { SyntaxError };
