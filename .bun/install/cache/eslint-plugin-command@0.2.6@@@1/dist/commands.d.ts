import { Command } from './types.js';
export { defineCommand } from './types.js';
import '@typescript-eslint/utils';

declare const hoistRegExp: Command;

declare const inlineArrow: Command;

declare const keepSorted: Command;

declare const keepUnique: Command;

declare const noShorthand: Command;

declare const noType: Command;

declare const regex101: Command;

declare const toArrow: Command;

declare const toDestructuring: Command;

declare const toDynamicImport: Command;

declare const toForEach: Command;

declare const toForOf: Command;

declare const toFunction: Command;

declare const toPromiseAll: Command;

declare const toStringLiteral: Command;

declare const toTemplateLiteral: Command;

declare const toTernary: Command;

declare const builtinCommands: Command[];

export { Command, builtinCommands, hoistRegExp, inlineArrow, keepSorted, keepUnique, noShorthand, noType, regex101, toArrow, toDestructuring, toDynamicImport, toForEach, toForOf, toFunction, toPromiseAll, toStringLiteral, toTemplateLiteral, toTernary };