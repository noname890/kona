import KonaCallable from '../KonaCallable';
import { Interpreter } from '../interpreter';
import format from '../../std/format';
import { KonaError } from '../../internal/error/errorTypes/InternalKonaError';
import { throws } from '../../internal/error/throws';
import { Token } from '../../lexer/Token';

export default class FormatImplement implements KonaCallable {
	public arity(): number {
		return 1;
	}

	public callFn(interpreter: Interpreter, fnArguments: any[], fnName: Token) {
		try {
			return format(fnArguments.shift(), ...fnArguments);
		} catch (e) {
			if (e instanceof KonaError) {
				throws(e, interpreter.fileName, {
					line: fnName.line,
					column: (fnName.column || 1) - fnName.lexeme.length,
					endColumn: fnName.column || 1,
					hint: e.hint,
					stack: interpreter.stack,
					exit: true
				});
			} else {
				throw e;
			}
		}
	}

	public toString(): string {
		return 'fn format(text, strings_to_interpolate) { /* native code */ }';
	}
}
