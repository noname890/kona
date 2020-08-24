import { Expression } from '../Expression';
import Token from '../../lexer/Token';
import { ExpVisitors } from '../ExpVisitors';

class Unary extends Expression {
	constructor(public operator: Token, public right: Expression) {
		super();
	}

	public accept(visitor: ExpVisitors) {
		return visitor.visitUnary(this);
	}
}

export { Unary };
