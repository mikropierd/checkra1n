/**
 * DON'T EDIT THIS FILE.
 * This file was generated by "scripts/update-lib-flat-configs.js" script.
 */
"use strict"

module.exports = {
    plugins: {
        get "es-x"() {
            return require("../../index.js")
        },
    },
    rules: {
        "es-x/no-bigint": "error",
        "es-x/no-dynamic-import": "error",
        "es-x/no-export-ns-from": "error",
        "es-x/no-global-this": "error",
        "es-x/no-import-meta": "error",
        "es-x/no-nullish-coalescing-operators": "error",
        "es-x/no-optional-chaining": "error",
        "es-x/no-promise-all-settled": "error",
        "es-x/no-regexp-unicode-property-escapes-2020": "error",
        "es-x/no-string-prototype-matchall": "error",
    },
}