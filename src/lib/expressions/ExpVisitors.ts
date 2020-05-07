/* eslint no-undef: */
/* eslint no-unused-vars: */

import { Binary } from './types/Binary';
import { Unary } from './types/Unary';
import { Literal } from './types/Literal';
import { Group } from './types/Group';

interface ExpVisitors {
	visitBinary(visitor: Binary): any;
	visitUnary(unary: Unary): any;
	visitLiteral(literal: Literal): any;
	visitGrouping(group: Group): any;
}

export { ExpVisitors };
