import { isolatedDeclaration } from "oxc-transform";

//#region src/core/transformer.ts
function oxcTransform(id, code) {
	return isolatedDeclaration(id, code);
}
async function swcTransform(id, code) {
	let swc;
	try {
		swc = await import("@swc/core");
	} catch {
		return {
			sourceText: "",
			errors: ["SWC is required for transforming TypeScript, please install `@swc/core`.",]
		};
	}
	try {
		const result = await swc.transform(code, {
			filename: id,
			jsc: {
				parser: {
					syntax: "typescript",
					tsx: false
				},
				experimental: { emitIsolatedDts: true }
			}
		});
		const output = JSON.parse(result.output);
		return {
			sourceText: output.__swc_isolated_declarations__,
			errors: []
		};
	} catch (error) {
		return {
			sourceText: "",
			errors: [error.toString()]
		};
	}
}
async function tsTransform(id, code, transformOptions) {
	let ts;
	try {
		ts = await import("typescript");
	} catch {
		return {
			sourceText: "",
			errors: ["TypeScript is required for transforming TypeScript, please install `typescript`.",]
		};
	}
	if (!ts.transpileDeclaration) {
		return {
			sourceText: "",
			errors: ["TypeScript version is too low, please upgrade to TypeScript 5.5.2+.",]
		};
	}
	const { outputText, diagnostics } = ts.transpileDeclaration(code, {
		fileName: id,
		reportDiagnostics: true,
		...transformOptions
	});
	const errors = diagnostics?.length ? [ts.formatDiagnostics(diagnostics, {
		getCanonicalFileName: (fileName) => ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
		getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
		getNewLine: () => ts.sys.newLine
	}),] : [];
	return {
		sourceText: outputText,
		errors
	};
}

//#endregion
export { oxcTransform, swcTransform, tsTransform };