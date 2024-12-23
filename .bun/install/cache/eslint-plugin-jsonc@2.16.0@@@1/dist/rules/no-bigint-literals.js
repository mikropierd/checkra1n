"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_compat_utils_1 = require("eslint-compat-utils");
exports.default = (0, utils_1.createRule)("no-bigint-literals", {
    meta: {
        docs: {
            description: "disallow BigInt literals",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {
            unexpected: "BigInt literals are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = (0, eslint_compat_utils_1.getSourceCode)(context);
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            JSONLiteral(node) {
                if (node.bigint != null) {
                    context.report({
                        loc: node.loc,
                        messageId: "unexpected",
                    });
                }
            },
        };
    },
});
