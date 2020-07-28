import { ExpVisitors } from '../expressions/ExpVisitors';
import * as Expr from '../expressions/exp';
import { Expression } from '../expressions/Expression';
import { TokenType } from '../lexer/TokenTypes';
import { Token } from '../lexer/Token';
import { throws } from '../internal/error/throws';
import { TypeError } from '../internal/error/errorTypes/runtime/TypeError';
import { KonaError } from '../internal/error/errorTypes/InternalKonaError';
import chalk from 'chalk';
import { StmtVisitors } from '../statements/StmtVisitors';
import * as Stmt from '../statements/stmt';
import { Statement } from '../statements/Statements';
import { Environment } from './Environment';
import { ReferenceError } from '../internal/error/errorTypes/runtime/ReferenceError';

class Interpreter implements ExpVisitors, StmtVisitors {
	private env = new Environment(this.fileName, null);

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
		const unescapeJs = require('unescape-js');

		console.log(unescapeJs(this.stringify(val)));
	}

	public visitVariableStmt(statement: Stmt.VariableStmt): void {
		let value: any;

		if (statement.name.lexeme === '_' && !this.env.getPragma('allow_underscore_for_var_names')) {
			return;
		}

		if (statement.initializer !== undefined) {
			value = this.evaluate(statement.initializer);
		}

		this.env.define(statement.name.lexeme, value);
	}

	public visitBlockStmt(statement: Stmt.BlockStmt): void {
		this.executeBlock(statement.statements, new Environment(this.fileName, this.env));
	}

	public visitIfStmt(statement: Stmt.IfStmt): void {
		if (this.isTruthy(this.evaluate(statement.condition))) {
			this.execute(statement.thenBlock);
		} else if (statement.elseBlock !== null) {
			this.execute(statement.elseBlock);
		}
	}

	public visitWhileStmt(statement: Stmt.WhileStmt): void {
		while (this.isTruthy(this.evaluate(statement.condition))) {
			this.execute(statement.body);
		}
	}

	public visitPragmaStmt(statement: Stmt.PragmaStatement): void {
		this.env.definePragma(statement.pragmaTarget.lexeme, statement.pragmaArg.lexeme);
	}

	public visitLogical(logical: Expr.LogicalExpr): any {
		const left = this.evaluate(logical.left);

		if (logical.operator.type === TokenType.OR) {
			if (this.isTruthy(left)) return left;
		} else {
			if (!this.isTruthy(left)) return left;
		}

		return this.evaluate(logical.right);
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

		if (this.env.getPragma('loose')) {
			if (left === undefined && right === undefined) {
				return undefined;
			}
			if (left === undefined || right === undefined) {
				// if left or right are `nil`, return the one that is not `nil`
				return left || right;
			}
		}

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
							(typeof left === 'undefined' ? 'nil' : typeof left) +
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

	public executeBlock(statements: Statement[], env: Environment) {
		const previous: Environment = this.env;

		this.env = env;
		for (const i in statements) {
			this.execute(statements[i]);
		}
		this.env = previous;
	}

	public isTruthy(val: any): boolean {
		if (val === undefined) {
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
		const isNil = got == undefined ? 'nil' : got;

		throws(
			new TypeError(
				"Expected operand of type '" +
					expected +
					"', but got '" +
					isNil +
					"' on operator '" +
					operator.lexeme +
					"'."
			),
			this.fileName,
			{
				line: operator.line,
				column: (operator.column || 1) - operator.lexeme.length,
				endColumn: operator.column || 1,
				hint:
					isNil == 'nil'
						? "If you don't want strict operations,\nyou could use 'pragma loose;'. This is not recommended, as it can lead\nto unexpected results.\nTo learn more about pragmas, visit: https://github.com/kona-lang/kona/wiki/Pragmas."
						: undefined,
				exit: true
			}
		);
	}

	private throwError(Error: KonaError, token: Token, hint?: string): void {
		throws(Error, this.fileName, {
			line: token.line,
			column: token.column ? token.column : 0,
			endColumn: (token.column || 0) + token.lexeme.length,
			hint,
			exit: true
		});
	}

	private checkNumOperand(operator: Token, ...operand: any[]) {
		for (const i in operand) {
			if (typeof operand[i] !== 'number') {
				this.throwTypeError(operator, 'number', typeof operand[i] === 'undefined' ? 'nil' : typeof operand[i]);
			}
		}
	}

	// ----------HELPERS---------- //
}

export { Interpreter };
