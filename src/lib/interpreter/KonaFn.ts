import KonaCallable from './KonaCallable';
import { FunctionStmt } from '../statements/stmt';
import { Interpreter } from './interpreter';
import { Environment } from './Environment';

export default class KonaFn implements KonaCallable {
	private fnRepresentation: string;

	constructor(public declaration: FunctionStmt) {
		// generate representation of function
		const argList = this.declaration.params.map((arg) => arg.lexeme);
		this.fnRepresentation = `fn ${this.declaration.name.lexeme}(${argList.join(', ')}) { /* kona code */ } `;
	}

	public arity() {
		return this.declaration.params.length;
	}

	public callFn(interpreter: Interpreter, args: any[]) {
		const env: Environment = new Environment(interpreter.fileName, interpreter.globals, interpreter.stack);
		for (const i in this.declaration.params) {
			env.define(this.declaration.params[i].lexeme, args[i]);
		}
		interpreter.executeBlock(this.declaration.body, env);

		return undefined;
	}

	public toString() {
		return this.fnRepresentation;
	}
}
