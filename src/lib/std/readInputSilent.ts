const readline = require('readline-sync');
const unescapeJS = require('unescape-js');

export default function readInput(prompt: string = '> ') {
	return readline.question(unescapeJS(prompt), { hideEchoBack: true, mask: '' });
}
