/* eslint array-bracket-spacing: */

import { KonaError } from './errorTypes/InternalKonaError';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { normalize } from 'path';
import Stack from '../../interpreter/Stack';

const INDENTATION = 4;
const NEW_LINE_REGEX = /\r?\n/g;

interface ErrorInfo {
	line: number;
	column: number;
	endColumn: number;
	hint?: string;
	stack?: Stack;
	exit?: true | false;
}

function clamp(number: number, min: number): number {
	return number < min ? min : number;
}

function formatStackTrace(stack: any[], indent: number = 0): string[] {
	// TODO: add option for user to choose stacktrae depth
	const MAX_DEPTH = 6;
	const result: string[] = [];

	if (stack.length === 0) return result;
	// prevent from displaying all the function children
	if (indent === MAX_DEPTH) return [];

	for (const i in stack) {
		result.push(' '.repeat(indent * 2) + stack[i][0]);
		result.push(...formatStackTrace(stack[i][1], indent + 1));
	}

	return result;
}

function calculateLineNumber(reference: number, info: ErrorInfo) {
	return reference + clamp(info.line - 3, 1);
}
function calculateLinePadding(array: string[], info: ErrorInfo) {
	const lineNumbersLengths: number[] = [];

	array.forEach((_, index) => {
		lineNumbersLengths.push(String(calculateLineNumber(index, info)).length);
	});
	return Math.max(...lineNumbersLengths);
}

// // TypeScript translates the chalk import to __importStar(require('chalk'))
// // and not to require('chalk'), that returns a module object with a property
// // named default
// // so chalk methods aren't accessible without doing this
// i am dumb, i had to do `import chalk from 'chalk'`

function findShortestWhitespaceAmount(array: string[]): number {
	const sorted = array.sort((a, b) => a.length - b.length);

	if (sorted[0] !== undefined) {
		while (!sorted[0].trim()) {
			sorted.shift();
		}

		if ((sorted[0] as unknown) as boolean) {
			const shortest = sorted[0].search(/\S/);

			return shortest < 0 ? 0 : shortest;
		}
	}

	return 0;
}

function generateFormattedFile(filename: string, info: ErrorInfo) {
	// grabs the file, splits by newline
	const file = readFileSync(filename, 'utf8').split(NEW_LINE_REGEX);
	const CLAMPED_MAX = info.line + 3 > file.length ? file.length : info.line + 3;

	// because slice gives back a shill copy i have to clone it like this, otherwise it gets sorted
	const shortestWhitespaceAmount = findShortestWhitespaceAmount([
		...file.slice(clamp(info.line - 4, 0), CLAMPED_MAX)
	]);
	const slicedFile = file.slice(clamp(info.line - 4, 0), CLAMPED_MAX);
	const formattedFile = slicedFile
		.map((val, index) => {
			const lineNumber = calculateLineNumber(index, info);
			const lineNumberPadding = calculateLinePadding(slicedFile, info) - String(lineNumber).length;

			// info.column -= shortestWhitespaceAmount;
			// info.endColumn -= shortestWhitespaceAmount;
			if (lineNumber === info.line) {
				const errorHighlight =
					val.substring(0, info.column - 1) +
					chalk.bold.redBright(val.substring(info.column - 1, info.endColumn - 1)) +
					val.substring(info.endColumn - 1);
				return (
					' '.repeat(lineNumberPadding) +
					chalk.bold.redBright(lineNumber) +
					' │ ' +
					chalk.bold.whiteBright(errorHighlight.substring(shortestWhitespaceAmount))
				);
			}

			return (
				' '.repeat(lineNumberPadding) +
				chalk.bold.grey(lineNumber) +
				' │ ' +
				chalk.bold.whiteBright(val.substring(shortestWhitespaceAmount))
			);
		})
		.join('\n  ');

	return formattedFile;
}

export default function throws(konaerror: KonaError, filename: string, info: ErrorInfo): never {
	const STACK_EMPTY = chalk.italic.grey('empty');
	const ERROR_ORIGIN = `${chalk.italic.grey(
		normalize(filename) + ' at ' + String(info.line) + ':' + String(info.column)
	)}`;

	const formattedFile = generateFormattedFile(filename, info);

	console.log(`\n${chalk.redBright('---------------ERROR!---------------')} ${ERROR_ORIGIN}	
  ${chalk.bold.redBright(konaerror.errorType)}: ${chalk.bold.whiteBright(
		// we format newlines to be indented based on where the first line of the error message starts
		// example:
		// ReferenceError: Variable '_' is not defined.\nVariables named '_' are not assigned.
		// becomes:
		// ReferenceError: Variable '_' is not defined.
		// 				   Variables named '_' are not assigned.
		konaerror.message.replace(NEW_LINE_REGEX, '\n' + ' '.repeat(konaerror.errorType.length + INDENTATION))
	)}
  
  ${formattedFile}

  ${chalk.bold.cyan('Stacktrace:')} ${info.stack
		? info.stack.getStacktrace().length !== 0
			? formatStackTrace(info.stack.unwrap(info.stack.getStacktrace())).join(
					'\n' + ' '.repeat('Stacktrace'.length + INDENTATION)
				)
			: STACK_EMPTY
		: STACK_EMPTY}
  ${info.hint
		? '\n' +
			' '.repeat(INDENTATION / 2) +
			chalk.bold.underline.cyanBright('Hint') +
			chalk.cyan(': ' + info.hint.replace(NEW_LINE_REGEX, '\n' + ' '.repeat('Hint'.length + INDENTATION)))
		: ''}
${chalk.redBright('------------------------------------')}
\n`);

	if (info.exit) {
		process.exit(1);
	}
	throw konaerror;
}
