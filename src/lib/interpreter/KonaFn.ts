import KonaCallable from './KonaCallable';
import { FunctionStmt } from '../statements/stmt';
import Interpreter from './interpreter';
import Environment from './Environment';

export default class KonaFn implements KonaCallable {
	private fnRepresentation: string;

	constructor(public declaration: FunctionStmt) {
		// generate representation of function
		const argList = this.declaration.params.map((arg) => arg.lexeme);
		this.fnRepresentation = `fn ${this.declaration.name.lexeme}(${argList.join(', ')}) { /* kona code */ } `;
	}

	/**
	 * Return the arity of the function
	 */
	public arity() {
		return this.declaration.params.length;
	}

	/**
	 * Calls the function
	 * @param interpreter the interpeter that is calling
	 * @param args the arguments for the function
	 */
	public callFn(interpreter: Interpreter, args: any[]) {
		const env: Environment = new Environment(interpreter.fileName, interpreter.globals, interpreter.stack);
		for (const i in this.declaration.params) {
			env.define(this.declaration.params[i].lexeme, args[i]);
		}
		interpreter.executeBlock(this.declaration.body, env);

		return undefined;
	}

	/**
	 * Returns the string representation of the function
	 */
	public toString() {
		return this.fnRepresentation;
	}
}
