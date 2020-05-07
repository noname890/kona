import { TokenType } from './TokenTypes';

class Token {
	constructor(private type: TokenType, public lexeme: string, private literal: string | null, private line: number) {}

	toString() {
		return this.type + ' ' + this.lexeme + ' ' + this.literal;
	}
}

export { Token };
