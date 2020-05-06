/* eslint no-unused-vars: */

import { Token } from './Token';
import { TokenType } from './TokenTypes';
import { throws } from '../internal/error/throws';
import { SyntaxError } from '../internal/error/SyntaxError';
import { Keywords } from './Keywords';

let hadError: boolean = false;

class LexScanner {
	private tokens: Token[] = [];
	private start: number = 0;
	private current: number = 0;
	private line: number = 0;

	constructor(private source: string, private fileName: string) {}

	scan(): Token[] {
		while (this.current >= this.source.length) {
			// we get the next lexeme
			this.start = this.current;
			this.scanToken();
		}
		this.tokens.push(new Token(TokenType.EOF, '', null, this.line));
		return this.tokens;
	}

	private nextChar(): string {
		this.current++;
		return this.source.charAt(this.current - 1);
	}

	private scanToken() {
		const char: string = this.nextChar();
		const addToken: Function = this.addToken;

		switch (char) {
			case '{':
				addToken(TokenType.LEFT_CURLY);
				break;
			case '}':
				addToken(TokenType.RIGHT_CURLY);
				break;
			case '[':
				addToken(TokenType.LEFT_BRACKET);
				break;
			case ']':
				addToken(TokenType.RIGHT_BRACKET);
				break;
			case '(':
				addToken(TokenType.LEFT_PAREN);
				break;
			case ')':
				addToken(TokenType.RIGHT_PAREN);
				break;
			case ';':
				addToken(TokenType.SEMI_COL);
				break;
			case ':':
				addToken(TokenType.COLON);
				break;
			case ',':
				addToken(TokenType.COMMA);
				break;
			case '*':
				addToken(this.match('*') ? TokenType.POW : this.match('=') ? TokenType.TIMES_EQ : TokenType.MULTIPLY);
				break;
			case '!':
				addToken(this.match('=') ? TokenType.NOT_STRICT_EQ : TokenType.NOT);
				break;
			case '=':
				addToken(this.match('=') ? TokenType.STRICT_EQ : this.match('>') ? TokenType.FAT_ARROW : TokenType.EQ);
				break;
			case '+':
				addToken(this.match('=') ? TokenType.PLUS_EQ : TokenType.PLUS);
				break;
			case '-':
				addToken(this.match('=') ? TokenType.MINUS_EQ : this.match('>') ? TokenType.ARROW : TokenType.MINUS);
				break;
			case '<':
				addToken(this.match('=') ? TokenType.LESS_OR_EQ_THAN : TokenType.LESS_THAN);
				break;
			case '>':
				addToken(this.match('=') ? TokenType.GREATER_OR_EQ_THAN : TokenType.GREATER_THAN);
				break;
			case '&':
				this.match('&') ? addToken(TokenType.AND) : '';
				break;
			case '/':
				if (this.match('/')) {
					while (this.peek() !== '\n' && !(this.current >= this.source.length)) this.nextChar();
				} else {
					addToken(this.match('=') ? TokenType.DIV_EQ : TokenType.DIV);
				}
				break;
			case ' ':
			case '\r':
			case '\t':
				// ignore whitespace
				break;
			case '\n':
				this.line++;
				break;
			case '"':
				this.konaString();
				break;

			default:
				if (this.isDigit(char)) {
					this.konaInt();
				} else if (this.isAlpha(char)) {
					this.konaIdentifier();
				} else {
					throws(new SyntaxError("Unexpected character: '" + char), this.fileName, {
						line: this.line,
						column: this.current,
						code: 'TO_BE_REPLACED',
						exit: false
					});
					hadError = true;
				}
		}
	}

	private addToken(type: TokenType, literal?: any) {
		const text: string = this.source.substring(this.start, this.current);
		this.tokens.push(new Token(type, text, literal === undefined ? null : literal, this.line));
	}

	private match(expected: string): boolean {
		if (this.current >= this.source.length) {
			return false;
		}
		if (this.source.charAt(this.current) !== expected) {
			return false;
		}

		this.current++;
		return true;
	}

	// ----------HELPERS---------- //

	private peek(charsToPeek: number = 0): string {
		if (this.current + charsToPeek >= this.source.length) {
			return '\0';
		}
		return this.source.charAt(this.current + charsToPeek);
	}

	private isEnd(): boolean {
		return this.current >= this.source.length;
	}

	private isAlpha(char: string): boolean {
		return /[a-zA-Z_]/g.test(char);
	}

	private isAlphaNum(char: string): boolean {
		return this.isAlpha(char) || this.isDigit(char);
	}

	private isDigit(number: string): boolean {
		return number >= '0' && number <= '9';
	}

	// ----------HELPERS---------- //

	// -------DEFINITIONS------ //

	private konaString() {
		while (this.peek() !== '"' && !this.isEnd()) {
			if (this.peek() === '\n') this.line++;
			this.nextChar();
		}
		if (this.isEnd()) {
			throws(new SyntaxError('Expected closing string, but found end of file.'), this.fileName, {
				line: this.line,
				column: this.current,
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

	// -------DEFINITIONS------ //
}
