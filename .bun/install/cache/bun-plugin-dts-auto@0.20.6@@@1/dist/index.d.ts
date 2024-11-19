import type { BunPlugin } from "bun";
import type { DtsOptions } from "./types";
export declare function generate(options?: DtsOptions): Promise<void>;
export declare function dts(options?: DtsOptions): BunPlugin;
export * from "./types";
export default dts;
