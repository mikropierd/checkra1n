"use strict";var o=Object.defineProperty;var t=(c,a)=>o(c,"name",{value:a,configurable:!0});var r=Object.defineProperty,e=t((c,a)=>r(c,"name",{value:a,configurable:!0}),"e");function createProxy(){return{agent:void 0,dispatcher:void 0}}t(createProxy,"createProxy"),e(createProxy,"createProxy");function createFetch(){return globalThis.fetch}t(createFetch,"createFetch"),e(createFetch,"createFetch");const fetch=globalThis.fetch;exports.createFetch=createFetch,exports.createProxy=createProxy,exports.fetch=fetch;