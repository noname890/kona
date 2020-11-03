import { Statement } from '../Statements';
import Token from '../../lexer/Token';
import { Expression } from '../../expressions/Expression';
import { StmtVisitors } from '../StmtVisitors';

class ReturnStmt extends Statement {
	constructor(public keyword: Token, public value: Expression | undefined) {
		super();
	}

	public accept(visitor: StmtVisitors) {
		return visitor.visitReturnStmt(this);
	}
}

export { ReturnStmt };
