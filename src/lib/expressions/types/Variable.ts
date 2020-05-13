import { Expression } from '../Expression';
import { Token } from '../../lexer/Token';
import { ExpVisitors } from '../ExpVisitors';

class Variable extends Expression {
	constructor(public name: Token) {
		super();
	}

	public accept(visitor: ExpVisitors): any {
		return visitor.visitVar(this);
	}
}

export { Variable };
