import { KonaError } from './errorTypes/InternalKonaError';
import * as chalkImport from 'chalk';

// TypeScript translates the chalk import to __importStar(require('chalk'))
// and not to require('chalk'), that returns a module object with a property
// named default
// so chalk methods aren't accessible without doing this

const chalk = chalkImport.default;

function throws(
	konaerror: KonaError,
	filename: string,
	info: { line: number; column: number; code: string; exit?: true | false }
) {
	console.log(chalk.bold.redBright(konaerror.errorType) + ': ' + chalk.whiteBright(konaerror.message));
	console.log('    ' + chalk.bold.whiteBright(info.code.trim()));
	console.log(chalk.bold.cyanBright('\n    at: ' + filename + ' ' + info.line + ':' + info.column + '\n'));
	if (info.exit) {
		process.exit(1);
	}
}

export { throws };
