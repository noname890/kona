import { KonaError } from '../InternalKonaError';

class TypeError extends KonaError {
	public errorType: string = 'TypeError';

	constructor(msg: string) {
		super(msg);
	}
}

export { TypeError };
