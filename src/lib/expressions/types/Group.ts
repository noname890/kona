import { Expression } from '../Expression';
import { ExpVisitors } from '../ExpVisitors';

class Group extends Expression {
	constructor(public expression: Expression) {
		super();
	}

	public accept(visitor: ExpVisitors) {
		return visitor.visitGrouping(this);
	}
}

export { Group };
