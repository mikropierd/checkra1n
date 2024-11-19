"use strict";
const require_transformer = require('./transformer-wFl7-Qrk.cjs');
const { mkdir, readFile, writeFile } = __toESM(require("node:fs/promises"));
const { default: path } = __toESM(require("node:path"));
const { createFilter } = __toESM(require("@rollup/pluginutils"));
const { parseAsync } = __toESM(require("oxc-parser"));
const { createUnplugin } = __toESM(require("unplugin"));

//#region src/core/options.ts
function resolveOptions(options) {
	return {
		include: options.include || [/\.[cm]?ts$/],
		exclude: options.exclude || [/node_modules/],
		enforce: "enforce" in options ? options.enforce : "pre",
		transformer: options.transformer || "oxc",
		ignoreErrors: options.ignoreErrors || false
	};
}

//#endregion
//#region src/index.ts
const IsolatedDecl = createUnplugin((rawOptions = {}, meta) => {
	const options = resolveOptions(rawOptions);
	const filter = createFilter(options.include, options.exclude);
	const outputFiles = {};
	function stripExt(filename) {
		return filename.replace(/\.(.?)[jt]s$/, "");
	}
	function addOutput(filename, source) {
		outputFiles[stripExt(filename)] = source;
	}
	const rollup = { renderStart(outputOptions, inputOptions) {
		let outBase = "";
		let input = inputOptions.input;
		input = typeof input === "string" ? [input] : input;
		if (Array.isArray(input)) {
			outBase = lowestCommonAncestor(...input);
		}
		if (typeof outputOptions.entryFileNames !== "string") {
			return this.error("entryFileNames must be a string");
		}
		const entryFileNames = outputOptions.entryFileNames.replace(/\.(.)?[jt]s$/, (_, s) => `.d.${s || ""}ts`);
		for (const [filename, source] of Object.entries(outputFiles)) {
			this.emitFile({
				type: "asset",
				fileName: entryFileNames.replace("[name]", path.relative(outBase, filename)),
				source
			});
		}
	} };
	return {
		name: "unplugin-isolated-decl",
		transformInclude(id) {
			return filter(id);
		},
		transform(code, id) {
			return transform.call(this, code, id);
		},
		esbuild: { setup(build) {
			build.onEnd(async (result) => {
				const esbuildOptions = build.initialOptions;
				const entries = esbuildOptions.entryPoints;
				if (!(entries && Array.isArray(entries) && entries.every((entry) => typeof entry === "string"))) throw new Error("unsupported entryPoints, must be an string[]");
				const outBase = lowestCommonAncestor(...entries);
				const jsExt = esbuildOptions.outExtension?.[".js"];
				let outExt;
				switch (jsExt) {
					case ".cjs":
						outExt = "cts";
						break;
					case ".mjs":
						outExt = "mts";
						break;
					default:
						outExt = "ts";
						break;
				}
				const write = build.initialOptions.write ?? true;
				if (write) {
					if (!build.initialOptions.outdir) throw new Error("outdir is required when write is true");
				} else {
					result.outputFiles ||= [];
				}
				const textEncoder = new TextEncoder();
				for (const [filename, source] of Object.entries(outputFiles)) {
					const outDir = build.initialOptions.outdir;
					const outFile = `${path.relative(outBase, filename)}.d.${outExt}`;
					const filePath = outDir ? path.resolve(outDir, outFile) : outFile;
					if (write) {
						await mkdir(path.dirname(filePath), { recursive: true });
						await writeFile(filePath, source);
					} else {
						result.outputFiles.push({
							path: filePath,
							contents: textEncoder.encode(source),
							hash: "",
							text: source
						});
					}
				}
			});
		} },
		rollup,
		rolldown: rollup,
		vite: {
			apply: "build",
			enforce: "pre",
			...rollup
		}
	};
	async function transform(code, id) {
		let result;
		switch (options.transformer) {
			case "oxc":
				result = require_transformer.oxcTransform(id, code);
				break;
			case "swc":
				result = await require_transformer.swcTransform(id, code);
				break;
			case "typescript": result = await require_transformer.tsTransform(id, code, options.transformOptions);
		}
		const { sourceText, errors } = result;
		if (errors.length) {
			if (options.ignoreErrors) {
				this.warn(errors[0]);
			} else {
				this.error(errors[0]);
				return;
			}
		}
		addOutput(id, sourceText);
		let program;
		try {
			program = JSON.parse((await parseAsync(code, { sourceFilename: id })).program);
		} catch {
			return;
		}
		const typeImports = program.body.filter((node) => {
			if (node.type !== "ImportDeclaration") return false;
			if (node.importKind === "type") return true;
			return (node.specifiers || []).every((spec) => spec.type === "ImportSpecifier" && spec.importKind === "type");
		});
		const resolve = async (id$1, importer) => {
			if (meta.framework === "esbuild") {
				return (await meta.build.resolve(id$1, {
					importer,
					resolveDir: path.dirname(importer),
					kind: "import-statement"
				})).path;
			}
			return (await this.resolve(id$1, importer))?.id;
		};
		for (const i of typeImports) {
			const resolved = await resolve(i.source.value, id);
			if (resolved && filter(resolved) && !outputFiles[stripExt(resolved)]) {
				let source;
				try {
					source = await readFile(resolved, "utf8");
				} catch {
					continue;
				}
				await transform.call(this, source, resolved);
			}
		}
	}
});
function lowestCommonAncestor(...filepaths) {
	if (filepaths.length === 0) return "";
	if (filepaths.length === 1) return path.dirname(filepaths[0]);
	filepaths = filepaths.map((p) => p.replaceAll("\\", "/"));
	const [first, ...rest] = filepaths;
	let ancestor = first.split("/");
	for (const filepath of rest) {
		const directories = filepath.split("/", ancestor.length);
		let index = 0;
		for (const directory of directories) {
			if (directory === ancestor[index]) {
				index += 1;
			} else {
				ancestor = ancestor.slice(0, index);
				break;
			}
		}
		ancestor = ancestor.slice(0, index);
	}
	return ancestor.length <= 1 && ancestor[0] === "" ? `/${ancestor[0]}` : ancestor.join("/");
}

//#endregion
Object.defineProperty(exports, 'IsolatedDecl', {
  enumerable: true,
  get: function () {
    return IsolatedDecl;
  }
});Object.defineProperty(exports, 'lowestCommonAncestor', {
  enumerable: true,
  get: function () {
    return lowestCommonAncestor;
  }
});