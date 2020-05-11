import { Token } from '../lexer/Token';
import { Expression } from '../expressions/Expression';
import { TokenType } from '../lexer/TokenTypes';
import { Binary, Literal, Unary, Group } from '../expressions/exp';
import { throws } from '../internal/error/throws';
import { SyntaxError } from '../internal/error/errorTypes/SyntaxError';
import * as chalkImport from 'chalk';

const chalk = chalkImport.default;

class Parser {
	private current: number = 0;

	constructor(public readonly tokens: Token[], public fileName: string) {}

	public parse(): Expression | null {
		try {
			return this.expression();
		} catch (e) {
			if (e.name === 'ParseError') {
				return null;
			}
			console.log(
				chalk.bold.redBright('INTERNAL: ') +
					chalk.bold.whiteBright(
						'This is an internal error, please report this immediatly with the stacktrace below.'
					)
			);
			throw e;
		}
	}

	// ----------RULES---------- //

	private expression(): Expression {
		return this.equality();
	}

	private equality(): Expression {
		let expression: Expression = this.comparison();

		while (this.match(TokenType.NOT_STRICT_EQ, TokenType.STRICT_EQ, TokenType.NOT_LOOSE_EQ, TokenType.LOOSE_EQ)) {
			const operator: Token = this.previous();
			const right: Expression = this.comparison();

			expression = new Binary(expression, operator, right);
		}

		return expression;
	}

	private comparison(): Expression {
		let expression: Expression = this.addition();

		while (
			this.match(
				TokenType.GREATER_THAN,
				TokenType.GREATER_OR_EQ_THAN,
				TokenType.LESS_THAN,
				TokenType.LESS_OR_EQ_THAN
			)
		) {
			const operator: Token = this.previous();
			const right: Expression = this.addition();
			expression = new Binary(expression, operator, right);
		}
		return expression;
	}

	private addition(): Expression {
		let expression: Expression = this.multiplication();

		while (this.match(TokenType.MINUS, TokenType.PLUS)) {
			const operator: Token = this.previous();
			const right: Expression = this.multiplication();

			expression = new Binary(expression, operator, right);
		}

		return expression;
	}

	private multiplication(): Expression {
		let expression: Expression = this.unary();

		while (this.match(TokenType.DIV, TokenType.MULTIPLY, TokenType.POW)) {
			const operator: Token = this.previous();
			const right: Expression = this.unary();

			expression = new Binary(expression, operator, right);
		}

		return expression;
	}

	private unary(): Expression {
		if (this.match(TokenType.NOT, TokenType.MINUS)) {
			const operator: Token = this.previous();
			const right: Expression = this.unary();
			return new Unary(operator, right);
		}
		return this.primary();
	}

	private primary(): Expression {
		if (this.match(TokenType.FALSE)) {
			return new Literal(false);
		}
		if (this.match(TokenType.TRUE)) {
			return new Literal(true);
		}
		if (this.match(TokenType.UNDEFINED)) {
			return new Literal(undefined);
		}

		if (this.match(TokenType.NUMBER, TokenType.STRING)) {
			return new Literal(this.previous().literal);
		}

		if (this.match(TokenType.LEFT_PAREN)) {
			const expression: Expression = this.expression();
			this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression.");

			return new Group(expression);
		}

		throws(new SyntaxError("Expected expression, got '" + this.currentToken().lexeme + "'"), this.fileName, {
			line: this.currentToken().line + 1,
			column: this.currentToken().column || 1,
			code: 'TO_BE_REPLACED',
			exit: true
		});

		// this is here so ts doesn't whine about returning undefined
		return new Literal(undefined);
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

	private consume(type: TokenType, msg: string): Token | undefined {
		if (this.currentToken().type === type) {
			return this.advance();
		}

		throws(new SyntaxError(msg), this.fileName, {
			line: this.currentToken().line + 1,
			column: this.currentToken().column || 0,
			code: 'TO_BE_REPLACED',
			exit: true
		});
	}

	private currentToken(): Token {
		return this.tokens[this.current];
	}

	// ----------HELPERS---------- //
}

export { Parser };
