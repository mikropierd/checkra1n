"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
const CP_BACK_SLASH = "\\".codePointAt(0);
const CP_BACKTICK = "`".codePointAt(0);
const CP_CR = "\r".codePointAt(0);
const CP_LF = "\n".codePointAt(0);
const CP_OPENING_BRACE = "{".codePointAt(0);
const CP_a = "a".codePointAt(0);
const CP_A = "A".codePointAt(0);
const CP_n = "n".codePointAt(0);
const CP_r = "r".codePointAt(0);
const CP_t = "t".codePointAt(0);
const CP_b = "b".codePointAt(0);
const CP_v = "v".codePointAt(0);
const CP_f = "f".codePointAt(0);
const CP_u = "u".codePointAt(0);
const CP_x = "x".codePointAt(0);
const CP_0 = "0".codePointAt(0);
const CP_7 = "7".codePointAt(0);
const CP_8 = "8".codePointAt(0);
const CP_9 = "9".codePointAt(0);
class Tokenizer {
    constructor(source, options) {
        var _a;
        this.source = source;
        this.pos = options.start;
        this.end = (_a = options.end) !== null && _a !== void 0 ? _a : null;
        this.ecmaVersion = options.ecmaVersion;
    }
    *parseTokens(quote) {
        var _a;
        const inTemplate = quote === CP_BACKTICK;
        const endIndex = (_a = this.end) !== null && _a !== void 0 ? _a : this.source.length;
        while (this.pos < endIndex) {
            const start = this.pos;
            const cp = this.source.codePointAt(start);
            if (cp == null) {
                throw new Error("Unterminated string constant");
            }
            this.pos = inc(start, cp);
            if (cp === quote)
                break;
            if (cp === CP_BACK_SLASH) {
                const { value, kind } = this.readEscape(inTemplate);
                yield {
                    type: "EscapeToken",
                    kind,
                    value,
                    range: [start, this.pos],
                };
            }
            else if (cp === CP_CR || cp === CP_LF) {
                if (inTemplate) {
                    if (cp === CP_CR &&
                        this.source.codePointAt(this.pos) === CP_LF) {
                        this.pos++;
                    }
                    yield {
                        type: "CharacterToken",
                        value: "\n",
                        range: [start, this.pos],
                    };
                }
                else {
                    throw new Error("Unterminated string constant");
                }
            }
            else {
                if (this.ecmaVersion >= 2019 &&
                    (cp === 0x2028 || cp === 0x2029) &&
                    !inTemplate) {
                    throw new Error("Unterminated string constant");
                }
                yield {
                    type: "CharacterToken",
                    value: String.fromCodePoint(cp),
                    range: [start, this.pos],
                };
            }
        }
    }
    readEscape(inTemplate) {
        const cp = this.source.codePointAt(this.pos);
        if (cp == null) {
            throw new Error("Invalid or unexpected token");
        }
        this.pos = inc(this.pos, cp);
        switch (cp) {
            case CP_n:
                return { value: "\n", kind: "special" };
            case CP_r:
                return { value: "\r", kind: "special" };
            case CP_t:
                return { value: "\t", kind: "special" };
            case CP_b:
                return { value: "\b", kind: "special" };
            case CP_v:
                return { value: "\v", kind: "special" };
            case CP_f:
                return { value: "\f", kind: "special" };
            case CP_CR:
                if (this.source.codePointAt(this.pos) === CP_LF) {
                    this.pos++;
                }
            case CP_LF:
                return { value: "", kind: "eol" };
            case CP_x:
                return {
                    value: String.fromCodePoint(this.readHex(2)),
                    kind: "hex",
                };
            case CP_u:
                return {
                    value: String.fromCodePoint(this.readUnicode()),
                    kind: "unicode",
                };
            default:
                if (CP_0 <= cp && cp <= CP_7) {
                    let octalStr = /^[0-7]+/u.exec(this.source.slice(this.pos - 1, this.pos + 2))[0];
                    let octal = parseInt(octalStr, 8);
                    if (octal > 255) {
                        octalStr = octalStr.slice(0, -1);
                        octal = parseInt(octalStr, 8);
                    }
                    this.pos += octalStr.length - 1;
                    const nextCp = this.source.codePointAt(this.pos);
                    if ((octalStr !== "0" ||
                        nextCp === CP_8 ||
                        nextCp === CP_9) &&
                        inTemplate) {
                        throw new Error("Octal literal in template string");
                    }
                    return {
                        value: String.fromCodePoint(octal),
                        kind: "octal",
                    };
                }
                return {
                    value: String.fromCodePoint(cp),
                    kind: "char",
                };
        }
    }
    readUnicode() {
        const cp = this.source.codePointAt(this.pos);
        if (cp === CP_OPENING_BRACE) {
            if (this.ecmaVersion < 2015) {
                throw new Error(`Unexpected character '${String.fromCodePoint(cp)}'`);
            }
            this.pos++;
            const endIndex = this.source.indexOf("}", this.pos);
            if (endIndex < 0) {
                throw new Error("Invalid Unicode escape sequence");
            }
            const code = this.readHex(endIndex - this.pos);
            this.pos++;
            if (code > 0x10ffff) {
                throw new Error("Code point out of bounds");
            }
            return code;
        }
        return this.readHex(4);
    }
    readHex(length) {
        let total = 0;
        for (let i = 0; i < length; i++, this.pos++) {
            const cp = this.source.codePointAt(this.pos);
            if (cp == null) {
                throw new Error(`Invalid hexadecimal escape sequence`);
            }
            let val;
            if (CP_a <= cp) {
                val = cp - CP_a + 10;
            }
            else if (CP_A <= cp) {
                val = cp - CP_A + 10;
            }
            else if (CP_0 <= cp && cp <= CP_9) {
                val = cp - CP_0;
            }
            else {
                throw new Error(`Invalid hexadecimal escape sequence`);
            }
            if (val >= 16) {
                throw new Error(`Invalid hexadecimal escape sequence`);
            }
            total = total * 16 + val;
        }
        return total;
    }
}
exports.Tokenizer = Tokenizer;
function inc(pos, cp) {
    return pos + (cp >= 0x10000 ? 2 : 1);
}
