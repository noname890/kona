/* eslint array-bracket-spacing: */

import { KonaError } from './errorTypes/InternalKonaError';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { normalize } from 'path';

function clamp(number: number, min: number, max: number): number {
	return Math.min(max, Math.min(Number(number), min));
}

// // TypeScript translates the chalk import to __importStar(require('chalk'))
// // and not to require('chalk'), that returns a module object with a property
// // named default
// // so chalk methods aren't accessible without doing this
// i am dumb, i had to do `import chalk from 'chalk'`

function findShortestWhitespaceAmount(array: string[]): number {
	const sorted = array.sort((a, b) => a.length - b.length);

	if (sorted[0]) {
		while (sorted[0].trim() === '') {
			sorted.shift();
		}

		if ((sorted[0] as unknown) as boolean) {
			const shortest = sorted[0].search(/\S/);

			return shortest < 0 ? 0 : shortest;
		}
	}

	return 0;
}

interface ErrorInfo {
	line: number;
	column: number;
	endColumn: number;
	hint?: string;
	exit?: true | false;
}

function throws(konaerror: KonaError, filename: string, info: ErrorInfo) {
	const INDENTATION = 4;
	const NEW_LINE_REGEX = /\r?\n/g;
	const ERROR_ORIGIN = `${chalk.italic.grey(
		normalize(filename) + ' at ' + String(info.line) + ':' + String(info.column)
	)}`;

	// grabs the file, splits by newline, and grabs 8 lines
	const file = readFileSync(filename, 'utf8').split(NEW_LINE_REGEX);

	// because slice gives back a shill copy i have to clone it like this, otherwise it gets sorted
	const shortestWhitespaceAmount = findShortestWhitespaceAmount([
		...file.slice(info.line - 4 < 0 ? 0 : info.line - 4, info.line + 3 > file.length ? file.length : info.line + 3)
	]);
	const formattedFile = file
		.slice(info.line - 4 < 0 ? 0 : info.line - 4, info.line + 3 > file.length ? file.length : info.line + 3)
		.map((val, index) => {
			const lineNumber = index + (info.line - 3 < 0 ? 1 : info.line - 3) + 1;

			// info.column -= shortestWhitespaceAmount;
			// info.endColumn -= shortestWhitespaceAmount;
			if (lineNumber === info.line) {
				const errorHighlight =
					val.substring(0, info.column - 1) +
					chalk.bold.redBright(val.substring(info.column - 1, info.endColumn - 1)) +
					val.substring(info.endColumn - 1);
				return (
					' '.repeat(String(info.line).length - String(lineNumber).length) +
					chalk.bold.redBright(lineNumber) +
					' │ ' +
					chalk.bold.whiteBright(errorHighlight.substring(shortestWhitespaceAmount))
				);
			}

			return (
				' '.repeat(String(info.line).length - String(lineNumber).length) +
				chalk.bold.grey(lineNumber) +
				' │ ' +
				chalk.bold.whiteBright(val.substring(shortestWhitespaceAmount))
			);
		})
		.join('\n  ');

	console.log(`\n${chalk.redBright('---------------ERROR!---------------')} ${ERROR_ORIGIN}	
  ${chalk.bold.redBright(konaerror.errorType)}: ${chalk.bold.whiteBright(
		// we format newlines to be indented based on where the first line of the error message starts
		konaerror.message.replace(NEW_LINE_REGEX, '\n' + ' '.repeat(konaerror.errorType.length + INDENTATION))
	)}
  
  ${formattedFile}
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
}

export { throws };
