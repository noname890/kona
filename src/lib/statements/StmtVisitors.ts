import { ExpressionStmt } from './types/ExpressionStmt';
import { PrintStmt } from './types/PrintStmt';
import { VariableStmt } from './types/VariableStmt';
import { BlockStmt } from './types/BlockStmt';

interface StmtVisitors {
	visitExprStmt(visitor: ExpressionStmt): any;
	visitPrintStmt(visitor: PrintStmt): any;
	visitVariableStmt(visitor: VariableStmt): any;
	visitBlockStmt(visitor: BlockStmt): any;
}
/* eslint no-undef: off */
export { StmtVisitors };
