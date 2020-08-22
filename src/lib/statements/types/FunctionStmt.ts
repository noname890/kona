import { Statement } from '../Statements';
import { Token } from '../../lexer/Token';
import { StmtVisitors } from '../StmtVisitors';

class FunctionStmt extends Statement {
	constructor(public name: Token, public params: Token[], public body: Statement[]) {
		super();
	}

	public accept(visitor: StmtVisitors) {
		return visitor.visitFunctionStmt(this);
	}
}

export { FunctionStmt };
