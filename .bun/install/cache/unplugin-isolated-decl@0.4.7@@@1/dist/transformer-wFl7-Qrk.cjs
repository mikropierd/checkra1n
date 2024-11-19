"use strict";
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
const { isolatedDeclaration } = __toESM(require("oxc-transform"));

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
Object.defineProperty(exports, '__toESM', {
  enumerable: true,
  get: function () {
    return __toESM;
  }
});Object.defineProperty(exports, 'oxcTransform', {
  enumerable: true,
  get: function () {
    return oxcTransform;
  }
});Object.defineProperty(exports, 'swcTransform', {
  enumerable: true,
  get: function () {
    return swcTransform;
  }
});Object.defineProperty(exports, 'tsTransform', {
  enumerable: true,
  get: function () {
    return tsTransform;
  }
});