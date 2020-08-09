import { Token } from '../lexer/Token';

const MAX_FUNCTIONS = 65536;
const MAX_STACKTRACE_LENGTH = 10;

let functionCount = 0;

// class StackInfo {
//     private stack = {}

//     public newFunction(name: string, token: Token) {
//         this.stack[name]
//     }
// }

// export default class Stack {
// 	private stackTrace: any = {};
// 	private functionCount = 0;
// 	private currentFunctionScope: Stack[] = [];

// 	private addCount() {
// 		this.functionCount++;
// 		if (this.functionCount >= MAX_FUNCTIONS) {
// 			// we throw
// 		}
// 	}

// 	public removeFunctionCall() {
// 		this.functionCount--;
// 		return this.currentFunctionScope.pop();
// 	}

// 	public getStacktrace() {
// 		return this.stackTrace;
// 	}

// 	public addFunctionCall(name: string, token: Token) {
// 		this.stackTrace[name] = this.stackTrace[name] || [];
// 		this.stackTrace[name].push(token);
// 		this.stackTrace[name].push(new Stack());
// 		this.currentFunctionScope.push(this.stackTrace[name][this.stackTrace[name].length - 1]);
// 		this.addCount();
// 	}
// }

class FixedArray<T> {
	private array: T[] = [];

	constructor(private maxLength: number) {}

	public push(...items: T[]): void {
		this.array.push(...items);

		if (this.array.length > this.maxLength) {
			this.array.shift();
		}
	}

	public pop(): T | undefined {
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

	public addFunctionCall(name: string, token: Token) {
		this.stacktrace.push([ name, token, new Stack() ]);
		functionCount++;
		if (functionCount >= MAX_FUNCTIONS) {
		}
	}

	public removeFunctionCall() {
		functionCount--;
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
