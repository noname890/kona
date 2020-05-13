import { Token } from '../lexer/Token';
import { throws } from '../internal/error/throws';
import { ReferenceError } from '../internal/error/errorTypes/ReferenceError';

class Environment {
	private vars: any = {};

	constructor(private fileName: string) {}

	public getVar(name: Token): any {
		if (this.vars.hasOwnProperty(name.lexeme)) {
			return this.vars[name.lexeme];
		}

		throws(new ReferenceError("Undefined variable: '" + name.lexeme + "'."), this.fileName, {
			line: name.line + 1,
			column: name.column || 0,
			code: 'TO_BE_REPLACED',
			exit: true
		});
	}

	public define(name: string, value: any): void {
		this.vars[name] = value;
	}

	public assign(name: Token, value: any): void {
		if (this.vars.hasOwnProperty(name.lexeme)) {
			this.vars[name.lexeme] = value;
			return undefined;
		}

		throws(new ReferenceError("Undefined variable: '" + name.lexeme + "'."), this.fileName, {
			line: name.line + 1,
			column: name.column || 0,
			code: 'TO_BE_REPLACED',
			exit: true
		});
	}
}

export { Environment };
