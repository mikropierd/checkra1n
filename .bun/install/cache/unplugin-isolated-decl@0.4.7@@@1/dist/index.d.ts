import { type UnpluginInstance } from "unplugin";
import { type Options } from "./core/options";
export type { Options };
export declare const IsolatedDecl: UnpluginInstance<Options | undefined, false>;
export declare function lowestCommonAncestor(...filepaths: string[]): string;
