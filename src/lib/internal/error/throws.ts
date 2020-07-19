import { KonaError } from './errorTypes/InternalKonaError';
import chalk from 'chalk';
import { ParseError } from './errorTypes/ParseError';

// // TypeScript translates the chalk import to __importStar(require('chalk'))
// // and not to require('chalk'), that returns a module object with a property
// // named default
// // so chalk methods aren't accessible without doing this
// i am dumb, i had to do `import chalk from 'chalk'`

function throws(
	konaerror: KonaError,
	filename: string,
	info: { line: number; column: number; hint?: string; exit?: true | false }
) {
	const INDENTATION = 4;
	// console.log(chalk.bold.redBright(konaerror.errorType) + ': ' + chalk.whiteBright(konaerror.message));
	// console.log('    ' + chalk.bold.whiteBright(info.code.trim()));
	// console.log(chalk.bold.cyanBright('\n    at: ' + filename + ' ' + info.line + ':' + info.column + '\n'));

	console.log(`\n${chalk.redBright('---------------ERROR!---------------')} ${chalk.italic.grey(filename)}	
  ${chalk.bold.redBright(konaerror.errorType)}: ${chalk.bold.whiteBright(
		konaerror.message.replace(/\n\r|\n|\r/, '\n' + ' '.repeat(konaerror.errorType.length + INDENTATION))
	)}
  ${info.hint
		? chalk.bold.underline.cyanBright('Hint') +
			chalk.cyan(': ' + info.hint.replace(/\n\r|\n|\r/, '\n' + ' '.repeat('Hint'.length + INDENTATION)))
		: ''}
${chalk.redBright('------------------------------------')}
\n`);

	if (info.exit) {
		process.exit(1);
	}
	throw new ParseError();
}

export { throws };
