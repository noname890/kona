/**
 * utils file for the tools
 */

import chalk from 'chalk';

class Log {
	public info(msg?: any) {
		console.log(`${chalk.bold.whiteBright('[*]')} ${chalk.bold.cyanBright('info: ')} ${chalk.cyan(msg)}`);
	}

	public success(msg?: any) {
		console.log(`${chalk.bold.whiteBright('[*]')} ${chalk.bold.greenBright('success: ')} ${chalk.green(msg)}`);
	}

	public warning(msg?: any) {
		console.log(`${chalk.bold.whiteBright('[-]')} ${chalk.bold.yellowBright('warning: ')} ${chalk.yellow(msg)}`);
	}

	public error(msg?: any) {
		console.log(`${chalk.bold.whiteBright('[!]')} ${chalk.bold.redBright('error: ')} ${chalk.red(msg)}`);
	}
}

const log = new Log();

export default log;
