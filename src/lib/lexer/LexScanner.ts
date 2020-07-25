/* eslint no-unused-vars: */

import { Token } from './Token';
import { TokenType } from './TokenTypes';
import { throws } from '../internal/error/throws';
import { SyntaxError } from '../internal/error/errorTypes/SyntaxError';
import { Keywords } from './Keywords';

class LexScanner {
	public tokens: Token[] = [];
	public start: number = 0;
	public current: number = 0;
	public line: number = 0;
	public column: number = 1;

	constructor(public source: string, public fileName: string) {}

	scan(): Token[] {
		while (this.current < this.source.length) {
			// we get the next lexeme
			this.start = this.current;
			this.scanToken();
		}

		this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
		return this.tokens;
	}

	nextChar(skip: number = 1): string {
		this.current += skip;
		this.column += skip;
		return this.source.charAt(this.current - 1);
	}

	scanToken() {
		const char: string = this.nextChar();

		switch (char) {
			case '{':
				this.addToken(TokenType.LEFT_CURLY);
				break;
			case '}':
				this.addToken(TokenType.RIGHT_CURLY);
				break;
			case '[':
				this.addToken(TokenType.LEFT_BRACKET);
				break;
			case ']':
				this.addToken(TokenType.RIGHT_BRACKET);
				break;
			case '(':
				this.addToken(TokenType.LEFT_PAREN);
				break;
			case ')':
				this.addToken(TokenType.RIGHT_PAREN);
				break;
			// greek question mark
			case ';':
			case ';':
				if (this.tokens.length !== 0) {
					this.tokens[this.tokens.length - 1].type !== TokenType.EOL &&
					this.tokens[this.tokens.length - 1].type !== TokenType.SEMI_COL
						? this.addToken(TokenType.SEMI_COL)
						: '';
				}
				break;
			case ':':
				this.addToken(TokenType.COLON);
				break;
			case ',':
				this.addToken(TokenType.COMMA);
				break;
			case '*':
				this.addToken(
					this.match('*')
						? TokenType.POW
						: this.match('/')
							? throws(new SyntaxError('Unexpected multiline comment ending.'), this.fileName, {
									line: this.line + 1,
									column: this.column,
									endColumn: this.column,
									exit: true
								})
							: TokenType.MULTIPLY
				);
				break;
			case '!':
				this.addToken(
					this.match('=')
						? this.match('=') ? TokenType.NOT_LOOSE_EQ : TokenType.NOT_STRICT_EQ
						: TokenType.NOT
				);
				break;
			case '=':
				// we call match 2 times with '=' to check for ===
				this.addToken(
					this.match('=')
						? this.match('=') ? TokenType.LOOSE_EQ : TokenType.STRICT_EQ
						: this.match('>') ? TokenType.FAT_ARROW : TokenType.EQ
				);
				break;
			case '+':
				this.addToken(TokenType.PLUS);
				break;
			case '-':
				this.addToken(this.match('>') ? TokenType.ARROW : TokenType.MINUS);
				break;
			case '<':
				this.addToken(this.match('=') ? TokenType.LESS_OR_EQ_THAN : TokenType.LESS_THAN);
				break;
			case '>':
				this.addToken(this.match('=') ? TokenType.GREATER_OR_EQ_THAN : TokenType.GREATER_THAN);
				break;
			case '|':
				this.addToken(this.match('|') ? TokenType.OR : this.unexpected(char));
				break;
			case '&':
				// in the future i am going to implement a bitwise && and a bitwise ||
				this.match('&') ? this.addToken(TokenType.AND) : this.unexpected(char);
				break;
			case '/':
				if (this.match('/')) {
					while (this.peek() !== '\n' && !(this.current >= this.source.length)) this.nextChar();
				} else if (this.match('*')) {
					this.konaMultiLine();
				} else {
					this.addToken(TokenType.DIV);
				}
				break;
			case ' ':
				break;
			case '\r':
				break;
			case '\t':
				this.column += 4;
				// ignore whitespace
				break;
			case '\n':
				if (this.tokens.length !== 0) {
					this.isExcludedFromEOL() ? this.addToken(TokenType.EOL) : '';
				}
				this.line++;
				this.column = 1;
				break;
			case "'":
				this.konaString();
				break;

			default:
				if (this.isDigit(char)) {
					this.konaInt();
				} else if (this.isAlpha(char)) {
					this.konaIdentifier();
				} else {
					this.unexpected(char);
				}
		}
	}

	addToken(type: TokenType | void, literal?: any) {
		const text: string = this.source.substring(this.start, this.current);
		if (typeof type === 'undefined') {
			return;
		}
		this.tokens.push(new Token(type, text, literal === undefined ? null : literal, this.line + 1, this.column));
	}

	match(expected: string): boolean {
		if (this.current >= this.source.length) {
			return false;
		}
		if (this.source.charAt(this.current) !== expected) {
			return false;
		}

		this.current++;
		this.column++;
		return true;
	}

	// ----------HELPERS---------- //

	isExcludedFromEOL(): boolean {
		return (
			this.tokens[this.tokens.length - 1].type !== TokenType.SEMI_COL &&
			this.tokens[this.tokens.length - 1].type !== TokenType.EOL &&
			this.tokens[this.tokens.length - 1].type !== TokenType.LEFT_CURLY &&
			this.tokens[this.tokens.length - 1].type !== TokenType.RIGHT_CURLY
		);
	}

	peek(charsToPeek: number = 0): string {
		if (this.current + charsToPeek >= this.source.length) {
			return '\0';
		}
		return this.source.charAt(this.current + charsToPeek);
	}

	isEnd(): boolean {
		return this.current >= this.source.length;
	}

	isAlpha(char: string): boolean {
		return /[a-zA-Z_]/g.test(char);
	}

	isAlphaNum(char: string): boolean {
		return this.isAlpha(char) || this.isDigit(char);
	}

	isDigit(number: string): boolean {
		return number >= '0' && number <= '9';
	}

	unexpected(char: string): void {
		throws(new SyntaxError("Unexpected character '" + char + "'"), this.fileName, {
			line: this.line + 1,
			column: this.column,
			endColumn: this.column + 1,
			exit: true
		});
	}

	// ----------HELPERS---------- //

	// -------DEFINITIONS------ //

	konaString() {
		while (this.peek() !== "'" && !this.isEnd()) {
			if (this.peek() === '\n') {
				throws(new SyntaxError('Expected string end, but found end of line.'), this.fileName, {
					line: this.line + 1,
					column: this.column - 1,
					endColumn: this.column,
					exit: true
				});
			}
			this.nextChar();
		}
		if (this.isEnd()) {
			throws(new SyntaxError('Expected string end, but found end of file.'), this.fileName, {
				line: this.line + 1,
				column: this.column - 1,
				endColumn: this.column,
				exit: true
			});
		}
		this.nextChar();
		this.addToken(TokenType.STRING, this.source.substring(this.start + 1, this.current - 1));
	}

	konaInt() {
		while (this.isDigit(this.peek())) {
			this.nextChar();
		}

		if (this.peek() === '.' && this.isDigit(this.peek(1))) {
			this.nextChar();

			while (this.isDigit(this.peek())) this.nextChar();
		}
		this.addToken(TokenType.NUMBER, Number(this.source.substring(this.start, this.current)));
	}

	konaIdentifier() {
		while (this.isAlphaNum(this.peek())) {
			this.nextChar();
		}
		const type = Keywords[this.source.substring(this.start, this.current)] || TokenType.IDENTIFIER;

		this.addToken(type);
	}

	konaMultiLine(): void {
		while (!(this.current >= this.source.length)) {
			this.nextChar();
			if (this.peek() === '*' && this.peek(1) === '/') {
				this.nextChar(2);
				return;
			}
		}
		// we reached the EOF without a closing bracket, so we throw an error
		if (this.current >= this.source.length) {
			throws(new SyntaxError('Expected multiline comment end, but found end of file.'), this.fileName, {
				line: this.line + 1,
				column: this.column,
				endColumn: this.column,
				exit: true
			});
		}
	}

	// -------DEFINITIONS------ //
}

export { LexScanner };
