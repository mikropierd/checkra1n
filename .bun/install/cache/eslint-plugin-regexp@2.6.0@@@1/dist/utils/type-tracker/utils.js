"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isParenthesized = exports.getPropertyName = exports.findVariable = void 0;
const astUtils = __importStar(require("../ast-utils"));
const eslintUtils = __importStar(require("@eslint-community/eslint-utils"));
function findVariable(context, node) {
    return astUtils.findVariable(context, node);
}
exports.findVariable = findVariable;
function getPropertyName(context, node) {
    return eslintUtils.getPropertyName(node, astUtils.getScope(context, node));
}
exports.getPropertyName = getPropertyName;
function isParenthesized(context, node) {
    return eslintUtils.isParenthesized(node, context.sourceCode);
}
exports.isParenthesized = isParenthesized;
