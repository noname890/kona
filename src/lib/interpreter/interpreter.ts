import { ExpVisitors } from '../expressions/ExpVisitors';
import * as Expr from '../expressions/exp';
import { Expression } from '../expressions/Expression';
import { TokenType } from '../lexer/TokenTypes';
import { Token } from '../lexer/Token';
import { throws } from '../internal/error/throws';
import { TypeError } from '../internal/error/errorTypes/runtime/TypeError';
import { KonaError } from '../internal/error/errorTypes/InternalKonaError';
import * as chalkImport from 'chalk';
import { StmtVisitors } from '../statements/StmtVisitors';
import * as Stmt from '../statements/stmt';
import { Statement } from '../statements/Statements';
import { Environment } from './Environment';

const chalk = chalkImport.default;

class Interpreter implements ExpVisitors, StmtVisitors {
	private env = new Environment(this.fileName);

	constructor(public readonly fileName: string) {}

	public interpret(statements: Statement[]) {
		try {
			for (const i in statements) {
				this.execute(statements[i]);
			}
		} catch (e) {
			console.log(
				chalk.bold.redBright('INTERNAL: ') +
					chalk.bold.whiteBright(
						'This is an internal error, please report this immediatly with the stacktrace below.'
					)
			);
			throw e;
		}
	}

	// ----------VISITORS---------- //

	public visitExprStmt(statement: Stmt.ExpressionStmt): void {
		this.evaluate(statement.expression);
	}

	public visitPrintStmt(statement: Stmt.PrintStmt): void {
		const val: any = this.evaluate(statement.expression);
		console.log(this.stringify(val));
	}

	public visitVariableStmt(statement: Stmt.VariableStmt): void {
		let value: any;

		if (statement.initializer !== undefined) {
			value = this.evaluate(statement.initializer);
		}

		this.env.define(statement.name.lexeme, value);
	}

	public visitVar(expression: Expr.Variable): any {
		return this.env.getVar(expression.name);
	}

	public visitLiteral(expression: Expr.Literal): any {
		return expression.value;
	}

	public visitGrouping(expression: Expr.Group): any {
		return this.evaluate(expression.expression);
	}

	public visitBinary(expression: Expr.Binary): any {
		const left: any = this.evaluate(expression.leftExp);
		const right: any = this.evaluate(expression.rightExp);

		switch (expression.operator.type) {
			case TokenType.MINUS:
				this.checkNumOperand(expression.operator, left, right);
				return left - right;
			case TokenType.MULTIPLY:
				this.checkNumOperand(expression.operator, left, right);
				return left * right;
			case TokenType.POW:
				this.checkNumOperand(expression.operator, left, right);
				return Math.pow(left, right);
			case TokenType.DIV:
				this.checkNumOperand(expression.operator, left, right);
				return left / right;
			case TokenType.PLUS:
				// those ifs are here to prevent js type conversion

				if (typeof left === 'number' && typeof right === 'number') {
					return left + right;
				}
				if (typeof left === 'string' && typeof right === 'string') {
					return left + right;
				}
				this.throwError(
					new TypeError(
						"Expected operands to be two strings or two numbers, got '" +
							typeof left +
							"' and '" +
							(typeof right === 'undefined' ? 'nil' : typeof right) +
							"'."
					),
					expression.operator
				);
				break;
			case TokenType.GREATER_THAN:
				return left > right;
			case TokenType.LESS_THAN:
				return left < right;
			case TokenType.GREATER_OR_EQ_THAN:
				return left >= right;
			case TokenType.LESS_OR_EQ_THAN:
				return left <= right;

			// i inverted === and == in kona because sometimes the == operator
			// is useful so i wanted to keep it in, but i wanted something that is
			// similiar to other languages

			case TokenType.STRICT_EQ:
				return left === right;
			case TokenType.NOT_STRICT_EQ:
				return left !== right;
			case TokenType.LOOSE_EQ:
				return left == right;
			case TokenType.NOT_LOOSE_EQ:
				return left != right;
		}
	}

	public visitCall(): any {}

	public visitAssignment(expression: Expr.Assignment): any {
		const value = this.evaluate(expression.value);

		this.env.assign(expression.name, value);

		return value;
	}

	public visitUnary(expression: Expr.Unary): any {
		const right: any = this.evaluate(expression.right);

		switch (expression.operator.type) {
			case TokenType.MINUS:
				return -right;
			case TokenType.NOT:
				return !this.isTruthy(right);
		}

		return null;
	}

	// ----------VISITORS---------- //

	// ----------HELPERS---------- //

	public isTruthy(val: any): boolean {
		if (val === null) {
			return false;
		}
		if (typeof val === 'boolean') {
			return val;
		}
		return true;
	}

	public evaluate(expression: Expression): any {
		return expression.accept(this);
	}

	public execute(statement: Statement): void {
		statement.accept(this);
	}

	public stringify(val: any): string {
		if (val === undefined) {
			return 'nil';
		}
		return String(val);
	}

	private throwTypeError(operator: Token, expected: string, got: string) {
		throws(
			new TypeError(
				"Expected operand of type '" +
					expected +
					"', but got '" +
					(got == undefined ? 'nil' : got) +
					"' on operator '" +
					operator.lexeme +
					"'."
			),
			this.fileName,
			{
				line: operator.line,
				column: operator.line ? operator.line : 0,
				code: 'TO_BE_REPLACED',
				exit: true
			}
		);
	}

	private throwError(Error: KonaError, token: Token): void {
		throws(Error, this.fileName, {
			line: token.line,
			column: token.column ? token.column : 0,
			code: 'TO_BE_REPLACED',
			exit: true
		});
	}

	private checkNumOperand(operator: Token, ...operand: any[]) {
		for (const i in operand) {
			if (typeof operand[i] !== 'number') {
				this.throwTypeError(operator, 'number', typeof operand);
			}
		}
	}

	// ----------HELPERS---------- //
}

export { Interpreter };
