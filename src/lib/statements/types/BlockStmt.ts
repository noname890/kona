import { Statement } from '../Statements';
import { StmtVisitors } from '../StmtVisitors';

class BlockStmt extends Statement {
	constructor(public statements: Statement[]) {
		super();
	}

	public accept(visitor: StmtVisitors): any {
		return visitor.visitBlockStmt(this);
	}
}

export { BlockStmt };
