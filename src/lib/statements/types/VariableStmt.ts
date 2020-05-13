import { Statement } from '../Statements';
import { Token } from '../../lexer/Token';
import { Expression } from '../../expressions/Expression';
import { StmtVisitors } from '../StmtVisitors';

class Variable extends Statement {
	constructor(public name: Token, public initializer: Expression) {
		super();
	}

	public accept(visitor: StmtVisitors): any {
		return visitor.visitVariableStmt(this);
	}
}

export { Variable as VariableStmt };
