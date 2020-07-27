import { Statement } from '../Statements';
import { StmtVisitors } from '../StmtVisitors';
import { Token } from '../../lexer/Token';

class ContinueStmt extends Statement {
	// we accept continueToken for error handling
	constructor(public continueToken: Token) {
		super();
	}

	public accept(visitor: StmtVisitors): void {
		return visitor.visitContinueStmt(this);
	}
}

export { ContinueStmt };
