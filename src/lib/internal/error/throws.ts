/* eslint array-bracket-spacing: */

import { KonaError } from './errorTypes/InternalKonaError';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { normalize } from 'path';
import Stack from '../../interpreter/Stack';

const INDENTATION = 4;
const NEW_LINE_REGEX = /\r?\n/g;

/**
 * Interface that describes an error
 */
interface ErrorInfo {
	line: number;
	column: number;
	endColumn: number;
	hint?: string;
	stack?: Stack;
	exit?: true | false;
}

/**
 * Clamps a number within a minimum bound
 * @param number the number to clamp
 * @param min the minimum
 */
function clamp(number: number, min: number): number {
	return number < min ? min : number;
}

/**
 * Takes an unwrapped stack and applies an indent to every child
 * @param stack the unwrapped stack
 * @param indent number that dictates the indent
 */
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

/**
 * Calculates the actual line number of an error based on an array index
 * @param reference the array index
 * @param info the error info
 */
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

/**
 * Finds the shortest index of the first character for each line
 * @param array the split file
 */
function findShortestWhitespaceAmount(array: string[]): number {
	// sort the array
	const sorted = array.sort((a, b) => a.length - b.length);

	if (sorted[0] !== undefined) {
		// check that it isn't only whitespace
		while (!sorted[0].trim()) {
			// shift in place
			sorted.shift();
		}

		// check if sorted[0] is not undefined
		if ((sorted[0] as unknown) as boolean) {
			// get the location of the first char
			const shortest = sorted[0].search(/\S/);
			// clamp and return
			return shortest < 0 ? 0 : shortest;
		}
	}

	return 0;
}

/**
 * Takes the lines around the line where the error happened
 * formats them and signs in red the line where the error was reported
 * and colors in red the piece of code that triggered it
 * @param filename filename
 * @param info error info
 */
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

/**
 * Prints a formatted error trace to the screen, with:
 *  - Error message and type of error
 *  - Error location
 *  - Stacktrace
 *  - Hints
 * @param konaerror the error class
 * @param filename name of the file where the error originated
 * @param info the info about the error
 */
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
