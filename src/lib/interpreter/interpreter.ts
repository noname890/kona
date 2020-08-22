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
import Environment from './Environment';
import { Break } from '../internal/error/errorTypes/runtime/Break';
import { Continue } from '../internal/error/errorTypes/runtime/Continue';
import { ReferenceError } from '../internal/error/errorTypes/runtime/ReferenceError';
import KonaCallable from './KonaCallable';
import { SyntaxError } from '../internal/error/errorTypes/SyntaxError';
import ReadInputImplement from './nativeImplements/readInput';
import ReadInputSilentImplement from './nativeImplements/readInputSilent';
import pluralize from '../internal/utils/pluralize';
import FormatImplement from './nativeImplements/format';
import Stack from './Stack';
import KonaFn from './KonaFn';

/**
 * The interpreter class
 */
export default class Interpreter implements ExpVisitors, StmtVisitors {
	public stack = new Stack();
	public globals = new Environment(this.fileName, null, this.stack);
	private env = this.globals;

	constructor(public readonly fileName: string) {
		// define the global functions, implementations can be found in `std`
		this.globals.define('read_input', new ReadInputImplement());
		this.globals.define('read_input_silent', new ReadInputSilentImplement());
		this.globals.define('format', new FormatImplement());
	}

	/**
	 * Interprets a list of parsed statements
	 * @param statements the parsed file
	 */
	public interpret(statements: Statement[]) {
		try {
			for (const i in statements) {
				this.execute(statements[i]);
			}
		} catch (e) {
			if (e instanceof Break || e instanceof Continue) {
				// illegal break or continue statement
				throws(e, this.fileName, {
					line: e.position.line,
					column: e.position.column,
					endColumn: e.position.endColumn,
					hint: e.hint,
					exit: true
				});
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

	// ----------VISITORS---------- //

	/**
	 * Evaluates an expression
	 * @param statement the expression
	 */
	public visitExprStmt(statement: Stmt.ExpressionStmt): void {
		this.evaluate(statement.expression);
	}

	/**
	 * Evaluates the right hand expression and prints it
	 * @param statement the print statement
	 */
	public visitPrintStmt(statement: Stmt.PrintStmt): void {
		const val: any = this.evaluate(statement.expression);
		const unescapeJs = require('unescape-js');

		console.log(unescapeJs(this.stringify(val)));
	}

	/**
	 * Defines a variable
	 * @param statement the var statement
	 */
	public visitVariableStmt(statement: Stmt.VariableStmt): void {
		let value: any;

		if (statement.initializer !== undefined) {
			value = this.evaluate(statement.initializer);
		}

		this.env.define(statement.name.lexeme, value);
	}

	/**
	 * Defines a constant
	 * @param statement the const statement
	 */
	public visitConstStmt(statement: Stmt.ConstStmt): void {
		this.env.defineConst(statement.name.lexeme, this.evaluate(statement.initializer));
	}

	/**
	 * Executes a block of code and creates a new scope that is dropped at the end
	 * @param statement the block statement
	 */
	public visitBlockStmt(statement: Stmt.BlockStmt): void {
		this.executeBlock(statement.statements, new Environment(this.fileName, this.env, this.stack));
	}

	/**
	 * Check if the condition is truthy and executes the corresponding block
	 * @param statement the if statement
	 */
	public visitIfStmt(statement: Stmt.IfStmt): void {
		if (this.isTruthy(this.evaluate(statement.condition))) {
			this.execute(statement.thenBlock);
		} else if (statement.elseBlock !== null) {
			this.execute(statement.elseBlock);
		}
	}

	/**
	 * Loops every time the condition is truthy
	 * @param statement the while statement
	 */
	public visitWhileStmt(statement: Stmt.WhileStmt): void {
		while (this.isTruthy(this.evaluate(statement.condition))) {
			try {
				this.execute(statement.body);
			} catch (e) {
				if (e instanceof Break) {
					break;
				} else if (e instanceof Continue) {
					continue;
				} else {
					throw e;
				}
			}
		}
	}

	/**
	 * Defines a pragma
	 * @param statement the pragma statement
	 */
	public visitPragmaStmt(statement: Stmt.PragmaStatement): void {
		this.env.definePragma(statement.pragmaTarget.lexeme, statement.pragmaArg.lexeme);
	}

	/**
	 * Breaks if in a while or for loop
	 * @param statement the break statement
	 */
	public visitBreakStmt(statement: Stmt.BreakStmt): void {
		throw new Break({
			line: statement.breakToken.line,
			column: (statement.breakToken.column || 1) - statement.breakToken.lexeme.length,
			endColumn: statement.breakToken.column || 1
		});
	}

	/**
	 * Continues if in a while or for loop
	 * @param statement the continue statement
	 */
	public visitContinueStmt(statement: Stmt.ContinueStmt): void {
		throw new Continue({
			line: statement.continueToken.line,
			column: (statement.continueToken.column || 1) - statement.continueToken.lexeme.length,
			endColumn: statement.continueToken.column || 1
		});
	}

	/**
	 * Defines a function
	 * @param statement the function statement
	 */
	public visitFunctionStmt(statement: Stmt.FunctionStmt) {
		const fn = new KonaFn(statement);
		this.env.define(statement.name.lexeme, fn);
	}

	/**
	 * Returns true if expression evaluates to true
	 * @param logical the logical expression
	 * @example
	 * true && true // => true
	 * true && false // => false
	 * false && false // => false
	 * !true // => false
	 * !false // => true
	 * 1 // => true
	 * 'string' // => true
	 * 0 // => false
	 */
	public visitLogical(logical: Expr.LogicalExpr): any {
		const left = this.evaluate(logical.left);

		if (logical.operator.type === TokenType.OR) {
			if (this.isTruthy(left)) return left;
		} else {
			if (!this.isTruthy(left)) return left;
		}

		return this.evaluate(logical.right);
	}

	/**
	 * Gets a var from the env
	 * @param expression the function expression
	 */
	public visitVar(expression: Expr.Variable): any {
		return this.env.getVar(expression.name);
	}

	/**
	 * Returns the literal value
	 * @param expression the literal
	 */
	public visitLiteral(expression: Expr.Literal): any {
		return expression.value;
	}

	public visitGrouping(expression: Expr.Group): any {
		return this.evaluate(expression.expression);
	}

	/**
	 * Handles arithmetic and comparison
	 * @param expression the binary expression
	 */
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

	/**
	 * Calls the specified function
	 * @param expression the call expression
	 */
	public visitCall(expression: Expr.Call): any {
		if (!(expression.callee instanceof Expr.Variable)) {
			this.throwError(new ReferenceError('Can only call functions.'), expression.calleeToken);
		}

		const callee = this.evaluate(expression.callee);
		const fnArguments: any[] = [];
		const fn = (callee as unknown) as KonaCallable;

		for (const arg of expression.args) {
			fnArguments.push(this.evaluate(arg));
		}

		if (fnArguments.length < fn.arity()) {
			this.throwError(
				new SyntaxError(
					'Expected at least ' +
						String(fn.arity()) +
						pluralize(' argument/s', fn.arity()) +
						', found ' +
						String(fnArguments.length) +
						'.'
				),
				expression.calleeToken
			);
		}

		this.stack.addFunctionCall(expression.calleeToken.lexeme, expression.calleeToken);

		const callResult = fn.callFn(this, fnArguments, expression.calleeToken);

		this.stack.removeFunctionCall();

		return callResult;
	}

	/**
	 * Assigns a value to a variable
	 * @param expression the assignment expression
	 */
	public visitAssignment(expression: Expr.Assignment): any {
		const value = this.evaluate(expression.value);

		this.env.assign(expression.name, value);

		return value;
	}

	/**
	 * Handles `-` and `!`
	 * @param expression the unary expression
	 */
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

	/**
	 * Executes a block and creates a new scope
	 * @param statements the statements of the block
	 * @param env the current environment
	 */
	public executeBlock(statements: Statement[], env: Environment) {
		const previous: Environment = this.env;

		this.env = env;
		for (const i in statements) {
			this.execute(statements[i]);
		}
		this.env = previous;
	}

	/**
	 * Checks if a value is truthy or not
	 * @param val the value
	 */
	public isTruthy(val: any): boolean {
		if (val === undefined) {
			return false;
		}
		if (typeof val === 'boolean') {
			return val;
		}
		return true;
	}

	/**
	 * Calls the accept function on an expression and passes this current instance
	 * @param expression the expression to evaluate
	 */
	public evaluate(expression: Expression): any {
		return expression.accept(this);
	}

	/**
	 * Same as evaluate but for statements
	 * @param statement the statement to execute
	 */
	public execute(statement: Statement): void {
		statement.accept(this);
	}

	/**
	 * Turns values into safe representations
	 * @param val
	 */
	public stringify(val: any): string {
		if (val === undefined) {
			return 'nil';
		}
		return String(val);
	}

	/**
	 * Throws a type error
	 * @param operator the operator that triggered the error
	 * @param expected the expected type value
	 * @param got the actual type value
	 */
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

	/**
	 * Throws an error
	 * @param Error the error to throw
	 * @param token the token that triggered the error
	 * @param hint an optional hint
	 */
	private throwError(Error: KonaError, token: Token, hint?: string): void {
		throws(Error, this.fileName, {
			line: token.line,
			column: (token.column || 0) - token.lexeme.length,
			endColumn: token.column || 0,
			hint,
			stack: this.stack,
			exit: true
		});
	}

	/**
	 * Check that every operand is a number
	 * @param operator
	 * @param operand
	 */
	private checkNumOperand(operator: Token, ...operand: any[]) {
		for (const i in operand) {
			if (typeof operand[i] !== 'number') {
				this.throwTypeError(operator, 'number', typeof operand[i] === 'undefined' ? 'nil' : typeof operand[i]);
			}
		}
	}

	// ----------HELPERS---------- //
}
