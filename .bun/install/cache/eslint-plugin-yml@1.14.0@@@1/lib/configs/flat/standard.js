"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = __importDefault(require("./base"));
exports.default = [
    ...base_1.default,
    {
        rules: {
            "yml/block-mapping-question-indicator-newline": "error",
            "yml/block-mapping": "error",
            "yml/block-sequence-hyphen-indicator-newline": "error",
            "yml/block-sequence": "error",
            "yml/flow-mapping-curly-newline": "error",
            "yml/flow-mapping-curly-spacing": "error",
            "yml/flow-sequence-bracket-newline": "error",
            "yml/flow-sequence-bracket-spacing": "error",
            "yml/indent": "error",
            "yml/key-spacing": "error",
            "yml/no-empty-document": "error",
            "yml/no-empty-key": "error",
            "yml/no-empty-mapping-value": "error",
            "yml/no-empty-sequence-entry": "error",
            "yml/no-irregular-whitespace": "error",
            "yml/no-tab-indent": "error",
            "yml/plain-scalar": "error",
            "yml/quotes": "error",
            "yml/spaced-comment": "error",
            "yml/vue-custom-block/no-parsing-error": "error",
        },
    },
];
