import { Statement } from '../Statements';
import { Expression } from '../../expressions/Expression';
import { StmtVisitors } from '../StmtVisitors';

class Print extends Statement {
	constructor(public expression: Expression) {
		super();
	}

	public accept(visitor: StmtVisitors): any {
		return visitor.visitPrintStmt(this);
	}
}

export { Print as PrintStmt };
