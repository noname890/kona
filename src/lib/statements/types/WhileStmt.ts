import { Expression } from '../../expressions/Expression';
import { Statement } from '../Statements';
import { StmtVisitors } from '../StmtVisitors';

class WhileStmt extends Statement {
	constructor(public condition: Expression, public body: Statement) {
		super();
	}

	public accept(visitor: StmtVisitors): any {
		return visitor.visitWhileStmt(this);
	}
}

export { WhileStmt };
