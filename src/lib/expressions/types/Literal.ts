import { Expression } from '../Expression';
import { ExpVisitors } from '../ExpVisitors';

class Literal extends Expression {
	constructor(public value: any) {
		super();
	}

	public accept(visitor: ExpVisitors) {
		return visitor.visitLiteral(this);
	}
}

export { Literal };
