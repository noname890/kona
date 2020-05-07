import { ExpVisitors } from './ExpVisitors';

abstract class Expression {
	abstract accept(visitor: ExpVisitors): any;
}

export { Expression };
