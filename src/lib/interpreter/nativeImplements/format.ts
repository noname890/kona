import KonaCallable from '../KonaCallable';
import { Interpreter } from '../interpreter';
import format from '../../std/format';

export default class FormatImplement implements KonaCallable {
	public arity(): number {
		return 2;
	}

	public callFn(interpreter: Interpreter, fnArguments: any[]) {
		return format(fnArguments.shift(), ...fnArguments);
	}

	public toString(): string {
		return 'fn format(text, strings_to_interpolate) { /* native code */ }';
	}
}
