"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClosingBraceToken = exports.isOpeningBraceToken = exports.isClosingBracketToken = exports.isOpeningBracketToken = exports.isComma = exports.isColon = exports.isHyphen = exports.isQuestion = exports.isTokenOnSameLine = exports.isCommentToken = void 0;
function isCommentToken(token) {
    return Boolean(token && (token.type === "Block" || token.type === "Line"));
}
exports.isCommentToken = isCommentToken;
function isTokenOnSameLine(left, right) {
    return left.loc.end.line === right.loc.start.line;
}
exports.isTokenOnSameLine = isTokenOnSameLine;
function isQuestion(token) {
    return token != null && token.type === "Punctuator" && token.value === "?";
}
exports.isQuestion = isQuestion;
function isHyphen(token) {
    return token != null && token.type === "Punctuator" && token.value === "-";
}
exports.isHyphen = isHyphen;
function isColon(token) {
    return token != null && token.type === "Punctuator" && token.value === ":";
}
exports.isColon = isColon;
function isComma(token) {
    return token != null && token.type === "Punctuator" && token.value === ",";
}
exports.isComma = isComma;
function isOpeningBracketToken(token) {
    return token != null && token.value === "[" && token.type === "Punctuator";
}
exports.isOpeningBracketToken = isOpeningBracketToken;
function isClosingBracketToken(token) {
    return token != null && token.value === "]" && token.type === "Punctuator";
}
exports.isClosingBracketToken = isClosingBracketToken;
function isOpeningBraceToken(token) {
    return token != null && token.value === "{" && token.type === "Punctuator";
}
exports.isOpeningBraceToken = isOpeningBraceToken;
function isClosingBraceToken(token) {
    return token != null && token.value === "}" && token.type === "Punctuator";
}
exports.isClosingBraceToken = isClosingBraceToken;
