import KonaCallable from '../KonaCallable';
import readInputSilent from '../../std/readInputSilent';
import { Interpreter } from '../interpreter';

export default class ReadInputSilentImplement implements KonaCallable {
	public arity() {
		return 0;
	}

	public callFn(interpreter: Interpreter, fnArguments: any[]) {
		if (typeof fnArguments[0] === 'string') {
			return readInputSilent(fnArguments[0]);
		}

		return readInputSilent();
	}

	public toString(): string {
		return 'fn read_input_silent(prompt) { /* native code */ }';
	}
}
