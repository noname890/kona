import { Expression } from '../Expression';
import { Token } from '../../lexer/Token';
import { ExpVisitors } from '../ExpVisitors';

class Logical extends Expression {
	constructor(public left: Expression, public operator: Token, public right: Expression) {
		super();
	}

	public accept(visitor: ExpVisitors) {
		return visitor.visitLogical(this);
	}
}

export { Logical as LogicalExpr };
