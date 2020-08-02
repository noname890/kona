import { Interpreter } from './interpreter';

export default interface KonaCallable {
    arity(): number;
    callFn(interpreter: Interpreter, fnArguments: any[]): any;
    toString(): string
};
