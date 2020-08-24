import Token from '../lexer/Token';
import throws from '../internal/error/throws';
import { ReferenceError } from '../internal/error/errorTypes/runtime/ReferenceError';
import Stack from './Stack';

/**
 * Environment that holds vars, consts, pragmas and handles errors
 */
export default class Environment {
	private vars: any = {};
	private pragmas: any = {};
	private constants: string[] = [];
	// this contains variables that have been casted in constants
	// and their locations
	private casts: string[] = [];

	constructor(private fileName: string, public enclosing: Environment | null, private stack: Stack) {}

	/**
	 * Returns a pragma
	 * @param name name of the pragma
	 */
	public getPragma(name: string): any {
		if (this.pragmas.hasOwnProperty(name)) {
			return this.pragmas[name];
		}
		if (this.enclosing !== null) {
			return this.enclosing.getPragma(name);
		}
	}

	/**
	 * Returns a variable, throws if it does not exist
	 * @param name name of the var
	 */
	public getVar(name: Token): any {
		if (this.vars.hasOwnProperty(name.lexeme)) {
			return this.vars[name.lexeme];
		}

		if (this.enclosing !== null) {
			return this.enclosing.getVar(name);
		}

		// vars named `_` are not bound, unless specified with a pragma
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

	/**
	 * Defines a constant, if a variable exists under the same name
	 * converts it into a constant, const casts are only valid in
	 * the scope they were casted in
	 * @param name name of the constant
	 * @param value value of the constant
	 */
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

	/**
	 * Creates a variable and assigns a value.
	 * Only binds variables that are not named `_`, unless specified with
	 * a pragma
	 * @param name name of the var
	 * @param value value of the var
	 */
	public define(name: string, value: any): void {
		if (name === '_' && !this.getPragma('allow_underscore_for_var_names')) {
			return;
		}

		if (this.isConst(name)) return;

		this.vars[name] = value;
	}

	/**
	 * Defines a pragma
	 * @param name name of the pragma
	 * @param value value if the pragma
	 */
	public definePragma(name: string, value: string): void {
		this.pragmas[name] = value;
	}

	/**
	 * Assigns to a variable, throws if it is a constant, isn't a variable, or it does not exist
	 * @param name name of the variable
	 * @param value value to assign
	 */
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

	/**
	 * Checks if a variable exists an any scope
	 * @param name name of the variable
	 */
	private exists(name: string): boolean {
		if (this.vars.hasOwnProperty(name)) return true;
		if (this.enclosing) return this.enclosing.exists(name);
		return false;
	}

	/**
	 * Checks if a variable is a const cast.
	 * Used by `assign` to give hints
	 * @param name name of the variable
	 */
	private isCast(name: string): boolean {
		if (this.casts.includes(name)) {
			return true;
		} else if (this.enclosing) {
			return this.enclosing.isCast(name);
		}
		return false;
	}

	/**
	 * Checks if the variable specified is a constant
	 * @param name name of the const
	 */
	private isConst(name: string): boolean {
		if (this.constants.includes(name)) {
			return true;
		} else if (this.enclosing) {
			return this.enclosing.isConst(name);
		}
		return false;
	}
}
