"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const compat_1 = require("../utils/compat");
exports.default = (0, utils_1.createRule)("no-empty-mapping-value", {
    meta: {
        docs: {
            description: "disallow empty mapping values",
            categories: ["recommended", "standard"],
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {
            unexpectedEmpty: "Empty mapping values are forbidden.",
        },
        type: "suggestion",
    },
    create(context) {
        const sourceCode = (0, compat_1.getSourceCode)(context);
        if (!sourceCode.parserServices.isYAML) {
            return {};
        }
        function isEmptyNode(node) {
            if (!node) {
                return true;
            }
            if (node.type === "YAMLWithMeta") {
                return isEmptyNode(node.value);
            }
            return false;
        }
        return {
            YAMLPair(node) {
                if (isEmptyNode(node.value)) {
                    context.report({
                        node,
                        messageId: "unexpectedEmpty",
                    });
                }
            },
        };
    },
});