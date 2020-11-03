import { TokenType } from './TokenTypes';

const Keywords: any = {
	'import!': TokenType.IMPORT,
	'export!': TokenType.EXPORT,
	as: TokenType.AS,
	'let!': TokenType.VAL,
	'const!': TokenType.CONST,
	return: TokenType.RETURN,
	nil: TokenType.UNDEFINED,
	new: TokenType.NEW,
	throw: TokenType.THROW,
	'public!': TokenType.PUBLIC,
	'private!': TokenType.PRIVATE,
	if: TokenType.IF,
	else: TokenType.ELSE,
	for: TokenType.FOR,
	while: TokenType.WHILE,
	continue: TokenType.CONTINUE,
	break: TokenType.BREAK,
	to: TokenType.TO,
	// do: TokenType.DO,
	print: TokenType.PRINT,
	'class!': TokenType.CLASS,
	extends: TokenType.EXTENDS,
	true: TokenType.TRUE,
	false: TokenType.FALSE,
	loop: TokenType.LOOP,
	'fn!': TokenType.FUNCTION,
	'lambda!': TokenType.LAMBDA,
	'λ!': TokenType.LAMBDA,
	typeof: TokenType.TYPEOF,
	sizeof: TokenType.SIZEOF,
	'pragma!': TokenType.PRAGMA
};

export default Keywords;
