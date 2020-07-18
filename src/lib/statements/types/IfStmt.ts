import { Statement } from '../Statements';
import { Expression } from '../../expressions/Expression';
import { StmtVisitors } from '../StmtVisitors';

class IfStmt extends Statement {
	constructor(public condition: Expression, public thenBlock: Statement, public elseBlock: Statement | null) {
		super();
	}

	public accept(visitor: StmtVisitors): void {
		return visitor.visitIfStmt(this);
	}
}

export { IfStmt };
