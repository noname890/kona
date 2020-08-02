class KonaError {
	public errorType: string = 'KonaError';

	constructor(public message: string, public hint?: string) {}
}

export { KonaError };
