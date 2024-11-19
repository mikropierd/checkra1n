import type { TranspileOptions } from "typescript";
export interface TransformResult {
	sourceText: string;
	errors: Array<string>;
}
export declare function oxcTransform(id: string, code: string): TransformResult;
export declare function swcTransform(id: string, code: string): Promise<TransformResult>;
export declare function tsTransform(id: string, code: string, transformOptions?: TranspileOptions): Promise<TransformResult>;
