"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("no-tab-indent", {
    meta: {
        docs: {
            description: "disallow tabs for indentation.",
            categories: ["recommended", "standard"],
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {
            disallow: "Unexpected tabs.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices.isYAML) {
            return {};
        }
        return {
            Program() {
                const lines = sourceCode.lines;
                for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                    const line = lines[lineIndex];
                    const res = /^([^\S\t]*(?:-[^\S\t]+)?)\t+/u.exec(line);
                    if (res) {
                        context.report({
                            loc: {
                                start: {
                                    line: lineIndex + 1,
                                    column: res[1].length,
                                },
                                end: {
                                    line: lineIndex + 1,
                                    column: res[0].length,
                                },
                            },
                            messageId: "disallow",
                        });
                    }
                }
            },
        };
    },
});
