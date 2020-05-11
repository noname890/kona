/* eslint no-unused-vars: */

// TODO implement other types and their respective visitor functions

import { ExpVisitors } from '../../expressions/ExpVisitors';
import { Binary } from '../../expressions/types/Binary';
import { Expression } from '../../expressions/Expression';
import { Group } from '../../expressions/types/Group';
import { Literal } from '../../expressions/types/Literal';
import { Unary } from '../../expressions/types/Unary';
import { Call } from '../../expressions/types/Call';
class AstPrinter implements ExpVisitors {
	public print(expr: Expression): string {
		return expr.accept(this);
	}

	public visitBinary(binary: Binary): string {
		return this.parenthesize(binary.operator.lexeme, binary.leftExp, binary.rightExp);
	}

	public visitGrouping(group: Group): string {
		return this.parenthesize('group', group.expression);
	}

	public visitUnary(unary: Unary): string {
		return this.parenthesize(unary.operator.lexeme, unary.right);
	}

	public visitLiteral(literal: Literal): string | undefined {
		if (literal.value !== undefined) {
			return literal.value.toString();
		}
		return 'nil';
	}

	public visitCall(call: Call): string {
		return this.parenthesize('Function', new Literal(call.args.join(', ')));
	}

	parenthesize(name: string, ...expr: Expression[]): string {
		let string = '(' + name;

		for (let i = 0; i <= expr.length - 1; i++) {
			const expression: Expression = expr[i];

			string += ' ' + expression.accept(this);
		}
		return string + ')';
	}
}

export { AstPrinter };
