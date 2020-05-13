import { KonaError } from './InternalKonaError';

class ReferenceError extends KonaError {
	public errorType = 'ReferenceError';

	constructor(msg: string) {
		super(msg);
	}
}

export { ReferenceError };
