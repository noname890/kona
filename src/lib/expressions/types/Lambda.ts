import { Expression } from '../Expression';
import Token from '../../lexer/Token';
import { ExpVisitors } from '../ExpVisitors';
import { Statement } from '../../statements/Statements';

class Lambda extends Expression {
	public readonly name = '<anonymous>';

	constructor(public params: Token[], public body: Statement[]) {
		super();
	}

	public accept(visitor: ExpVisitors) {
		return visitor.visitLambda(this);
	}
}

export { Lambda };
