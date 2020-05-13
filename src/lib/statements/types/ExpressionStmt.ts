import { Statement } from '../Statements';
import { Expression } from '../../expressions/Expression';
import { StmtVisitors } from '../StmtVisitors';

class ExpressionStmt extends Statement {
	constructor(public expression: Expression) {
		super();
	}

	public accept(visitor: StmtVisitors): any {
		return visitor.visitExprStmt(this);
	}
}

export { ExpressionStmt };
