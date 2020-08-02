export default function pluralize(text: string, count: number): string {
	const split = text.split('/');
	if (split.length === 1) {
		throw new Error('Expected /, found none.');
	}
	return count !== 1 ? split.join('') : split[0];
}
