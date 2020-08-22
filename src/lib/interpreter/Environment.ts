import { Token } from '../lexer/Token';
import { throws } from '../internal/error/throws';
import { ReferenceError } from '../internal/error/errorTypes/runtime/ReferenceError';
import Stack from './Stack';

class Environment {
	private vars: any = {};
	private pragmas: any = {};
	private constants: string[] = [];
	// this contains variables that have been casted in constants
	// and their locations
	private casts: string[] = [];

	constructor(private fileName: string, public enclosing: Environment | null, private stack: Stack) {}

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
					stack: this.stack,
					exit: true
				}
			);
		}

		throws(new ReferenceError("Undefined variable: '" + name.lexeme + "'."), this.fileName, {
			line: name.line,
			column: (name.column || 1) - name.lexeme.length,
			endColumn: name.column || 1,
			stack: this.stack,
			exit: true
		});
	}

	public defineConst(name: string, value: any): void {
		if (name === '_' && !this.getPragma('allow_underscore_for_var_names')) {
			return;
		}
		if (this.exists(name)) {
			this.casts.push(name);
		}
		this.define(name, value);
		this.constants.push(name);
	}

	public define(name: string, value: any): void {
		if (name === '_' && !this.getPragma('allow_underscore_for_var_names')) {
			return;
		}

		if (this.isConst(name)) return;

		this.vars[name] = value;
	}

	public definePragma(name: string, value: string): void {
		this.pragmas[name] = value;
	}

	public assign(name: Token, value: any): null {
		if (this.isConst(name.lexeme)) {
			throws(new ReferenceError('Illegal assignment to constant variable.'), this.fileName, {
				line: name.line,
				column: (name.column || 1) - name.lexeme.length,
				endColumn: name.column || 1,
				hint: this.isCast(name.lexeme)
					? `'${name.lexeme}' was casted into a constant,\nand cannot be modified.`
					: undefined,
				stack: this.stack,
				exit: true
			});
		}

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
					stack: this.stack,
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

	private exists(name: string): boolean {
		if (this.vars.hasOwnProperty(name)) return true;
		if (this.enclosing) return this.enclosing.exists(name);
		return false;
	}

	private isCast(name: string): boolean {
		if (this.casts.includes(name)) {
			return true;
		} else if (this.enclosing) {
			return this.enclosing.isCast(name);
		}
		return false;
	}

	private isConst(name: string): boolean {
		if (this.constants.includes(name)) {
			return true;
		} else if (this.enclosing) {
			return this.enclosing.isConst(name);
		}
		return false;
	}
}

export { Environment };
