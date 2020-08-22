import { Expression } from '../Expression';
import Token from '../../lexer/Token';
import { ExpVisitors } from '../ExpVisitors';

class Assignment extends Expression {
	constructor(public name: Token, public value: Expression) {
		super();
	}

	public accept(visitor: ExpVisitors): any {
		return visitor.visitAssignment(this);
	}
}

export { Assignment };
