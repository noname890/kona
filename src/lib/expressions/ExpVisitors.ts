/* eslint no-undef: */
/* eslint no-unused-vars: */

import { Binary } from './types/Binary';
import { Unary } from './types/Unary';
import { Literal } from './types/Literal';
import { Group } from './types/Group';
import { Call } from './types/Call';

interface ExpVisitors {
	visitBinary(visitor: Binary): any;
	visitUnary(unary: Unary): any;
	visitLiteral(literal: Literal): any;
	visitGrouping(group: Group): any;
	visitCall(call: Call): any;
}

export { ExpVisitors };
