import { Expression } from '../Expression';
import Token from '../../lexer/Token';
import { ExpVisitors } from '../ExpVisitors';

class Call extends Expression {
	constructor(
		public callee: Expression,
		public parenthesis: Token,
		public args: Expression[],
		public calleeToken: Token
	) {
		super();
	}

	public accept(visitor: ExpVisitors): void {
		return visitor.visitCall(this);
	}
}

export { Call };
