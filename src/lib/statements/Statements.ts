import { StmtVisitors } from './StmtVisitors';

abstract class Statement {
	abstract accept(visitor: StmtVisitors): any;
}

export { Statement };
