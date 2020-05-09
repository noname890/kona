import { TokenType } from './TokenTypes';

class Token {
	constructor(public type: TokenType, public lexeme: string, public literal: string | null, private line: number) {}

	toString() {
		return this.type + ' ' + this.lexeme + ' ' + this.literal;
	}
}

export { Token };
