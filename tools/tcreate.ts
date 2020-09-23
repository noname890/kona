/**
 * tool used to create test files for kona
 * does not overwrite existing ones
 */

import * as fs from 'fs';
import log from './log';

const LIB_DIR = './src/lib/';
const fileList = getAllFiles(LIB_DIR);

function createFile(path: string, data: any) {
	const PATH = path.substring(0, path.lastIndexOf('/'));
	log.info(`Creating directory '${PATH}'`);
	fs.mkdirSync(PATH, { recursive: true });
	log.success('succesfully created path.');
	fs.writeFileSync(path, data);
}

function getAllFiles(path: string = '') {
	const result: string[] = [];
	let files;

	try {
		files = fs.readdirSync(path);
	} catch (e) {
		if (e.code === 'ENOENT') {
			log.error('Could not find the src directory. Are you sure you are running in the root of the project?');
			process.exit(1);
		}
		throw e;
	}

	for (const i in files) {
		if (fs.lstatSync(path + files[i]).isDirectory()) {
			log.info(`found directory '${path}${files[i]}/', recursing`);
			result.push(...getAllFiles(`${path}${files[i]}/`));
			continue;
		}
		log.info(`found file '${path}${files[i]}'`);
		result.push(`${path}${files[i]}`);
	}

	return result;
}

for (const i in fileList) {
	const testFileName = fileList[i].replace('src/lib', 'test').replace('.ts', '.test.ts');

	if (fs.existsSync(testFileName)) {
		log.warning(`file '${testFileName}' already exists, skipping`);
		continue;
	}
	log.info(`creating file '${testFileName}'`);
	createFile(
		testFileName,
		`/* eslint-env jest */

describe('${fileList[i].substring(0, fileList[i].lastIndexOf('.'))}', () => {})
`
	);
}
