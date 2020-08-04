import { SyntaxError } from '../internal/error/errorTypes/SyntaxError';

export default function format(text: string, ...stringsToInterpolate: string[]): string {
	let result: string = text;

	if (text === undefined) {
		return 'nil';
	}

	while (result.includes('{}')) {
		if (!stringsToInterpolate.hasOwnProperty(0)) {
			throw new SyntaxError(
				'Not enough strings to interpolate.',
				"The number of strings should be at least\nthe same number of interpolators ('{}')."
			);
		}
		result = result.replace('{}', stringsToInterpolate[0] === undefined ? 'nil' : stringsToInterpolate[0]);
		stringsToInterpolate.shift();
	}

	return result;
}
