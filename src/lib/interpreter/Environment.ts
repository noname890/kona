import { Token } from '../lexer/Token';
import { throws } from '../internal/error/throws';
import { ReferenceError } from '../internal/error/errorTypes/runtime/ReferenceError';

class Environment {
	private vars: any = {};
	private pragmas: any = {};

	constructor(private fileName: string, public enclosing: Environment | null) {}

	public getPragma(name: string): any {
		if (this.pragmas.hasOwnProperty(name)) {
			return this.pragmas[name];
		}
		if (this.enclosing !== null) {
			return this.enclosing.getPragma(name);
		}
	}

	public getVar(name: Token): any {
		if (this.vars.hasOwnProperty(name.lexeme)) {
			return this.vars[name.lexeme];
		}

		if (this.enclosing !== null) {
			return this.enclosing.getVar(name);
		}

		throws(new ReferenceError("Undefined variable: '" + name.lexeme + "'."), this.fileName, {
			line: name.line + 1,
			column: name.column || 0,
			hint: 'TO_BE_REPLACED',
			exit: true
		});
	}

	public define(name: string, value: any): void {
		this.vars[name] = value;
	}

	public definePragma(name: string, value: string): void {
		this.pragmas[name] = value;
	}

	public assign(name: Token, value: any): null {
		if (this.vars.hasOwnProperty(name.lexeme)) {
			this.vars[name.lexeme] = value;
			return null;
		}

		if (this.enclosing !== null) {
			this.enclosing.assign(name, value);
			return null;
		}

		throws(new ReferenceError("Undefined variable: '" + name.lexeme + "'."), this.fileName, {
			line: name.line + 1,
			column: name.column || 0,
			hint: 'TO_BE_REPLACED',
			exit: true
		});
		return null;
	}
}

export { Environment };
