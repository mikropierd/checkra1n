"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_compat_utils_1 = require("eslint-compat-utils");
exports.default = (0, utils_1.createRule)("no-template-literals", {
    meta: {
        docs: {
            description: "disallow template literals",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "The template literals are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = (0, eslint_compat_utils_1.getSourceCode)(context);
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            JSONTemplateLiteral(node) {
                context.report({
                    loc: node.loc,
                    messageId: "unexpected",
                    fix(fixer) {
                        const s = node.quasis[0].value.cooked;
                        return fixer.replaceTextRange(node.range, JSON.stringify(s));
                    },
                });
            },
        };
    },
});
