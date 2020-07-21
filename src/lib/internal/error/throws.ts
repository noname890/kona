/* eslint array-bracket-spacing: */

import { KonaError } from './errorTypes/InternalKonaError';
import chalk from 'chalk';
import { ParseError } from './errorTypes/ParseError';
import { readFileSync } from 'fs';

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

		if (sorted[0]) {
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
	const ERROR_ORIGIN = `${chalk.italic.grey(filename + ' at ' + String(info.line) + ':' + String(info.column))}`;

	// grabs the file, splits by newline, and grabs 9 lines
	const file = readFileSync(filename, 'utf8').split(NEW_LINE_REGEX);

	// because slice gives back a shill copy i have to clone it like this, otherwise it gets sorted
	const shortestWhitespaceAmount = findShortestWhitespaceAmount([ ...file ]);
	const formattedFile = file
		.slice(info.line - 4 < 0 ? 0 : info.line - 4, info.line + 4 > file.length ? file.length : info.line + 4)
		.map((val, index) => {
			const lineNumber = index + (info.line - 3 < 0 ? 1 : info.line - 3);
			const newVal = val.substring(shortestWhitespaceAmount);

			info.column -= shortestWhitespaceAmount;
			info.endColumn -= shortestWhitespaceAmount;

			if (lineNumber === info.line) {
				const errorHighlight =
					newVal.substring(0, info.column - 1) +
					chalk.bold.redBright(newVal.substring(info.column - 1, info.endColumn - 1)) +
					newVal.substring(info.endColumn - 1);
				return (
					' '.repeat(String(info.line).length - String(lineNumber).length) +
					chalk.bold.redBright(lineNumber) +
					' │ ' +
					chalk.bold.whiteBright(errorHighlight)
				);
			}

			return (
				' '.repeat(String(info.line).length - String(lineNumber).length) +
				chalk.bold.grey(lineNumber) +
				' │ ' +
				chalk.bold.whiteBright(newVal)
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
