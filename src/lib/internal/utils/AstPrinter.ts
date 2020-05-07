/* eslint no-unused-vars: */

import { ExpVisitors } from '../../expressions/ExpVisitors';
import { Binary } from '../../expressions/types/Binary';
import { Expression } from '../../expressions/Expression';
import { Group } from '../../expressions/types/Group';
import { Literal } from '../../expressions/types/Literal';
import { Unary } from '../../expressions/types/Unary';
class AstPrinter implements ExpVisitors {
	public print(expr: Expression): string {
		console.log('1');
		return expr.accept(this);
	}

	public visitBinary(binary: Binary): string {
		console.log(2);
		return this.parenthesize(binary.operator.lexeme, binary.leftExp, binary.rightExp);
	}

	public visitGrouping(group: Group): string {
		console.log(this.parenthesize('group', group.expression));
		return this.parenthesize('group', group.expression);
	}

	public visitUnary(unary: Unary): string {
		return this.parenthesize(unary.operator.lexeme, unary.right);
	}

	public visitLiteral(literal: Literal): string {
		return literal.value.toString();
	}

	public parenthesize(name: string, ...expr: Expression[]): string {
		let string = '(' + name;

		for (let i = 0; i <= expr.length - 1; i++) {
			const expression: Expression = expr[i];

			string += ' ' + expression.accept(this);
		}
		return string + ')';
	}
}

export { AstPrinter };
