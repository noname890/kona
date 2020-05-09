/* eslint no-unused-vars: */

import { Token } from './Token';
import { TokenType } from './TokenTypes';
import { throws } from '../internal/error/throws';
import { SyntaxError } from '../internal/error/errorTypes/SyntaxError';
import { Keywords } from './Keywords';

let hadError: boolean = false;

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
			case ';':
				this.addToken(TokenType.SEMI_COL);
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
						: this.match('=')
							? TokenType.TIMES_EQ
							: this.match('/')
								? throws(new SyntaxError('Unexpected multiline comment ending.'), this.fileName, {
										line: this.line + 1,
										column: this.column,
										code: 'TO_BE_REPLACED',
										exit: true
									})
								: TokenType.MULTIPLY
				);
				break;
			case '!':
				this.addToken(this.match('=') ? TokenType.NOT_STRICT_EQ : TokenType.NOT);
				break;
			case '=':
				this.addToken(
					this.match('=') ? TokenType.STRICT_EQ : this.match('>') ? TokenType.FAT_ARROW : TokenType.EQ
				);
				break;
			case '+':
				this.addToken(this.match('=') ? TokenType.PLUS_EQ : TokenType.PLUS);
				break;
			case '-':
				this.addToken(
					this.match('=') ? TokenType.MINUS_EQ : this.match('>') ? TokenType.ARROW : TokenType.MINUS
				);
				break;
			case '<':
				this.addToken(this.match('=') ? TokenType.LESS_OR_EQ_THAN : TokenType.LESS_THAN);
				break;
			case '>':
				this.addToken(this.match('=') ? TokenType.GREATER_OR_EQ_THAN : TokenType.GREATER_THAN);
				break;
			case '&':
				this.match('&') ? this.addToken(TokenType.AND) : '';
				break;
			case '/':
				if (this.match('/')) {
					while (this.peek() !== '\n' && !(this.current >= this.source.length)) this.nextChar();
				} else if (this.match('*')) {
					this.konaMultiLine();
				} else {
					this.addToken(this.match('=') ? TokenType.DIV_EQ : TokenType.DIV);
				}
				break;
			case ' ':
				this.column++;
				break;
			case '\r':
				this.column += 4;
				break;
			case '\t':
				this.column += 4;
				// ignore whitespace
				break;
			case '\n':
				this.addToken(TokenType.EOL);
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
					throws(new SyntaxError("Unexpected character '" + char + "'"), this.fileName, {
						line: this.line + 1,
						column: this.column,
						code: 'TO_BE_REPLACED',
						exit: true
					});
					hadError = true;
				}
		}
	}

	addToken(type: TokenType | void, literal?: any) {
		const text: string = this.source.substring(this.start, this.current);
		if (typeof type === 'undefined') {
			return;
		}
		this.tokens.push(new Token(type, text, literal === undefined ? null : literal, this.line));
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

	private isDigit(number: string): boolean {
		return number >= '0' && number <= '9';
	}

	// ----------HELPERS---------- //

	// -------DEFINITIONS------ //

	private konaString() {
		while (this.peek() !== "'" && !this.isEnd()) {
			if (this.peek() === '\n') {
				throws(new SyntaxError('Expected string end, but found end of line.'), this.fileName, {
					line: this.line + 1,
					column: this.column,
					code: 'TO_BE_REPLACED',
					exit: true
				});
			}
			this.nextChar();
		}
		if (this.isEnd()) {
			throws(new SyntaxError('Expected string end, but found end of file.'), this.fileName, {
				line: this.line + 1,
				column: this.column,
				code: 'TO_BE_REPLACED',
				exit: true
			});
		}
		this.nextChar();
		this.addToken(TokenType.DOUBLE_STRING, this.source.substring(this.start + 1, this.current - 1));
	}

	private konaInt() {
		while (this.isDigit(this.peek())) {
			this.nextChar;
		}

		if (this.peek() === '.' && this.isDigit(this.peek(1))) {
			this.nextChar();

			while (this.isDigit(this.peek())) this.nextChar();
		}
		this.addToken(TokenType.NUMBER, parseInt(this.source.substring(this.start, this.current)));
	}

	private konaIdentifier() {
		while (this.isAlphaNum(this.peek())) {
			this.nextChar();
		}
		const type = Keywords[this.source.substring(this.start, this.current)] || TokenType.IDENTIFIER;

		this.addToken(type);
	}

	private konaMultiLine() {
		let multilines: number = 0;
		multilines++;

		while (multilines !== 0 && !(this.current >= this.source.length)) {
			this.nextChar();
			if (this.peek() === '/' && this.peek(1) === '*') {
				multilines++;
			}

			if (this.peek() === '*' && this.peek(1) === '/') {
				multilines--;
			}
		}
		// multilines isn't zero so we throw an error
		if (multilines) {
			throws(new SyntaxError('Expected multiline comment end, but found end of file.'), this.fileName, {
				line: this.line + 1,
				column: this.column,
				code: 'TO_BE_REPLACED',
				exit: true
			});
		}
		this.nextChar(2);
	}

	// -------DEFINITIONS------ //
}

export { LexScanner };
