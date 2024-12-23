var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/.pnpm/picocolors@1.1.0/node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/.pnpm/picocolors@1.1.0/node_modules/picocolors/picocolors.js"(exports2, module2) {
    var argv = process.argv || [];
    var env2 = process.env;
    var isColorSupported = !("NO_COLOR" in env2 || argv.includes("--no-color")) && ("FORCE_COLOR" in env2 || argv.includes("--color") || process.platform === "win32" || require != null && require("tty").isatty(1) && env2.TERM !== "dumb" || "CI" in env2);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input;
      let index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let result = "";
      let cursor = 0;
      do {
        result += string.substring(cursor, index) + replace;
        cursor = index + close.length;
        index = string.indexOf(close, cursor);
      } while (~index);
      return result + string.substring(cursor);
    };
    var createColors = (enabled = isColorSupported) => {
      let init = enabled ? formatter : () => String;
      return {
        isColorSupported: enabled,
        reset: init("\x1B[0m", "\x1B[0m"),
        bold: init("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
        dim: init("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
        italic: init("\x1B[3m", "\x1B[23m"),
        underline: init("\x1B[4m", "\x1B[24m"),
        inverse: init("\x1B[7m", "\x1B[27m"),
        hidden: init("\x1B[8m", "\x1B[28m"),
        strikethrough: init("\x1B[9m", "\x1B[29m"),
        black: init("\x1B[30m", "\x1B[39m"),
        red: init("\x1B[31m", "\x1B[39m"),
        green: init("\x1B[32m", "\x1B[39m"),
        yellow: init("\x1B[33m", "\x1B[39m"),
        blue: init("\x1B[34m", "\x1B[39m"),
        magenta: init("\x1B[35m", "\x1B[39m"),
        cyan: init("\x1B[36m", "\x1B[39m"),
        white: init("\x1B[37m", "\x1B[39m"),
        gray: init("\x1B[90m", "\x1B[39m"),
        bgBlack: init("\x1B[40m", "\x1B[49m"),
        bgRed: init("\x1B[41m", "\x1B[49m"),
        bgGreen: init("\x1B[42m", "\x1B[49m"),
        bgYellow: init("\x1B[43m", "\x1B[49m"),
        bgBlue: init("\x1B[44m", "\x1B[49m"),
        bgMagenta: init("\x1B[45m", "\x1B[49m"),
        bgCyan: init("\x1B[46m", "\x1B[49m"),
        bgWhite: init("\x1B[47m", "\x1B[49m"),
        blackBright: init("\x1B[90m", "\x1B[39m"),
        redBright: init("\x1B[91m", "\x1B[39m"),
        greenBright: init("\x1B[92m", "\x1B[39m"),
        yellowBright: init("\x1B[93m", "\x1B[39m"),
        blueBright: init("\x1B[94m", "\x1B[39m"),
        magentaBright: init("\x1B[95m", "\x1B[39m"),
        cyanBright: init("\x1B[96m", "\x1B[39m"),
        whiteBright: init("\x1B[97m", "\x1B[39m"),
        bgBlackBright: init("\x1B[100m", "\x1B[49m"),
        bgRedBright: init("\x1B[101m", "\x1B[49m"),
        bgGreenBright: init("\x1B[102m", "\x1B[49m"),
        bgYellowBright: init("\x1B[103m", "\x1B[49m"),
        bgBlueBright: init("\x1B[104m", "\x1B[49m"),
        bgMagentaBright: init("\x1B[105m", "\x1B[49m"),
        bgCyanBright: init("\x1B[106m", "\x1B[49m"),
        bgWhiteBright: init("\x1B[107m", "\x1B[49m")
      };
    };
    module2.exports = createColors();
    module2.exports.createColors = createColors;
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  NpmScript: () => NpmScript,
  ProgressEvent: () => ProgressEvent,
  bumpConfigDefaults: () => bumpConfigDefaults,
  default: () => src_default,
  defineConfig: () => defineConfig,
  loadBumpConfig: () => loadBumpConfig,
  versionBump: () => versionBump,
  versionBumpInfo: () => versionBumpInfo
});
module.exports = __toCommonJS(src_exports);

// src/version-bump.ts
var import_node_process5 = __toESM(require("process"));
var ezSpawn4 = __toESM(require("@jsdevtools/ez-spawn"));

// node_modules/.pnpm/chalk@5.3.0/node_modules/chalk/source/vendor/ansi-styles/index.js
var ANSI_BACKGROUND_OFFSET = 10;
var wrapAnsi16 = (offset = 0) => (code) => `\x1B[${code + offset}m`;
var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
var styles = {
  modifier: {
    reset: [0, 0],
    // 21 isn't widely supported and 22 does the same thing
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    overline: [53, 55],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29]
  },
  color: {
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    // Bright color
    blackBright: [90, 39],
    gray: [90, 39],
    // Alias of `blackBright`
    grey: [90, 39],
    // Alias of `blackBright`
    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39]
  },
  bgColor: {
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    // Bright color
    bgBlackBright: [100, 49],
    bgGray: [100, 49],
    // Alias of `bgBlackBright`
    bgGrey: [100, 49],
    // Alias of `bgBlackBright`
    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49]
  }
};
var modifierNames = Object.keys(styles.modifier);
var foregroundColorNames = Object.keys(styles.color);
var backgroundColorNames = Object.keys(styles.bgColor);
var colorNames = [...foregroundColorNames, ...backgroundColorNames];
function assembleStyles() {
  const codes = /* @__PURE__ */ new Map();
  for (const [groupName, group] of Object.entries(styles)) {
    for (const [styleName, style] of Object.entries(group)) {
      styles[styleName] = {
        open: `\x1B[${style[0]}m`,
        close: `\x1B[${style[1]}m`
      };
      group[styleName] = styles[styleName];
      codes.set(style[0], style[1]);
    }
    Object.defineProperty(styles, groupName, {
      value: group,
      enumerable: false
    });
  }
  Object.defineProperty(styles, "codes", {
    value: codes,
    enumerable: false
  });
  styles.color.close = "\x1B[39m";
  styles.bgColor.close = "\x1B[49m";
  styles.color.ansi = wrapAnsi16();
  styles.color.ansi256 = wrapAnsi256();
  styles.color.ansi16m = wrapAnsi16m();
  styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
  styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
  Object.defineProperties(styles, {
    rgbToAnsi256: {
      value(red, green, blue) {
        if (red === green && green === blue) {
          if (red < 8) {
            return 16;
          }
          if (red > 248) {
            return 231;
          }
          return Math.round((red - 8) / 247 * 24) + 232;
        }
        return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
      },
      enumerable: false
    },
    hexToRgb: {
      value(hex) {
        const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
        if (!matches) {
          return [0, 0, 0];
        }
        let [colorString] = matches;
        if (colorString.length === 3) {
          colorString = [...colorString].map((character) => character + character).join("");
        }
        const integer = Number.parseInt(colorString, 16);
        return [
          /* eslint-disable no-bitwise */
          integer >> 16 & 255,
          integer >> 8 & 255,
          integer & 255
          /* eslint-enable no-bitwise */
        ];
      },
      enumerable: false
    },
    hexToAnsi256: {
      value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
      enumerable: false
    },
    ansi256ToAnsi: {
      value(code) {
        if (code < 8) {
          return 30 + code;
        }
        if (code < 16) {
          return 90 + (code - 8);
        }
        let red;
        let green;
        let blue;
        if (code >= 232) {
          red = ((code - 232) * 10 + 8) / 255;
          green = red;
          blue = red;
        } else {
          code -= 16;
          const remainder = code % 36;
          red = Math.floor(code / 36) / 5;
          green = Math.floor(remainder / 6) / 5;
          blue = remainder % 6 / 5;
        }
        const value = Math.max(red, green, blue) * 2;
        if (value === 0) {
          return 30;
        }
        let result = 30 + (Math.round(blue) << 2 | Math.round(green) << 1 | Math.round(red));
        if (value === 2) {
          result += 60;
        }
        return result;
      },
      enumerable: false
    },
    rgbToAnsi: {
      value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
      enumerable: false
    },
    hexToAnsi: {
      value: (hex) => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
      enumerable: false
    }
  });
  return styles;
}
var ansiStyles = assembleStyles();
var ansi_styles_default = ansiStyles;

// node_modules/.pnpm/chalk@5.3.0/node_modules/chalk/source/vendor/supports-color/index.js
var import_node_process = __toESM(require("process"), 1);
var import_node_os = __toESM(require("os"), 1);
var import_node_tty = __toESM(require("tty"), 1);
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : import_node_process.default.argv) {
  const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
  const position = argv.indexOf(prefix + flag);
  const terminatorPosition = argv.indexOf("--");
  return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
var { env } = import_node_process.default;
var flagForceColor;
if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false") || hasFlag("color=never")) {
  flagForceColor = 0;
} else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
  flagForceColor = 1;
}
function envForceColor() {
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      return 1;
    }
    if (env.FORCE_COLOR === "false") {
      return 0;
    }
    return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
  }
}
function translateLevel(level) {
  if (level === 0) {
    return false;
  }
  return {
    level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3
  };
}
function _supportsColor(haveStream, { streamIsTTY, sniffFlags = true } = {}) {
  const noFlagForceColor = envForceColor();
  if (noFlagForceColor !== void 0) {
    flagForceColor = noFlagForceColor;
  }
  const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;
  if (forceColor === 0) {
    return 0;
  }
  if (sniffFlags) {
    if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
      return 3;
    }
    if (hasFlag("color=256")) {
      return 2;
    }
  }
  if ("TF_BUILD" in env && "AGENT_NAME" in env) {
    return 1;
  }
  if (haveStream && !streamIsTTY && forceColor === void 0) {
    return 0;
  }
  const min = forceColor || 0;
  if (env.TERM === "dumb") {
    return min;
  }
  if (import_node_process.default.platform === "win32") {
    const osRelease = import_node_os.default.release().split(".");
    if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }
    return 1;
  }
  if ("CI" in env) {
    if ("GITHUB_ACTIONS" in env || "GITEA_ACTIONS" in env) {
      return 3;
    }
    if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "BUILDKITE", "DRONE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
      return 1;
    }
    return min;
  }
  if ("TEAMCITY_VERSION" in env) {
    return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  }
  if (env.COLORTERM === "truecolor") {
    return 3;
  }
  if (env.TERM === "xterm-kitty") {
    return 3;
  }
  if ("TERM_PROGRAM" in env) {
    const version = Number.parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
    switch (env.TERM_PROGRAM) {
      case "iTerm.app": {
        return version >= 3 ? 3 : 2;
      }
      case "Apple_Terminal": {
        return 2;
      }
    }
  }
  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }
  if ("COLORTERM" in env) {
    return 1;
  }
  return min;
}
function createSupportsColor(stream, options = {}) {
  const level = _supportsColor(stream, __spreadValues({
    streamIsTTY: stream && stream.isTTY
  }, options));
  return translateLevel(level);
}
var supportsColor = {
  stdout: createSupportsColor({ isTTY: import_node_tty.default.isatty(1) }),
  stderr: createSupportsColor({ isTTY: import_node_tty.default.isatty(2) })
};
var supports_color_default = supportsColor;

// node_modules/.pnpm/chalk@5.3.0/node_modules/chalk/source/utilities.js
function stringReplaceAll(string, substring, replacer) {
  let index = string.indexOf(substring);
  if (index === -1) {
    return string;
  }
  const substringLength = substring.length;
  let endIndex = 0;
  let returnValue = "";
  do {
    returnValue += string.slice(endIndex, index) + substring + replacer;
    endIndex = index + substringLength;
    index = string.indexOf(substring, endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}
function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
  let endIndex = 0;
  let returnValue = "";
  do {
    const gotCR = string[index - 1] === "\r";
    returnValue += string.slice(endIndex, gotCR ? index - 1 : index) + prefix + (gotCR ? "\r\n" : "\n") + postfix;
    endIndex = index + 1;
    index = string.indexOf("\n", endIndex);
  } while (index !== -1);
  returnValue += string.slice(endIndex);
  return returnValue;
}

// node_modules/.pnpm/chalk@5.3.0/node_modules/chalk/source/index.js
var { stdout: stdoutColor, stderr: stderrColor } = supports_color_default;
var GENERATOR = Symbol("GENERATOR");
var STYLER = Symbol("STYLER");
var IS_EMPTY = Symbol("IS_EMPTY");
var levelMapping = [
  "ansi",
  "ansi",
  "ansi256",
  "ansi16m"
];
var styles2 = /* @__PURE__ */ Object.create(null);
var applyOptions = (object, options = {}) => {
  if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
    throw new Error("The `level` option should be an integer from 0 to 3");
  }
  const colorLevel = stdoutColor ? stdoutColor.level : 0;
  object.level = options.level === void 0 ? colorLevel : options.level;
};
var chalkFactory = (options) => {
  const chalk2 = (...strings) => strings.join(" ");
  applyOptions(chalk2, options);
  Object.setPrototypeOf(chalk2, createChalk.prototype);
  return chalk2;
};
function createChalk(options) {
  return chalkFactory(options);
}
Object.setPrototypeOf(createChalk.prototype, Function.prototype);
for (const [styleName, style] of Object.entries(ansi_styles_default)) {
  styles2[styleName] = {
    get() {
      const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
      Object.defineProperty(this, styleName, { value: builder });
      return builder;
    }
  };
}
styles2.visible = {
  get() {
    const builder = createBuilder(this, this[STYLER], true);
    Object.defineProperty(this, "visible", { value: builder });
    return builder;
  }
};
var getModelAnsi = (model, level, type, ...arguments_) => {
  if (model === "rgb") {
    if (level === "ansi16m") {
      return ansi_styles_default[type].ansi16m(...arguments_);
    }
    if (level === "ansi256") {
      return ansi_styles_default[type].ansi256(ansi_styles_default.rgbToAnsi256(...arguments_));
    }
    return ansi_styles_default[type].ansi(ansi_styles_default.rgbToAnsi(...arguments_));
  }
  if (model === "hex") {
    return getModelAnsi("rgb", level, type, ...ansi_styles_default.hexToRgb(...arguments_));
  }
  return ansi_styles_default[type][model](...arguments_);
};
var usedModels = ["rgb", "hex", "ansi256"];
for (const model of usedModels) {
  styles2[model] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "color", ...arguments_), ansi_styles_default.color.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
  const bgModel = "bg" + model[0].toUpperCase() + model.slice(1);
  styles2[bgModel] = {
    get() {
      const { level } = this;
      return function(...arguments_) {
        const styler = createStyler(getModelAnsi(model, levelMapping[level], "bgColor", ...arguments_), ansi_styles_default.bgColor.close, this[STYLER]);
        return createBuilder(this, styler, this[IS_EMPTY]);
      };
    }
  };
}
var proto = Object.defineProperties(() => {
}, __spreadProps(__spreadValues({}, styles2), {
  level: {
    enumerable: true,
    get() {
      return this[GENERATOR].level;
    },
    set(level) {
      this[GENERATOR].level = level;
    }
  }
}));
var createStyler = (open, close, parent) => {
  let openAll;
  let closeAll;
  if (parent === void 0) {
    openAll = open;
    closeAll = close;
  } else {
    openAll = parent.openAll + open;
    closeAll = close + parent.closeAll;
  }
  return {
    open,
    close,
    openAll,
    closeAll,
    parent
  };
};
var createBuilder = (self, _styler, _isEmpty) => {
  const builder = (...arguments_) => applyStyle(builder, arguments_.length === 1 ? "" + arguments_[0] : arguments_.join(" "));
  Object.setPrototypeOf(builder, proto);
  builder[GENERATOR] = self;
  builder[STYLER] = _styler;
  builder[IS_EMPTY] = _isEmpty;
  return builder;
};
var applyStyle = (self, string) => {
  if (self.level <= 0 || !string) {
    return self[IS_EMPTY] ? "" : string;
  }
  let styler = self[STYLER];
  if (styler === void 0) {
    return string;
  }
  const { openAll, closeAll } = styler;
  if (string.includes("\x1B")) {
    while (styler !== void 0) {
      string = stringReplaceAll(string, styler.close, styler.open);
      styler = styler.parent;
    }
  }
  const lfIndex = string.indexOf("\n");
  if (lfIndex !== -1) {
    string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
  }
  return openAll + string + closeAll;
};
Object.defineProperties(createChalk.prototype, styles2);
var chalk = createChalk();
var chalkStderr = createChalk({ level: stderrColor ? stderrColor.level : 0 });
var source_default = chalk;

// node_modules/.pnpm/is-unicode-supported@1.3.0/node_modules/is-unicode-supported/index.js
var import_node_process2 = __toESM(require("process"), 1);
function isUnicodeSupported() {
  if (import_node_process2.default.platform !== "win32") {
    return import_node_process2.default.env.TERM !== "linux";
  }
  return Boolean(import_node_process2.default.env.CI) || Boolean(import_node_process2.default.env.WT_SESSION) || Boolean(import_node_process2.default.env.TERMINUS_SUBLIME) || import_node_process2.default.env.ConEmuTask === "{cmd::Cmder}" || import_node_process2.default.env.TERM_PROGRAM === "Terminus-Sublime" || import_node_process2.default.env.TERM_PROGRAM === "vscode" || import_node_process2.default.env.TERM === "xterm-256color" || import_node_process2.default.env.TERM === "alacritty" || import_node_process2.default.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}

// node_modules/.pnpm/log-symbols@6.0.0/node_modules/log-symbols/index.js
var main = {
  info: source_default.blue("\u2139"),
  success: source_default.green("\u2714"),
  warning: source_default.yellow("\u26A0"),
  error: source_default.red("\u2716")
};
var fallback = {
  info: source_default.blue("i"),
  success: source_default.green("\u221A"),
  warning: source_default.yellow("\u203C"),
  error: source_default.red("\xD7")
};
var logSymbols = isUnicodeSupported() ? main : fallback;
var log_symbols_default = logSymbols;

// src/version-bump.ts
var import_picocolors3 = __toESM(require_picocolors());
var import_prompts2 = __toESM(require("prompts"));

// src/get-current-version.ts
var import_semver = require("semver");

// src/fs.ts
var import_node_fs = __toESM(require("fs"));
var import_node_path = __toESM(require("path"));
var jsonc = __toESM(require("jsonc-parser"));
async function readJsoncFile(name, cwd) {
  const file = await readTextFile(name, cwd);
  const data = jsonc.parse(file.data);
  const modified = [];
  return __spreadProps(__spreadValues({}, file), { data, modified, text: file.data });
}
async function writeJsoncFile(file) {
  let newJSON = file.text;
  for (const [key, value] of file.modified) {
    const edit = jsonc.modify(file.text, key, value, {});
    newJSON = jsonc.applyEdits(newJSON, edit);
  }
  return writeTextFile(__spreadProps(__spreadValues({}, file), { data: newJSON }));
}
function readTextFile(name, cwd) {
  return new Promise((resolve, reject) => {
    const filePath = import_node_path.default.join(cwd, name);
    import_node_fs.default.readFile(filePath, "utf8", (err, text) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          path: filePath,
          data: text
        });
      }
    });
  });
}
function writeTextFile(file) {
  return new Promise((resolve, reject) => {
    import_node_fs.default.writeFile(file.path, file.data, (err) => {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
}

// src/manifest.ts
function isManifest(obj) {
  return obj && typeof obj === "object" && isOptionalString(obj.name) && isOptionalString(obj.version) && isOptionalString(obj.description);
}
function isPackageLockManifest(manifest) {
  var _a, _b;
  return typeof ((_b = (_a = manifest.packages) == null ? void 0 : _a[""]) == null ? void 0 : _b.version) === "string";
}
function isOptionalString(value) {
  const type = typeof value;
  return value === null || type === "undefined" || type === "string";
}

// src/get-current-version.ts
async function getCurrentVersion(operation) {
  if (operation.state.currentVersion)
    return operation;
  const { cwd, files } = operation.options;
  const filesToCheck = files.filter((file) => file.endsWith(".json"));
  if (!filesToCheck.includes("package.json"))
    filesToCheck.push("package.json");
  if (!filesToCheck.includes("deno.json"))
    filesToCheck.push("deno.json");
  if (!filesToCheck.includes("deno.jsonc"))
    filesToCheck.push("deno.jsonc");
  for (const file of filesToCheck) {
    const version = await readVersion(file, cwd);
    if (version) {
      return operation.update({
        currentVersionSource: file,
        currentVersion: version
      });
    }
  }
  throw new Error(
    `Unable to determine the current version number. Checked ${filesToCheck.join(", ")}.`
  );
}
async function readVersion(file, cwd) {
  try {
    const { data: manifest } = await readJsoncFile(file, cwd);
    if (isManifest(manifest)) {
      if ((0, import_semver.valid)(manifest.version))
        return manifest.version;
    }
  } catch (e) {
    return void 0;
  }
}

// src/get-new-version.ts
var import_node_process3 = __toESM(require("process"));
var import_picocolors2 = __toESM(require_picocolors());
var import_prompts = __toESM(require("prompts"));
var import_semver2 = __toESM(require("semver"));

// src/print-commits.ts
var ezSpawn = __toESM(require("@jsdevtools/ez-spawn"));
var import_picocolors = __toESM(require_picocolors());
var messageColorMap = {
  chore: import_picocolors.default.gray,
  fix: import_picocolors.default.yellow,
  feat: import_picocolors.default.green,
  refactor: import_picocolors.default.cyan,
  docs: import_picocolors.default.blue,
  doc: import_picocolors.default.blue,
  ci: import_picocolors.default.gray,
  build: import_picocolors.default.gray
};
function parseCommits(raw) {
  const lines = raw.toString().trim().split(/\n/g);
  if (!lines.length) {
    return [];
  }
  return lines.map((line) => {
    const [hash, ...parts] = line.split(" ");
    const message = parts.join(" ");
    const match = message.match(/^(\w+)(!)?(\([^)]+\))?:(.*)$/);
    if (match) {
      let color = messageColorMap[match[1].toLowerCase()] || ((c4) => c4);
      if (match[2] === "!") {
        color = (s) => import_picocolors.default.inverse(import_picocolors.default.red(s));
      }
      const tag = [match[1], match[2]].filter(Boolean).join("");
      const scope = match[3] || "";
      return {
        hash,
        tag,
        message: match[4].trim(),
        scope,
        breaking: match[2] === "!",
        color
      };
    }
    return {
      hash,
      tag: "",
      message,
      scope: "",
      color: (c4) => c4
    };
  }).reverse();
}
function formatParsedCommits(commits) {
  const tagLength = commits.map(({ tag }) => tag.length).reduce((a, b) => Math.max(a, b), 0);
  let scopeLength = commits.map(({ scope }) => scope.length).reduce((a, b) => Math.max(a, b), 0);
  if (scopeLength)
    scopeLength += 2;
  return commits.map(({ hash, tag, message, scope, color }) => {
    const paddedTag = tag.padStart(tagLength + 1, " ");
    const paddedScope = !scope ? " ".repeat(scopeLength) : import_picocolors.default.dim("(") + scope.slice(1, -1) + import_picocolors.default.dim(")") + " ".repeat(scopeLength - scope.length);
    return [
      import_picocolors.default.dim(hash),
      " ",
      color === import_picocolors.default.gray ? color(paddedTag) : import_picocolors.default.bold(color(paddedTag)),
      " ",
      paddedScope,
      import_picocolors.default.dim(":"),
      " ",
      color === import_picocolors.default.gray ? color(message) : message
    ].join("");
  });
}
async function printRecentCommits(operation) {
  let sha;
  sha || (sha = await ezSpawn.async(
    "git",
    ["rev-list", "-n", "1", `v${operation.state.currentVersion}`],
    { stdio: "pipe" }
  ).then((res) => res.stdout.trim()).catch(() => void 0));
  sha || (sha = await ezSpawn.async(
    "git",
    ["rev-list", "-n", "1", operation.state.currentVersion],
    { stdio: "pipe" }
  ).then((res) => res.stdout.trim()).catch(() => void 0));
  if (!sha) {
    console.log(
      import_picocolors.default.blue(`i`) + import_picocolors.default.gray(` Failed to locate the previous tag ${import_picocolors.default.yellow(`v${operation.state.currentVersion}`)}`)
    );
    return;
  }
  const { stdout } = await ezSpawn.async(
    "git",
    [
      "--no-pager",
      "log",
      `${sha}..HEAD`,
      "--oneline"
    ],
    { stdio: "pipe" }
  );
  const parsed = parseCommits(stdout.toString().trim());
  const prettified = formatParsedCommits(parsed);
  if (!parsed.length) {
    console.log();
    console.log(import_picocolors.default.blue(`i`) + import_picocolors.default.gray(` No commits since ${operation.state.currentVersion}`));
    console.log();
    return;
  }
  console.log();
  console.log(
    import_picocolors.default.bold(
      `${import_picocolors.default.green(parsed.length)} Commits since ${import_picocolors.default.gray(sha.slice(0, 7))}:`
    )
  );
  console.log();
  console.log(prettified.join("\n"));
  console.log();
}

// src/release-type.ts
var prereleaseTypes = ["premajor", "preminor", "prepatch", "prerelease"];
var releaseTypes = prereleaseTypes.concat(["major", "minor", "patch", "next"]);
function isPrerelease(value) {
  return prereleaseTypes.includes(value);
}
function isReleaseType(value) {
  return releaseTypes.includes(value);
}

// src/get-new-version.ts
async function getNewVersion(operation) {
  const { release } = operation.options;
  const { currentVersion } = operation.state;
  switch (release.type) {
    case "prompt":
      return promptForNewVersion(operation);
    case "version":
      return operation.update({
        newVersion: new import_semver2.SemVer(release.version, true).version
      });
    default:
      return operation.update({
        release: release.type,
        newVersion: getNextVersion(currentVersion, release)
      });
  }
}
function getNextVersion(currentVersion, bump) {
  const oldSemVer = new import_semver2.SemVer(currentVersion);
  const type = bump.type === "next" ? oldSemVer.prerelease.length ? "prerelease" : "patch" : bump.type;
  const newSemVer = oldSemVer.inc(type, bump.preid);
  if (isPrerelease(bump.type) && newSemVer.prerelease.length === 2 && newSemVer.prerelease[0] === bump.preid && String(newSemVer.prerelease[1]) === "0") {
    newSemVer.prerelease[1] = "1";
    newSemVer.format();
  }
  return newSemVer.version;
}
function getNextVersions(currentVersion, preid) {
  const next = {};
  const parse2 = import_semver2.default.parse(currentVersion);
  if (typeof (parse2 == null ? void 0 : parse2.prerelease[0]) === "string")
    preid = (parse2 == null ? void 0 : parse2.prerelease[0]) || "preid";
  for (const type of releaseTypes)
    next[type] = getNextVersion(currentVersion, { type, preid });
  return next;
}
async function promptForNewVersion(operation) {
  var _a, _b;
  const { currentVersion } = operation.state;
  const release = operation.options.release;
  const next = getNextVersions(currentVersion, release.preid);
  const configCustomVersion = await ((_b = (_a = operation.options).customVersion) == null ? void 0 : _b.call(_a, currentVersion, import_semver2.default));
  if (operation.options.printCommits) {
    await printRecentCommits(operation);
  }
  const PADDING = 13;
  const answers = await (0, import_prompts.default)([
    {
      type: "autocomplete",
      name: "release",
      message: `Current version ${import_picocolors2.default.green(currentVersion)}`,
      initial: configCustomVersion ? "config" : "next",
      choices: [
        { value: "major", title: `${"major".padStart(PADDING, " ")} ${import_picocolors2.default.bold(next.major)}` },
        { value: "minor", title: `${"minor".padStart(PADDING, " ")} ${import_picocolors2.default.bold(next.minor)}` },
        { value: "patch", title: `${"patch".padStart(PADDING, " ")} ${import_picocolors2.default.bold(next.patch)}` },
        { value: "next", title: `${"next".padStart(PADDING, " ")} ${import_picocolors2.default.bold(next.next)}` },
        ...configCustomVersion ? [
          { value: "config", title: `${"from config".padStart(PADDING, " ")} ${import_picocolors2.default.bold(configCustomVersion)}` }
        ] : [],
        { value: "prepatch", title: `${"pre-patch".padStart(PADDING, " ")} ${import_picocolors2.default.bold(next.prepatch)}` },
        { value: "preminor", title: `${"pre-minor".padStart(PADDING, " ")} ${import_picocolors2.default.bold(next.preminor)}` },
        { value: "premajor", title: `${"pre-major".padStart(PADDING, " ")} ${import_picocolors2.default.bold(next.premajor)}` },
        { value: "none", title: `${"as-is".padStart(PADDING, " ")} ${import_picocolors2.default.bold(currentVersion)}` },
        { value: "custom", title: "custom ...".padStart(PADDING + 4, " ") }
      ]
    },
    {
      type: (prev) => prev === "custom" ? "text" : null,
      name: "custom",
      message: "Enter the new version number:",
      initial: currentVersion,
      validate: (custom) => {
        return (0, import_semver2.valid)(custom) ? true : "That's not a valid version number";
      }
    }
  ]);
  const newVersion = answers.release === "none" ? currentVersion : answers.release === "custom" ? (0, import_semver2.clean)(answers.custom) : answers.release === "config" ? (0, import_semver2.clean)(configCustomVersion) : next[answers.release];
  if (!newVersion)
    import_node_process3.default.exit(1);
  switch (answers.release) {
    case "custom":
    case "config":
    case "next":
    case "none":
      return operation.update({ newVersion });
    default:
      return operation.update({ release: answers.release, newVersion });
  }
}

// src/git.ts
var ezSpawn2 = __toESM(require("@jsdevtools/ez-spawn"));

// src/types/version-bump-progress.ts
var ProgressEvent = /* @__PURE__ */ ((ProgressEvent2) => {
  ProgressEvent2["FileUpdated"] = "file updated";
  ProgressEvent2["FileSkipped"] = "file skipped";
  ProgressEvent2["GitCommit"] = "git commit";
  ProgressEvent2["GitTag"] = "git tag";
  ProgressEvent2["GitPush"] = "git push";
  ProgressEvent2["NpmScript"] = "npm script";
  return ProgressEvent2;
})(ProgressEvent || {});
var NpmScript = /* @__PURE__ */ ((NpmScript2) => {
  NpmScript2["PreVersion"] = "preversion";
  NpmScript2["Version"] = "version";
  NpmScript2["PostVersion"] = "postversion";
  return NpmScript2;
})(NpmScript || {});

// src/git.ts
async function gitCommit(operation) {
  if (!operation.options.commit)
    return operation;
  const { all, noVerify, message } = operation.options.commit;
  const { updatedFiles, newVersion } = operation.state;
  let args = ["--allow-empty"];
  if (all) {
    args.push("--all");
  }
  if (noVerify) {
    args.push("--no-verify");
  }
  const commitMessage = formatVersionString(message, newVersion);
  args.push("--message", commitMessage);
  if (!all)
    args = args.concat(updatedFiles);
  await ezSpawn2.async("git", ["commit", ...args]);
  return operation.update({ event: "git commit" /* GitCommit */, commitMessage });
}
async function gitTag(operation) {
  if (!operation.options.tag)
    return operation;
  const { commit, tag } = operation.options;
  const { newVersion } = operation.state;
  const args = [
    // Create an annotated tag, which is recommended for releases.
    // See https://git-scm.com/docs/git-tag
    "--annotate",
    // Use the same commit message for the tag
    "--message",
    formatVersionString(commit.message, newVersion)
  ];
  const tagName = formatVersionString(tag.name, newVersion);
  args.push(tagName);
  await ezSpawn2.async("git", ["tag", ...args]);
  return operation.update({ event: "git tag" /* GitTag */, tagName });
}
async function gitPush(operation) {
  if (!operation.options.push)
    return operation;
  await ezSpawn2.async("git", "push");
  if (operation.options.tag) {
    await ezSpawn2.async("git", ["push", "--tags"]);
  }
  return operation.update({ event: "git push" /* GitPush */ });
}
function formatVersionString(template, newVersion) {
  if (template.includes("%s"))
    return template.replace(/%s/g, newVersion);
  else
    return template + newVersion;
}

// src/normalize-options.ts
var import_node_fs2 = __toESM(require("fs"));
var import_promises = __toESM(require("fs/promises"));
var import_node_process4 = __toESM(require("process"));
var import_fast_glob = __toESM(require("fast-glob"));
var import_js_yaml = __toESM(require("js-yaml"));
async function normalizeOptions(raw) {
  var _a, _b, _d;
  const preid = typeof raw.preid === "string" ? raw.preid : "beta";
  const push = Boolean(raw.push);
  const all = Boolean(raw.all);
  const noVerify = Boolean(raw.noVerify);
  const cwd = raw.cwd || import_node_process4.default.cwd();
  const ignoreScripts = Boolean(raw.ignoreScripts);
  const execute = raw.execute;
  const recursive = Boolean(raw.recursive);
  let release;
  if (!raw.release || raw.release === "prompt")
    release = { type: "prompt", preid };
  else if (isReleaseType(raw.release) || raw.release === "next")
    release = { type: raw.release, preid };
  else
    release = { type: "version", version: raw.release };
  let tag;
  if (typeof raw.tag === "string")
    tag = { name: raw.tag };
  else if (raw.tag)
    tag = { name: "v" };
  let commit;
  if (typeof raw.commit === "string")
    commit = { all, noVerify, message: raw.commit };
  else if (raw.commit || tag || push)
    commit = { all, noVerify, message: "chore: release v" };
  if (recursive && !((_a = raw.files) == null ? void 0 : _a.length)) {
    raw.files = [
      "package.json",
      "package-lock.json",
      "packages/**/package.json",
      "jsr.json",
      "jsr.jsonc",
      "deno.json",
      "deno.jsonc"
    ];
    if (import_node_fs2.default.existsSync("pnpm-workspace.yaml")) {
      const pnpmWorkspace = await import_promises.default.readFile("pnpm-workspace.yaml", "utf8");
      const workspaces = import_js_yaml.default.load(pnpmWorkspace);
      const workspacesWithPackageJson = workspaces.packages.map((workspace) => `${workspace}/package.json`);
      const withoutExcludedWorkspaces = workspacesWithPackageJson.filter((workspace) => {
        var _a2;
        return !workspace.startsWith("!") && !((_a2 = raw.files) == null ? void 0 : _a2.includes(workspace));
      });
      raw.files = raw.files.concat(withoutExcludedWorkspaces);
    }
  } else {
    raw.files = ((_b = raw.files) == null ? void 0 : _b.length) ? raw.files : ["package.json", "package-lock.json", "jsr.json", "jsr.jsonc", "deno.json", "deno.jsonc"];
  }
  const files = await (0, import_fast_glob.default)(
    raw.files,
    {
      cwd,
      onlyFiles: true,
      ignore: [
        "**/{.git,node_modules,bower_components,__tests__,fixtures,fixture}/**"
      ]
    }
  );
  let ui;
  if (raw.interface === false) {
    ui = { input: false, output: false };
  } else if (raw.interface === true || !raw.interface) {
    ui = { input: import_node_process4.default.stdin, output: import_node_process4.default.stdout };
  } else {
    let _c = raw.interface, { input, output } = _c, other = __objRest(_c, ["input", "output"]);
    if (input === true || input !== false && !input)
      input = import_node_process4.default.stdin;
    if (output === true || output !== false && !output)
      output = import_node_process4.default.stdout;
    ui = __spreadValues({ input, output }, other);
  }
  if (release.type === "prompt" && !(ui.input && ui.output))
    throw new Error("Cannot prompt for the version number because input or output has been disabled.");
  return {
    release,
    commit,
    tag,
    push,
    files,
    cwd,
    interface: ui,
    ignoreScripts,
    execute,
    printCommits: (_d = raw.printCommits) != null ? _d : true,
    customVersion: raw.customVersion,
    currentVersion: raw.currentVersion
  };
}

// src/operation.ts
var Operation = class _Operation {
  /**
   * Private constructor.  Use the `Operation.start()` static method instead.
   */
  constructor(options, progress) {
    /**
     * The current state of the operation.
     */
    this.state = {
      release: void 0,
      currentVersion: "",
      currentVersionSource: "",
      newVersion: "",
      commitMessage: "",
      tagName: "",
      updatedFiles: [],
      skippedFiles: []
    };
    this.options = options;
    this._progress = progress;
    if (options.currentVersion) {
      this.update({
        currentVersion: options.currentVersion,
        currentVersionSource: "user"
      });
    }
  }
  /**
   * The results of the operation.
   */
  get results() {
    const options = this.options;
    const state = this.state;
    return {
      release: state.release,
      currentVersion: state.currentVersion,
      newVersion: state.newVersion,
      commit: options.commit ? state.commitMessage : false,
      tag: options.tag ? state.tagName : false,
      updatedFiles: state.updatedFiles.slice(),
      skippedFiles: state.skippedFiles.slice()
    };
  }
  /**
   * Starts a new `versionBump()` operation.
   */
  static async start(input) {
    const options = await normalizeOptions(input);
    return new _Operation(options, input.progress);
  }
  /**
   * Updates the operation state and results, and reports the updated progress to the user.
   */
  update(_a) {
    var _b = _a, { event, script } = _b, newState = __objRest(_b, ["event", "script"]);
    Object.assign(this.state, newState);
    if (event && this._progress) {
      this._progress(__spreadValues({ event, script }, this.results));
    }
    return this;
  }
};

// src/run-npm-script.ts
var ezSpawn3 = __toESM(require("@jsdevtools/ez-spawn"));
async function runNpmScript(script, operation) {
  const { cwd, ignoreScripts } = operation.options;
  if (!ignoreScripts) {
    const { data: manifest } = await readJsoncFile("package.json", cwd);
    if (isManifest(manifest) && hasScript(manifest, script)) {
      await ezSpawn3.async("npm", ["run", script, "--silent"], { stdio: "inherit" });
      operation.update({ event: "npm script" /* NpmScript */, script });
    }
  }
  return operation;
}
function hasScript(manifest, script) {
  const scripts = manifest.scripts;
  if (scripts && typeof scripts === "object")
    return Boolean(scripts[script]);
  return false;
}

// src/update-files.ts
var import_node_fs3 = require("fs");
var path2 = __toESM(require("path"));
async function updateFiles(operation) {
  const { files } = operation.options;
  for (const relPath of files) {
    const modified = await updateFile(relPath, operation);
    if (modified) {
      operation.update({
        event: "file updated" /* FileUpdated */,
        updatedFiles: operation.state.updatedFiles.concat(relPath)
      });
    } else {
      operation.update({
        event: "file skipped" /* FileSkipped */,
        skippedFiles: operation.state.skippedFiles.concat(relPath)
      });
    }
  }
  return operation;
}
async function updateFile(relPath, operation) {
  if (!(0, import_node_fs3.existsSync)(relPath)) {
    return false;
  }
  const name = path2.basename(relPath).trim().toLowerCase();
  switch (name) {
    case "package.json":
    case "package-lock.json":
    case "bower.json":
    case "component.json":
    case "jsr.json":
    case "jsr.jsonc":
    case "deno.json":
    case "deno.jsonc":
      return updateManifestFile(relPath, operation);
    default:
      return updateTextFile(relPath, operation);
  }
}
async function updateManifestFile(relPath, operation) {
  const { cwd } = operation.options;
  const { newVersion } = operation.state;
  let modified = false;
  const file = await readJsoncFile(relPath, cwd);
  if (isManifest(file.data) && file.data.version !== newVersion) {
    file.modified.push([["version"], newVersion]);
    if (isPackageLockManifest(file.data))
      file.modified.push([["packages", "", "version"], newVersion]);
    await writeJsoncFile(file);
    modified = true;
  }
  return modified;
}
async function updateTextFile(relPath, operation) {
  const { cwd } = operation.options;
  const { currentVersion, newVersion } = operation.state;
  const modified = false;
  const file = await readTextFile(relPath, cwd);
  if (file.data.includes(currentVersion)) {
    const sanitizedVersion = currentVersion.replace(/(\W)/g, "\\$1");
    const replacePattern = new RegExp(`(\\b|v)${sanitizedVersion}\\b`, "g");
    file.data = file.data.replace(replacePattern, `$1${newVersion}`);
    await writeTextFile(file);
    return true;
  }
  return modified;
}

// src/version-bump.ts
async function versionBump(arg = {}) {
  if (typeof arg === "string")
    arg = { release: arg };
  const operation = await Operation.start(arg);
  await getCurrentVersion(operation);
  await getNewVersion(operation);
  if (arg.confirm) {
    printSummary(operation);
    if (!await (0, import_prompts2.default)({
      name: "yes",
      type: "confirm",
      message: "Bump?",
      initial: true
    }).then((r) => r.yes)) {
      import_node_process5.default.exit(1);
    }
  }
  await runNpmScript("preversion" /* PreVersion */, operation);
  await updateFiles(operation);
  if (operation.options.execute) {
    console.log(log_symbols_default.info, "Executing script", operation.options.execute);
    await ezSpawn4.async(operation.options.execute, { stdio: "inherit" });
    console.log(log_symbols_default.success, "Script finished");
  }
  await runNpmScript("version" /* Version */, operation);
  await gitCommit(operation);
  await gitTag(operation);
  await runNpmScript("postversion" /* PostVersion */, operation);
  await gitPush(operation);
  return operation.results;
}
function printSummary(operation) {
  console.log();
  console.log(`   files ${operation.options.files.map((i) => import_picocolors3.default.bold(i)).join("\n         ")}`);
  if (operation.options.commit)
    console.log(`  commit ${import_picocolors3.default.bold(formatVersionString(operation.options.commit.message, operation.state.newVersion))}`);
  if (operation.options.tag)
    console.log(`     tag ${import_picocolors3.default.bold(formatVersionString(operation.options.tag.name, operation.state.newVersion))}`);
  if (operation.options.execute)
    console.log(` execute ${import_picocolors3.default.bold(operation.options.execute)}`);
  if (operation.options.push)
    console.log(`    push ${import_picocolors3.default.cyan(import_picocolors3.default.bold("yes"))}`);
  console.log();
  console.log(`    from ${import_picocolors3.default.bold(operation.state.currentVersion)}`);
  console.log(`      to ${import_picocolors3.default.green(import_picocolors3.default.bold(operation.state.newVersion))}`);
  console.log();
}
async function versionBumpInfo(arg = {}) {
  if (typeof arg === "string")
    arg = { release: arg };
  const operation = await Operation.start(arg);
  await getCurrentVersion(operation);
  await getNewVersion(operation);
  return operation;
}

// src/config.ts
var import_node_path2 = require("path");
var import_node_process6 = __toESM(require("process"));
var import_c12 = require("c12");
var import_sync = __toESM(require("escalade/sync"));
var bumpConfigDefaults = {
  commit: true,
  push: true,
  tag: true,
  recursive: false,
  noVerify: false,
  confirm: true,
  ignoreScripts: false,
  all: false,
  files: []
};
async function loadBumpConfig(overrides, cwd = import_node_process6.default.cwd()) {
  const name = "bump";
  const configFile = findConfigFile(name, cwd);
  const { config } = await (0, import_c12.loadConfig)({
    name,
    defaults: bumpConfigDefaults,
    overrides: __spreadValues({}, overrides),
    cwd: configFile ? (0, import_node_path2.dirname)(configFile) : cwd
  });
  return config;
}
function findConfigFile(name, cwd) {
  let foundRepositoryRoot = false;
  try {
    const candidates = ["js", "mjs", "ts", "mts", "json"].map((ext) => `${name}.config.${ext}`);
    return (0, import_sync.default)(cwd, (_dir, files) => {
      const match = files.find((file) => {
        if (candidates.includes(file))
          return true;
        if (file === ".git")
          foundRepositoryRoot = true;
        return false;
      });
      if (match)
        return match;
      if (foundRepositoryRoot) {
        throw null;
      }
      return false;
    });
  } catch (error) {
    if (foundRepositoryRoot)
      return null;
    throw error;
  }
}
function defineConfig(config) {
  return config;
}

// src/index.ts
var src_default = versionBump;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NpmScript,
  ProgressEvent,
  bumpConfigDefaults,
  defineConfig,
  loadBumpConfig,
  versionBump,
  versionBumpInfo
});
