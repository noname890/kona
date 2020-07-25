import { Interpreter } from '../lib/interpreter/interpreter';
import { LexScanner } from '../lib/lexer/LexScanner';
import { Parser } from '../lib/parser/Parser';
import { readFileSync } from 'fs';

if (process.argv[2] && process.argv.length < 4) {
	let file;
	try {
		file = readFileSync(process.argv[2], 'utf8');
	} catch (e) {
		console.log('file not found');
		process.exit(1);
	}

	run(file, process.argv[2]);
}

function run(source: string, fileName: string) {
	// lex the file contents
	const lexed = new LexScanner(source, fileName).scan();
	const parsed = new Parser(lexed, fileName).parse();
	const interpreter = new Interpreter(fileName);

	if (parsed) {
		interpreter.interpret(parsed);
	}
}
