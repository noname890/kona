import { TokenType } from './TokenTypes';

export default class Token {
	constructor(
		public type: TokenType,
		public lexeme: string,
		public literal: string | null,
		public line: number,
		public column?: number
	) {}

	toString() {
		return this.type + ' ' + this.lexeme + ' ' + this.literal;
	}
}
