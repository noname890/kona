import { Statement } from '../Statements';
import { StmtVisitors } from '../StmtVisitors';
import Token from '../../lexer/Token';

class PragmaStatement extends Statement {
	constructor(public pragmaTarget: Token, public pragmaArg: Token) {
		super();
	}

	public accept(visitor: StmtVisitors): void {
		return visitor.visitPragmaStmt(this);
	}
}

export { PragmaStatement };
