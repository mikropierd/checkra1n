// src/factory.ts
import { isPackageExists as isPackageExists4 } from "local-pkg";
import { FlatConfigComposer } from "eslint-flat-config-utils";

// src/globs.ts
var GLOB_SRC_EXT = "?([cm])[jt]s?(x)";
var GLOB_SRC = "**/*.?([cm])[jt]s?(x)";
var GLOB_JS = "**/*.?([cm])js";
var GLOB_JSX = "**/*.?([cm])jsx";
var GLOB_TS = "**/*.?([cm])ts";
var GLOB_TSX = "**/*.?([cm])tsx";
var GLOB_STYLE = "**/*.{c,le,sc}ss";
var GLOB_CSS = "**/*.css";
var GLOB_POSTCSS = "**/*.{p,post}css";
var GLOB_LESS = "**/*.less";
var GLOB_SCSS = "**/*.scss";
var GLOB_JSON = "**/*.json";
var GLOB_JSON5 = "**/*.json5";
var GLOB_JSONC = "**/*.jsonc";
var GLOB_MARKDOWN = "**/*.md";
var GLOB_MARKDOWN_IN_MARKDOWN = "**/*.md/*.md";
var GLOB_SVELTE = "**/*.svelte";
var GLOB_VUE = "**/*.vue";
var GLOB_YAML = "**/*.y?(a)ml";
var GLOB_TOML = "**/*.toml";
var GLOB_XML = "**/*.xml";
var GLOB_SVG = "**/*.svg";
var GLOB_HTML = "**/*.htm?(l)";
var GLOB_ASTRO = "**/*.astro";
var GLOB_ASTRO_TS = "**/*.astro/*.ts";
var GLOB_GRAPHQL = "**/*.{g,graph}ql";
var GLOB_MARKDOWN_CODE = `${GLOB_MARKDOWN}/${GLOB_SRC}`;
var GLOB_TESTS = [
  `**/__tests__/**/*.${GLOB_SRC_EXT}`,
  `**/*.spec.${GLOB_SRC_EXT}`,
  `**/*.test.${GLOB_SRC_EXT}`,
  `**/*.bench.${GLOB_SRC_EXT}`,
  `**/*.benchmark.${GLOB_SRC_EXT}`
];
var GLOB_ALL_SRC = [
  GLOB_SRC,
  GLOB_STYLE,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_MARKDOWN,
  GLOB_SVELTE,
  GLOB_VUE,
  GLOB_YAML,
  GLOB_XML,
  GLOB_HTML
];
var GLOB_EXCLUDE = [
  "**/node_modules",
  "**/dist",
  "**/package-lock.json",
  "**/yarn.lock",
  "**/pnpm-lock.yaml",
  "**/bun.lockb",
  "**/output",
  "**/coverage",
  "**/temp",
  "**/.temp",
  "**/tmp",
  "**/.tmp",
  "**/.history",
  "**/.vitepress/cache",
  "**/.nuxt",
  "**/.next",
  "**/.svelte-kit",
  "**/.vercel",
  "**/.changeset",
  "**/.idea",
  "**/.cache",
  "**/.output",
  "**/.vite-inspect",
  "**/.yarn",
  "**/vite.config.*.timestamp-*",
  "**/CHANGELOG*.md",
  "**/*.min.*",
  "**/LICENSE*",
  "**/__snapshots__",
  "**/auto-import?(s).d.ts",
  "**/components.d.ts"
];

// src/utils.ts
import process from "node:process";
import { fileURLToPath } from "node:url";
import { isPackageExists } from "local-pkg";
var scopeUrl = fileURLToPath(new URL(".", import.meta.url));
var isCwdInScope = isPackageExists("@antfu/eslint-config");
var parserPlain = {
  meta: {
    name: "parser-plain"
  },
  parseForESLint: (code) => ({
    ast: {
      body: [],
      comments: [],
      loc: { end: code.length, start: 0 },
      range: [0, code.length],
      tokens: [],
      type: "Program"
    },
    scopeManager: null,
    services: { isPlain: true },
    visitorKeys: {
      Program: []
    }
  })
};
async function combine(...configs2) {
  const resolved = await Promise.all(configs2);
  return resolved.flat();
}
function renameRules(rules, map) {
  return Object.fromEntries(
    Object.entries(rules).map(([key, value]) => {
      for (const [from, to] of Object.entries(map)) {
        if (key.startsWith(`${from}/`))
          return [to + key.slice(from.length), value];
      }
      return [key, value];
    })
  );
}
function renamePluginInConfigs(configs2, map) {
  return configs2.map((i) => {
    const clone = { ...i };
    if (clone.rules)
      clone.rules = renameRules(clone.rules, map);
    if (clone.plugins) {
      clone.plugins = Object.fromEntries(
        Object.entries(clone.plugins).map(([key, value]) => {
          if (key in map)
            return [map[key], value];
          return [key, value];
        })
      );
    }
    return clone;
  });
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
async function interopDefault(m) {
  const resolved = await m;
  return resolved.default || resolved;
}
function isPackageInScope(name) {
  return isPackageExists(name, { paths: [scopeUrl] });
}
async function ensurePackages(packages) {
  if (process.env.CI || process.stdout.isTTY === false || isCwdInScope === false)
    return;
  const nonExistingPackages = packages.filter((i) => i && !isPackageInScope(i));
  if (nonExistingPackages.length === 0)
    return;
  const p = await import("@clack/prompts");
  const result = await p.confirm({
    message: `${nonExistingPackages.length === 1 ? "Package is" : "Packages are"} required for this config: ${nonExistingPackages.join(", ")}. Do you want to install them?`
  });
  if (result)
    await import("@antfu/install-pkg").then((i) => i.installPackage(nonExistingPackages, { dev: true }));
}
function isInEditorEnv() {
  if (process.env.CI)
    return false;
  if (isInGitHooksOrLintStaged())
    return false;
  return !!(process.env.VSCODE_PID || process.env.VSCODE_CWD || process.env.JETBRAINS_IDE || process.env.VIM || process.env.NVIM);
}
function isInGitHooksOrLintStaged() {
  return !!(process.env.GIT_PARAMS || process.env.VSCODE_GIT_COMMAND || process.env.npm_lifecycle_script?.startsWith("lint-staged"));
}

// src/configs/astro.ts
async function astro(options = {}) {
  const {
    files = [GLOB_ASTRO],
    overrides = {},
    stylistic: stylistic2 = true
  } = options;
  const [
    pluginAstro,
    parserAstro,
    parserTs
  ] = await Promise.all([
    interopDefault(import("eslint-plugin-astro")),
    interopDefault(import("astro-eslint-parser")),
    interopDefault(import("@typescript-eslint/parser"))
  ]);
  return [
    {
      name: "antfu/astro/setup",
      plugins: {
        astro: pluginAstro
      }
    },
    {
      files,
      languageOptions: {
        globals: pluginAstro.environments.astro.globals,
        parser: parserAstro,
        parserOptions: {
          extraFileExtensions: [".astro"],
          parser: parserTs
        },
        sourceType: "module"
      },
      name: "antfu/astro/rules",
      processor: "astro/client-side-ts",
      rules: {
        // use recommended rules
        "astro/missing-client-only-directive-value": "error",
        "astro/no-conflict-set-directives": "error",
        "astro/no-deprecated-astro-canonicalurl": "error",
        "astro/no-deprecated-astro-fetchcontent": "error",
        "astro/no-deprecated-astro-resolve": "error",
        "astro/no-deprecated-getentrybyslug": "error",
        "astro/no-set-html-directive": "off",
        "astro/no-unused-define-vars-in-style": "error",
        "astro/semi": "off",
        "astro/valid-compile": "error",
        ...stylistic2 ? {
          "style/indent": "off",
          "style/jsx-closing-tag-location": "off",
          "style/jsx-indent": "off",
          "style/jsx-one-expression-per-line": "off",
          "style/no-multiple-empty-lines": "off"
        } : {},
        ...overrides
      }
    }
  ];
}

// src/configs/command.ts
import createCommand from "eslint-plugin-command/config";
async function command() {
  return [
    {
      ...createCommand(),
      name: "antfu/command/rules"
    }
  ];
}

// src/plugins.ts
import { default as default2 } from "eslint-plugin-antfu";
import { default as default3 } from "@eslint-community/eslint-plugin-eslint-comments";
import * as pluginImport from "eslint-plugin-import-x";
import { default as default4 } from "eslint-plugin-n";
import { default as default5 } from "eslint-plugin-unicorn";
import { default as default6 } from "eslint-plugin-unused-imports";
import { default as default7 } from "eslint-plugin-perfectionist";

// src/configs/comments.ts
async function comments() {
  return [
    {
      name: "antfu/eslint-comments/rules",
      plugins: {
        "eslint-comments": default3
      },
      rules: {
        "eslint-comments/no-aggregating-enable": "error",
        "eslint-comments/no-duplicate-disable": "error",
        "eslint-comments/no-unlimited-disable": "error",
        "eslint-comments/no-unused-enable": "error"
      }
    }
  ];
}

// src/configs/formatters.ts
import { isPackageExists as isPackageExists2 } from "local-pkg";

// src/configs/stylistic.ts
var StylisticConfigDefaults = {
  indent: 2,
  jsx: true,
  quotes: "single",
  semi: false
};
async function stylistic(options = {}) {
  const {
    indent,
    jsx: jsx2,
    lessOpinionated = false,
    overrides = {},
    quotes,
    semi
  } = {
    ...StylisticConfigDefaults,
    ...options
  };
  const pluginStylistic = await interopDefault(import("@stylistic/eslint-plugin"));
  const config = pluginStylistic.configs.customize({
    flat: true,
    indent,
    jsx: jsx2,
    pluginName: "style",
    quotes,
    semi
  });
  return [
    {
      name: "antfu/stylistic/rules",
      plugins: {
        antfu: default2,
        style: pluginStylistic
      },
      rules: {
        ...config.rules,
        "antfu/consistent-list-newline": "error",
        ...lessOpinionated ? {
          curly: ["error", "all"]
        } : {
          "antfu/curly": "error",
          "antfu/if-newline": "error",
          "antfu/top-level-function": "error"
        },
        ...overrides
      }
    }
  ];
}

// src/configs/formatters.ts
async function formatters(options = {}, stylistic2 = {}) {
  if (options === true) {
    const isPrettierPluginXmlInScope = isPackageInScope("@prettier/plugin-xml");
    options = {
      astro: isPackageInScope("prettier-plugin-astro"),
      css: true,
      graphql: true,
      html: true,
      markdown: true,
      slidev: isPackageExists2("@slidev/cli"),
      svg: isPrettierPluginXmlInScope,
      xml: isPrettierPluginXmlInScope
    };
  }
  await ensurePackages([
    "eslint-plugin-format",
    options.markdown && options.slidev ? "prettier-plugin-slidev" : void 0,
    options.astro ? "prettier-plugin-astro" : void 0,
    options.xml || options.svg ? "@prettier/plugin-xml" : void 0
  ]);
  if (options.slidev && options.markdown !== true && options.markdown !== "prettier")
    throw new Error("`slidev` option only works when `markdown` is enabled with `prettier`");
  const {
    indent,
    quotes,
    semi
  } = {
    ...StylisticConfigDefaults,
    ...stylistic2
  };
  const prettierOptions = Object.assign(
    {
      endOfLine: "auto",
      printWidth: 120,
      semi,
      singleQuote: quotes === "single",
      tabWidth: typeof indent === "number" ? indent : 2,
      trailingComma: "all",
      useTabs: indent === "tab"
    },
    options.prettierOptions || {}
  );
  const prettierXmlOptions = {
    xmlQuoteAttributes: "double",
    xmlSelfClosingSpace: true,
    xmlSortAttributesByKey: false,
    xmlWhitespaceSensitivity: "ignore"
  };
  const dprintOptions = Object.assign(
    {
      indentWidth: typeof indent === "number" ? indent : 2,
      quoteStyle: quotes === "single" ? "preferSingle" : "preferDouble",
      useTabs: indent === "tab"
    },
    options.dprintOptions || {}
  );
  const pluginFormat = await interopDefault(import("eslint-plugin-format"));
  const configs2 = [
    {
      name: "antfu/formatter/setup",
      plugins: {
        format: pluginFormat
      }
    }
  ];
  if (options.css) {
    configs2.push(
      {
        files: [GLOB_CSS, GLOB_POSTCSS],
        languageOptions: {
          parser: parserPlain
        },
        name: "antfu/formatter/css",
        rules: {
          "format/prettier": [
            "error",
            {
              ...prettierOptions,
              parser: "css"
            }
          ]
        }
      },
      {
        files: [GLOB_SCSS],
        languageOptions: {
          parser: parserPlain
        },
        name: "antfu/formatter/scss",
        rules: {
          "format/prettier": [
            "error",
            {
              ...prettierOptions,
              parser: "scss"
            }
          ]
        }
      },
      {
        files: [GLOB_LESS],
        languageOptions: {
          parser: parserPlain
        },
        name: "antfu/formatter/less",
        rules: {
          "format/prettier": [
            "error",
            {
              ...prettierOptions,
              parser: "less"
            }
          ]
        }
      }
    );
  }
  if (options.html) {
    configs2.push({
      files: [GLOB_HTML],
      languageOptions: {
        parser: parserPlain
      },
      name: "antfu/formatter/html",
      rules: {
        "format/prettier": [
          "error",
          {
            ...prettierOptions,
            parser: "html"
          }
        ]
      }
    });
  }
  if (options.xml) {
    configs2.push({
      files: [GLOB_XML],
      languageOptions: {
        parser: parserPlain
      },
      name: "antfu/formatter/xml",
      rules: {
        "format/prettier": [
          "error",
          {
            ...prettierXmlOptions,
            ...prettierOptions,
            parser: "xml",
            plugins: [
              "@prettier/plugin-xml"
            ]
          }
        ]
      }
    });
  }
  if (options.svg) {
    configs2.push({
      files: [GLOB_SVG],
      languageOptions: {
        parser: parserPlain
      },
      name: "antfu/formatter/svg",
      rules: {
        "format/prettier": [
          "error",
          {
            ...prettierXmlOptions,
            ...prettierOptions,
            parser: "xml",
            plugins: [
              "@prettier/plugin-xml"
            ]
          }
        ]
      }
    });
  }
  if (options.markdown) {
    const formater = options.markdown === true ? "prettier" : options.markdown;
    const GLOB_SLIDEV = !options.slidev ? [] : options.slidev === true ? ["**/slides.md"] : options.slidev.files;
    configs2.push({
      files: [GLOB_MARKDOWN],
      ignores: GLOB_SLIDEV,
      languageOptions: {
        parser: parserPlain
      },
      name: "antfu/formatter/markdown",
      rules: {
        [`format/${formater}`]: [
          "error",
          formater === "prettier" ? {
            ...prettierOptions,
            embeddedLanguageFormatting: "off",
            parser: "markdown"
          } : {
            ...dprintOptions,
            language: "markdown"
          }
        ]
      }
    });
    if (options.slidev) {
      configs2.push({
        files: GLOB_SLIDEV,
        languageOptions: {
          parser: parserPlain
        },
        name: "antfu/formatter/slidev",
        rules: {
          "format/prettier": [
            "error",
            {
              ...prettierOptions,
              embeddedLanguageFormatting: "off",
              parser: "slidev",
              plugins: [
                "prettier-plugin-slidev"
              ]
            }
          ]
        }
      });
    }
  }
  if (options.astro) {
    configs2.push({
      files: [GLOB_ASTRO],
      languageOptions: {
        parser: parserPlain
      },
      name: "antfu/formatter/astro",
      rules: {
        "format/prettier": [
          "error",
          {
            ...prettierOptions,
            parser: "astro",
            plugins: [
              "prettier-plugin-astro"
            ]
          }
        ]
      }
    });
    configs2.push({
      files: [GLOB_ASTRO, GLOB_ASTRO_TS],
      name: "antfu/formatter/astro/disables",
      rules: {
        "style/arrow-parens": "off",
        "style/block-spacing": "off",
        "style/comma-dangle": "off",
        "style/indent": "off",
        "style/no-multi-spaces": "off",
        "style/quotes": "off",
        "style/semi": "off"
      }
    });
  }
  if (options.graphql) {
    configs2.push({
      files: [GLOB_GRAPHQL],
      languageOptions: {
        parser: parserPlain
      },
      name: "antfu/formatter/graphql",
      rules: {
        "format/prettier": [
          "error",
          {
            ...prettierOptions,
            parser: "graphql"
          }
        ]
      }
    });
  }
  return configs2;
}

// src/configs/ignores.ts
async function ignores() {
  return [
    {
      ignores: GLOB_EXCLUDE
    }
  ];
}

// src/configs/imports.ts
async function imports(options = {}) {
  const {
    stylistic: stylistic2 = true
  } = options;
  return [
    {
      name: "antfu/imports/rules",
      plugins: {
        antfu: default2,
        import: pluginImport
      },
      rules: {
        "antfu/import-dedupe": "error",
        "antfu/no-import-dist": "error",
        "antfu/no-import-node-modules-by-path": "error",
        "import/first": "error",
        "import/no-duplicates": "error",
        "import/no-mutable-exports": "error",
        "import/no-named-default": "error",
        "import/no-self-import": "error",
        "import/no-webpack-loader-syntax": "error",
        "import/order": "error",
        ...stylistic2 ? {
          "import/newline-after-import": ["error", { count: 1 }]
        } : {}
      }
    },
    {
      files: ["**/bin/**/*", `**/bin.${GLOB_SRC_EXT}`],
      name: "antfu/imports/disables/bin",
      rules: {
        "antfu/no-import-dist": "off",
        "antfu/no-import-node-modules-by-path": "off"
      }
    }
  ];
}

// src/configs/javascript.ts
import globals from "globals";
async function javascript(options = {}) {
  const {
    isInEditor = false,
    overrides = {}
  } = options;
  return [
    {
      languageOptions: {
        ecmaVersion: 2022,
        globals: {
          ...globals.browser,
          ...globals.es2021,
          ...globals.node,
          document: "readonly",
          navigator: "readonly",
          window: "readonly"
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          },
          ecmaVersion: 2022,
          sourceType: "module"
        },
        sourceType: "module"
      },
      linterOptions: {
        reportUnusedDisableDirectives: true
      },
      name: "antfu/javascript/setup"
    },
    {
      name: "antfu/javascript/rules",
      plugins: {
        "antfu": default2,
        "unused-imports": default6
      },
      rules: {
        "accessor-pairs": ["error", { enforceForClassMembers: true, setWithoutGet: true }],
        "array-callback-return": "error",
        "block-scoped-var": "error",
        "constructor-super": "error",
        "default-case-last": "error",
        "dot-notation": ["error", { allowKeywords: true }],
        "eqeqeq": ["error", "smart"],
        "new-cap": ["error", { capIsNew: false, newIsCap: true, properties: true }],
        "no-alert": "error",
        "no-array-constructor": "error",
        "no-async-promise-executor": "error",
        "no-caller": "error",
        "no-case-declarations": "error",
        "no-class-assign": "error",
        "no-compare-neg-zero": "error",
        "no-cond-assign": ["error", "always"],
        "no-console": ["error", { allow: ["warn", "error"] }],
        "no-const-assign": "error",
        "no-control-regex": "error",
        "no-debugger": "error",
        "no-delete-var": "error",
        "no-dupe-args": "error",
        "no-dupe-class-members": "error",
        "no-dupe-keys": "error",
        "no-duplicate-case": "error",
        "no-empty": ["error", { allowEmptyCatch: true }],
        "no-empty-character-class": "error",
        "no-empty-pattern": "error",
        "no-eval": "error",
        "no-ex-assign": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-boolean-cast": "error",
        "no-fallthrough": "error",
        "no-func-assign": "error",
        "no-global-assign": "error",
        "no-implied-eval": "error",
        "no-import-assign": "error",
        "no-invalid-regexp": "error",
        "no-irregular-whitespace": "error",
        "no-iterator": "error",
        "no-labels": ["error", { allowLoop: false, allowSwitch: false }],
        "no-lone-blocks": "error",
        "no-loss-of-precision": "error",
        "no-misleading-character-class": "error",
        "no-multi-str": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-native-nonconstructor": "error",
        "no-new-wrappers": "error",
        "no-obj-calls": "error",
        "no-octal": "error",
        "no-octal-escape": "error",
        "no-proto": "error",
        "no-prototype-builtins": "error",
        "no-redeclare": ["error", { builtinGlobals: false }],
        "no-regex-spaces": "error",
        "no-restricted-globals": [
          "error",
          { message: "Use `globalThis` instead.", name: "global" },
          { message: "Use `globalThis` instead.", name: "self" }
        ],
        "no-restricted-properties": [
          "error",
          { message: "Use `Object.getPrototypeOf` or `Object.setPrototypeOf` instead.", property: "__proto__" },
          { message: "Use `Object.defineProperty` instead.", property: "__defineGetter__" },
          { message: "Use `Object.defineProperty` instead.", property: "__defineSetter__" },
          { message: "Use `Object.getOwnPropertyDescriptor` instead.", property: "__lookupGetter__" },
          { message: "Use `Object.getOwnPropertyDescriptor` instead.", property: "__lookupSetter__" }
        ],
        "no-restricted-syntax": [
          "error",
          "DebuggerStatement",
          "LabeledStatement",
          "WithStatement",
          "TSEnumDeclaration[const=true]",
          "TSExportAssignment"
        ],
        "no-self-assign": ["error", { props: true }],
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-shadow-restricted-names": "error",
        "no-sparse-arrays": "error",
        "no-template-curly-in-string": "error",
        "no-this-before-super": "error",
        "no-throw-literal": "error",
        "no-undef": "error",
        "no-undef-init": "error",
        "no-unexpected-multiline": "error",
        "no-unmodified-loop-condition": "error",
        "no-unneeded-ternary": ["error", { defaultAssignment: false }],
        "no-unreachable": "error",
        "no-unreachable-loop": "error",
        "no-unsafe-finally": "error",
        "no-unsafe-negation": "error",
        "no-unused-expressions": ["error", {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
          allowTernary: true
        }],
        "no-unused-vars": ["error", {
          args: "none",
          caughtErrors: "none",
          ignoreRestSiblings: true,
          vars: "all"
        }],
        "no-use-before-define": ["error", { classes: false, functions: false, variables: true }],
        "no-useless-backreference": "error",
        "no-useless-call": "error",
        "no-useless-catch": "error",
        "no-useless-computed-key": "error",
        "no-useless-constructor": "error",
        "no-useless-rename": "error",
        "no-useless-return": "error",
        "no-var": "error",
        "no-with": "error",
        "object-shorthand": [
          "error",
          "always",
          {
            avoidQuotes: true,
            ignoreConstructors: false
          }
        ],
        "one-var": ["error", { initialized: "never" }],
        "prefer-arrow-callback": [
          "error",
          {
            allowNamedFunctions: false,
            allowUnboundThis: true
          }
        ],
        "prefer-const": [
          "error",
          {
            destructuring: "all",
            ignoreReadBeforeAssign: true
          }
        ],
        "prefer-exponentiation-operator": "error",
        "prefer-promise-reject-errors": "error",
        "prefer-regex-literals": ["error", { disallowRedundantWrapping: true }],
        "prefer-rest-params": "error",
        "prefer-spread": "error",
        "prefer-template": "error",
        "sort-imports": [
          "error",
          {
            allowSeparatedGroups: false,
            ignoreCase: false,
            ignoreDeclarationSort: true,
            ignoreMemberSort: false,
            memberSyntaxSortOrder: ["none", "all", "multiple", "single"]
          }
        ],
        "symbol-description": "error",
        "unicode-bom": ["error", "never"],
        "unused-imports/no-unused-imports": isInEditor ? "off" : "error",
        "unused-imports/no-unused-vars": [
          "error",
          {
            args: "after-used",
            argsIgnorePattern: "^_",
            ignoreRestSiblings: true,
            vars: "all",
            varsIgnorePattern: "^_"
          }
        ],
        "use-isnan": ["error", { enforceForIndexOf: true, enforceForSwitchCase: true }],
        "valid-typeof": ["error", { requireStringLiterals: true }],
        "vars-on-top": "error",
        "yoda": ["error", "never"],
        ...overrides
      }
    },
    {
      files: [`scripts/${GLOB_SRC}`, `cli.${GLOB_SRC_EXT}`],
      name: "antfu/javascript/disables/cli",
      rules: {
        "no-console": "off"
      }
    }
  ];
}

// src/configs/jsdoc.ts
async function jsdoc(options = {}) {
  const {
    stylistic: stylistic2 = true
  } = options;
  return [
    {
      name: "antfu/jsdoc/rules",
      plugins: {
        jsdoc: await interopDefault(import("eslint-plugin-jsdoc"))
      },
      rules: {
        "jsdoc/check-access": "warn",
        "jsdoc/check-param-names": "warn",
        "jsdoc/check-property-names": "warn",
        "jsdoc/check-types": "warn",
        "jsdoc/empty-tags": "warn",
        "jsdoc/implements-on-classes": "warn",
        "jsdoc/no-defaults": "warn",
        "jsdoc/no-multi-asterisks": "warn",
        "jsdoc/require-param-name": "warn",
        "jsdoc/require-property": "warn",
        "jsdoc/require-property-description": "warn",
        "jsdoc/require-property-name": "warn",
        "jsdoc/require-returns-check": "warn",
        "jsdoc/require-returns-description": "warn",
        "jsdoc/require-yields-check": "warn",
        ...stylistic2 ? {
          "jsdoc/check-alignment": "warn",
          "jsdoc/multiline-blocks": "warn"
        } : {}
      }
    }
  ];
}

// src/configs/jsx.ts
async function jsx() {
  return [
    {
      files: [GLOB_JSX, GLOB_TSX],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          }
        }
      },
      name: "antfu/jsx/setup"
    }
  ];
}

// src/configs/jsonc.ts
async function jsonc(options = {}) {
  const {
    files = [GLOB_JSON, GLOB_JSON5, GLOB_JSONC],
    overrides = {},
    stylistic: stylistic2 = true
  } = options;
  const {
    indent = 2
  } = typeof stylistic2 === "boolean" ? {} : stylistic2;
  const [
    pluginJsonc,
    parserJsonc
  ] = await Promise.all([
    interopDefault(import("eslint-plugin-jsonc")),
    interopDefault(import("jsonc-eslint-parser"))
  ]);
  return [
    {
      name: "antfu/jsonc/setup",
      plugins: {
        jsonc: pluginJsonc
      }
    },
    {
      files,
      languageOptions: {
        parser: parserJsonc
      },
      name: "antfu/jsonc/rules",
      rules: {
        "jsonc/no-bigint-literals": "error",
        "jsonc/no-binary-expression": "error",
        "jsonc/no-binary-numeric-literals": "error",
        "jsonc/no-dupe-keys": "error",
        "jsonc/no-escape-sequence-in-identifier": "error",
        "jsonc/no-floating-decimal": "error",
        "jsonc/no-hexadecimal-numeric-literals": "error",
        "jsonc/no-infinity": "error",
        "jsonc/no-multi-str": "error",
        "jsonc/no-nan": "error",
        "jsonc/no-number-props": "error",
        "jsonc/no-numeric-separators": "error",
        "jsonc/no-octal": "error",
        "jsonc/no-octal-escape": "error",
        "jsonc/no-octal-numeric-literals": "error",
        "jsonc/no-parenthesized": "error",
        "jsonc/no-plus-sign": "error",
        "jsonc/no-regexp-literals": "error",
        "jsonc/no-sparse-arrays": "error",
        "jsonc/no-template-literals": "error",
        "jsonc/no-undefined-value": "error",
        "jsonc/no-unicode-codepoint-escapes": "error",
        "jsonc/no-useless-escape": "error",
        "jsonc/space-unary-ops": "error",
        "jsonc/valid-json-number": "error",
        "jsonc/vue-custom-block/no-parsing-error": "error",
        ...stylistic2 ? {
          "jsonc/array-bracket-spacing": ["error", "never"],
          "jsonc/comma-dangle": ["error", "never"],
          "jsonc/comma-style": ["error", "last"],
          "jsonc/indent": ["error", indent],
          "jsonc/key-spacing": ["error", { afterColon: true, beforeColon: false }],
          "jsonc/object-curly-newline": ["error", { consistent: true, multiline: true }],
          "jsonc/object-curly-spacing": ["error", "always"],
          "jsonc/object-property-newline": ["error", { allowMultiplePropertiesPerLine: true }],
          "jsonc/quote-props": "error",
          "jsonc/quotes": "error"
        } : {},
        ...overrides
      }
    }
  ];
}

// src/configs/markdown.ts
import { mergeProcessors, processorPassThrough } from "eslint-merge-processors";
async function markdown(options = {}) {
  const {
    componentExts = [],
    files = [GLOB_MARKDOWN],
    overrides = {}
  } = options;
  const markdown2 = await interopDefault(import("eslint-plugin-markdown"));
  return [
    {
      name: "antfu/markdown/setup",
      plugins: {
        markdown: markdown2
      }
    },
    {
      files,
      ignores: [GLOB_MARKDOWN_IN_MARKDOWN],
      name: "antfu/markdown/processor",
      // `eslint-plugin-markdown` only creates virtual files for code blocks,
      // but not the markdown file itself. We use `eslint-merge-processors` to
      // add a pass-through processor for the markdown file itself.
      processor: mergeProcessors([
        markdown2.processors.markdown,
        processorPassThrough
      ])
    },
    {
      files,
      languageOptions: {
        parser: parserPlain
      },
      name: "antfu/markdown/parser"
    },
    {
      files: [
        GLOB_MARKDOWN_CODE,
        ...componentExts.map((ext) => `${GLOB_MARKDOWN}/**/*.${ext}`)
      ],
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            impliedStrict: true
          }
        }
      },
      name: "antfu/markdown/disables",
      rules: {
        "import/newline-after-import": "off",
        "no-alert": "off",
        "no-console": "off",
        "no-labels": "off",
        "no-lone-blocks": "off",
        "no-restricted-syntax": "off",
        "no-undef": "off",
        "no-unused-expressions": "off",
        "no-unused-labels": "off",
        "no-unused-vars": "off",
        "node/prefer-global/process": "off",
        "style/comma-dangle": "off",
        "style/eol-last": "off",
        "ts/consistent-type-imports": "off",
        "ts/no-namespace": "off",
        "ts/no-redeclare": "off",
        "ts/no-require-imports": "off",
        "ts/no-unused-expressions": "off",
        "ts/no-unused-vars": "off",
        "ts/no-use-before-define": "off",
        "ts/no-var-requires": "off",
        "unicode-bom": "off",
        "unused-imports/no-unused-imports": "off",
        "unused-imports/no-unused-vars": "off",
        ...overrides
      }
    }
  ];
}

// src/configs/node.ts
async function node() {
  return [
    {
      name: "antfu/node/rules",
      plugins: {
        node: default4
      },
      rules: {
        "node/handle-callback-err": ["error", "^(err|error)$"],
        "node/no-deprecated-api": "error",
        "node/no-exports-assign": "error",
        "node/no-new-require": "error",
        "node/no-path-concat": "error",
        "node/prefer-global/buffer": ["error", "never"],
        "node/prefer-global/process": ["error", "never"],
        "node/process-exit-as-throw": "error"
      }
    }
  ];
}

// src/configs/perfectionist.ts
async function perfectionist() {
  return [
    {
      name: "antfu/perfectionist/setup",
      plugins: {
        perfectionist: default7
      }
    }
  ];
}

// src/configs/react.ts
import { isPackageExists as isPackageExists3 } from "local-pkg";
var ReactRefreshAllowConstantExportPackages = [
  "vite"
];
var RemixPackages = [
  "@remix-run/node",
  "@remix-run/react",
  "@remix-run/serve",
  "@remix-run/dev"
];
var NextJsPackages = [
  "next"
];
async function react(options = {}) {
  const {
    files = [GLOB_SRC],
    overrides = {}
  } = options;
  await ensurePackages([
    "@eslint-react/eslint-plugin",
    "eslint-plugin-react-hooks",
    "eslint-plugin-react-refresh"
  ]);
  const tsconfigPath = options?.tsconfigPath ? toArray(options.tsconfigPath) : void 0;
  const isTypeAware = !!tsconfigPath;
  const [
    pluginReact,
    pluginReactHooks,
    pluginReactRefresh,
    parserTs
  ] = await Promise.all([
    interopDefault(import("@eslint-react/eslint-plugin")),
    interopDefault(import("eslint-plugin-react-hooks")),
    interopDefault(import("eslint-plugin-react-refresh")),
    interopDefault(import("@typescript-eslint/parser"))
  ]);
  const isAllowConstantExport = ReactRefreshAllowConstantExportPackages.some((i) => isPackageExists3(i));
  const isUsingRemix = RemixPackages.some((i) => isPackageExists3(i));
  const isUsingNext = NextJsPackages.some((i) => isPackageExists3(i));
  const plugins = pluginReact.configs.all.plugins;
  return [
    {
      name: "antfu/react/setup",
      plugins: {
        "react": plugins["@eslint-react"],
        "react-dom": plugins["@eslint-react/dom"],
        "react-hooks": pluginReactHooks,
        "react-hooks-extra": plugins["@eslint-react/hooks-extra"],
        "react-naming-convention": plugins["@eslint-react/naming-convention"],
        "react-refresh": pluginReactRefresh
      }
    },
    {
      files,
      languageOptions: {
        parser: parserTs,
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          },
          ...isTypeAware ? { project: tsconfigPath } : {}
        },
        sourceType: "module"
      },
      name: "antfu/react/rules",
      rules: {
        // recommended rules from @eslint-react/dom
        "react-dom/no-children-in-void-dom-elements": "warn",
        "react-dom/no-dangerously-set-innerhtml": "warn",
        "react-dom/no-dangerously-set-innerhtml-with-children": "error",
        "react-dom/no-find-dom-node": "error",
        "react-dom/no-missing-button-type": "warn",
        "react-dom/no-missing-iframe-sandbox": "warn",
        "react-dom/no-namespace": "error",
        "react-dom/no-render-return-value": "error",
        "react-dom/no-script-url": "warn",
        "react-dom/no-unsafe-iframe-sandbox": "warn",
        "react-dom/no-unsafe-target-blank": "warn",
        // recommended rules react-hooks
        "react-hooks/exhaustive-deps": "warn",
        "react-hooks/rules-of-hooks": "error",
        // react refresh
        "react-refresh/only-export-components": [
          "warn",
          {
            allowConstantExport: isAllowConstantExport,
            allowExportNames: [
              ...isUsingNext ? [
                "config",
                "generateStaticParams",
                "metadata",
                "generateMetadata",
                "viewport",
                "generateViewport"
              ] : [],
              ...isUsingRemix ? [
                "meta",
                "links",
                "headers",
                "loader",
                "action"
              ] : []
            ]
          }
        ],
        // recommended rules from @eslint-react
        "react/ensure-forward-ref-using-ref": "warn",
        "react/no-access-state-in-setstate": "error",
        "react/no-array-index-key": "warn",
        "react/no-children-count": "warn",
        "react/no-children-for-each": "warn",
        "react/no-children-map": "warn",
        "react/no-children-only": "warn",
        "react/no-children-prop": "warn",
        "react/no-children-to-array": "warn",
        "react/no-clone-element": "warn",
        "react/no-comment-textnodes": "warn",
        "react/no-component-will-mount": "error",
        "react/no-component-will-receive-props": "error",
        "react/no-component-will-update": "error",
        "react/no-create-ref": "error",
        "react/no-direct-mutation-state": "error",
        "react/no-duplicate-key": "error",
        "react/no-implicit-key": "error",
        "react/no-missing-key": "error",
        "react/no-nested-components": "warn",
        "react/no-redundant-should-component-update": "error",
        "react/no-set-state-in-component-did-mount": "warn",
        "react/no-set-state-in-component-did-update": "warn",
        "react/no-set-state-in-component-will-update": "warn",
        "react/no-string-refs": "error",
        "react/no-unsafe-component-will-mount": "warn",
        "react/no-unsafe-component-will-receive-props": "warn",
        "react/no-unsafe-component-will-update": "warn",
        "react/no-unstable-context-value": "error",
        "react/no-unstable-default-props": "error",
        "react/no-unused-class-component-members": "warn",
        "react/no-unused-state": "warn",
        "react/no-useless-fragment": "warn",
        "react/prefer-destructuring-assignment": "warn",
        "react/prefer-shorthand-boolean": "warn",
        "react/prefer-shorthand-fragment": "warn",
        ...isTypeAware ? {
          "react/no-leaked-conditional-rendering": "warn"
        } : {},
        // overrides
        ...overrides
      }
    }
  ];
}

// src/configs/solid.ts
async function solid(options = {}) {
  const {
    files = [GLOB_JSX, GLOB_TSX],
    overrides = {},
    typescript: typescript2 = true
  } = options;
  await ensurePackages([
    "eslint-plugin-solid"
  ]);
  const tsconfigPath = options?.tsconfigPath ? toArray(options.tsconfigPath) : void 0;
  const isTypeAware = !!tsconfigPath;
  const [
    pluginSolid,
    parserTs
  ] = await Promise.all([
    interopDefault(import("eslint-plugin-solid")),
    interopDefault(import("@typescript-eslint/parser"))
  ]);
  return [
    {
      name: "antfu/solid/setup",
      plugins: {
        solid: pluginSolid
      }
    },
    {
      files,
      languageOptions: {
        parser: parserTs,
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          },
          ...isTypeAware ? { project: tsconfigPath } : {}
        },
        sourceType: "module"
      },
      name: "antfu/solid/rules",
      rules: {
        // reactivity
        "solid/components-return-once": "warn",
        "solid/event-handlers": ["error", {
          // if true, don't warn on ambiguously named event handlers like `onclick` or `onchange`
          ignoreCase: false,
          // if true, warn when spreading event handlers onto JSX. Enable for Solid < v1.6.
          warnOnSpread: false
        }],
        // these rules are mostly style suggestions
        "solid/imports": "error",
        // identifier usage is important
        "solid/jsx-no-duplicate-props": "error",
        "solid/jsx-no-script-url": "error",
        "solid/jsx-no-undef": "error",
        "solid/jsx-uses-vars": "error",
        "solid/no-destructure": "error",
        // security problems
        "solid/no-innerhtml": ["error", { allowStatic: true }],
        "solid/no-react-deps": "error",
        "solid/no-react-specific-props": "error",
        "solid/no-unknown-namespaces": "error",
        "solid/prefer-for": "error",
        "solid/reactivity": "warn",
        "solid/self-closing-comp": "error",
        "solid/style-prop": ["error", { styleProps: ["style", "css"] }],
        ...typescript2 ? {
          "solid/jsx-no-undef": ["error", { typescriptEnabled: true }],
          "solid/no-unknown-namespaces": "off"
        } : {},
        // overrides
        ...overrides
      }
    }
  ];
}

// src/configs/sort.ts
async function sortPackageJson() {
  return [
    {
      files: ["**/package.json"],
      name: "antfu/sort/package-json",
      rules: {
        "jsonc/sort-array-values": [
          "error",
          {
            order: { type: "asc" },
            pathPattern: "^files$"
          }
        ],
        "jsonc/sort-keys": [
          "error",
          {
            order: [
              "publisher",
              "name",
              "displayName",
              "type",
              "version",
              "private",
              "packageManager",
              "description",
              "author",
              "contributors",
              "license",
              "funding",
              "homepage",
              "repository",
              "bugs",
              "keywords",
              "categories",
              "sideEffects",
              "exports",
              "main",
              "module",
              "unpkg",
              "jsdelivr",
              "types",
              "typesVersions",
              "bin",
              "icon",
              "files",
              "engines",
              "activationEvents",
              "contributes",
              "scripts",
              "peerDependencies",
              "peerDependenciesMeta",
              "dependencies",
              "optionalDependencies",
              "devDependencies",
              "pnpm",
              "overrides",
              "resolutions",
              "husky",
              "simple-git-hooks",
              "lint-staged",
              "eslintConfig"
            ],
            pathPattern: "^$"
          },
          {
            order: { type: "asc" },
            pathPattern: "^(?:dev|peer|optional|bundled)?[Dd]ependencies(Meta)?$"
          },
          {
            order: { type: "asc" },
            pathPattern: "^(?:resolutions|overrides|pnpm.overrides)$"
          },
          {
            order: [
              "types",
              "import",
              "require",
              "default"
            ],
            pathPattern: "^exports.*$"
          },
          {
            order: [
              // client hooks only
              "pre-commit",
              "prepare-commit-msg",
              "commit-msg",
              "post-commit",
              "pre-rebase",
              "post-rewrite",
              "post-checkout",
              "post-merge",
              "pre-push",
              "pre-auto-gc"
            ],
            pathPattern: "^(?:gitHooks|husky|simple-git-hooks)$"
          }
        ]
      }
    }
  ];
}
function sortTsconfig() {
  return [
    {
      files: ["**/tsconfig.json", "**/tsconfig.*.json"],
      name: "antfu/sort/tsconfig-json",
      rules: {
        "jsonc/sort-keys": [
          "error",
          {
            order: [
              "extends",
              "compilerOptions",
              "references",
              "files",
              "include",
              "exclude"
            ],
            pathPattern: "^$"
          },
          {
            order: [
              /* Projects */
              "incremental",
              "composite",
              "tsBuildInfoFile",
              "disableSourceOfProjectReferenceRedirect",
              "disableSolutionSearching",
              "disableReferencedProjectLoad",
              /* Language and Environment */
              "target",
              "jsx",
              "jsxFactory",
              "jsxFragmentFactory",
              "jsxImportSource",
              "lib",
              "moduleDetection",
              "noLib",
              "reactNamespace",
              "useDefineForClassFields",
              "emitDecoratorMetadata",
              "experimentalDecorators",
              /* Modules */
              "baseUrl",
              "rootDir",
              "rootDirs",
              "customConditions",
              "module",
              "moduleResolution",
              "moduleSuffixes",
              "noResolve",
              "paths",
              "resolveJsonModule",
              "resolvePackageJsonExports",
              "resolvePackageJsonImports",
              "typeRoots",
              "types",
              "allowArbitraryExtensions",
              "allowImportingTsExtensions",
              "allowUmdGlobalAccess",
              /* JavaScript Support */
              "allowJs",
              "checkJs",
              "maxNodeModuleJsDepth",
              /* Type Checking */
              "strict",
              "strictBindCallApply",
              "strictFunctionTypes",
              "strictNullChecks",
              "strictPropertyInitialization",
              "allowUnreachableCode",
              "allowUnusedLabels",
              "alwaysStrict",
              "exactOptionalPropertyTypes",
              "noFallthroughCasesInSwitch",
              "noImplicitAny",
              "noImplicitOverride",
              "noImplicitReturns",
              "noImplicitThis",
              "noPropertyAccessFromIndexSignature",
              "noUncheckedIndexedAccess",
              "noUnusedLocals",
              "noUnusedParameters",
              "useUnknownInCatchVariables",
              /* Emit */
              "declaration",
              "declarationDir",
              "declarationMap",
              "downlevelIteration",
              "emitBOM",
              "emitDeclarationOnly",
              "importHelpers",
              "importsNotUsedAsValues",
              "inlineSourceMap",
              "inlineSources",
              "mapRoot",
              "newLine",
              "noEmit",
              "noEmitHelpers",
              "noEmitOnError",
              "outDir",
              "outFile",
              "preserveConstEnums",
              "preserveValueImports",
              "removeComments",
              "sourceMap",
              "sourceRoot",
              "stripInternal",
              /* Interop Constraints */
              "allowSyntheticDefaultImports",
              "esModuleInterop",
              "forceConsistentCasingInFileNames",
              "isolatedDeclarations",
              "isolatedModules",
              "preserveSymlinks",
              "verbatimModuleSyntax",
              /* Completeness */
              "skipDefaultLibCheck",
              "skipLibCheck"
            ],
            pathPattern: "^compilerOptions$"
          }
        ]
      }
    }
  ];
}

// src/configs/svelte.ts
async function svelte(options = {}) {
  const {
    files = [GLOB_SVELTE],
    overrides = {},
    stylistic: stylistic2 = true
  } = options;
  const {
    indent = 2,
    quotes = "single"
  } = typeof stylistic2 === "boolean" ? {} : stylistic2;
  await ensurePackages([
    "eslint-plugin-svelte"
  ]);
  const [
    pluginSvelte,
    parserSvelte
  ] = await Promise.all([
    interopDefault(import("eslint-plugin-svelte")),
    interopDefault(import("svelte-eslint-parser"))
  ]);
  return [
    {
      name: "antfu/svelte/setup",
      plugins: {
        svelte: pluginSvelte
      }
    },
    {
      files,
      languageOptions: {
        parser: parserSvelte,
        parserOptions: {
          extraFileExtensions: [".svelte"],
          parser: options.typescript ? await interopDefault(import("@typescript-eslint/parser")) : null
        }
      },
      name: "antfu/svelte/rules",
      processor: pluginSvelte.processors[".svelte"],
      rules: {
        "import/no-mutable-exports": "off",
        "no-undef": "off",
        // incompatible with most recent (attribute-form) generic types RFC
        "no-unused-vars": ["error", {
          args: "none",
          caughtErrors: "none",
          ignoreRestSiblings: true,
          vars: "all",
          varsIgnorePattern: "^(\\$\\$Props$|\\$\\$Events$|\\$\\$Slots$)"
        }],
        "svelte/comment-directive": "error",
        "svelte/no-at-debug-tags": "warn",
        "svelte/no-at-html-tags": "error",
        "svelte/no-dupe-else-if-blocks": "error",
        "svelte/no-dupe-style-properties": "error",
        "svelte/no-dupe-use-directives": "error",
        "svelte/no-dynamic-slot-name": "error",
        "svelte/no-export-load-in-svelte-module-in-kit-pages": "error",
        "svelte/no-inner-declarations": "error",
        "svelte/no-not-function-handler": "error",
        "svelte/no-object-in-text-mustaches": "error",
        "svelte/no-reactive-functions": "error",
        "svelte/no-reactive-literals": "error",
        "svelte/no-shorthand-style-property-overrides": "error",
        "svelte/no-unknown-style-directive-property": "error",
        "svelte/no-unused-svelte-ignore": "error",
        "svelte/no-useless-mustaches": "error",
        "svelte/require-store-callbacks-use-set-param": "error",
        "svelte/system": "error",
        "svelte/valid-each-key": "error",
        "unused-imports/no-unused-vars": [
          "error",
          {
            args: "after-used",
            argsIgnorePattern: "^_",
            vars: "all",
            varsIgnorePattern: "^(_|\\$\\$Props$|\\$\\$Events$|\\$\\$Slots$)"
          }
        ],
        ...stylistic2 ? {
          "style/indent": "off",
          // superseded by svelte/indent
          "style/no-trailing-spaces": "off",
          // superseded by svelte/no-trailing-spaces
          "svelte/derived-has-same-inputs-outputs": "error",
          "svelte/html-closing-bracket-spacing": "error",
          "svelte/html-quotes": ["error", { prefer: quotes }],
          "svelte/indent": ["error", { alignAttributesVertically: true, indent }],
          "svelte/mustache-spacing": "error",
          "svelte/no-spaces-around-equal-signs-in-attribute": "error",
          "svelte/no-trailing-spaces": "error",
          "svelte/spaced-html-comment": "error"
        } : {},
        ...overrides
      }
    }
  ];
}

// src/configs/test.ts
var _pluginTest;
async function test(options = {}) {
  const {
    files = GLOB_TESTS,
    isInEditor = false,
    overrides = {}
  } = options;
  const [
    pluginVitest,
    pluginNoOnlyTests
  ] = await Promise.all([
    interopDefault(import("@vitest/eslint-plugin")),
    // @ts-expect-error missing types
    interopDefault(import("eslint-plugin-no-only-tests"))
  ]);
  _pluginTest = _pluginTest || {
    ...pluginVitest,
    rules: {
      ...pluginVitest.rules,
      // extend `test/no-only-tests` rule
      ...pluginNoOnlyTests.rules
    }
  };
  return [
    {
      name: "antfu/test/setup",
      plugins: {
        test: _pluginTest
      }
    },
    {
      files,
      name: "antfu/test/rules",
      rules: {
        "node/prefer-global/process": "off",
        "test/consistent-test-it": ["error", { fn: "it", withinDescribe: "it" }],
        "test/no-identical-title": "error",
        "test/no-import-node-test": "error",
        "test/no-only-tests": isInEditor ? "off" : "error",
        "test/prefer-hooks-in-order": "error",
        "test/prefer-lowercase-title": "error",
        "ts/explicit-function-return-type": "off",
        ...overrides
      }
    }
  ];
}

// src/configs/toml.ts
async function toml(options = {}) {
  const {
    files = [GLOB_TOML],
    overrides = {},
    stylistic: stylistic2 = true
  } = options;
  const {
    indent = 2
  } = typeof stylistic2 === "boolean" ? {} : stylistic2;
  const [
    pluginToml,
    parserToml
  ] = await Promise.all([
    interopDefault(import("eslint-plugin-toml")),
    interopDefault(import("toml-eslint-parser"))
  ]);
  return [
    {
      name: "antfu/toml/setup",
      plugins: {
        toml: pluginToml
      }
    },
    {
      files,
      languageOptions: {
        parser: parserToml
      },
      name: "antfu/toml/rules",
      rules: {
        "style/spaced-comment": "off",
        "toml/comma-style": "error",
        "toml/keys-order": "error",
        "toml/no-space-dots": "error",
        "toml/no-unreadable-number-separator": "error",
        "toml/precision-of-fractional-seconds": "error",
        "toml/precision-of-integer": "error",
        "toml/tables-order": "error",
        "toml/vue-custom-block/no-parsing-error": "error",
        ...stylistic2 ? {
          "toml/array-bracket-newline": "error",
          "toml/array-bracket-spacing": "error",
          "toml/array-element-newline": "error",
          "toml/indent": ["error", indent === "tab" ? 2 : indent],
          "toml/inline-table-curly-spacing": "error",
          "toml/key-spacing": "error",
          "toml/padding-line-between-pairs": "error",
          "toml/padding-line-between-tables": "error",
          "toml/quoted-keys": "error",
          "toml/spaced-comment": "error",
          "toml/table-bracket-spacing": "error"
        } : {},
        ...overrides
      }
    }
  ];
}

// src/configs/typescript.ts
import process2 from "node:process";
async function typescript(options = {}) {
  const {
    componentExts = [],
    overrides = {},
    overridesTypeAware = {},
    parserOptions = {},
    type = "app"
  } = options;
  const files = options.files ?? [
    GLOB_TS,
    GLOB_TSX,
    ...componentExts.map((ext) => `**/*.${ext}`)
  ];
  const filesTypeAware = options.filesTypeAware ?? [GLOB_TS, GLOB_TSX];
  const ignoresTypeAware = options.ignoresTypeAware ?? [
    `${GLOB_MARKDOWN}/**`,
    GLOB_ASTRO_TS
  ];
  const tsconfigPath = options?.tsconfigPath ? options.tsconfigPath : void 0;
  const isTypeAware = !!tsconfigPath;
  const typeAwareRules = {
    "dot-notation": "off",
    "no-implied-eval": "off",
    "ts/await-thenable": "error",
    "ts/dot-notation": ["error", { allowKeywords: true }],
    "ts/no-floating-promises": "error",
    "ts/no-for-in-array": "error",
    "ts/no-implied-eval": "error",
    "ts/no-misused-promises": "error",
    "ts/no-unnecessary-type-assertion": "error",
    "ts/no-unsafe-argument": "error",
    "ts/no-unsafe-assignment": "error",
    "ts/no-unsafe-call": "error",
    "ts/no-unsafe-member-access": "error",
    "ts/no-unsafe-return": "error",
    "ts/promise-function-async": "error",
    "ts/restrict-plus-operands": "error",
    "ts/restrict-template-expressions": "error",
    "ts/return-await": ["error", "in-try-catch"],
    "ts/strict-boolean-expressions": ["error", { allowNullableBoolean: true, allowNullableObject: true }],
    "ts/switch-exhaustiveness-check": "error",
    "ts/unbound-method": "error"
  };
  const [
    pluginTs,
    parserTs
  ] = await Promise.all([
    interopDefault(import("@typescript-eslint/eslint-plugin")),
    interopDefault(import("@typescript-eslint/parser"))
  ]);
  function makeParser(typeAware, files2, ignores2) {
    return {
      files: files2,
      ...ignores2 ? { ignores: ignores2 } : {},
      languageOptions: {
        parser: parserTs,
        parserOptions: {
          extraFileExtensions: componentExts.map((ext) => `.${ext}`),
          sourceType: "module",
          ...typeAware ? {
            projectService: {
              allowDefaultProject: ["./*.js"],
              defaultProject: tsconfigPath
            },
            tsconfigRootDir: process2.cwd()
          } : {},
          ...parserOptions
        }
      },
      name: `antfu/typescript/${typeAware ? "type-aware-parser" : "parser"}`
    };
  }
  return [
    {
      // Install the plugins without globs, so they can be configured separately.
      name: "antfu/typescript/setup",
      plugins: {
        antfu: default2,
        ts: pluginTs
      }
    },
    // assign type-aware parser for type-aware files and type-unaware parser for the rest
    ...isTypeAware ? [
      makeParser(false, files),
      makeParser(true, filesTypeAware, ignoresTypeAware)
    ] : [
      makeParser(false, files)
    ],
    {
      files,
      name: "antfu/typescript/rules",
      rules: {
        ...renameRules(
          pluginTs.configs["eslint-recommended"].overrides[0].rules,
          { "@typescript-eslint": "ts" }
        ),
        ...renameRules(
          pluginTs.configs.strict.rules,
          { "@typescript-eslint": "ts" }
        ),
        "no-dupe-class-members": "off",
        "no-loss-of-precision": "off",
        "no-redeclare": "off",
        "no-use-before-define": "off",
        "no-useless-constructor": "off",
        "ts/ban-ts-comment": ["error", { "ts-expect-error": "allow-with-description" }],
        "ts/consistent-type-definitions": ["error", "interface"],
        "ts/consistent-type-imports": ["error", {
          disallowTypeAnnotations: false,
          prefer: "type-imports"
        }],
        "ts/method-signature-style": ["error", "property"],
        // https://www.totaltypescript.com/method-shorthand-syntax-considered-harmful
        "ts/no-dupe-class-members": "error",
        "ts/no-dynamic-delete": "off",
        "ts/no-empty-object-type": ["error", { allowInterfaces: "always" }],
        "ts/no-explicit-any": "off",
        "ts/no-extraneous-class": "off",
        "ts/no-import-type-side-effects": "error",
        "ts/no-invalid-void-type": "off",
        "ts/no-loss-of-precision": "error",
        "ts/no-non-null-assertion": "off",
        "ts/no-redeclare": "error",
        "ts/no-require-imports": "error",
        "ts/no-unused-vars": "off",
        "ts/no-use-before-define": ["error", { classes: false, functions: false, variables: true }],
        "ts/no-useless-constructor": "off",
        "ts/no-wrapper-object-types": "error",
        "ts/triple-slash-reference": "off",
        "ts/unified-signatures": "off",
        ...type === "lib" ? {
          "ts/explicit-function-return-type": ["error", {
            allowExpressions: true,
            allowHigherOrderFunctions: true,
            allowIIFEs: true
          }]
        } : {},
        ...overrides
      }
    },
    ...isTypeAware ? [{
      files: filesTypeAware,
      ignores: ignoresTypeAware,
      name: "antfu/typescript/rules-type-aware",
      rules: {
        ...typeAwareRules,
        ...overridesTypeAware
      }
    }] : [],
    {
      files: ["**/*.d.?([cm])ts"],
      name: "antfu/typescript/disables/dts",
      rules: {
        "eslint-comments/no-unlimited-disable": "off",
        "import/no-duplicates": "off",
        "no-restricted-syntax": "off",
        "unused-imports/no-unused-vars": "off"
      }
    },
    {
      files: ["**/*.{test,spec}.ts?(x)"],
      name: "antfu/typescript/disables/test",
      rules: {
        "no-unused-expressions": "off"
      }
    },
    {
      files: ["**/*.js", "**/*.cjs"],
      name: "antfu/typescript/disables/cjs",
      rules: {
        "ts/no-require-imports": "off",
        "ts/no-var-requires": "off"
      }
    }
  ];
}

// src/configs/unicorn.ts
async function unicorn() {
  return [
    {
      name: "antfu/unicorn/rules",
      plugins: {
        unicorn: default5
      },
      rules: {
        // Pass error message when throwing errors
        "unicorn/error-message": "error",
        // Uppercase regex escapes
        "unicorn/escape-case": "error",
        // Array.isArray instead of instanceof
        "unicorn/no-instanceof-array": "error",
        // Ban `new Array` as `Array` constructor's params are ambiguous
        "unicorn/no-new-array": "error",
        // Prevent deprecated `new Buffer()`
        "unicorn/no-new-buffer": "error",
        // Lowercase number formatting for octal, hex, binary (0x1'error' instead of 0X1'error')
        "unicorn/number-literal-case": "error",
        // textContent instead of innerText
        "unicorn/prefer-dom-node-text-content": "error",
        // includes over indexOf when checking for existence
        "unicorn/prefer-includes": "error",
        // Prefer using the node: protocol
        "unicorn/prefer-node-protocol": "error",
        // Prefer using number properties like `Number.isNaN` rather than `isNaN`
        "unicorn/prefer-number-properties": "error",
        // String methods startsWith/endsWith instead of more complicated stuff
        "unicorn/prefer-string-starts-ends-with": "error",
        // Enforce throwing type error when throwing error while checking typeof
        "unicorn/prefer-type-error": "error",
        // Use new when throwing error
        "unicorn/throw-new-error": "error"
      }
    }
  ];
}

// src/configs/unocss.ts
async function unocss(options = {}) {
  const {
    attributify = true,
    strict = false
  } = options;
  await ensurePackages([
    "@unocss/eslint-plugin"
  ]);
  const [
    pluginUnoCSS
  ] = await Promise.all([
    interopDefault(import("@unocss/eslint-plugin"))
  ]);
  return [
    {
      name: "antfu/unocss",
      plugins: {
        unocss: pluginUnoCSS
      },
      rules: {
        "unocss/order": "warn",
        ...attributify ? {
          "unocss/order-attributify": "warn"
        } : {},
        ...strict ? {
          "unocss/blocklist": "error"
        } : {}
      }
    }
  ];
}

// src/configs/vue.ts
import { mergeProcessors as mergeProcessors2 } from "eslint-merge-processors";
async function vue(options = {}) {
  const {
    files = [GLOB_VUE],
    overrides = {},
    stylistic: stylistic2 = true,
    vueVersion = 3
  } = options;
  const sfcBlocks = options.sfcBlocks === true ? {} : options.sfcBlocks ?? {};
  const {
    indent = 2
  } = typeof stylistic2 === "boolean" ? {} : stylistic2;
  const [
    pluginVue,
    parserVue,
    processorVueBlocks
  ] = await Promise.all([
    // @ts-expect-error missing types
    interopDefault(import("eslint-plugin-vue")),
    interopDefault(import("vue-eslint-parser")),
    interopDefault(import("eslint-processor-vue-blocks"))
  ]);
  return [
    {
      // This allows Vue plugin to work with auto imports
      // https://github.com/vuejs/eslint-plugin-vue/pull/2422
      languageOptions: {
        globals: {
          computed: "readonly",
          defineEmits: "readonly",
          defineExpose: "readonly",
          defineProps: "readonly",
          onMounted: "readonly",
          onUnmounted: "readonly",
          reactive: "readonly",
          ref: "readonly",
          shallowReactive: "readonly",
          shallowRef: "readonly",
          toRef: "readonly",
          toRefs: "readonly",
          watch: "readonly",
          watchEffect: "readonly"
        }
      },
      name: "antfu/vue/setup",
      plugins: {
        vue: pluginVue
      }
    },
    {
      files,
      languageOptions: {
        parser: parserVue,
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          },
          extraFileExtensions: [".vue"],
          parser: options.typescript ? await interopDefault(import("@typescript-eslint/parser")) : null,
          sourceType: "module"
        }
      },
      name: "antfu/vue/rules",
      processor: sfcBlocks === false ? pluginVue.processors[".vue"] : mergeProcessors2([
        pluginVue.processors[".vue"],
        processorVueBlocks({
          ...sfcBlocks,
          blocks: {
            styles: true,
            ...sfcBlocks.blocks
          }
        })
      ]),
      rules: {
        ...pluginVue.configs.base.rules,
        ...vueVersion === 2 ? {
          ...pluginVue.configs.essential.rules,
          ...pluginVue.configs["strongly-recommended"].rules,
          ...pluginVue.configs.recommended.rules
        } : {
          ...pluginVue.configs["vue3-essential"].rules,
          ...pluginVue.configs["vue3-strongly-recommended"].rules,
          ...pluginVue.configs["vue3-recommended"].rules
        },
        "node/prefer-global/process": "off",
        "vue/block-order": ["error", {
          order: ["script", "template", "style"]
        }],
        "vue/component-name-in-template-casing": ["error", "PascalCase"],
        "vue/component-options-name-casing": ["error", "PascalCase"],
        // this is deprecated
        "vue/component-tags-order": "off",
        "vue/custom-event-name-casing": ["error", "camelCase"],
        "vue/define-macros-order": ["error", {
          order: ["defineOptions", "defineProps", "defineEmits", "defineSlots"]
        }],
        "vue/dot-location": ["error", "property"],
        "vue/dot-notation": ["error", { allowKeywords: true }],
        "vue/eqeqeq": ["error", "smart"],
        "vue/html-indent": ["error", indent],
        "vue/html-quotes": ["error", "double"],
        "vue/max-attributes-per-line": "off",
        "vue/multi-word-component-names": "off",
        "vue/no-dupe-keys": "off",
        "vue/no-empty-pattern": "error",
        "vue/no-irregular-whitespace": "error",
        "vue/no-loss-of-precision": "error",
        "vue/no-restricted-syntax": [
          "error",
          "DebuggerStatement",
          "LabeledStatement",
          "WithStatement"
        ],
        "vue/no-restricted-v-bind": ["error", "/^v-/"],
        "vue/no-setup-props-reactivity-loss": "off",
        "vue/no-sparse-arrays": "error",
        "vue/no-unused-refs": "error",
        "vue/no-useless-v-bind": "error",
        "vue/no-v-html": "off",
        "vue/object-shorthand": [
          "error",
          "always",
          {
            avoidQuotes: true,
            ignoreConstructors: false
          }
        ],
        "vue/prefer-separate-static-class": "error",
        "vue/prefer-template": "error",
        "vue/prop-name-casing": ["error", "camelCase"],
        "vue/require-default-prop": "off",
        "vue/require-prop-types": "off",
        "vue/space-infix-ops": "error",
        "vue/space-unary-ops": ["error", { nonwords: false, words: true }],
        ...stylistic2 ? {
          "vue/array-bracket-spacing": ["error", "never"],
          "vue/arrow-spacing": ["error", { after: true, before: true }],
          "vue/block-spacing": ["error", "always"],
          "vue/block-tag-newline": ["error", {
            multiline: "always",
            singleline: "always"
          }],
          "vue/brace-style": ["error", "stroustrup", { allowSingleLine: true }],
          "vue/comma-dangle": ["error", "always-multiline"],
          "vue/comma-spacing": ["error", { after: true, before: false }],
          "vue/comma-style": ["error", "last"],
          "vue/html-comment-content-spacing": ["error", "always", {
            exceptions: ["-"]
          }],
          "vue/key-spacing": ["error", { afterColon: true, beforeColon: false }],
          "vue/keyword-spacing": ["error", { after: true, before: true }],
          "vue/object-curly-newline": "off",
          "vue/object-curly-spacing": ["error", "always"],
          "vue/object-property-newline": ["error", { allowMultiplePropertiesPerLine: true }],
          "vue/operator-linebreak": ["error", "before"],
          "vue/padding-line-between-blocks": ["error", "always"],
          "vue/quote-props": ["error", "consistent-as-needed"],
          "vue/space-in-parens": ["error", "never"],
          "vue/template-curly-spacing": "error"
        } : {},
        ...overrides
      }
    }
  ];
}

// src/configs/yaml.ts
async function yaml(options = {}) {
  const {
    files = [GLOB_YAML],
    overrides = {},
    stylistic: stylistic2 = true
  } = options;
  const {
    indent = 2,
    quotes = "single"
  } = typeof stylistic2 === "boolean" ? {} : stylistic2;
  const [
    pluginYaml,
    parserYaml
  ] = await Promise.all([
    interopDefault(import("eslint-plugin-yml")),
    interopDefault(import("yaml-eslint-parser"))
  ]);
  return [
    {
      name: "antfu/yaml/setup",
      plugins: {
        yaml: pluginYaml
      }
    },
    {
      files,
      languageOptions: {
        parser: parserYaml
      },
      name: "antfu/yaml/rules",
      rules: {
        "style/spaced-comment": "off",
        "yaml/block-mapping": "error",
        "yaml/block-sequence": "error",
        "yaml/no-empty-key": "error",
        "yaml/no-empty-sequence-entry": "error",
        "yaml/no-irregular-whitespace": "error",
        "yaml/plain-scalar": "error",
        "yaml/vue-custom-block/no-parsing-error": "error",
        ...stylistic2 ? {
          "yaml/block-mapping-question-indicator-newline": "error",
          "yaml/block-sequence-hyphen-indicator-newline": "error",
          "yaml/flow-mapping-curly-newline": "error",
          "yaml/flow-mapping-curly-spacing": "error",
          "yaml/flow-sequence-bracket-newline": "error",
          "yaml/flow-sequence-bracket-spacing": "error",
          "yaml/indent": ["error", indent === "tab" ? 2 : indent],
          "yaml/key-spacing": "error",
          "yaml/no-tab-indent": "error",
          "yaml/quotes": ["error", { avoidEscape: false, prefer: quotes }],
          "yaml/spaced-comment": "error"
        } : {},
        ...overrides
      }
    }
  ];
}

// src/configs/regexp.ts
import { configs } from "eslint-plugin-regexp";
async function regexp(options = {}) {
  const config = configs["flat/recommended"];
  const rules = {
    ...config.rules
  };
  if (options.level === "warn") {
    for (const key in rules) {
      if (rules[key] === "error")
        rules[key] = "warn";
    }
  }
  return [
    {
      ...config,
      name: "antfu/regexp/rules",
      rules: {
        ...rules,
        ...options.overrides
      }
    }
  ];
}

// src/factory.ts
var flatConfigProps = [
  "name",
  "files",
  "ignores",
  "languageOptions",
  "linterOptions",
  "processor",
  "plugins",
  "rules",
  "settings"
];
var VuePackages = [
  "vue",
  "nuxt",
  "vitepress",
  "@slidev/cli"
];
var defaultPluginRenaming = {
  "@eslint-react": "react",
  "@eslint-react/dom": "react-dom",
  "@eslint-react/hooks-extra": "react-hooks-extra",
  "@eslint-react/naming-convention": "react-naming-convention",
  "@stylistic": "style",
  "@typescript-eslint": "ts",
  "import-x": "import",
  "n": "node",
  "vitest": "test",
  "yml": "yaml"
};
function antfu(options = {}, ...userConfigs) {
  const {
    astro: enableAstro = false,
    autoRenamePlugins = true,
    componentExts = [],
    gitignore: enableGitignore = true,
    jsx: enableJsx = true,
    react: enableReact = false,
    regexp: enableRegexp = true,
    solid: enableSolid = false,
    svelte: enableSvelte = false,
    typescript: enableTypeScript = isPackageExists4("typescript"),
    unocss: enableUnoCSS = false,
    vue: enableVue = VuePackages.some((i) => isPackageExists4(i))
  } = options;
  let isInEditor = options.isInEditor;
  if (isInEditor == null) {
    isInEditor = isInEditorEnv();
    if (isInEditor)
      console.log("[@antfu/eslint-config] Detected running in editor, some rules are disabled.");
  }
  const stylisticOptions = options.stylistic === false ? false : typeof options.stylistic === "object" ? options.stylistic : {};
  if (stylisticOptions && !("jsx" in stylisticOptions))
    stylisticOptions.jsx = enableJsx;
  const configs2 = [];
  if (enableGitignore) {
    if (typeof enableGitignore !== "boolean") {
      configs2.push(interopDefault(import("eslint-config-flat-gitignore")).then((r) => [r(enableGitignore)]));
    } else {
      configs2.push(interopDefault(import("eslint-config-flat-gitignore")).then((r) => [r({ strict: false })]));
    }
  }
  const typescriptOptions = resolveSubOptions(options, "typescript");
  const tsconfigPath = "tsconfigPath" in typescriptOptions ? typescriptOptions.tsconfigPath : void 0;
  configs2.push(
    ignores(),
    javascript({
      isInEditor,
      overrides: getOverrides(options, "javascript")
    }),
    comments(),
    node(),
    jsdoc({
      stylistic: stylisticOptions
    }),
    imports({
      stylistic: stylisticOptions
    }),
    unicorn(),
    command(),
    // Optional plugins (installed but not enabled by default)
    perfectionist()
  );
  if (enableVue) {
    componentExts.push("vue");
  }
  if (enableJsx) {
    configs2.push(jsx());
  }
  if (enableTypeScript) {
    configs2.push(typescript({
      ...typescriptOptions,
      componentExts,
      overrides: getOverrides(options, "typescript"),
      type: options.type
    }));
  }
  if (stylisticOptions) {
    configs2.push(stylistic({
      ...stylisticOptions,
      lessOpinionated: options.lessOpinionated,
      overrides: getOverrides(options, "stylistic")
    }));
  }
  if (enableRegexp) {
    configs2.push(regexp(typeof enableRegexp === "boolean" ? {} : enableRegexp));
  }
  if (options.test ?? true) {
    configs2.push(test({
      isInEditor,
      overrides: getOverrides(options, "test")
    }));
  }
  if (enableVue) {
    configs2.push(vue({
      ...resolveSubOptions(options, "vue"),
      overrides: getOverrides(options, "vue"),
      stylistic: stylisticOptions,
      typescript: !!enableTypeScript
    }));
  }
  if (enableReact) {
    configs2.push(react({
      overrides: getOverrides(options, "react"),
      tsconfigPath
    }));
  }
  if (enableSolid) {
    configs2.push(solid({
      overrides: getOverrides(options, "solid"),
      tsconfigPath,
      typescript: !!enableTypeScript
    }));
  }
  if (enableSvelte) {
    configs2.push(svelte({
      overrides: getOverrides(options, "svelte"),
      stylistic: stylisticOptions,
      typescript: !!enableTypeScript
    }));
  }
  if (enableUnoCSS) {
    configs2.push(unocss({
      ...resolveSubOptions(options, "unocss"),
      overrides: getOverrides(options, "unocss")
    }));
  }
  if (enableAstro) {
    configs2.push(astro({
      overrides: getOverrides(options, "astro"),
      stylistic: stylisticOptions
    }));
  }
  if (options.jsonc ?? true) {
    configs2.push(
      jsonc({
        overrides: getOverrides(options, "jsonc"),
        stylistic: stylisticOptions
      }),
      sortPackageJson(),
      sortTsconfig()
    );
  }
  if (options.yaml ?? true) {
    configs2.push(yaml({
      overrides: getOverrides(options, "yaml"),
      stylistic: stylisticOptions
    }));
  }
  if (options.toml ?? true) {
    configs2.push(toml({
      overrides: getOverrides(options, "toml"),
      stylistic: stylisticOptions
    }));
  }
  if (options.markdown ?? true) {
    configs2.push(
      markdown(
        {
          componentExts,
          overrides: getOverrides(options, "markdown")
        }
      )
    );
  }
  if (options.formatters) {
    configs2.push(formatters(
      options.formatters,
      typeof stylisticOptions === "boolean" ? {} : stylisticOptions
    ));
  }
  const fusedConfig = flatConfigProps.reduce((acc, key) => {
    if (key in options)
      acc[key] = options[key];
    return acc;
  }, {});
  if (Object.keys(fusedConfig).length)
    configs2.push([fusedConfig]);
  let composer = new FlatConfigComposer();
  composer = composer.append(
    ...configs2,
    ...userConfigs
  );
  if (autoRenamePlugins) {
    composer = composer.renamePlugins(defaultPluginRenaming);
  }
  return composer;
}
function resolveSubOptions(options, key) {
  return typeof options[key] === "boolean" ? {} : options[key] || {};
}
function getOverrides(options, key) {
  const sub = resolveSubOptions(options, key);
  return {
    ...options.overrides?.[key],
    ..."overrides" in sub ? sub.overrides : {}
  };
}

// src/index.ts
var src_default = antfu;
export {
  GLOB_ALL_SRC,
  GLOB_ASTRO,
  GLOB_ASTRO_TS,
  GLOB_CSS,
  GLOB_EXCLUDE,
  GLOB_GRAPHQL,
  GLOB_HTML,
  GLOB_JS,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_JSONC,
  GLOB_JSX,
  GLOB_LESS,
  GLOB_MARKDOWN,
  GLOB_MARKDOWN_CODE,
  GLOB_MARKDOWN_IN_MARKDOWN,
  GLOB_POSTCSS,
  GLOB_SCSS,
  GLOB_SRC,
  GLOB_SRC_EXT,
  GLOB_STYLE,
  GLOB_SVELTE,
  GLOB_SVG,
  GLOB_TESTS,
  GLOB_TOML,
  GLOB_TS,
  GLOB_TSX,
  GLOB_VUE,
  GLOB_XML,
  GLOB_YAML,
  StylisticConfigDefaults,
  antfu,
  astro,
  combine,
  command,
  comments,
  src_default as default,
  defaultPluginRenaming,
  ensurePackages,
  formatters,
  getOverrides,
  ignores,
  imports,
  interopDefault,
  isInEditorEnv,
  isInGitHooksOrLintStaged,
  isPackageInScope,
  javascript,
  jsdoc,
  jsonc,
  jsx,
  markdown,
  node,
  parserPlain,
  perfectionist,
  react,
  regexp,
  renamePluginInConfigs,
  renameRules,
  resolveSubOptions,
  solid,
  sortPackageJson,
  sortTsconfig,
  stylistic,
  svelte,
  test,
  toArray,
  toml,
  typescript,
  unicorn,
  unocss,
  vue,
  yaml
};
