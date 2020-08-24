import Interpreter from './interpreter';
import Token from '../lexer/Token';

/**
 * Interface that describes a function
 */
export default interface KonaCallable {
	arity(): number;
	callFn(interpreter: Interpreter, fnArguments: any[], fnToken: Token): any;
	toString(): string;
};
