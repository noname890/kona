import { Statement } from '../Statements';
import { Token } from '../../lexer/Token';
import { Expression } from '../../expressions/Expression';
import { StmtVisitors } from '../StmtVisitors';

class ConstStmt extends Statement {
	constructor(public name: Token, public initializer: Expression) {
		super();
	}

	public accept(visitor: StmtVisitors): any {
		return visitor.visitConstStmt(this);
	}
}

export { ConstStmt };
