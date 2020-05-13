import { ExpressionStmt } from './types/ExpressionStmt';
import { PrintStmt } from './types/PrintStmt';
import { VariableStmt } from './types/VariableStmt';

interface StmtVisitors {
	visitExprStmt(visitor: ExpressionStmt): any;
	visitPrintStmt(visitor: PrintStmt): any;
	visitVariableStmt(visitor: VariableStmt): any;
}
/* eslint no-undef: */
export { StmtVisitors };
