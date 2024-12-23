"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_compat_utils_1 = require("eslint-compat-utils");
exports.default = (0, utils_1.createRule)("no-number-props", {
    meta: {
        docs: {
            description: "disallow number property keys",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "The number property keys are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = (0, eslint_compat_utils_1.getSourceCode)(context);
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            JSONProperty(node) {
                if (node.key.type !== "JSONLiteral") {
                    return;
                }
                if (typeof node.key.value === "number") {
                    const raw = node.key.raw;
                    context.report({
                        loc: node.key.loc,
                        messageId: "unexpected",
                        fix(fixer) {
                            return fixer.replaceTextRange(node.key.range, `"${raw}"`);
                        },
                    });
                }
            },
        };
    },
});
