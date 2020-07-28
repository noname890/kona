import { KonaError } from '../InternalKonaError';
import ErrorPosition from './ErrorPosition';

/**
 * Class used to get out of loops.
 * When it is catched internally by a loop, it does nothing.
 * When catched by the top level of the interpreter, reports it to the user.
 * Contains additional information
 */
class Break extends KonaError {
	public errorType: string = 'IllegalError';
	public hint: string = 'You cannot use loop-specific (break and continue) statements outside a loop.';

	constructor(public position: ErrorPosition) {
		super('Illegal break statement.');
	}
}

export { Break };
