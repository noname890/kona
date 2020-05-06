import { KonaError } from './InternalKonaError';
import * as chalk from 'chalk';

function throws(
	konaerror: KonaError,
	filename: string,
	info: { line: number; column: number; code: string; exit?: true | false }
) {
	console.log(chalk.redBright(konaerror.errorType) + ': ' + chalk.whiteBright(konaerror.message));
	console.log('    ' + info.code.trim());
	console.log(chalk.bold.cyanBright('\n    at: ' + filename + ' ' + info.line + ':' + info.column));
	if (info.exit) {
		process.exit(1);
	}
}

export { throws };
