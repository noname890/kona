import { Token } from '../lexer/Token';

const MAX_STACKTRACE_LENGTH = 10;

class FixedArray<T> {
	private array: T[] = [];
	public length = 0;

	constructor(private maxLength: number) {}

	public push(...items: T[]): void {
		this.array.push(...items);
		this.length += items.length;
		if (this.array.length > this.maxLength) {
			this.array.shift();
		}
	}

	public pop(): T | undefined {
		this.length--;
		return this.array.pop();
	}

	public get(index: number = 0): T | undefined {
		return this.array[index];
	}

	public forEach(cb: (value: T, index: number) => void): void {
		this.array.forEach(cb);
	}

	public getArray() {
		return this.array;
	}
}

export default class Stack {
	// the stack trace is structured like this:
	// - first index: the function name
	// - second index: function position etc
	// - third index: function children
	// all fixed to a default "depth" of 10
	private stacktrace: FixedArray<[string, Token, Stack]> = new FixedArray(MAX_STACKTRACE_LENGTH);
	public executingFunction = false;

	private removeExecution() {
		const latest = this.stacktrace.get(this.stacktrace.length - 1);
		if (latest) {
			if (latest[2].executingFunction) {
				latest[2].removeExecution();
				return;
			}
		}
		this.executingFunction = false;
	}

	public addFunctionCall(name: string, token: Token) {
		if (this.executingFunction) {
			const latest = this.stacktrace.get(this.stacktrace.length - 1);

			if (latest) {
				latest[2].addFunctionCall(name, token);
			}
			return;
		}
		this.stacktrace.push([ name, token, new Stack() ]);

		this.executingFunction = true;
	}

	public removeFunctionCall() {
		this.removeExecution();
	}

	public unwrap(stack: [string, Token, Stack][]): any {
		const result = [];

		for (const i in stack) {
			const token = stack[i][1];

			result.push([
				stack[i][0] + ' at ' + String(token.line) + ':' + String((token.column || 1) - token.lexeme.length),
				this.unwrap(stack[i][2].getStacktrace())
			]);
		}
		// @ts-ignore
		return result;
	}

	public getStacktrace() {
		return this.stacktrace.getArray();
	}
}
