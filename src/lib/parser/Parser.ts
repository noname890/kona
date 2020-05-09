import { Token } from '../lexer/Token';
import { Expression } from '../expressions/Expression';
import { TokenType } from '../lexer/TokenTypes';
import { Binary, Literal } from '../expressions/exp';

class Parser {
	private current: number = 0;

	constructor(public readonly tokens: Token[]) {}

	// ----------RULES---------- //

	private expression(): Expression {
		return this.equality();
	}

	private equality(): Expression {
		const expression: Expression = this.comparison();

		while (this.match(TokenType.NOT_STRICT_EQ)) {}

		return expression;
	}

	private comparison(): Expression {
		return new Binary(new Literal(123), new Token(TokenType.DIV, '/', null, 1), new Literal(123));
	}

	// ----------RULES---------- //

	// ----------HELPERS---------- //

	private match(...tokentypes: TokenType[]): boolean {
		for (const i in tokentypes) {
			if (this.check(tokentypes[i])) {
				this.advance();
				return true;
			}
		}

		return false;
	}

	private check(tokentype: TokenType): boolean {
		if (this.isEnd()) {
			return false;
		}
		return this.peek().type === tokentype;
	}

	private isEnd(): boolean {
		return this.peek().type === TokenType.EOF;
	}

	private peek(skip: number = 0): Token {
		return this.tokens[this.current + skip];
	}

	private previous(): Token {
		return this.tokens[this.current - 1];
	}

	private advance(): Token {
		if (!this.isEnd()) this.current++;
		return this.previous();
	}

	// ----------HELPERS---------- //
}
