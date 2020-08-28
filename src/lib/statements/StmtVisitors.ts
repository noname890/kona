import * as Stmt from './stmt'

interface StmtVisitors {
	visitExprStmt(visitor: Stmt.ExpressionStmt): any;
	visitPrintStmt(visitor: Stmt.PrintStmt): any;
	visitVariableStmt(visitor: Stmt.VariableStmt): any;
	visitConstStmt(visitor: Stmt.ConstStmt): any;
	visitBlockStmt(visitor: Stmt.BlockStmt): any;
	visitIfStmt(visitor: Stmt.IfStmt): any;
	visitWhileStmt(visitor: Stmt.WhileStmt): any;
	visitPragmaStmt(visitBlockStmt: Stmt.PragmaStatement): any;
	visitBreakStmt(visitBreakStmt: Stmt.BreakStmt): any;
	visitContinueStmt(visitContinueStmt: Stmt.ContinueStmt): any;
	visitFunctionStmt(visitor: Stmt.FunctionStmt): any;
	visitReturnStmt(visitor: Stmt.ReturnStmt): any
}
/* eslint no-undef: off */
export { StmtVisitors };
