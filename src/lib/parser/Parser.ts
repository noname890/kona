import { Token } from '../lexer/Token';
import { Expression } from '../expressions/Expression';
import { TokenType } from '../lexer/TokenTypes';
import { Binary, Literal, Unary, Group, Variable, Assignment } from '../expressions/exp';
import { throws } from '../internal/error/throws';
import { SyntaxError } from '../internal/error/errorTypes/SyntaxError';
import { Statement } from '../statements/Statements';
import * as Stmt from '../statements/stmt';
import { LogicalExpr } from '../expressions/types/Logical';
import { Keywords } from '../lexer/Keywords';

const GREEK_QUESTION_MARK = ';';

class Parser {
	private current: number = 0;

	constructor(public readonly tokens: Token[], public fileName: string) {}

	public parse(): Statement[] | null {
		const statements: Statement[] = [];

		while (!this.isEnd()) {
			statements.push(this.declaration());
		}

		return statements;
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
		if (this.match(TokenType.IF)) {
			return this.ifStatement();
		}
		if (this.match(TokenType.WHILE)) {
			return this.whileStatement();
		}
		if (this.match(TokenType.FOR)) {
			return this.forStatement();
		}
		if (this.match(TokenType.PRAGMA)) {
			return this.pragmaStatement();
		}

		return this.expressionStatement();
	}

	private expression(): Expression {
		return this.assignment();
	}

	private assignment(): Expression {
		const token = this.currentToken();
		const expression = this.or();

		if (this.match(TokenType.EQ)) {
			// const equals = this.previous();
			const value = this.assignment();

			if (expression instanceof Variable) {
				return new Assignment(expression.name, value);
			}

			throws(new SyntaxError("Tried to assign to '" + token.lexeme + "'. Expected variable."), this.fileName, {
				line: this.currentToken().line,
				column: (token.column || 1) - token.lexeme.length,
				endColumn: token.column || 1,
				exit: true
			});
		}
		return expression;
	}

	private or(): Expression {
		let expression = this.and();

		while (this.match(TokenType.OR)) {
			const operator = this.previous();
			const right = this.and();
			expression = new LogicalExpr(expression, operator, right);
		}
		return expression;
	}

	private and(): Expression {
		let expression = this.equality();

		while (this.match(TokenType.AND)) {
			const operator = this.previous();
			const right = this.equality();
			expression = new LogicalExpr(expression, operator, right);
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

		if (this.currentToken().type === TokenType.EOF) {
			throws(new SyntaxError('Expected expression, found end of file.'), this.fileName, {
				line: this.previous().line,
				column: (this.previous().column || 1) - this.previous().lexeme.length,
				endColumn: this.previous().column || 1,
				exit: true
			});
		}

		throws(new SyntaxError("Expected expression, got '" + this.currentToken().lexeme + "'"), this.fileName, {
			line: this.currentToken().line,
			column: (this.currentToken().column || 1) - this.currentToken().lexeme.length,
			endColumn: this.currentToken().column || 1,
			exit: true
		});

		// this is here so ts doesn't whine about returning undefined
		return new Literal(undefined);
	}

	// ----------RULES---------- //

	// ----------STATEMENTS---------- //

	private varDeclaration(): Statement | undefined {
		const HINT = 'You cannot use expressions (e.g. 2 + 2) or keywords (e.g. while) as valid variable names.';
		const name: Token | undefined = this.consume(
			TokenType.IDENTIFIER,
			"Expected identifier, got '" + this.currentToken().lexeme.replace(/'/g, '') + "'.",
			this.currentToken().type === TokenType.NUMBER || this.currentToken().lexeme in Keywords
				? HINT +
					"\nYou can solve this by using '_" +
					this.currentToken().lexeme +
					"' as a variable name,\nor choose another non-conflicting name.\nFor a complete list of keywords, visit https://github.com/kona-lang/kona/wiki/Keywords."
				: HINT + '\nFor a complete list of keywords, visit https://github.com/kona-lang/kona/wiki/Keywords.'
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

	private ifStatement(): Statement {
		this.consume(
			TokenType.LEFT_PAREN,
			"Expected '(' after if statement, found '" + this.currentToken().lexeme + "'."
		);
		const condition: Expression = this.expression();
		this.consume(
			TokenType.RIGHT_PAREN,
			"Expected ')' after if condition, found '" + this.currentToken().lexeme + "'."
		);
		const thenBlock: Statement = this.statement();
		let elseBlock = null;
		if (this.match(TokenType.ELSE)) {
			elseBlock = this.statement();
		}
		return new Stmt.IfStmt(condition, thenBlock, elseBlock);
	}

	private whileStatement(): Statement {
		this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'while', got '" + this.currentToken().lexeme + "'.");
		const condition = this.expression();
		this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression, got '" + this.currentToken().lexeme + "'.");
		const body = this.statement();

		return new Stmt.WhileStmt(condition, body);
	}

	private forStatement(): Statement {
		let initializer: Statement | undefined;
		let condition: Expression;
		let increment: Expression;
		let body: Statement;

		this.consume(TokenType.LEFT_PAREN, "Expected '(' after 'for'.");

		if (this.match(TokenType.SEMI_COL)) {
			initializer = undefined;
		} else if (this.match(TokenType.VAL)) {
			initializer = this.varDeclaration();
		} else {
			initializer = this.expressionStatement();
		}

		if (!this.check(TokenType.SEMI_COL)) {
			condition = this.expression();
		}
		this.consume(TokenType.SEMI_COL, "Expected ';' after for loop condition.");

		if (!this.check(TokenType.RIGHT_PAREN)) {
			increment = this.expression();
		}
		this.consume(TokenType.RIGHT_PAREN, "Expected ')' after for loop clause.");

		body = this.statement();

		// @ts-ignore
		if (increment) {
			body = new Stmt.BlockStmt([ body, new Stmt.ExpressionStmt(increment) ]);
		}
		// @ts-ignore
		if (!condition) {
			condition = new Literal(true);
		}
		body = new Stmt.WhileStmt(condition, body);

		if (initializer) {
			body = new Stmt.BlockStmt([ initializer, body ]);
		}

		return body;
	}

	private pragmaStatement(): Statement {
		const pragmaTarget = this.consume(
			TokenType.IDENTIFIER,
			"Expected identifier for pragma target, got '" + this.currentToken().lexeme + "'."
		);
		const pragmaArg = this.match(TokenType.IDENTIFIER)
			? this.previous()
			: new Token(TokenType.UNDEFINED, 'nil', null, this.currentToken().line, this.currentToken().column || 0);

		this.expectEndStatement();

		return new Stmt.PragmaStatement(pragmaTarget as Token, pragmaArg);
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

	private consume(type: TokenType, msg: string, hint?: string): Token | undefined {
		if (this.currentToken().type === type) {
			return this.advance();
		}
		const realColumn = (this.currentToken().column || 1) - this.currentToken().lexeme.length;

		throws(new SyntaxError(msg), this.fileName, {
			line: this.currentToken().line,
			column: realColumn,
			endColumn: this.currentToken().column || 1,
			hint,
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
			line: this.currentToken().line,
			column: (this.currentToken().column || 1) - this.currentToken().lexeme.length,
			endColumn: this.currentToken().column || 1,
			exit: true
		});
	}

	private expectEndStatement(): void {
		if (this.currentToken().lexeme === GREEK_QUESTION_MARK) {
			throws(new SyntaxError("Expected ';', end of line or end of file after statement."), this.fileName, {
				line: this.currentToken().line,
				column: (this.currentToken().column || 1) - this.currentToken().lexeme.length,
				endColumn: this.currentToken().column || 1,
				hint:
					'You may have typed in a greek question mark, rather than a semi-colon.' +
					"\nThey both look the same, but have a different unicode 'id'.",
				exit: true
			});
		}

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
