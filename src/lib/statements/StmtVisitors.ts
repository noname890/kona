import { ExpressionStmt } from './types/ExpressionStmt';
import { PrintStmt } from './types/PrintStmt';
import { VariableStmt } from './types/VariableStmt';
import { BlockStmt } from './types/BlockStmt';
import { IfStmt } from './types/IfStmt';
import { WhileStmt } from './types/WhileStmt';
import { PragmaStatement } from './types/PragmaStmt';
import { ContinueStmt } from './types/ContinueStmt';
import { BreakStmt } from './types/BreakStmt';
import { ConstStmt } from './types/ConstStmt';
import { FunctionStmt } from './types/FunctionStmt';
import { ReturnStmt } from './types/ReturnStmt';

interface StmtVisitors {
	visitExprStmt(visitor: ExpressionStmt): any;
	visitPrintStmt(visitor: PrintStmt): any;
	visitVariableStmt(visitor: VariableStmt): any;
	visitConstStmt(visitor: ConstStmt): any;
	visitBlockStmt(visitor: BlockStmt): any;
	visitIfStmt(visitor: IfStmt): any;
	visitWhileStmt(visitor: WhileStmt): any;
	visitPragmaStmt(visitBlockStmt: PragmaStatement): any;
	visitBreakStmt(visitBreakStmt: BreakStmt): any;
	visitContinueStmt(visitContinueStmt: ContinueStmt): any;
	visitFunctionStmt(visitor: FunctionStmt): any;
	visitReturnStmt(visitor: ReturnStmt): any
}
/* eslint no-undef: off */
export { StmtVisitors };
