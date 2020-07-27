import { Statement } from '../Statements';
import { StmtVisitors } from '../StmtVisitors';
import { Token } from '../../lexer/Token';

class BreakStmt extends Statement {
	// we accept continueToken for error handling
	constructor(public breakToken: Token) {
		super();
	}

	public accept(visitor: StmtVisitors): void {
		return visitor.visitBreakStmt(this);
	}
}

export { BreakStmt };
