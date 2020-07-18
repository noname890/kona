import { ExpressionStmt } from './types/ExpressionStmt';
import { PrintStmt } from './types/PrintStmt';
import { VariableStmt } from './types/VariableStmt';
import { BlockStmt } from './types/BlockStmt';
import { IfStmt } from './types/IfStmt';
import { WhileStmt } from './types/WhileStmt';
import { PragmaStatement } from './types/PragmaStmt';

interface StmtVisitors {
	visitExprStmt(visitor: ExpressionStmt): any;
	visitPrintStmt(visitor: PrintStmt): any;
	visitVariableStmt(visitor: VariableStmt): any;
	visitBlockStmt(visitor: BlockStmt): any;
	visitIfStmt(visitor: IfStmt): any;
	visitWhileStmt(visitor: WhileStmt): any;
	visitPragmaStmt(visitBlockStmt: PragmaStatement): any;
}
/* eslint no-undef: off */
export { StmtVisitors };
