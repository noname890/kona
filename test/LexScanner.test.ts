/* eslint-env mocha */

import { expect } from 'chai';
import LexScanner from '../dist/lib/lexer/LexScanner';
import { TokenType } from '../src/lib/lexer/TokenTypes';

describe('LexScanner', () => {
	describe('peek()', () => {
		const lex = new LexScanner("val test = 'This is a mocha test!'; true == true; nil", 'mochaTest');
		it('should return the next char.', () => {
			expect(lex.peek()).to.be.equal('v');
		});
		it('should return the 3rd char.', () => {
			expect(lex.peek(2)).to.be.equal('l');
		});
	});
	describe('match()', () => {
		const lex = new LexScanner('print nil', 'mochaTest');
		it('should return true.', () => {
			expect(lex.match('p')).to.be.true;
		});
		it('should return false.', () => {
			expect(lex.match('m')).to.be.false;
		});
	});
	describe('scan()', () => {
		const lex = new LexScanner('test', 'mochaTest');

		it('should be return TokenType.IDENTIFIER', () => {
			expect(lex.scan()[0].type).to.be.equal(TokenType.IDENTIFIER);
		});
	});
	describe('isAlpha()', () => {
		const lex = new LexScanner('', 'mochaTest');
		it('should return true.', () => {
			expect(lex.isAlpha('t')).to.be.true;
		});
		it('should return false', () => {
			expect(lex.isAlpha('1')).to.be.false;
		});
	});
	describe('isDigit()', () => {
		const lex = new LexScanner('', 'mochaTest');
		it('should return true', () => {
			expect(lex.isDigit('1')).to.be.true;
		});
		it('should return false', () => {
			expect(lex.isDigit('a')).to.be.false;
		});
	});
});
