import { Interpreter } from './interpreter';
import { Token } from '../lexer/Token';

export default interface KonaCallable {
    arity(): number;
    callFn(interpreter: Interpreter, fnArguments: any[], fnToken: Token): any;
    toString(): string
};
