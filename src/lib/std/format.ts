export default function format(text: string, ...stringsToInterpolate: string[]): string {
	let result: string = text;

	while (result.includes('{}')) {
		if (!stringsToInterpolate[0]) {
			console.log('add error bruh');
		}
		result = result.replace('{}', stringsToInterpolate[0]);
		stringsToInterpolate.shift();
	}

	return result;
}
