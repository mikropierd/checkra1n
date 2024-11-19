import type { FilterPattern } from "@rollup/pluginutils";
import type { TranspileOptions } from "typescript";
export type Options = {
	include?: FilterPattern;
	exclude?: FilterPattern;
	enforce?: "pre" | "post" | undefined;
	ignoreErrors?: boolean;
} & ({transformer?: "oxc" | "swc"} | {
	transformer: "typescript";
	transformOptions?: TranspileOptions;
});
type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
export type OptionsResolved = Overwrite<Required<Options>, Pick<Options, "enforce">>;
export declare function resolveOptions(options: Options): OptionsResolved;
export {};
