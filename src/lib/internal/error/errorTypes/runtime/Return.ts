import { KonaError } from '../InternalKonaError';
import ErrorPosition from './ErrorPosition';

/**
 * Class used to get out of functions.
 * When it is catched internally by a function, it does nothing.
 * When catched by the top level of the interpreter, reports it to the user.
 * Contains additional information
 */
export class Return extends KonaError {
	public errorType: string = 'IllegalError';
	public hint: string = 'You cannot use the return statement outside a function.';

	constructor(public position: ErrorPosition, public value: any) {
		super('Illegal return statement.');
	}
}
