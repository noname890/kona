"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var interpreter_1 = require("../lib/interpreter/interpreter");
var LexScanner_1 = require("../lib/lexer/LexScanner");
var Parser_1 = require("../lib/parser/Parser");
var fs_1 = require("fs");
if (process.argv[2] && process.argv.length < 4) {
    var file = void 0;
    try {
        file = fs_1.readFileSync(process.argv[2], 'utf8');
    }
    catch (e) {
        console.log('file not found');
        process.exit(1);
    }
    run(file, process.argv[2]);
}
function run(source, fileName) {
    // lex the file contents
    var lexed = new LexScanner_1.LexScanner(source, fileName).scan();
    var parsed = new Parser_1.Parser(lexed, fileName).parse();
    var interpreter = new interpreter_1.Interpreter(fileName);
    if (parsed) {
        interpreter.interpret(parsed);
    }
}
