import { Token } from '../lexer/Token';
import { Expression } from '../expressions/Expression';
import { TokenType } from '../lexer/TokenTypes';
import { Binary, Literal, Unary, Group, Variable, Assignment } from '../expressions/exp';
import { throws } from '../internal/error/throws';
import { SyntaxError } from '../internal/error/errorTypes/SyntaxError';
import * as chalkImport from 'chalk';
import { Statement } from '../statements/Statements';
import * as Stmt from '../statements/stmt';

const chalk = chalkImport.default;

class Parser {
	private current: number = 0;

	constructor(public readonly tokens: Token[], public fileName: string) {}

	public parse(): Statement[] | null {
		const statements: Statement[] = [];

		while (!this.isEnd()) {
			statements.push(this.declaration());
		}

		return statements;
		/*
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
		*/
	}

	// ----------RULES---------- //

	private declaration(): Statement {
		if (this.match(TokenType.VAL)) {
			const varDeclare = this.varDeclaration();

			// TS complains about the return value being undefined,
			// so that is why this is here
			if (varDeclare) {
				return varDeclare;
			}
		}
		return this.statement();
	}

	private statement(): Statement {
		if (this.match(TokenType.PRINT)) {
			return this.printStatement();
		}
		if (this.match(TokenType.LEFT_CURLY)) {
			return new Stmt.BlockStmt(this.block());
		}
		return this.expressionStatement();
	}

	private expression(): Expression {
		return this.assignment();
	}

	private assignment(): Expression {
		const expression = this.equality();
		if (this.match(TokenType.EQ)) {
			const equals = this.previous();
			const value = this.assignment();

			if (expression instanceof Variable) {
				return new Assignment(expression.name, value);
			}

			throws(
				new SyntaxError("Tried to assign to type '" + typeof expression + "'. Expected variable."),
				this.fileName,
				{
					line: this.currentToken().line + 1,
					column: this.currentToken().column || 0,
					code: 'TO_BE_REPLACED',
					exit: true
				}
			);
		}
		return expression;
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

		if (this.match(TokenType.IDENTIFIER)) {
			return new Variable(this.previous());
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

	// ----------STATEMENTS---------- //

	private varDeclaration(): Statement | undefined {
		const name: Token | undefined = this.consume(
			TokenType.IDENTIFIER,
			"Expected identifier, got '" + this.currentToken().literal + "'."
		);
		let initializer: Expression = new Literal(undefined);

		if (this.match(TokenType.EQ)) {
			initializer = this.expression();
		}

		this.expectEndStatement();
		if (name) {
			return new Stmt.VariableStmt(name, initializer);
		}
	}

	private printStatement(): Statement {
		const expression: Expression = this.expression();
		// this.consume(TokenType.SEMI_COL, "Expected ';' after statement.");
		this.expectEndStatement();
		return new Stmt.PrintStmt(expression);
	}

	private expressionStatement(): Statement {
		const expression: Expression = this.expression();
		this.expectEndStatement();
		return new Stmt.ExpressionStmt(expression);
	}

	// ----------STATEMENTS---------- //

	// ----------HELPERS---------- //

	private block(): Statement[] {
		const statements: Statement[] = [];
		while (!this.check(TokenType.RIGHT_CURLY) && !this.isEnd()) {
			statements.push(this.declaration());
		}
		this.consume(TokenType.RIGHT_CURLY, "Expected '}', but found end of file.");
		return statements;
	}

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

	private consumeMultiple(msg: string, ...tokens: TokenType[]): Token | undefined {
		for (const i in tokens) {
			if (this.currentToken().type === tokens[i]) {
				return this.advance();
			}
		}
		throws(new SyntaxError(msg), this.fileName, {
			line: this.currentToken().line + 1,
			column: this.currentToken().column || 0,
			code: 'TO_BE_REPLACED',
			exit: true
		});
	}

	private expectEndStatement(): void {
		this.consumeMultiple(
			"Expected ';', end of line or end of file after statement.",
			TokenType.SEMI_COL,
			TokenType.EOL,
			TokenType.EOF
		);
	}

	// ----------HELPERS---------- //
}

export { Parser };
