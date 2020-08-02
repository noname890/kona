import KonaCallable from '../KonaCallable';
import readInput from '../../std/readInput';
import { Interpreter } from '../interpreter';

export default class ReadInputImplement implements KonaCallable {
	public arity() {
		return 0;
	}

	public callFn(interpreter: Interpreter, fnArguments: any[]) {
		if (typeof fnArguments[0] === 'string') {
			return readInput(fnArguments[0]);
		}

		return readInput();
	}

	public toString(): string {
		return 'fn read_input(prompt) { /* native code */ }';
	}
}
