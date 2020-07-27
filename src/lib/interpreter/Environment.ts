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

		if (name.lexeme === '_' && !this.getPragma('allow_underscore_for_var_names')) {
			throws(
				new ReferenceError(`Undefined variable '_'.\nVariables that are named '_' are not assigned.`),
				this.fileName,
				{
					line: name.line,
					column: (name.column || 1) - name.lexeme.length,
					endColumn: name.column || 1,
					hint:
						"To use '_' as a valid variable name, put 'pragma allow_underscore_for_var_names'\nat the top of your file.\nTo learn more about pragmas, visit: https://github.com/kona-lang/kona/wiki/Pragmas",
					exit: true
				}
			);
		}

		throws(new ReferenceError("Undefined variable: '" + name.lexeme + "'."), this.fileName, {
			line: name.line,
			column: (name.column || 1) - name.lexeme.length,
			endColumn: name.column || 1,
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

		if (name.lexeme === '_' && !this.getPragma('allow_underscore_for_var_names')) {
			throws(
				new ReferenceError(`Undefined variable '_'.\nVariables that are named '_' are not assigned.`),
				this.fileName,
				{
					line: name.line,
					column: (name.column || 1) - name.lexeme.length,
					endColumn: name.column || 1,
					hint:
						"To use '_' as a valid variable name, put 'pragma allow_underscore_for_var_names'\nat the top of your file.\nTo learn more about pragmas, visit: https://github.com/kona-lang/kona/wiki/Pragmas",
					exit: true
				}
			);
		}

		throws(new ReferenceError("Undefined variable: '" + name.lexeme + "'."), this.fileName, {
			line: name.line,
			column: (name.column || 0) - name.lexeme.length,
			endColumn: name.column || 0,
			exit: true
		});
		return null;
	}
}

export { Environment };
