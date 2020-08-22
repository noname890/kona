import { Expression } from '../Expression';
import { ExpVisitors } from '../ExpVisitors';
import Token from '../../lexer/Token';

class Binary extends Expression {
	constructor(public leftExp: Expression, public operator: Token, public rightExp: Expression) {
		super();
	}

	public accept(visitor: ExpVisitors): void {
		return visitor.visitBinary(this);
	}
}

export { Binary };
